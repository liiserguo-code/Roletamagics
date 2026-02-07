"use client"

import { useState, useCallback } from "react"
import { X, Smartphone, DollarSign, Check, Zap, Shield, Clock } from "lucide-react"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createDepositSession } from "@/app/actions/stripe"
import { DEPOSIT_PACKAGES } from "@/lib/deposit-packages"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDepositSuccess: (amount: number) => void
}

export function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('deposit-100')
  const [customAmount, setCustomAmount] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  if (!isOpen) return null

  const handleStartCheckout = async () => {
    try {
      const packageId = customAmount ? 'custom' : selectedPackageId
      const amount = customAmount ? parseFloat(customAmount) : undefined

      if (packageId === 'custom' && (!amount || amount < 10)) {
        alert("Valor mínimo de depósito é R$ 10,00")
        return
      }

      const { clientSecret } = await createDepositSession(packageId, amount)
      
      if (clientSecret) {
        setClientSecret(clientSecret)
        setShowCheckout(true)
      }
    } catch (error) {
      console.error('[v0] Error starting checkout:', error)
      alert('Erro ao iniciar pagamento. Tente novamente.')
    }
  }

  const fetchClientSecret = useCallback(async () => {
    if (!clientSecret) {
      const packageId = customAmount ? 'custom' : selectedPackageId
      const amount = customAmount ? parseFloat(customAmount) : undefined
      const { clientSecret: newClientSecret } = await createDepositSession(packageId, amount)
      return newClientSecret || ''
    }
    return clientSecret
  }, [clientSecret, customAmount, selectedPackageId])

  const getSelectedPackage = () => {
    return DEPOSIT_PACKAGES.find(pkg => pkg.id === selectedPackageId)
  }

  const getDisplayAmount = () => {
    if (customAmount) {
      const amount = parseFloat(customAmount) || 0
      return { amount, bonus: 0, total: amount }
    }
    const pkg = getSelectedPackage()
    if (!pkg) return { amount: 0, bonus: 0, total: 0 }
    const bonus = (pkg.amount * pkg.bonus) / 100
    return { amount: pkg.amount, bonus, total: pkg.amount + bonus }
  }

  const { amount, bonus, total } = getDisplayAmount()

  // Checkout view
  if (showCheckout) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div 
          className="relative w-full max-w-2xl animate-slide-up my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="glass-card rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div 
              className="relative px-6 py-5 border-b border-white/10"
              style={{
                background: 'linear-gradient(135deg, #1A1A24 0%, #12121A 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gold-gradient">
                    <Zap className="w-5 h-5 text-[#0B0B0F]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold gold-text">Finalizar Pagamento</h2>
                    <p className="text-xs text-[#A0A0A0]">R$ {total.toFixed(2).replace('.', ',')} total</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCheckout(false)
                    setClientSecret(null)
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Voltar"
                >
                  <X className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
                </button>
              </div>
            </div>

            {/* Stripe Checkout */}
            <div className="p-6 bg-white rounded-b-2xl">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Selection view
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg animate-slide-up my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="glass-card rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div 
            className="relative px-6 py-5 border-b border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1A1A24 0%, #12121A 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gold-gradient">
                  <Zap className="w-5 h-5 text-[#0B0B0F]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold gold-text">Depositar</h2>
                  <p className="text-xs text-[#A0A0A0]">Adicione saldo à sua conta</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-card rounded-xl p-3 text-center">
                <Zap className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-[#A0A0A0]">Instantâneo</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-[#A0A0A0]">100% Seguro</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <DollarSign className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-[#A0A0A0]">Com Bônus</p>
              </div>
            </div>

            {/* Deposit packages */}
            <div className="mb-6">
              <label className="text-sm text-[#A0A0A0] mb-3 block">Selecione o valor</label>
              <div className="grid grid-cols-3 gap-3">
                {DEPOSIT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackageId(pkg.id)
                      setCustomAmount("")
                    }}
                    className={`relative p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                      selectedPackageId === pkg.id && !customAmount
                        ? 'border-[#D4AF37] scale-105'
                        : 'border-transparent hover:border-[#D4AF37]/30'
                    }`}
                    style={{
                      background: selectedPackageId === pkg.id && !customAmount
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)'
                        : 'rgba(26, 26, 36, 0.6)',
                    }}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold gold-gradient text-[#0B0B0F]">
                        POPULAR
                      </span>
                    )}
                    <div className="text-lg font-bold gold-text">R$ {pkg.amount}</div>
                    {pkg.bonus > 0 && (
                      <div className="text-[10px] text-[#059669] font-semibold mt-1">
                        +{pkg.bonus}% bônus
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-6">
              <label className="text-sm text-[#A0A0A0] mb-2 block">Ou digite outro valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] font-bold">R$</span>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass-card text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
                  style={{
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">Depósito mínimo: R$ 10,00</p>
            </div>

            {/* Payment method */}
            <div className="mb-6">
              <label className="text-sm text-[#A0A0A0] mb-3 block">Método de pagamento</label>
              <div 
                className="w-full p-4 rounded-xl border-2 border-[#D4AF37] flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gold-gradient">
                    <Smartphone className="w-5 h-5 text-[#0B0B0F]" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold gold-text">Cartão / PIX</div>
                    <div className="text-xs text-[#A0A0A0] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Processamento via Stripe
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#059669] text-white">
                  SEGURO
                </span>
              </div>
            </div>

            {/* Summary */}
            {(amount > 0) && (
              <div className="glass-card rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#A0A0A0]">Valor do depósito</span>
                  <span className="text-sm font-bold text-white">
                    R$ {amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {bonus > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#059669]">Bônus</span>
                    <span className="text-sm font-bold text-[#059669]">
                      + R$ {bonus.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-bold gold-text">Total</span>
                    <span className="text-base font-bold gold-text">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit button */}
            <button
              onClick={handleStartCheckout}
              disabled={!amount || amount < 10}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wider relative overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 50%, #996515 100%)',
                boxShadow: '0 4px 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-[#0B0B0F]">
                <Zap className="w-5 h-5" />
                CONTINUAR PARA PAGAMENTO
              </span>
            </button>

            {/* Terms */}
            <p className="text-xs text-[#A0A0A0] text-center mt-4">
              Pagamento processado com segurança pela Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
