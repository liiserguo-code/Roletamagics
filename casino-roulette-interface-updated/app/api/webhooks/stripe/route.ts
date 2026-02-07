import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', errorMessage)
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.type === 'deposit') {
          const depositAmount = parseFloat(session.metadata.depositAmount || '0')
          const bonusPercent = parseFloat(session.metadata.bonusPercent || '0')
          const totalAmount = parseFloat(session.metadata.totalAmount || '0')
          
          console.log('[v0] Deposit completed:', {
            sessionId: session.id,
            depositAmount,
            bonusPercent,
            totalAmount,
            paymentStatus: session.payment_status,
          })

          // Here you would:
          // 1. Store transaction in database
          // 2. Update user balance
          // 3. Send confirmation email
          // 4. Log the transaction
          
          // For now, we just log it
          console.log(`[v0] User should receive R$ ${totalAmount.toFixed(2)} in their balance`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[v0] Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[v0] Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`[v0] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error processing webhook:', errorMessage)
    return NextResponse.json(
      { error: `Webhook handler failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
