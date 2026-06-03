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

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

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
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", biz.id)
      .eq("rating", 5)
      .gte("created_at", tenMinutesAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    if (!reviews || reviews.length === 0) continue;

    const alertRecipients = biz.alert_recipients || [];
    const recipients: string[] = alertRecipients
      .filter((r: any) => r.email)
      .map((r: any) => r.email);

    if (recipients.length === 0) {
      recipients.push(biz.owner_email);
    }

    for (const review of reviews) {
      const subject = `&#127881; Great News! ${biz.name} received a new 5-star review`;
      const dashboardUrl = "https://reviewflowdental.com/dashboard";

      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", biz.id);

      const totalReviews = allReviews?.length || 0;
      const avgRating = allReviews?.length
        ? (allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
        : "0.0";

      const html = generateEmailHTML({
        clinicName: biz.name,
        authorName: review.author_name || "Anonymous",
        reviewContent: review.content || "No comment",
        totalReviews,
        avgRating,
        dashboardUrl,
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
          console.error(`Failed to send 5-star alert to ${to}`, e);
        }
      }
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

function generateEmailHTML({
  clinicName,
  authorName,
  reviewContent,
  totalReviews,
  avgRating,
  dashboardUrl,
}: {
  clinicName: string;
  authorName: string;
  reviewContent: string;
  totalReviews: number;
  avgRating: string;
  dashboardUrl: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReviewFlow - Great News!</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family:Arial, Helvetica, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e0e7f1;">

          <!-- Header -->
          <tr>
            <td style="background-color:#2e7d32; padding:32px 40px; border-radius:16px 16px 0 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size:22px; font-weight:700; color:#ffffff;">&#127881; Great News!</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; padding-top:4px;">
                    New 5-star review &middot; ReviewFlow
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Green accent line -->
          <tr>
            <td style="height:4px; background-color:#4caf50;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:18px; font-weight:600; color:#1e293b; margin:0 0 8px;">
                Hi <span style="color:#2e7d32;">${clinicName}</span>,
              </p>
              <p style="font-size:15px; color:#666; margin:0 0 24px; line-height:1.6;">
                A patient just left you a <strong style="color:#2e7d32;">5-star review</strong>! Time to celebrate &#127775;
              </p>

              <!-- Review Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f8e9; border:1px solid #c5e1a5; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding:0; border-left:4px solid #4caf50; border-radius:12px 0 0 12px;" width="4"></td>
                  <td style="padding:24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" style="padding-right:12px; vertical-align:top;">
                          <table border="0" cellpadding="0" cellspacing="0" width="40" height="40" style="background-color:#2e7d32; border-radius:50%;">
                            <tr><td align="center" style="font-size:16px; font-weight:700; color:#ffffff;">
                              ${authorName.charAt(0).toUpperCase()}
                            </td></tr>
                          </table>
                        </td>
                        <td>
                          <p style="font-size:15px; font-weight:600; color:#0a2463; margin:0 0 4px;">${authorName}</p>
                          <p style="font-size:12px; color:#888; margin:0;">Posted recently &middot; Google Reviews</p>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size:16px; color:#fdc500; margin:12px 0 8px; letter-spacing:1px;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                    <p style="font-size:15px; color:#33691e; margin:0; font-style:italic; line-height:1.5; padding-left:16px; border-left:3px solid #a5d6a7;">
                      "${reviewContent}"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stats -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="padding-right:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:28px; font-weight:800; color:#4caf50; margin:0;">${totalReviews}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Total Reviews</p>
                      </td></tr>
                    </table>
                  </td>
                  <td width="48%" style="padding-left:8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff; border:1px solid #e8ecf0; border-radius:12px;">
                      <tr><td style="padding:20px; text-align:center;">
                        <p style="font-size:28px; font-weight:800; color:#ffb300; margin:0;">${avgRating}</p>
                        <p style="font-size:12px; color:#888; margin:6px 0 0; font-weight:500;">Average Rating</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                <tr><td align="center" style="padding:16px 0;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="background-color:#2e7d32; border-radius:10px;">
                        <a href="${dashboardUrl}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">View All Reviews &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <p style="text-align:center; color:#888; font-size:13px; margin:12px 0 0;">
                Keep up the excellent work! Your patients love you.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e8ecf0; text-align:center; background-color:#f5f7fa; border-radius:0 0 16px 16px;">
              <p style="font-size:13px; color:#1e88e5; margin:0 0 8px;">
                <a href="${dashboardUrl}" style="color:#1e88e5; text-decoration:none; font-weight:600;">Open Dashboard</a>
              </p>
              <p style="font-size:12px; color:#999; margin:0;">
                ReviewFlow &middot; Celebrating your success<br/>
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
