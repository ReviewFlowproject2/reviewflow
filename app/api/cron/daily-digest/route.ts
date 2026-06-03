import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@reviewflowdental.com";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("plan", "agency")
    .eq("daily_digest_enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];

  for (const biz of businesses || []) {
    const { data: existing } = await supabase
      .from("digest_logs")
      .select("id")
      .eq("business_id", biz.id)
      .eq("digest_date", yesterdayStr)
      .single();

    if (existing) continue;

    const businessId = biz.id;
    const startOfYesterday = `${yesterdayStr}T00:00:00Z`;
    const endOfYesterday = `${yesterdayStr}T23:59:59Z`;

    const { data: newReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .gte("created_at", startOfYesterday)
      .lte("created_at", endOfYesterday)
      .order("created_at", { ascending: false });

    const negativeReviews = newReviews?.filter((r) => r.rating <= 3) || [];

    const avgRating = newReviews?.length
      ? (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(1)
      : "0.0";

    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", businessId);

    const totalReviews = allReviews?.length || 0;

    const dateFormatted = yesterday.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const subject = `[ReviewFlow] Your Daily Reputation Digest — ${dateFormatted}`;

    const actionText = negativeReviews.length > 0
      ? `You have ${negativeReviews.length} unanswered negative reviews from this week. Responding to reviews can improve patient satisfaction by 35%.`
      : "No negative reviews yesterday. Keep monitoring your reputation to maintain your clinic's excellent standing.";

    const html = generateEmailHTML({
      clinicName: biz.name,
      date: dateFormatted,
      newReviews: newReviews?.length || 0,
      avgRating,
      negativeReviews: negativeReviews.length,
      totalReviews,
      actionText,
      dashboardUrl: "https://reviewflowdental.com/dashboard",
    });

    const recipients: string[] = [biz.owner_email];
    const alertRecipients = biz.alert_recipients || [];
    alertRecipients.forEach((r: any) => {
      if (r.email && !recipients.includes(r.email)) recipients.push(r.email);
    });

    for (const to of recipients) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `ReviewFlow <${RESEND_FROM_EMAIL}>`,
            to,
            subject,
            html,
          }),
        });
      } catch (e) {
        console.error(`Failed to send digest to ${to}`, e);
      }
    }

    await supabase.from("digest_logs").insert({
      business_id: biz.id,
      digest_date: yesterdayStr,
      sent_to: recipients,
      new_reviews_count: newReviews?.length || 0,
      negative_reviews_count: negativeReviews.length,
      avg_rating: parseFloat(avgRating),
    });

    results.push({ business: biz.name, sent: recipients.length, date: yesterdayStr });
  }

  return NextResponse.json({ success: true, sent: results.length, details: results });
}

function generateEmailHTML({
  clinicName,
  date,
  newReviews,
  avgRating,
  negativeReviews,
  totalReviews,
  actionText,
  dashboardUrl,
}: {
  clinicName: string;
  date: string;
  newReviews: number;
  avgRating: string;
  negativeReviews: number;
  totalReviews: number;
  actionText: string;
  dashboardUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReviewFlow Daily Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);padding:32px 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td style="font-size:24px;font-weight:700;color:#ffffff;">ReviewFlow</td></tr>
                <tr><td style="font-size:12px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;padding-top:4px;">Daily Reputation Digest — ${date}</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px;background:linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);"></td></tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:18px;font-weight:600;color:#1e293b;margin:0 0 8px;">Good morning, <span style="color:#2563eb;">${clinicName}</span>!</p>
              <p style="font-size:14px;color:#64748b;margin:0 0 24px;">Here is how your clinic performed yesterday. Keep up the great work!</p>

              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td width="32%" style="padding-right:8px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                      <tr><td style="font-size:28px;font-weight:700;color:#22c55e;">${newReviews}</td></tr>
                      <tr><td style="font-size:12px;color:#64748b;padding-top:4px;">New Reviews</td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding:0 8px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                      <tr><td style="font-size:28px;font-weight:700;color:#f59e0b;">${avgRating}</td></tr>
                      <tr><td style="font-size:12px;color:#64748b;padding-top:4px;">Avg Rating</td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding-left:8px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                      <tr><td style="font-size:28px;font-weight:700;color:#ef4444;">${negativeReviews}</td></tr>
                      <tr><td style="font-size:12px;color:#64748b;padding-top:4px;">Negative Reviews</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fefce8;border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid #fde68a;">
                <tr><td>
                  <span style="font-size:20px;color:#f59e0b;">★★★★★</span>
                  <span style="font-size:24px;font-weight:700;color:#1e293b;margin-left:8px;">${avgRating}</span>
                  <span style="font-size:14px;color:#64748b;">/ 5.0 · Based on ${totalReviews} reviews</span>
                </td></tr>
              </table>

              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff7ed;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #f59e0b;">
                <tr><td>
                  <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">💡 Action Recommended</p>
                  <p style="font-size:13px;color:#92400e;margin:0;line-height:1.5;">${actionText}</p>
                </td></tr>
              </table>

              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;">
                <tr><td align="center">
                  <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">Open Dashboard →</a>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="font-size:13px;color:#2563eb;margin:0 0 8px;"><a href="${dashboardUrl}" style="color:#2563eb;text-decoration:none;">Open Dashboard</a></p>
              <p style="font-size:11px;color:#94a3b8;margin:0;">ReviewFlow · You're receiving this because you're a ReviewFlow member<br/><a href="#" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a> · <a href="#" style="color:#94a3b8;text-decoration:underline;">Update preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
