import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEffectivePlan, canUseFeature } from "@/lib/plan-config";

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();
    if (!patientId) {
      return NextResponse.json({ success: false, error: "Patient ID is required" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 获取患者信息
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("business_id", user.id)
      .single();

    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    if (!patient.email) {
      return NextResponse.json({ success: false, error: "Patient has no email address" }, { status: 400 });
    }

    // 获取诊所信息（含 trial 状态）
    const { data: business } = await supabase
      .from("businesses")
      .select("name, google_review_link, trial_ends_at, plan")
      .eq("user_id", user.id)
      .single();

    // 检查套餐权限：邮件自动化需要 Pro 或 Agency
    const effectivePlan = getEffectivePlan(business);
    if (!canUseFeature(effectivePlan, "emailAutomation")) {
      return NextResponse.json(
        { success: false, error: "Email automation requires Pro or Agency plan. Please upgrade." },
        { status: 403 }
      );
    }

    const clinicName = business?.name || "Your Dental Clinic";
    const reviewLink = business?.google_review_link || "https://www.google.com/search?q=review";

    // 通过 FormSubmit 发送邮件
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a3a5c;">Hi ${patient.name},</h2>
        <p>Thank you for visiting <strong>${clinicName}</strong> today!</p>
        <p>We hope you had a great experience. If you have a moment, we'd really appreciate your feedback on Google.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewLink}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Review on Google</a>
        </div>
        <p style="font-size: 12px; color: #888;">This is a one-time request. If you prefer not to receive these, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">${clinicName}</p>
      </div>
    `;

    const formData = new FormData();
    formData.append("_subject", `How was your visit to ${clinicName}?`);
    formData.append("_replyto", patient.email);
    formData.append("_captcha", "false");
    formData.append("email", patient.email);
    formData.append("name", patient.name);
    formData.append("message", `Review request sent for ${patient.name} (${patient.email})`);
    formData.append("_html", emailHtml);

    // 使用 FormSubmit 发送
    const res = await fetch("https://formsubmit.co/ajax/dengxiaofeng880914@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const result = await res.json();

    if (result.success === "true" || result.success === true) {
      // 更新患者状态
      const { error: updateError } = await supabase
        .from("patients")
        .update({
          email_status: "sent",
          email_sent_at: new Date().toISOString(),
          email_sent_count: (patient.email_sent_count || 0) + 1,
        })
        .eq("id", patientId);

      if (updateError) {
        console.error("Update error:", updateError);
      }

      return NextResponse.json({ success: true, status: "sent" });
    } else {
      return NextResponse.json({ success: false, error: "Failed to send email via FormSubmit" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
