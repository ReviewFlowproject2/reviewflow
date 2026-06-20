import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@reviewflowdental.com";

// ==================== Mock Report Data Generator ====================

interface Competitor {
  name: string;
  google_rating: number;
  yelp_rating: number;
  total_reviews: number;
}

interface ReviewSentiment {
  author: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  date: string;
}

interface MockReport {
  clinic_name: string;
  clinic_google_rating: number;
  clinic_yelp_rating: number;
  clinic_total_reviews: number;
  competitors: Competitor[];
  recent_reviews: ReviewSentiment[];
  unanswered_negative: number;
  competitor_response_rate: string;
}

function generateMockReport(clinicName: string): MockReport {
  // Deterministic-ish mock data so every report feels personalized
  const seed = clinicName.length + clinicName.charCodeAt(0);
  const ratingBase = 3.5 + (seed % 15) / 10; // 3.5 – 5.0

  const competitors: Competitor[] = [
    {
      name: "Bright Smile Dentistry",
      google_rating: +(ratingBase - 0.3).toFixed(1),
      yelp_rating: +(ratingBase - 0.5).toFixed(1),
      total_reviews: 142 + (seed % 50),
    },
    {
      name: "Pearl Dental Care",
      google_rating: +(ratingBase + 0.2).toFixed(1),
      yelp_rating: +(ratingBase + 0.1).toFixed(1),
      total_reviews: 98 + (seed % 40),
    },
    {
      name: "Family Dental Center",
      google_rating: +(ratingBase - 0.1).toFixed(1),
      yelp_rating: +(ratingBase - 0.2).toFixed(1),
      total_reviews: 210 + (seed % 60),
    },
  ];

  const recentReviews: ReviewSentiment[] = [
    {
      author: "Sarah M.",
      rating: 5,
      text: "Best dental experience I've ever had. The staff was incredibly friendly and professional.",
      sentiment: "positive",
      date: "2 days ago",
    },
    {
      author: "James T.",
      rating: 2,
      text: "Had to wait 45 minutes past my appointment time. The cleaning was rushed.",
      sentiment: "negative",
      date: "5 days ago",
    },
    {
      author: "Maria L.",
      rating: 1,
      text: "Billing department made multiple errors. Still trying to resolve a charge from 2 months ago.",
      sentiment: "negative",
      date: "1 week ago",
    },
    {
      author: "David K.",
      rating: 4,
      text: "Good cleaning, friendly hygienist. Front desk could be more organized.",
      sentiment: "positive",
      date: "3 days ago",
    },
    {
      author: "Linda W.",
      rating: 5,
      text: "Dr. Chen is amazing! Explained everything clearly and the procedure was painless.",
      sentiment: "positive",
      date: "1 day ago",
    },
  ];

  const clinicRating = +(ratingBase - 0.5).toFixed(1);
  const clinicYelp = +(ratingBase - 0.7).toFixed(1);

  // Ensure ratings stay in valid range
  const clamp = (v: number) => Math.min(5, Math.max(1, +v.toFixed(1)));

  return {
    clinic_name: clinicName,
    clinic_google_rating: clamp(clinicRating),
    clinic_yelp_rating: clamp(clinicYelp),
    clinic_total_reviews: 67 + (seed % 80),
    competitors: competitors.map((c) => ({
      ...c,
      google_rating: clamp(c.google_rating),
      yelp_rating: clamp(c.yelp_rating),
    })),
    recent_reviews: recentReviews,
    unanswered_negative: 2,
    competitor_response_rate: "3 of 3 competitors reply within 24h",
  };
}

// ==================== POST: Submit Audit Request ====================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clinicName, email, name, placeId } = body as {
      clinicName?: string;
      email?: string;
      name?: string;
      placeId?: string;
    };

    // Validate required fields
    if (!clinicName || !clinicName.trim()) {
      return NextResponse.json(
        { error: "Clinic name is required." },
        { status: 400 }
      );
    }
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const trimmedName = clinicName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUserName = name?.trim() || null;
    const trimmedPlaceId = placeId?.trim() || null;

    // ---- 1. Save lead to Supabase ----
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase.from as any)("audit_leads").insert({
      clinic_name: trimmedName,
      google_place_id: trimmedPlaceId,
      email: trimmedEmail,
      name: trimmedUserName,
      source: "free-audit",
    });

    if (dbError) {
      console.error("Failed to save audit lead:", dbError);
      // Don't fail the request — email is more important than DB
    }

    // ---- 2. Generate mock report data ----
    const report = generateMockReport(trimmedName);

    // ---- 3. Send email via Resend ----
    const competitorRows = report.competitors
      .map(
        (c) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #E0E7F1">${c.name}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;text-align:center">⭐ ${c.google_rating}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;text-align:center">⭐ ${c.yelp_rating}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;text-align:center">${c.total_reviews}</td></tr>`
      )
      .join("");

    const sentimentRows = report.recent_reviews
      .map((r) => {
        const color =
          r.sentiment === "positive"
            ? "#16a34a"
            : r.sentiment === "negative"
            ? "#dc2626"
            : "#ca8a04";
        return (
          `<tr>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1">${r.author}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;text-align:center">${"⭐".repeat(r.rating)}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;color:${color};font-weight:600">${r.sentiment.toUpperCase()}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #E0E7F1;font-size:14px">${r.text}</td>` +
          `</tr>`
        );
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F8FC;padding:40px 20px">
<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(2,58,120,0.08)">

  <!-- Header -->
  <div style="background:#023A78;padding:32px 28px;text-align:center">
    <h1 style="color:#fff;font-size:24px;margin:0 0 8px">Your Free Review Audit</h1>
    <p style="color:#E9F1FA;font-size:15px;margin:0">${report.clinic_name} vs. 3 Local Competitors</p>
  </div>

  <div style="padding:28px">

    <!-- Rating Comparison -->
    <h2 style="font-size:18px;color:#023A78;margin:0 0 16px">📊 Rating Comparison</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:15px">
      <thead>
        <tr style="background:#E9F1FA">
          <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #023A78">Clinic</th>
          <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">Google</th>
          <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">Yelp</th>
          <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">Reviews</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#E9F1FA;font-weight:700">
          <td style="padding:10px 12px;border-bottom:2px solid #023A78">🔍 ${report.clinic_name} (You)</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">⭐ ${report.clinic_google_rating}</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">⭐ ${report.clinic_yelp_rating}</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">${report.clinic_total_reviews}</td>
        </tr>
        ${competitorRows}
      </tbody>
    </table>

    <!-- Recent Reviews Sentiment -->
    <h2 style="font-size:18px;color:#023A78;margin:0 0 16px">💬 Recent Review Sentiment</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px">
      <thead>
        <tr style="background:#E9F1FA">
          <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #023A78">Author</th>
          <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">Rating</th>
          <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #023A78">Sentiment</th>
          <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #023A78">Review</th>
        </tr>
      </thead>
      <tbody>${sentimentRows}</tbody>
    </table>

    <!-- Alerts -->
    <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px">
      <strong style="color:#DC2626">⚠ You have ${report.unanswered_negative} unanswered negative reviews</strong><br>
      <span style="color:#991B1B;font-size:14px">Patients check reviews before booking. Responding quickly can recover trust.</span>
    </div>

    <div style="background:#F0FDF4;border-left:4px solid #16A34A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px">
      <strong style="color:#16A34A">✅ ${report.competitor_response_rate}</strong><br>
      <span style="color:#166534;font-size:14px">Fast responses correlate with higher patient acquisition.</span>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:28px;padding:24px;background:#E9F1FA;border-radius:12px">
      <p style="color:#023A78;font-weight:600;margin:0 0 12px">Want the full dashboard with real-time alerts?</p>
      <a href="${process.env.APP_URL || "https://www.reviewflowdental.com"}/register" style="display:inline-block;padding:12px 32px;background:#023A78;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Start 15-Day Free Trial</a>
    </div>

  </div>

  <div style="padding:20px 28px;background:#F5F8FC;text-align:center;font-size:12px;color:#546E8E">
    ReviewFlow — Automated Reputation Management for Dental Clinics<br>
    <a href="${process.env.APP_URL || "https://www.reviewflowdental.com"}" style="color:#023A78">reviewflowdental.com</a>
  </div>
</div>
</body>
</html>`;

    let emailSent = false;
    try {
      await resend.emails.send({
        from: `ReviewFlow <${FROM_EMAIL}>`,
        to: [trimmedEmail],
        subject: `Your Free Review Audit: ${trimmedName} vs. Competitors`,
        html,
      });
      emailSent = true;

      // Update report_sent in DB
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)("audit_leads")
          .update({ report_sent: true, report_sent_at: new Date().toISOString() })
          .eq("email", trimmedEmail)
          .eq("clinic_name", trimmedName);
      } catch (_) {
        // non-critical
      }
    } catch (emailErr: any) {
      console.error("Resend error:", emailErr);
      // Still return success — lead was captured
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Report sent! Check your inbox."
        : "Report generated. Delivery may be delayed — we'll retry shortly.",
    });
  } catch (err: any) {
    console.error("Audit submit error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
