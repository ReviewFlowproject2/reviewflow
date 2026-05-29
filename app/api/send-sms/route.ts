import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req: NextRequest) {
  try {
    const { patientId, businessId } = await req.json()
    const supabaseAdmin = getSupabaseAdmin()

    let targetPatientId = patientId
    let targetBusinessId = businessId

    // 如果没有提供 patientId，自动查找第一个未发送的患者
    if (!targetPatientId) {
      const { data: patients, error: findErr } = await (supabaseAdmin as any)
        .from('patients')
        .select('id, business_id, name, phone')
        .eq('sms_sent', false)
        .order('created_at', { ascending: true })
        .limit(1)

      if (findErr) {
        return NextResponse.json({ error: findErr.message }, { status: 500 })
      }

      if (!patients || patients.length === 0) {
        return NextResponse.json({ 
          error: 'No unsent patients found. Import patients first.' 
        }, { status: 400 })
      }

      const firstPatient: any = patients[0]
      targetPatientId = firstPatient.id
      targetBusinessId = firstPatient.business_id
    }

    // 1. 获取患者和诊所信息
    const { data: patient, error: pErr } = await (supabaseAdmin as any)
      .from('patients')
      .select('*, businesses(name, google_review_url)')
      .eq('id', targetPatientId)
      .single()

    if (pErr || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patientData: any = patient

    if (patientData.sms_sent) {
      return NextResponse.json({ error: 'SMS already sent' }, { status: 400 })
    }

    // 2. 构造短信
    const clinicName = patientData.businesses?.name || 'Your Dental Clinic'
    const reviewUrl = patientData.businesses?.google_review_url || 'https://g.page/review'

    const body = `Hi ${patientData.name.split(' ')[0]}, thanks for visiting ${clinicName} on ${patientData.visit_date}. If you had a great experience, we'd love a quick Google review — it takes 30 seconds: ${reviewUrl}`

    // 3. 调用 Twilio 发送
    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patientData.phone,
    })

    // 4. 更新数据库
    const updateData = { sms_sent: true, sms_sent_at: new Date().toISOString() }
    await (supabaseAdmin as any)
      .from('patients')
      .update(updateData)
      .eq('id', targetPatientId)

    const logData = {
      patient_id: targetPatientId,
      business_id: targetBusinessId || patientData.business_id,
      twilio_sid: message.sid,
      status: message.status,
      body,
    }
    await (supabaseAdmin as any).from('sms_logs').insert(logData)

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
      to: patientData.phone,
      message: `SMS sent to ${patientData.phone}`,
    })
  } catch (err: any) {
    console.error('SMS send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
