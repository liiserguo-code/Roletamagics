'use server'

import { stripe } from '@/lib/stripe'
import { DEPOSIT_PACKAGES } from '@/lib/deposit-packages'

export async function createDepositSession(packageId: string, customAmount?: number) {
  try {
    let amount: number
    let description: string
    let bonus: number

    if (packageId === 'custom' && customAmount) {
      // Custom amount validation
      if (customAmount < 10) {
        throw new Error('Valor mínimo de depósito é R$ 10,00')
      }
      amount = customAmount
      description = 'Depósito Customizado'
      bonus = 0
    } else {
      // Find package from predefined packages
      const depositPackage = DEPOSIT_PACKAGES.find((p) => p.id === packageId)
      if (!depositPackage) {
        throw new Error(`Pacote de depósito "${packageId}" não encontrado`)
      }
      amount = depositPackage.amount
      description = depositPackage.name
      bonus = depositPackage.bonus
    }

    const totalAmount = amount + (amount * bonus) / 100
    const priceInCents = amount * 100 // Convert to cents

    // Create Checkout Session with PIX payment method
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'], // Note: PIX requires special setup in Stripe
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Depósito ${description}`,
              description: bonus > 0 
                ? `R$ ${amount.toFixed(2)} + ${bonus}% bônus = R$ ${totalAmount.toFixed(2)}`
                : `R$ ${amount.toFixed(2)}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        type: 'deposit',
        packageId,
        depositAmount: amount.toString(),
        bonusPercent: bonus.toString(),
        totalAmount: totalAmount.toString(),
      },
    })

    return { 
      clientSecret: session.client_secret,
      sessionId: session.id,
    }
  } catch (error) {
    console.error('Error creating deposit session:', error)
    throw error
  }
}

export async function getSessionStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    }
  } catch (error) {
    console.error('Error retrieving session:', error)
    throw error
  }
}
