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
    .eq("priority_alert_enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];

  for (const biz of businesses || []) {
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

    const alertRecipients = biz.alert_recipients || [];
    const recipients: string[] = alertRecipients
      .filter((r: any) => r.email)
      .map((r: any) => r.email);

    if (recipients.length === 0) {
      recipients.push(biz.owner_email);
    }

    for (const review of reviews) {
      const subject = `[URGENT] ${biz.name} — New ${review.rating}⭐ Review Detected`;

      const stars = "&#9733;".repeat(review.rating) + "&#9734;".repeat(5 - review.rating);
      const reviewUrl = biz.google_review_url || "https://reviewflowdental.com/dashboard";
      const dashboardUrl = "https://reviewflowdental.com/dashboard";

      const html = generateAlertHTML({
        clinicName: biz.name,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        rating: review.rating,
        stars,
        authorName: review.author_name || "Anonymous",
        reviewContent: review.content || "No comment",
        reviewUrl,
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

function generateAlertHTML({
  clinicName,
  date,
  rating,
  stars,
  authorName,
  reviewContent,
  reviewUrl,
  dashboardUrl,
}: {
  clinicName: string;
  date: string;
  rating: number;
  stars: string;
  authorName: string;
  reviewContent: string;
  reviewUrl: string;
  dashboardUrl: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReviewFlow Priority Alert</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family:Arial, Helvetica, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e0e7f1;">

          <!-- Header -->
          <tr>
            <td style="background-color:#c62828; padding:32px 40px; border-radius:16px 16px 0 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size:22px; font-weight:700; color:#ffffff;">&#9888;&#65039; Priority Alert</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:#fca5a5; text-transform:uppercase; letter-spacing:0.5px; padding-top:4px;">
                    Immediate action required &middot; ${date}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Red accent line -->
          <tr>
            <td style="height:4px; background-color:#ef4444;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:18px; font-weight:600; color:#1e293b; margin:0 0 8px;">
                Hi <span style="color:#c62828;">${clinicName}</span>,
              </p>
              <p style="font-size:15px; color:#666; margin:0 0 24px; line-height:1.6;">
                Your clinic just received a <strong style="color:#c62828;">${rating}-star review</strong> on Google. This requires your immediate attention.
              </p>

              <!-- Review Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff8f8; border:1px solid #ffcdd2; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding:0; border-left:4px solid #e53935; border-radius:12px 0 0 12px;" width="4"></td>
                  <td style="padding:24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" style="padding-right:12px; vertical-align:top;">
                          <table border="0" cellpadding="0" cellspacing="0" width="40" height="40" style="background-color:#0a2463; border-radius:50%;">
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
                    <p style="font-size:16px; color:#fdc500; margin:12px 0 8px; letter-spacing:1px;">${stars}</p>
                    <p style="font-size:15px; color:#7f1d1d; margin:0; font-style:italic; line-height:1.5; padding-left:16px; border-left:3px solid #e0e0e0;">
                      "${reviewContent}"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Why this matters -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff7ed; border-left:4px solid #dc2626; border-radius:10px; margin-bottom:24px;">
                <tr><td style="padding:16px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="30" style="vertical-align:top; padding-right:12px;">
                        <span style="font-size:20px;">&#128161;</span>
                      </td>
                      <td>
                        <p style="font-size:14px; font-weight:600; color:#92400e; margin:0 0 4px;">Why respond quickly?</p>
                        <p style="font-size:13px; color:#92400e; margin:0; line-height:1.5;">
                          Clinics that reply to negative reviews within 1 hour are 3x more likely to have the patient update or remove their review. A thoughtful response also shows prospective patients that you care.
                        </p>
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
                      <td align="center" style="background-color:#c62828; border-radius:10px;">
                        <a href="${reviewUrl}" style="display:inline-block; padding:16px 40px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">Reply on Google Now &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <p style="text-align:center; color:#888; font-size:13px; margin:12px 0 0;">
                We'll also suggest a response draft in your dashboard.
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
                ReviewFlow Priority Alert &mdash; Sent within 10 minutes of detection<br/>
                This is an automated alert. You can manage alert settings in your dashboard.<br/>
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
