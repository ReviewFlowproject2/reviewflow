import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEffectivePlan, canUseFeature } from "@/lib/plan-config";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

// ==================== Helpers ====================

/** 从 Google Maps URL 提取 place_id 或搜索词 */
function parseGoogleMapsUrl(url: string): {
  placeId?: string;
  name?: string;
  lat?: number;
  lng?: number;
} {
  try {
    // 提取 place_id: https://maps.google.com/?q=place_id:XXX
    const pidMatch = url.match(/place_id:([^&]+)/);
    if (pidMatch) return { placeId: pidMatch[1] };

    // 提取 !1s... 格式中的 place id (新版 Google Maps URL)
    // e.g. /place/Clinic+Name/@lat,lng,17z/data=...!1s0xXXX:0xXXX
    const dataMatch = url.match(/!1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+)/);
    if (dataMatch) return { placeId: dataMatch[1] };

    // 提取 cid (旧版 URL 参数)
    const cidMatch = url.match(/[?&]cid=([^&]+)/);
    if (cidMatch) return { placeId: cidMatch[1] };

    // 提取经纬度 @lat,lng
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
    }

    // 提取地点名称 /place/Name/
    const placeMatch = url.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      return { name: decodeURIComponent(placeMatch[1]).replace(/[+]/g, " ") };
    }
  } catch (e) {
    // ignore parse errors
  }
  return {};
}

// ==================== GET: 查询 Google Places ====================
export async function GET(req: NextRequest) {
  try {
    // 验证用户登录（客户端请求）
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查套餐权限：竞品追踪需要 Free 以上（所有套餐都有）
    const { data: biz } = await supabase
      .from("businesses")
      .select("plan, trial_ends_at, subscription_status, subscription_tier")
      .eq("user_id", user.id)
      .single();
    const plan = getEffectivePlan(biz);
    if (!canUseFeature(plan, "competitorTracking")) {
      return NextResponse.json({ error: "Competitor tracking not available on your plan" }, { status: 403 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google Places API not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "details";
    const placeId = searchParams.get("place_id");
    const url = searchParams.get("url");
    const query = searchParams.get("query");

    // ---- Action: search ----
    if (action === "search" && query) {
      const searchUrl = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query + " dental clinic")}&type=dentist&key=${GOOGLE_API_KEY}`;
      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        return NextResponse.json({ error: `Places API error: ${data.status}` }, { status: 500 });
      }

      const results = (data.results || []).slice(0, 5).map((p: any) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.formatted_address || p.vicinity || "",
        rating: p.rating || 0,
        review_count: p.user_ratings_total || 0,
        types: p.types || [],
      }));

      return NextResponse.json({ success: true, results });
    }

    // ---- Action: parse-url ----
    if (action === "parse-url" && url) {
      const parsed = parseGoogleMapsUrl(url);

      // 如果有 place_id，查详情
      if (parsed.placeId) {
        const detailsUrl = `${PLACES_BASE}/details/json?place_id=${encodeURIComponent(parsed.placeId)}&fields=name,formatted_address,rating,user_ratings_total,place_id,types,geometry&key=${GOOGLE_API_KEY}`;
        const res = await fetch(detailsUrl);
        const data = await res.json();

        if (data.status !== "OK") {
          return NextResponse.json({ error: `Place not found: ${data.status}` }, { status: 404 });
        }

        const p = data.result;
        return NextResponse.json({
          success: true,
          place: {
            place_id: p.place_id,
            name: p.name,
            address: p.formatted_address || "",
            rating: p.rating || 0,
            review_count: p.user_ratings_total || 0,
          },
        });
      }

      // 如果有名称，搜索
      if (parsed.name) {
        const searchUrl = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(parsed.name + " dentist")}&type=dentist&key=${GOOGLE_API_KEY}`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (data.status !== "OK" || !data.results?.length) {
          return NextResponse.json({ error: "No matching place found" }, { status: 404 });
        }

        const p = data.results[0];
        return NextResponse.json({
          success: true,
          place: {
            place_id: p.place_id,
            name: p.name,
            address: p.formatted_address || p.vicinity || "",
            rating: p.rating || 0,
            review_count: p.user_ratings_total || 0,
          },
        });
      }

      // 如果有经纬度，附近搜索
      if (parsed.lat && parsed.lng) {
        const nearbyUrl = `${PLACES_BASE}/nearbysearch/json?location=${parsed.lat},${parsed.lng}&radius=50&type=dentist&key=${GOOGLE_API_KEY}`;
        const res = await fetch(nearbyUrl);
        const data = await res.json();

        if (data.status !== "OK" || !data.results?.length) {
          return NextResponse.json({ error: "No nearby place found" }, { status: 404 });
        }

        const p = data.results[0];
        return NextResponse.json({
          success: true,
          place: {
            place_id: p.place_id,
            name: p.name,
            address: p.vicinity || "",
            rating: p.rating || 0,
            review_count: p.user_ratings_total || 0,
          },
        });
      }

      return NextResponse.json({ error: "Could not extract place information from URL" }, { status: 400 });
    }

    // ---- Action: details (default) ----
    if (placeId) {
      const detailsUrl = `${PLACES_BASE}/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,rating,user_ratings_total,place_id,types,website,formatted_phone_number&key=${GOOGLE_API_KEY}`;
      const res = await fetch(detailsUrl);
      const data = await res.json();

      if (data.status !== "OK") {
        return NextResponse.json({ error: `Place not found: ${data.status}` }, { status: 404 });
      }

      const p = data.result;
      return NextResponse.json({
        success: true,
        place: {
          place_id: p.place_id,
          name: p.name,
          address: p.formatted_address || "",
          rating: p.rating || 0,
          review_count: p.user_ratings_total || 0,
          phone: p.formatted_phone_number || "",
          website: p.website || "",
        },
      });
    }

    return NextResponse.json({ error: "Missing required parameter: place_id, url, or query" }, { status: 400 });
  } catch (err: any) {
    console.error("Google Places API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ==================== POST: 批量刷新竞品数据 ====================
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google Places API not configured" }, { status: 500 });
    }

    const { competitorIds } = await req.json();
    if (!Array.isArray(competitorIds) || competitorIds.length === 0) {
      return NextResponse.json({ error: "competitorIds array required" }, { status: 400 });
    }

    const updated: any[] = [];
    const errors: string[] = [];

    for (const id of competitorIds) {
      try {
        // 获取竞品数据
        const { data: comp } = await supabase
          .from("competitors")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (!comp) {
          errors.push(`${id}: not found`);
          continue;
        }

        // 获取 place_id 或通过名称/地址搜索
        let placeId = comp.place_id || comp.google_place_id;
        if (!placeId && comp.google_link) {
          const parsed = parseGoogleMapsUrl(comp.google_link);
          placeId = parsed.placeId;
        }

        let placeData: any = null;

        if (placeId) {
          const detailsUrl = `${PLACES_BASE}/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,rating,user_ratings_total,place_id&key=${GOOGLE_API_KEY}`;
          const res = await fetch(detailsUrl);
          const data = await res.json();
          if (data.status === "OK") placeData = data.result;
        } else if (comp.name) {
          const query = `${comp.name} ${comp.address || "dental clinic"}`;
          const searchUrl = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query)}&type=dentist&key=${GOOGLE_API_KEY}`;
          const res = await fetch(searchUrl);
          const data = await res.json();
          if (data.status === "OK" && data.results?.length) {
            placeData = data.results[0];
          }
        }

        if (placeData) {
          const updates: any = {
            rating: placeData.rating || comp.rating,
            review_count: placeData.user_ratings_total || comp.review_count,
            address: placeData.formatted_address || placeData.vicinity || comp.address,
            place_id: placeData.place_id || placeId,
            data_refreshed_at: new Date().toISOString(),
          };

          const { error: updateErr } = await supabase
            .from("competitors")
            .update(updates)
            .eq("id", id);

          if (!updateErr) {
            updated.push({ id, ...updates });
          } else {
            errors.push(`${id}: ${updateErr.message}`);
          }
        } else {
          errors.push(`${id}: place not found on Google`);
        }
      } catch (e: any) {
        errors.push(`${id}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      updated: updated.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Batch refresh error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
