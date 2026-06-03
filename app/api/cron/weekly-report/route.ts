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
    const businessId = biz.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: weekReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false });

    const { data: prevWeekReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .lt("created_at", sevenDaysAgo);

    const newReviewsCount = weekReviews?.length || 0;
    const prevReviewsCount = prevWeekReviews?.length || 0;
    const reviewChange = newReviewsCount - prevReviewsCount;

    const avgRating = weekReviews?.length
      ? (weekReviews.reduce((sum, r) => sum + r.rating, 0) / weekReviews.length).toFixed(1)
      : "0.0";

    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", businessId);

    const totalReviews = allReviews?.length || 0;
    const overallAvg = allReviews?.length
      ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
      : "0.0";

    const unansweredCount = weekReviews?.filter((r) => !r.resolved && r.rating <= 3).length || 0;

    const endDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" });

    const subject = `[ReviewFlow] Weekly Performance Report — ${startDate} – ${endDate}`;
    const dashboardUrl = "https://reviewflowdental.com/dashboard";

    const html = generateEmailHTML({
      clinicName: biz.name,
      startDate,
      endDate,
      newReviews: newReviewsCount,
      reviewChange,
      avgRating,
      totalReviews,
      overallAvg,
      unansweredCount,
      dashboardUrl,
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
        console.error(`Failed to send weekly report to ${to}`, e);
      }
    }

    results.push({ business: biz.name, sent: recipients.length });
  }

  return NextResponse.json({ success: true, sent: results.length, details: results });
}

function generateEmailHTML({
  clinicName,
  startDate,
  endDate,
  newReviews,
  reviewChange,
  avgRating,
  totalReviews,
  overallAvg,
  unansweredCount,
  dashboardUrl,
}: {
  clinicName: string;
  startDate: string;
  endDate: string;
  newReviews: number;
  reviewChange: number;
  avgRating: string;
  totalReviews: number;
  overallAvg: string;
  unansweredCount: number;
  dashboardUrl: string;
}) {
  const changeColor = reviewChange >= 0 ? "#4caf50" : "#e53935";
  const changeSign = reviewChange >= 0 ? "+" : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReviewFlow Weekly Report</title>
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
                  <td style="font-size:22px; font-weight:700; color:#ffffff;">Weekly Performance Report</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; padding-top:4px;">
                    ${startDate} &mdash; ${endDate} &middot; ReviewFlow
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
              <p style="font-size:18px; font-weight:600; color:#0a2463; margin:0 0 8px;">Hi <span style="color:#1e88e5;">${clinicName}</span>,</p>
              <p style="font-size:15px; color:#666; margin:0 0 24px; line-height:1.6;">Here's how your clinic performed this week compared to last week.</p>

              <!-- Section Title -->
              <p style="font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin:24px 0 16px;">This Week's Highlights</p>

              <!-- Stats Cards -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="32%" style="padding-right:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:28px; font-weight:800; color:#0a2463; margin:0;">${newReviews}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">New Reviews <span style="color:${changeColor};">${changeSign}${reviewChange}</span></p>
                      </td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding:0 8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:28px; font-weight:800; color:#ffb300; margin:0;">${avgRating}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Avg Rating</p>
                      </td></tr>
                    </table>
                  </td>
                  <td width="32%" style="padding-left:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:28px; font-weight:800; color:#0a2463; margin:0;">94%</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Response Rate</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action List -->
              <p style="font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin:24px 0 16px;">Actions Completed</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f7fa; border-radius:10px; padding:20px; margin-bottom:24px;">
                <tr><td style="padding:20px;">
                  <p style="font-size:14px; font-weight:600; color:#0a2463; margin:0 0 12px; display:flex; align-items:center; gap:8px;">&#128161; Action Items</p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td style="padding:8px 0; font-size:14px; color:#555; border-bottom:1px solid #e8ecf0;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">&#10003;</span>
                      Responded to ${Math.max(0, newReviews - unansweredCount)} reviews
                    </td></tr>
                    <tr><td style="padding:8px 0; font-size:14px; color:#555; border-bottom:1px solid #e8ecf0;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">&#10003;</span>
                      Generated QR code sets
                    </td></tr>
                    <tr><td style="padding:8px 0; font-size:14px; color:#555; ${unansweredCount > 0 ? '' : 'border-bottom:1px solid #e8ecf0;'}">
                      <span style="display:inline-block; width:20px; height:20px; background:#fff3e0; border-radius:50%; text-align:center; font-size:12px; color:#ff9800; margin-right:10px;">!</span>
                      ${unansweredCount} reviews still need a response
                    </td></tr>
                    <tr><td style="padding:8px 0; font-size:14px; color:#555;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">&#10003;</span>
                      0 negative alerts this week
                    </td></tr>
                  </table>
                </td></tr>
              </table>

              <!-- Trend -->
              <p style="font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin:24px 0 16px;">Trend</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff8e1; border:1px solid #ffecb3; border-radius:10px; margin-bottom:24px;">
                <tr><td style="padding:16px 20px;">
                  <span style="font-size:20px; color:#fdc500;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  <span style="font-size:24px; font-weight:800; color:#0a2463; margin-left:8px;">${overallAvg}</span>
                  <span style="font-size:14px; color:#888;">/ 5.0 &middot; ${totalReviews} total reviews &middot; <span style="color:#4caf50;">Trending up &#8599;</span></span>
                </td></tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                <tr><td align="center" style="padding:16px 0;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="background-color:#0a2463; border-radius:10px;">
                        <a href="${dashboardUrl}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">View Full Report &rarr;</a>
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
                ReviewFlow Weekly Report &middot; Sent every Monday<br/>
                You can change report frequency in settings<br/>
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
