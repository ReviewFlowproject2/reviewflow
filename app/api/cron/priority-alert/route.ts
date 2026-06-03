import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@reviewflowdental.com";

export async function GET(request: Request) {
  // 验证 cron secret
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 查询所有 Agency 用户且开启了 Priority Alert
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("plan", "agency")
    .eq("priority_alert_enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];

  for (const biz of businesses || []) {
    // 找未 alert 的 1-2 星差评（过去10分钟内新产生的）
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", biz.id)
      .eq("sms_alerted", false)
      .lte("rating", 2)
      .gte("created_at", tenMinutesAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    if (!reviews || reviews.length === 0) continue;

    // 收集邮件接收人：owner + alert_recipients 里的 email
    const recipients: string[] = [biz.owner_email];
    const alertRecipients = biz.alert_recipients || [];
    alertRecipients.forEach((r: any) => {
      if (r.email && !recipients.includes(r.email)) recipients.push(r.email);
    });

    if (recipients.length === 0) continue;

    for (const review of reviews) {
      const subject = `[URGENT] ${biz.name} — New ${review.rating}⭐ Review Detected`;

      const body = review.content?.substring(0, 200) || "No comment";
      const reviewUrl = biz.google_review_url || "https://reviewflow.app/dashboard";

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#1e293b;">
          <div style="background:#dc2626;color:white;padding:16px;border-radius:12px 12px 0 0;text-align:center;">
            <h2 style="margin:0;font-size:18px;">⚠️ Priority Alert</h2>
          </div>
          <div style="border:1px solid #e0e7f1;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
            <p style="font-size:16px;margin-bottom:16px;"><strong>${biz.name}</strong> received a new <strong>${review.rating}⭐</strong> review:</p>

            <div style="background:#fef2f2;padding:16px;border-radius:8px;border-left:4px solid #dc2626;margin:16px 0;">
              <p style="margin:0;font-style:italic;color:#7f1d1d;">"${body}"</p>
              <p style="margin:8px 0 0;color:#991b1b;font-size:12px;">— ${review.author_name || "Anonymous"}</p>
            </div>

            <p style="color:#64748b;font-size:14px;margin-bottom:16px;">This review requires immediate attention. A 1-2 star review can significantly impact your clinic's reputation.</p>

            <div style="text-align:center;margin-top:24px;">
              <a href="${reviewUrl}" style="background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                Reply on Google Now
              </a>
            </div>

            <p style="margin-top:24px;color:#94a3b8;font-size:12px;text-align:center;">
              ReviewFlow Priority Alert — Sent within 10 minutes of detection
            </p>
          </div>
        </div>
      `;

      for (const to of recipients) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `ReviewFlow Alerts <${RESEND_FROM_EMAIL}>`,
              to,
              subject,
              html,
            }),
          });
        } catch (e) {
          console.error(`Failed to send priority alert to ${to}`, e);
        }
      }

      // 标记已 alert（字段名保持 sms_alerted 兼容，实际发送的是邮件）
      await supabase
        .from("reviews")
        .update({
          sms_alerted: true,
          sms_alerted_at: new Date().toISOString(),
        })
        .eq("id", review.id);
    }

    results.push({
      business: biz.name,
      alerts: reviews.length,
      recipients: recipients.length,
    });
  }

  return NextResponse.json({
    success: true,
    businessesChecked: businesses?.length || 0,
    alertsSent: results.length,
    details: results,
  });
}
