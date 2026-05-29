import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Vercel Cron: 每天中午12:00 CT (UTC-5/UTC-6) 运行
// vercel.json 配置: "schedule": "0 17 * * *" (UTC 17:00 = CT 12:00)
export async function GET(req: Request) {
  // 验证Cron Secret（防止外部调用）
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // 找：visit_date是昨天、且sms_sent=false的患者
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]

    const { data: patients, error } = await (supabaseAdmin as any)
      .from('patients')
      .select('id, business_id')
      .eq('sms_sent', false)
      .eq('visit_date', yStr)
      .limit(100)

    if (error) throw error

    let sent = 0
    for (const p of patients || []) {
      try {
        // 调用内部API发送短信
        await fetch(`${process.env.APP_URL}/api/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: p.id, businessId: p.business_id }),
        })
        sent++
      } catch (e) {
        console.error(`Failed to send SMS to patient ${p.id}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      date: yStr,
      queued: patients?.length || 0,
      sent,
    })
  } catch (err: any) {
    console.error('Daily SMS cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
