import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

// Paddle Webhook Secret from environment
const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET_KEY || ''

export async function POST(req: NextRequest) {
  try {
    // 1. Get Paddle-Signature header
    const paddleSignature = req.headers.get('paddle-signature')

    if (!paddleSignature) {
      console.error('Paddle-Signature not present in request headers')
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!WEBHOOK_SECRET) {
      console.error('Webhook secret not defined')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    // 2. Extract timestamp and signature from header
    // Format: ts=1234567890;h1=abc123...
    const parts = paddleSignature.split(';')
    if (parts.length < 2) {
      console.error('Invalid Paddle-Signature format')
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const timestampPart = parts.find(p => p.startsWith('ts='))
    const signaturePart = parts.find(p => p.startsWith('h1='))

    if (!timestampPart || !signaturePart) {
      console.error('Unable to extract timestamp or signature')
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const timestamp = timestampPart.split('=')[1]
    const signature = signaturePart.split('=')[1]

    if (!timestamp || !signature) {
      console.error('Invalid timestamp or signature format')
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 3. Get raw body
    const bodyRaw = await req.text()

    // 4. Build signed payload: timestamp:body
    const signedPayload = `${timestamp}:${bodyRaw}`

    // 5. Hash signed payload using HMAC SHA256
    const hashedPayload = createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload, 'utf8')
      .digest('hex')

    // 6. Compare signatures (timing-safe)
    const expectedBuffer = Buffer.from(hashedPayload, 'utf8')
    const receivedBuffer = Buffer.from(signature, 'utf8')

    if (expectedBuffer.length !== receivedBuffer.length) {
      console.error('Signature length mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.error('Computed signature does not match Paddle signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 7. Parse and process webhook event
    const event = JSON.parse(bodyRaw)
    console.log('Paddle Webhook received:', event.event_type)

    // Handle different event types
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.activated':
        await handleSubscriptionCreated(event)
        break
      case 'subscription.updated':
        await handleSubscriptionUpdated(event)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event)
        break
      case 'subscription.past_due':
        await handleSubscriptionPastDue(event)
        break
      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Failed to process Paddle webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle subscription created/activated
async function handleSubscriptionCreated(event: any) {
  const subscription = event.data
  const customerEmail = subscription.customer?.email
  const subscriptionId = subscription.id
  const status = subscription.status
  const priceId = subscription.items?.[0]?.price?.id

  if (!customerEmail) {
    console.error('No customer email in subscription')
    return
  }

  // Determine tier based on price ID
  let tier = 'pro'
  if (priceId === process.env.PADDLE_AGENCY_PRICE_ID) {
    tier = 'agency'
  }

  // Update business in database
  const { error } = await supabaseAdmin
    .from('businesses')
    .update({
      subscription_status: status === 'active' ? 'active' : 'trial',
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: subscription.customer_id,
      subscription_tier: tier,
      trial_ends_at: subscription.current_billing_period?.ends_at || null,
    })
    .eq('owner_email', customerEmail)

  if (error) {
    console.error('Error updating business:', error)
  } else {
    console.log(`Business updated for ${customerEmail}, tier: ${tier}`)
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(event: any) {
  const subscription = event.data
  const subscriptionId = subscription.id
  const status = subscription.status

  const { error } = await supabaseAdmin
    .from('businesses')
    .update({
      subscription_status: status === 'active' ? 'active' : status,
      trial_ends_at: subscription.current_billing_period?.ends_at || null,
    })
    .eq('paddle_subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(event: any) {
  const subscription = event.data
  const subscriptionId = subscription.id

  const { error } = await supabaseAdmin
    .from('businesses')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: 'free',
    })
    .eq('paddle_subscription_id', subscriptionId)

  if (error) {
    console.error('Error cancelling subscription:', error)
  }
}

// Handle subscription past due (payment failed)
async function handleSubscriptionPastDue(event: any) {
  const subscription = event.data
  const subscriptionId = subscription.id

  const { error } = await supabaseAdmin
    .from('businesses')
    .update({
      subscription_status: 'past_due',
    })
    .eq('paddle_subscription_id', subscriptionId)

  if (error) {
    console.error('Error marking past due:', error)
  }
}
