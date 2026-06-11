import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST /api/business/ensure
 * 确保当前用户有一条 business 记录（使用 service role 绕过 RLS）
 * - 存在则返回
 * - 不存在则创建默认记录（从 user_metadata 获取诊所信息）
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户身份
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

    const supabaseAdmin = getSupabaseAdmin();

    // 2. 用 service role 查询是否已有 business 记录
    const { data: existingRows } = await (supabaseAdmin as any)
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);

    const existing = existingRows?.[0];
    if (existing) {
      return NextResponse.json({ success: true, business: existing, created: false });
    }

    // 3. 不存在 → 使用 service role 创建（绕过 RLS）
    const { name, googleLink, phone } = await req.json().catch(() => ({}));
    const clinicName =
      name ||
      user.user_metadata?.clinic_name ||
      user.user_metadata?.full_name ||
      "My Clinic";
    const reviewLink = googleLink || "";
    const ownerPhone = phone || user.user_metadata?.phone || "";
    const ownerName = user.user_metadata?.full_name || user.user_metadata?.owner_name || "";

    const { data: newBizRows, error: insertErr } = await (supabaseAdmin as any)
      .from("businesses")
      .insert({
        user_id: user.id,
        owner_email: user.email,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        name: clinicName,
        google_review_link: reviewLink,
        plan: "free",
        trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("*");

    // 如果上面失败，尝试更少的字段
    if (insertErr) {
      console.warn("Business insert with full fields failed, trying minimal:", insertErr.message);
      const { data: fallbackRows, error: fallbackErr } = await (supabaseAdmin as any)
        .from("businesses")
        .insert({
          user_id: user.id,
          name: clinicName,
          plan: "free",
          trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("*");

      if (fallbackErr || !fallbackRows?.[0]) {
        console.error("Business insert fallback also failed:", fallbackErr);
        return NextResponse.json({ error: fallbackErr?.message || "Failed to create business" }, { status: 500 });
      }

      return NextResponse.json({ success: true, business: fallbackRows[0], created: true });
    }

    const newBiz = newBizRows?.[0];
    if (!newBiz) {
      return NextResponse.json({ error: "No data returned after insert" }, { status: 500 });
    }

    return NextResponse.json({ success: true, business: newBiz, created: true });
  } catch (err: any) {
    console.error("Ensure business error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
