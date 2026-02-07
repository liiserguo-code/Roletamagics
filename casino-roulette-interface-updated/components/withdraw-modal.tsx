"use client"

import { useState } from "react"
import { X, ArrowDownToLine, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface WithdrawRequest {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
}

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  onWithdrawRequest: (amount: number) => void
  pendingWithdraws: WithdrawRequest[]
}

const QUICK_WITHDRAW_AMOUNTS = [20, 50, 100, 200, 500]

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  balance, 
  onWithdrawRequest,
  pendingWithdraws 
}: WithdrawModalProps) {
  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleWithdraw = () => {
    const amount = selectedAmount || parseFloat(customAmount)

    if (!amount || amount <= 0) {
      alert("Por favor, insira um valor válido")
      return
    }

    if (amount > balance) {
      alert("Saldo insuficiente para saque")
      return
    }

    if (amount < 10) {
      alert("Valor mínimo de saque é R$ 10,00")
      return
    }

    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      onWithdrawRequest(amount)
      setIsProcessing(false)
      setCustomAmount("")
      setSelectedAmount(null)
      alert(`Solicitação de saque de R$ ${amount.toFixed(2)} enviada!\nStatus: PENDENTE`)
    }, 1000)
  }

  const getStatusIcon = (status: WithdrawRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: WithdrawRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'PENDENTE'
      case 'completed':
        return 'CONCLUÍDO'
      case 'failed':
        return 'FALHOU'
    }
  }

  const getStatusColor = (status: WithdrawRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500'
      case 'completed':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
    }
  }

  const withdrawAmount = selectedAmount || parseFloat(customAmount) || 0

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
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  }}
                >
                  <ArrowDownToLine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Solicitar Saque</h2>
                  <p className="text-xs text-[#A0A0A0]">Disponível: R$ {balance.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-[#A0A0A0] hover:text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Quick withdraw amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">
                Valores Rápidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_WITHDRAW_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount("")
                    }}
                    disabled={amount > balance}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      selectedAmount === amount
                        ? 'border-[#059669] bg-[#059669]/10'
                        : 'border-white/10 hover:border-[#059669]/50'
                    } ${amount > balance ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-center">
                      <p className={`font-bold text-lg ${
                        selectedAmount === amount ? 'text-[#059669]' : 'text-white'
                      }`}>
                        R$ {amount}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">
                Valor Personalizado
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] font-medium">
                  R$
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="0,00"
                  min="10"
                  max={balance}
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-[#0B0B0F] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#059669]/50 transition-colors"
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                Mínimo: R$ 10,00 • Máximo: R$ {balance.toFixed(2)}
              </p>
            </div>

            {/* Summary */}
            {withdrawAmount > 0 && (
              <div 
                className="p-4 rounded-xl mb-6 border border-[#059669]/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(4, 120, 87, 0.05) 100%)',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#A0A0A0]">Valor do Saque</span>
                  <span className="text-lg font-bold text-[#059669]">
                    R$ {withdrawAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#A0A0A0]">
                  <span>Saldo após saque</span>
                  <span>R$ {(balance - withdrawAmount).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            )}

            {/* Withdraw button */}
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || withdrawAmount > balance || withdrawAmount < 10 || isProcessing}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wider relative overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 30px rgba(5, 150, 105, 0.5)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-5 h-5" />
                    SOLICITAR SAQUE
                  </>
                )}
              </span>
            </button>

            {/* Pending withdrawals */}
            {pendingWithdraws.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#A0A0A0] mb-3">
                  Histórico de Saques
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingWithdraws.map((withdraw) => (
                    <div
                      key={withdraw.id}
                      className="p-3 rounded-lg border border-white/10 bg-[#0B0B0F]/50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(withdraw.status)}
                          <div>
                            <p className="text-sm font-medium text-white">
                              R$ {withdraw.amount.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-[#A0A0A0]">
                              {withdraw.timestamp.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${getStatusColor(withdraw.status)}`}>
                          {getStatusText(withdraw.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
