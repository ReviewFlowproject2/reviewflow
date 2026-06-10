import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEffectivePlan, getLimit } from '@/lib/plan-config'

export async function POST(req: NextRequest) {
  try {
    const { csvData } = await req.json()

    if (!Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    // 获取当前用户并检查 trial 状态
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // 获取 business 信息
    const { data: business } = await supabase
      .from("businesses")
      .select("id, trial_ends_at, plan, subscription_status, subscription_tier")
      .eq("user_id", user.id)
      .single()

    const effectivePlan = getEffectivePlan(business)
    const maxPatients = getLimit(effectivePlan, "maxPatients")
    const businessId = business?.id || user.id

    // 检查当前患者数量
    const { count: currentCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)

    const remaining = maxPatients - (currentCount || 0)
    if (remaining <= 0) {
      return NextResponse.json(
        { success: false, error: `Patient limit reached (${currentCount}/${maxPatients}). Please upgrade your plan to import more patients.` },
        { status: 403 }
      )
    }

    // 格式化数据
    const formatted = csvData.map((row: any) => ({
      business_id: businessId,
      name: row.name?.trim(),
      email: row.email?.trim().toLowerCase(),
      phone: row.phone || '',
      visit_date: row.visit_date,
      email_status: 'pending',
    })).filter((r: any) => r.name && r.email && r.visit_date)

    if (formatted.length === 0) {
      return NextResponse.json({ error: 'No valid data found. Required: name, email, visit_date' }, { status: 400 })
    }

    // 限制本次导入数量不超过剩余配额
    const toImport = formatted.slice(0, remaining)
    const skipped = formatted.length - toImport.length

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await (supabaseAdmin as any)
      .from('patients')
      .insert(toImport)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      failed: csvData.length - (data?.length || 0),
      skipped: skipped > 0 ? skipped : undefined,
      limit: { current: (currentCount || 0) + (data?.length || 0), max: maxPatients },
    })
  } catch (err: any) {
    console.error('Import error:', err)
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 })
  }
}
