import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { csvData } = await req.json()

    if (!Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
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
