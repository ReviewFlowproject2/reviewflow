import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@reviewflowdental.com";

export async function GET(request: Request) {
  // 验证 cron secret（防止外部调用）
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // 查询所有 Agency 用户且开启了 Daily Digest
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
    // 检查今天是否已发送（防重复）
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

    // 昨日新 reviews
    const { data: newReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .gte("created_at", startOfYesterday)
      .lte("created_at", endOfYesterday)
      .order("created_at", { ascending: false });

    // 昨日差评 (1-3星)
    const negativeReviews = newReviews?.filter((r) => r.rating <= 3) || [];

    // 平均评分
    const avgRating = newReviews?.length
      ? (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(1)
      : "0.0";

    // 竞品数据
    const { data: competitors } = await supabase
      .from("competitors")
      .select("*")
      .eq("business_id", businessId)
      .order("last_checked_at", { ascending: false })
      .limit(5);

    const dateFormatted = yesterday.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const subject = `[ReviewFlow] Your Daily Reputation Digest — ${dateFormatted}`;

    let negativeListHtml = "";
    if (negativeReviews.length > 0) {
      negativeListHtml = `<h3 style="color:#dc2626;margin-top:16px;">⚠️ Negative Reviews (${negativeReviews.length})</h3>`;
      negativeReviews.forEach((r) => {
        negativeListHtml += `<p style="margin:4px 0;font-size:14px;"><strong>${r.author_name || "Anonymous"}:</strong> ${r.rating}⭐ — "${r.content?.substring(0, 100) || "No comment"}"</p>`;
      });
    }

    let competitorHtml = "";
    if (competitors && competitors.length > 0) {
      competitorHtml = `<h3 style="color:#2563eb;margin-top:16px;">📊 Competitor Update</h3>`;
      competitors.forEach((c) => {
        competitorHtml += `<p style="margin:4px 0;font-size:14px;">${c.name}: ${c.review_count || 0} reviews, ${c.current_rating || "N/A"}⭐ avg</p>`;
      });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
        <div style="border-bottom:2px solid #e0e7f1;padding-bottom:16px;margin-bottom:24px;">
          <h2 style="color:#1e40af;margin:0;font-size:20px;">ReviewFlow</h2>
          <p style="color:#64748b;margin:4px 0 0;font-size:14px;">Daily Reputation Digest</p>
        </div>

        <p style="font-size:16px;margin-bottom:16px;">Good morning, <strong>${biz.name}</strong>!</p>
        <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Yesterday at a glance:</p>

        <div style="background:#f8faff;padding:16px;border-radius:12px;margin:16px 0;border:1px solid #e0e7f1;">
          <p style="margin:8px 0;font-size:15px;"><strong>⭐ New Reviews:</strong> ${newReviews?.length || 0}</p>
          <p style="margin:8px 0;font-size:15px;"><strong>Average Rating:</strong> ${avgRating} / 5</p>
          <p style="margin:8px 0;font-size:15px;"><strong>⚠️ Negative Reviews:</strong> ${negativeReviews.length}</p>
        </div>

        ${negativeListHtml}
        ${competitorHtml}

        <div style="margin-top:24px;padding:16px;background:#fef3c7;border-radius:8px;border:1px solid #fde68a;">
          <p style="margin:0;font-weight:bold;color:#92400e;font-size:14px;">🎯 Action Recommended:</p>
          <p style="margin:4px 0;color:#92400e;font-size:14px;">- Respond to negative reviews ASAP</p>
          <p style="margin:4px 0;color:#92400e;font-size:14px;">- Monitor competitor trends</p>
        </div>

        <p style="margin-top:24px;color:#94a3b8;font-size:12px;">
          Have a great day,<br/>ReviewFlow
        </p>

        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e7f1;text-align:center;">
          <a href="https://reviewflow.app/dashboard" style="color:#2563eb;font-size:13px;text-decoration:none;">Open Dashboard →</a>
        </div>
      </div>
    `;

    // 发送给 owner + alert_recipients
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

    // 记录日志
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
