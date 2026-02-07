"use client"

import { useEffect, useState } from "react"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  amount: number
  packageId: string
  onSuccess?: () => void
}

export function StripeCheckout({ amount, packageId, onSuccess }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create checkout session on mount
    const createSession = async () => {
      try {
        const response = await fetch('/api/deposit/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageId,
            amount,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Error creating checkout session:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      }
    }

    createSession()
  }, [amount, packageId])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F7E98E] transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        <p className="mt-4 text-gray-300">Carregando pagamento...</p>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          clientSecret,
          onComplete: () => {
            onSuccess?.()
          },
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
