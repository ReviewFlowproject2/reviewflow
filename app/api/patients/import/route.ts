import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // 检查 trial 是否过期
    const { data: business } = await supabase
      .from("businesses")
      .select("trial_ends_at, plan")
      .eq("user_id", user.id)
      .single()

    if (business && business.plan !== "agency" && business.trial_ends_at) {
      const trialEnd = new Date(business.trial_ends_at)
      const now = new Date()
      if (trialEnd <= now) {
        return NextResponse.json(
          { success: false, error: "Trial expired. Please upgrade your plan to import patients." },
          { status: 403 }
        )
      }
    }

    // 格式化数据
    const formatted = csvData.map((row: any) => ({
      business_id: row.business_id,
      name: row.name?.trim(),
      email: row.email?.trim().toLowerCase(),
      phone: row.phone || '',
      visit_date: row.visit_date,
      email_status: 'pending',
    })).filter((r: any) => r.name && r.email && r.visit_date)

    if (formatted.length === 0) {
      return NextResponse.json({ error: 'No valid data found. Required: name, email, visit_date' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 去掉 ON CONFLICT，直接插入（如果重复会报错，但刚加的字段不会有重复）
    const { data, error } = await (supabaseAdmin as any)
      .from('patients')
      .insert(formatted)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      failed: csvData.length - (data?.length || 0),
    })
  } catch (err: any) {
    console.error('Import error:', err)
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 })
  }
}
