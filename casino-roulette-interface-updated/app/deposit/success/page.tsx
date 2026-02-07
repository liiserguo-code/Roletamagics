"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function DepositSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [amount, setAmount] = useState<number>(0)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/status?session_id=${sessionId}`)
        const data = await response.json()

        if (data.status === 'complete') {
          setStatus('success')
          setAmount(data.amount || 0)
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
      }
    }

    verifyPayment()
  }, [sessionId, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-700">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Verificando pagamento...
            </h1>
            <p className="text-gray-400">
              Aguarde enquanto confirmamos seu depósito
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-400 mb-4">
              R$ {(amount / 100).toFixed(2)} foram creditados em sua conta
            </p>
            <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecionando...</span>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Erro no Pagamento
            </h1>
            <p className="text-gray-400 mb-6">
              Não foi possível confirmar seu pagamento
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#F7E98E] transition-colors"
            >
              Voltar ao Início
            </button>
          </>
        )}
      </div>
    </div>
  )
}
