import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

/**
 * GET /api/google/reviews
 * 从 Google Places API 拉取诊所的真实评论
 *
 * 流程：
 * 1. 获取当前用户的 business 信息（google_review_link / place_id）
 * 2. 如果没有 place_id，尝试从 google_review_link 解析
 * 3. 调用 Google Places Details API 获取评论
 * 4. 返回评论列表 + 缓存在 reviews 表中
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google Places API not configured" }, { status: 500 });
    }

    // 获取 business 的 place_id
    const { data: biz } = await supabase
      .from("businesses")
      .select("id, google_review_link, place_id, name")
      .eq("user_id", user.id)
      .single();

    let placeId = biz?.place_id || null;

    // 如果没有 place_id，尝试从 google_review_link 提取
    if (!placeId && biz?.google_review_link) {
      placeId = extractPlaceId(biz.google_review_link);
    }

    if (!placeId) {
      return NextResponse.json({
        success: true,
        reviews: [],
        message: "No Place ID found. Add a Google Review link in Settings first.",
      });
    }

    // 调用 Google Places Details API
    const fields = "reviews,rating,user_ratings_total,name";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${GOOGLE_API_KEY}&language=en`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json({ error: `Places API error: ${data.status}` }, { status: 500 });
    }

    const place = data.result;
    const reviews = (place.reviews || []).map((r: any) => ({
      author_name: r.author_name || "Anonymous",
      rating: r.rating || 0,
      text: r.text || "",
      time: r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString(),
      profile_photo_url: r.profile_photo_url || "",
      relative_time: r.relative_time_description || "",
    }));

    // 同步到 Supabase reviews 表（upsert by author_name + time）
    const supabaseAdmin = getSupabaseAdmin();
    const businessId = biz?.id || user.id;

    for (const r of reviews) {
      // 检查是否已存在
      const { data: existing } = await (supabaseAdmin as any)
        .from("reviews")
        .select("id")
        .eq("business_id", businessId)
        .eq("author_name", r.author_name)
        .eq("created_at", r.time)
        .limit(1);

      if (!existing?.length) {
        await (supabaseAdmin as any).from("reviews").insert({
          business_id: businessId,
          patient_name: r.author_name,
          rating: r.rating,
          comment: r.text,
          platform: "Google",
          status: "new",
          sentiment: r.rating >= 4 ? "positive" : r.rating <= 2 ? "negative" : "neutral",
          resolved: false,
          created_at: r.time,
          is_negative: r.rating <= 2,
          alerted: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      place_name: place.name,
      place_rating: place.rating,
      place_total_reviews: place.user_ratings_total,
      reviews,
      synced: reviews.length,
    });
  } catch (err: any) {
    console.error("Google Reviews error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** 从 Google Maps URL 提取 place_id */
function extractPlaceId(url: string): string | null {
  // place_id:XXXXX 格式
  const pidMatch = url.match(/place_id:([^&]+)/);
  if (pidMatch) return pidMatch[1];
  // data=...!1s0xXXX:0xXXX 格式
  const dataMatch = url.match(/!1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+)/);
  if (dataMatch) return dataMatch[1];
  // cid= 格式（数字ID需要转换，暂不处理）
  return null;
}
