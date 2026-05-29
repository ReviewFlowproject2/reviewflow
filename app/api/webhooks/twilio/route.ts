import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const messageSid = formData.get('MessageSid') as string
  const status = formData.get('MessageStatus') as string
  const errorMessage = formData.get('ErrorMessage') as string

  // 通过sid更新sms_logs
  if (messageSid) {
    await supabaseAdmin
      .from('sms_logs')
      .update({
        status,
        error_message: errorMessage || null,
      })
      .eq('twilio_sid', messageSid)
  }

  return NextResponse.json({ received: true })
}
