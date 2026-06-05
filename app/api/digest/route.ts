import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
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

    // 获取诊所信息
    const { data: biz } = await supabase
      .from("businesses")
      .select("name, email, plan")
      .eq("user_id", user.id)
      .single();

    if (!biz || biz.plan !== "agency") {
      return NextResponse.json({ success: false, error: "Agency plan required" }, { status: 403 });
    }

    // 获取昨日数据
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: newReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", user.id)
      .gte("created_at", yesterdayStr)
      .order("created_at", { ascending: false });

    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", user.id);

    const avgRating = allReviews?.length
      ? (allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
      : "0.0";

    const negativeCount = newReviews?.filter((r: any) => (r.rating || 5) <= 2).length || 0;
    const positiveCount = newReviews?.filter((r: any) => (r.rating || 0) >= 4).length || 0;

    // 构建邮件内容
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a3a5c;">Daily Reputation Digest — ${biz.name}</h2>
        <p style="color: #666;">${yesterday.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

        <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; text-align: center;">
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">${newReviews?.length || 0}</p>
              <p style="color: #666; font-size: 12px;">New Reviews</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">${avgRating}</p>
              <p style="color: #666; font-size: 12px;">Avg Rating</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #ef4444; margin: 0;">${negativeCount}</p>
              <p style="color: #666; font-size: 12px;">Negative</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #22c55e; margin: 0;">${positiveCount}</p>
              <p style="color: #666; font-size: 12px;">Positive</p>
            </div>
          </div>
        </div>

        ${newReviews && newReviews.length > 0 ? `
        <h3 style="color: #1a3a5c;">New Reviews</h3>
        ${newReviews.map((r: any) => `
          <div style="border-left: 3px solid ${(r.rating || 5) <= 2 ? '#ef4444' : '#22c55e'}; padding-left: 12px; margin: 12px 0;">
            <p style="margin: 0; font-weight: bold;">${r.patient_name || "Anonymous"} — ${"★".repeat(r.rating || 0)}${"☆".repeat(5 - (r.rating || 0))}</p>
            <p style="margin: 4px 0 0; color: #666; font-size: 14px;">${r.comment || "No comment"}</p>
          </div>
        `).join("")}
        ` : "<p style=\"color: #666;\">No new reviews yesterday.</p>"}

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.reviewflowdental.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 30px;">You're receiving this because you're on the Agency plan. <a href="https://www.reviewflowdental.com/settings">Manage notifications</a></p>
      </div>
    `;

    // 通过 FormSubmit 发送
    const formData = new FormData();
    formData.append("_subject", `Daily Digest — ${biz.name} — ${newReviews?.length || 0} new reviews`);
    formData.append("_replyto", user.email || "");
    formData.append("_captcha", "false");
    formData.append("email", user.email || "");
    formData.append("message", `Daily digest for ${biz.name}`);
    formData.append("_html", emailHtml);

    const emailRes = await fetch("https://formsubmit.co/ajax/dengxiaofeng880914@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const emailResult = await emailRes.json();

    if (emailResult.success === "true" || emailResult.success === true) {
      return NextResponse.json({ success: true, sent: true, stats: { new: newReviews?.length || 0, negative: negativeCount, positive: positiveCount } });
    } else {
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
