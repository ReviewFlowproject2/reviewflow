import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // 1. 找所有在trial或active状态的诊所
    const { data: businesses, error: bErr } = await (supabaseAdmin as any)
      .from('businesses')
      .select('*')
      .in('subscription_status', ['trial', 'active'])

    if (bErr) throw bErr

    let alertedCount = 0

    for (const biz of businesses || []) {
      // MVP阶段：手动抓Review（Google Places API免费额度有限）
      // 这里用模拟逻辑：检查reviews表中 is_negative=true 且 alerted=false 的记录
      const { data: newNegReviews, error: rErr } = await (supabaseAdmin as any)
        .from('reviews')
        .select('*')
        .eq('business_id', biz.id)
        .eq('is_negative', true)
        .eq('alerted', false)
        .order('created_at', { ascending: false })

      if (rErr || !newNegReviews?.length) continue

      for (const review of newNegReviews) {
        // 2. 发邮件警报给老板
        await resend.emails.send({
          from: `ReviewFlow <${process.env.RESEND_FROM_EMAIL}>`,
          to: biz.owner_email,
          subject: `New ${review.rating}-star review for ${biz.name} - Action needed`,
          headers: {
            'List-Unsubscribe': `<mailto:unsubscribe@reviewflowdental.com?subject=unsubscribe-${biz.id}>`,
            'Precedence': 'bulk'
          },
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#dc2626;">New Negative Review Alert</h2>
              <p>Hi ${biz.owner_name || 'Doctor'},</p>
              <p>Your clinic <strong>${biz.name}</strong> just received a new review:</p>
              <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
                <p style="margin:0;font-size:24px;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
                <p style="margin:8px 0 0;font-style:italic;">"${review.content || 'No text provided'}"</p>
                <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">- ${review.author_name || 'Anonymous'}</p>
              </div>
              <p><strong>Why this matters:</strong> 94% of patients check reviews before choosing a dentist. A fast, professional response can turn this around.</p>
              <p><strong>Suggested response template:</strong></p>
              <div style="background:#eff6ff;padding:12px;border-left:4px solid #3b82f6;">
                "Thank you for your feedback, ${review.author_name || 'patient'}. We take all concerns seriously and would like to make this right. Please call our office directly at ${biz.owner_phone || '[your phone]'} so we can address this personally. - ${biz.owner_name || 'Office Manager'}"
              </div>
              <p style="margin-top:24px;">
                <a href="https://business.google.com/reviews" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Respond on Google</a>
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
              <p style="color:#9ca3af;font-size:12px;">
                Powered by ReviewFlow<br>
                <a href="mailto:unsubscribe@reviewflowdental.com?subject=unsubscribe-${biz.id}" style="color:#9ca3af;">Unsubscribe from these alerts</a>
              </p>
            </div>
          `,
        })

        // 3. 标记为已警报
        await (supabaseAdmin as any)
          .from('reviews')
          .update({ alerted: true, alerted_at: new Date().toISOString() })
          .eq('id', review.id)

        alertedCount++
      }
    }

    return NextResponse.json({
      success: true,
      businessesChecked: businesses?.length || 0,
      alertsSent: alertedCount,
    })
  } catch (err: any) {
    console.error('Check reviews cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
