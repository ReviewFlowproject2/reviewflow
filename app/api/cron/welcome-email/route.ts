import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@reviewflowdental.com";

export async function POST(request: Request) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const subject = "Welcome to ReviewFlow! Let's get your clinic more 5-star reviews";
    const dashboardUrl = "https://reviewflowdental.com/dashboard";

    const html = generateEmailHTML({
      clinicName: biz.name,
      dashboardUrl,
    });

    const recipients: string[] = [biz.owner_email];

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
        console.error(`Failed to send welcome email to ${to}`, e);
      }
    }

    return NextResponse.json({ success: true, sent: recipients.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generateEmailHTML({
  clinicName,
  dashboardUrl,
}: {
  clinicName: string;
  dashboardUrl: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ReviewFlow!</title>
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
                  <td style="font-size:22px; font-weight:700; color:#ffffff;">Welcome to ReviewFlow!</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; padding-top:4px;">
                    Let's get your clinic more 5-star reviews
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
              <p style="font-size:15px; color:#666; margin:0 0 24px; line-height:1.6;">
                Thank you for joining ReviewFlow! You're now one step closer to turning every happy patient into a 5-star review.
              </p>

              <!-- Section Title -->
              <p style="font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin:24px 0 16px;">Get Started in 3 Easy Steps</p>

              <!-- Action List -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f7fa; border-radius:10px; padding:20px; margin-bottom:24px;">
                <tr><td style="padding:20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td style="padding:8px 0; font-size:14px; color:#555; border-bottom:1px solid #e8ecf0;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">1</span>
                      <strong>Choose a template</strong> &mdash; Pick from 7 professionally designed styles
                    </td></tr>
                    <tr><td style="padding:8px 0; font-size:14px; color:#555; border-bottom:1px solid #e8ecf0;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">2</span>
                      <strong>Customize</strong> &mdash; Add your clinic name, logo, and doctor info
                    </td></tr>
                    <tr><td style="padding:8px 0; font-size:14px; color:#555;">
                      <span style="display:inline-block; width:20px; height:20px; background:#e8f5e9; border-radius:50%; text-align:center; font-size:12px; color:#4caf50; margin-right:10px;">3</span>
                      <strong>Print &amp; Display</strong> &mdash; Download PDF and place at your front desk
                    </td></tr>
                  </table>
                </td></tr>
              </table>

              <!-- Pro Tip Banner -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#e8f5e9; border-left:4px solid #4caf50; border-radius:10px; margin-bottom:24px;">
                <tr><td style="padding:16px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="30" style="vertical-align:top; padding-right:12px;">
                        <span style="font-size:20px;">&#128161;</span>
                      </td>
                      <td>
                        <p style="font-size:14px; font-weight:600; color:#2e7d32; margin:0 0 4px;">Pro Tip</p>
                        <p style="font-size:13px; color:#33691e; margin:0; line-height:1.5;">
                          Clinics that display QR codes at checkout see an average of 3x more reviews within the first month.
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
                      <td align="center" style="background-color:#0a2463; border-radius:10px;">
                        <a href="${dashboardUrl}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">Create My First QR Code &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <p style="text-align:center; color:#888; font-size:13px; margin:16px 0 0;">
                Need help? Reply to this email or <a href="#" style="color:#1e88e5; text-decoration:none;">schedule a demo</a>.
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
                ReviewFlow &middot; Turning happy patients into 5-star reviews<br/>
                Questions? Contact us at support@reviewflow.com<br/>
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
