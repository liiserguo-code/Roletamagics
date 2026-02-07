"use client"

import { useState } from "react"
import { X, CreditCard, Smartphone, DollarSign, Check, Zap, Shield, Clock } from "lucide-react"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDepositSuccess: (amount: number) => void
}

const DEPOSIT_OPTIONS = [
  { amount: 20, popular: false, bonus: 0 },
  { amount: 50, popular: true, bonus: 5 },
  { amount: 100, popular: false, bonus: 15 },
  { amount: 200, popular: false, bonus: 40 },
  { amount: 500, popular: false, bonus: 125 },
  { amount: 1000, popular: false, bonus: 300 },
]

const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', icon: Smartphone, instant: true, description: 'Pagamento instantâneo' },
]

export function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const getBonus = (amount: number) => {
    const option = DEPOSIT_OPTIONS.find(opt => opt.amount === amount)
    return option?.bonus || Math.floor(amount * 0.1)
  }

  const handleDeposit = async () => {
    const depositAmount = customAmount ? parseFloat(customAmount) : selectedAmount
    
    if (isNaN(depositAmount) || depositAmount < 10) {
      alert("Valor mínimo de depósito é R$ 10,00")
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const bonus = getBonus(depositAmount)
    const totalAmount = depositAmount + bonus
    
    setIsProcessing(false)
    setIsSuccess(true)
    
    // Wait for success animation
    setTimeout(() => {
      onDepositSuccess(totalAmount)
      setIsSuccess(false)
      setCustomAmount("")
      onClose()
    }, 2000)
  }

  const bonus = customAmount 
    ? getBonus(parseFloat(customAmount) || 0)
    : getBonus(selectedAmount)
  
  const totalAmount = (customAmount ? parseFloat(customAmount) || 0 : selectedAmount) + bonus

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
        {/* Success overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(5, 150, 105, 0.95)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-center animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center animate-check-bounce">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Depósito Confirmado!</h3>
              <p className="text-white/90 text-lg">
                R$ {totalAmount.toFixed(2).replace('.', ',')} creditado
              </p>
            </div>
          </div>
        )}

        {/* Main modal */}
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
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
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

            {/* Deposit amounts */}
            <div className="mb-6">
              <label className="text-sm text-[#A0A0A0] mb-3 block">Selecione o valor</label>
              <div className="grid grid-cols-3 gap-3">
                {DEPOSIT_OPTIONS.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => {
                      setSelectedAmount(option.amount)
                      setCustomAmount("")
                    }}
                    disabled={isProcessing}
                    className={`relative p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                      selectedAmount === option.amount && !customAmount
                        ? 'border-[#D4AF37] scale-105'
                        : 'border-transparent hover:border-[#D4AF37]/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{
                      background: selectedAmount === option.amount && !customAmount
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)'
                        : 'rgba(26, 26, 36, 0.6)',
                    }}
                  >
                    {option.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold gold-gradient text-[#0B0B0F]">
                        POPULAR
                      </span>
                    )}
                    <div className="text-lg font-bold gold-text">R$ {option.amount}</div>
                    {option.bonus > 0 && (
                      <div className="text-[10px] text-[#059669] font-semibold mt-1">
                        +R$ {option.bonus} bônus
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
                  disabled={isProcessing}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass-card text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
                  style={{
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">Depósito mínimo: R$ 10,00</p>
            </div>

            {/* Payment methods */}
            <div className="mb-6">
              <label className="text-sm text-[#A0A0A0] mb-3 block">Método de pagamento</label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      disabled={isProcessing}
                      className={`w-full p-4 rounded-xl transition-all duration-300 border-2 flex items-center justify-between ${
                        selectedMethod === method.id
                          ? 'border-[#D4AF37]'
                          : 'border-transparent hover:border-[#D4AF37]/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{
                        background: selectedMethod === method.id
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)'
                          : 'rgba(26, 26, 36, 0.6)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'gold-gradient' : 'bg-[#2A2A3A]'}`}>
                          <Icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-[#0B0B0F]' : 'text-[#A0A0A0]'}`} />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold ${selectedMethod === method.id ? 'gold-text' : 'text-white'}`}>
                            {method.name}
                          </div>
                          <div className="text-xs text-[#A0A0A0] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {method.description}
                          </div>
                        </div>
                      </div>
                      {method.instant && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#059669] text-white">
                          INSTANTÂNEO
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            {(selectedAmount || customAmount) && (
              <div className="glass-card rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#A0A0A0]">Valor do depósito</span>
                  <span className="text-sm font-bold text-white">
                    R$ {(customAmount ? parseFloat(customAmount) || 0 : selectedAmount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#059669]">Bônus</span>
                  <span className="text-sm font-bold text-[#059669]">
                    + R$ {bonus.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-bold gold-text">Total</span>
                    <span className="text-base font-bold gold-text">
                      R$ {totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit button */}
            <button
              onClick={handleDeposit}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wider relative overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isProcessing 
                  ? 'linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 100%)'
                  : 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 50%, #996515 100%)',
                boxShadow: isProcessing 
                  ? '0 4px 15px rgba(0, 0, 0, 0.3)'
                  : '0 4px 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-[#0B0B0F]">
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    CONFIRMAR DEPÓSITO
                  </>
                )}
              </span>
              
              {!isProcessing && (
                <div 
                  className="absolute inset-0 animate-light-sweep opacity-40"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    width: '50%',
                  }}
                />
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-[#A0A0A0] text-center mt-4">
              Ao depositar, você concorda com nossos{' '}
              <button className="text-[#D4AF37] hover:underline">Termos de Serviço</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
