import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // 字段名和注册页面对齐
    const { email, password, clinic, name, phone } = await req.json()

    if (!email || !password || !clinic) {
      return NextResponse.json({ error: 'Email, password, and clinic name are required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 1. 创建Supabase Auth用户
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        clinic_name: clinic,
        owner_name: name,
      }
    })

    if (authError) {
      console.error('Auth create error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. 创建business记录（id = userId，和schema一致）
    const businessData = {
      id: userId,  // ← 关键：businesses.id = auth.users.id
      name: clinic,
      owner_email: email,
      owner_name: name || '',
      owner_phone: phone || '',
      user_id: userId,
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const { data: bizData, error: bizError } = await (supabaseAdmin as any)
      .from('businesses')
      .insert(businessData)
      .select()

    if (bizError) {
      console.error('Business insert error:', bizError)
      // 回滚：删除已创建的auth用户
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: bizError.message }, { status: 500 })
    }

    const biz: any = bizData?.[0]

    return NextResponse.json({
      success: true,
      businessId: biz?.id,
      userId: userId,
      message: 'Registration successful. Start your 30-day free trial.',
    })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 })
  }
}
