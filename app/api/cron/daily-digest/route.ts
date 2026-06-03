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
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReviewFlow Daily Digest</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family:Arial, Helvetica, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e0e7f1;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0a2463; padding:32px 40px; border-radius:16px 16px 0 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size:22px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">ReviewFlow</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; padding-top:4px;">
                    Daily Reputation Digest — ${date}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Yellow accent line -->
          <tr>
            <td style="height:4px; background-color:#fdc500;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:18px; font-weight:600; color:#0a2463; margin:0 0 8px;">Good morning, <span style="color:#1e88e5;">${clinicName}</span>!</p>
              <p style="font-size:15px; color:#666; margin:0 0 24px; line-height:1.6;">Here is how your clinic performed yesterday. Keep up the great work!</p>

              <!-- Stats Cards - 3 columns -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="32%" style="padding-right:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:24px; margin:0 0 8px;">&#11088;</p>
                        <p style="font-size:28px; font-weight:800; color:#4caf50; margin:0;">${newReviews}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">New Reviews</p>
                      </td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding:0 8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:24px; margin:0 0 8px;">&#9733;</p>
                        <p style="font-size:28px; font-weight:800; color:#ffb300; margin:0;">${avgRating}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Avg Rating</p>
                      </td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding-left:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:24px; margin:0 0 8px;">&#9888;&#65039;</p>
                        <p style="font-size:28px; font-weight:800; color:#e53935; margin:0;">${negativeReviews}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Negative Reviews</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Rating Bar -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff8e1; border:1px solid #ffecb3; border-radius:10px; margin-bottom:24px;">
                <tr><td style="padding:16px 20px;">
                  <span style="font-size:20px; color:#fdc500;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  <span style="font-size:24px; font-weight:800; color:#0a2463; margin-left:8px;">${avgRating}</span>
                  <span style="font-size:13px; color:#888;">/ 5.0 · Based on ${totalReviews} reviews</span>
                </td></tr>
              </table>

              <!-- Action Recommended Banner -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff3e0; border-left:4px solid #ff9800; border-radius:10px; margin-bottom:24px;">
                <tr><td style="padding:16px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="30" style="vertical-align:top; padding-right:12px;">
                        <span style="font-size:20px;">&#128161;</span>
                      </td>
                      <td>
                        <p style="font-size:14px; font-weight:600; color:#e65100; margin:0 0 4px;">Action Recommended</p>
                        <p style="font-size:13px; color:#bf360c; margin:0; line-height:1.5;">${actionText}</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                <tr><td align="center" style="padding:16px 0;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="background-color:#0a2463; border-radius:10px;">
                        <a href="${dashboardUrl}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">Open Dashboard &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e8ecf0; text-align:center; background-color:#f5f7fa; border-radius:0 0 16px 16px;">
              <p style="font-size:13px; color:#1e88e5; margin:0 0 8px;">
                <a href="${dashboardUrl}" style="color:#1e88e5; text-decoration:none; font-weight:600;">Open Dashboard</a>
              </p>
              <p style="font-size:12px; color:#999; margin:0;">
                ReviewFlow &middot; You're receiving this because you're a ReviewFlow member<br/>
                <a href="#" style="color:#999; text-decoration:underline;">Unsubscribe</a> &middot; 
                <a href="#" style="color:#999; text-decoration:underline;">Update preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
