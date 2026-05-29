import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { patientId } = await req.json();
    console.log("Received patientId:", patientId);

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 第一步：查患者（不关联任何表）
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    console.log("Patient result:", patient);
    console.log("Patient error:", patientError);

    if (patientError) {
      console.error("Patient query error:", patientError);
      return NextResponse.json({ error: "Patient not found: " + patientError.message }, { status: 404 });
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    if (!patient.email) {
      return NextResponse.json({ error: "Patient has no email" }, { status: 400 });
    }

    // 第二步：单独查 business（如果有 business_id）
    let clinicName = "Your Dental Office";
    let reviewLink = "https://google.com";

    if (patient.business_id) {
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("name, google_review_url")
        .eq("id", patient.business_id)
        .single();

      console.log("Business result:", business);
      console.log("Business error:", businessError);

      if (business) {
        clinicName = business.name || clinicName;
        reviewLink = business.google_review_url || reviewLink;
      }
    }

    console.log("Final clinicName:", clinicName);
    console.log("Final reviewLink:", reviewLink);

    // 发送邮件
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "ReviewFlow <noreply@reviewflowdental.com>",
      to: patient.email,
      subject: `How was your visit to ${clinicName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #023A78;">Hi ${patient.name},</h2>
          <p>Thank you for visiting ${clinicName} today.</p>
          <p>If you had a great experience, we would greatly appreciate your feedback on Google.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewLink}"
               style="background: #FEDB01; color: #023A78; padding: 15px 30px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block;">
              Leave a Google Review
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            This is a one-time request. If you prefer not to leave a review, no further emails will be sent.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Email send error:", emailError);

      await supabase
        .from("patients")
        .update({ email_status: "failed" })
        .eq("id", patientId);

      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // 更新患者状态、计数和时间
    const currentCount = patient.email_sent_count || 0;
    const { error: updateError } = await supabase
      .from("patients")
      .update({
        email_status: "sent",
        email_sent_count: currentCount + 1,
        email_sent_at: new Date().toISOString()
      })
      .eq("id", patientId);

    if (updateError) {
      console.error("Update status error:", updateError);
      return NextResponse.json({ error: "Failed to update status: " + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "sent",
      emailId: emailData?.id
    });

  } catch (err: any) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
