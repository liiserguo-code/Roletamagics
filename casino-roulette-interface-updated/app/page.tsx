"use client"

import { useState, useCallback, useEffect } from "react"
import { LuxuryBackground } from "@/components/luxury-background"
import { RouletteWheel } from "@/components/roulette-wheel"
import { GameControls } from "@/components/game-controls"
import { RegisterModal } from "@/components/register-modal"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"
import { FloatingNotification } from "@/components/floating-notification"
import { useAudio } from "@/hooks/use-audio"
import { User, LogOut } from "lucide-react"

interface AuthUser {
  name: string
  email: string
  phone: string
}

interface WithdrawRequest {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
}

export default function Home() {
  const { playSpin, playWin, playLoss } = useAudio()
  const [balance, setBalance] = useState(0)
  const [betAmount, setBetAmount] = useState(0.50)
  const [gain, setGain] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [fastMode, setFastMode] = useState(false)
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([])

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("luxspin_current_user")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const [insufficientBalance, setInsufficientBalance] = useState(false)

  const handleSpin = useCallback(() => {
    if (balance < betAmount) {
      // Only show register if not logged in AND has no balance
      if (!currentUser) {
        setShowRegister(true)
      } else {
        // Show insufficient balance warning
        setInsufficientBalance(true)
        setTimeout(() => setInsufficientBalance(false), 2000)
      }
      return false
    }

    playSpin()
    setIsSpinning(true)
    setBalance(prev => prev - betAmount)
    setGain(null)
    return true
  }, [balance, betAmount, currentUser, playSpin])

  const handleSpinComplete = useCallback((outerValue: string, innerValue: string) => {
    setIsSpinning(false)
    
    // Calculate winnings
    const outerMultiplier = parseFloat(outerValue.replace('x', ''))
    const innerMultiplier = parseFloat(innerValue.replace('x', ''))
    
    // If outer is 0x, lose based on inner multiplier (can lose more than bet)
    if (outerMultiplier === 0) {
      playLoss()
      const lossMultiplier = innerMultiplier // 1x to 4x loss
      const lossAmount = betAmount * lossMultiplier
      setGain(-lossAmount)
      setBalance(prev => Math.max(0, prev - (lossAmount - betAmount))) // Already deducted betAmount on spin
      return
    }
    
    playWin()
    const totalMultiplier = outerMultiplier * innerMultiplier
    const winAmount = betAmount * totalMultiplier
    
    setGain(winAmount)
    setBalance(prev => prev + winAmount)
  }, [betAmount, playWin, playLoss])

  const handleDeposit = useCallback(() => {
    setShowDeposit(true)
  }, [])

  const handleDepositSuccess = useCallback((amount: number) => {
    setBalance(prev => prev + amount)
  }, [])

  const handleWithdrawRequest = useCallback((amount: number) => {
    // Deduct from balance immediately
    setBalance(prev => prev - amount)
    
    // Create new withdraw request
    const newRequest: WithdrawRequest = {
      id: `withdraw-${Date.now()}`,
      amount,
      status: 'pending',
      timestamp: new Date(),
    }
    
    setWithdrawRequests(prev => [newRequest, ...prev])
    setShowWithdraw(false)
  }, [])

  const handleBetChange = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])

  const handleAuthSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    // Give welcome bonus
    setBalance(prev => prev + 10)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("luxspin_current_user")
    setCurrentUser(null)
    setBalance(0)
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden">
      <LuxuryBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between py-6 px-4">
        {/* Header with brand and user info */}
        <header className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between">
            {/* User profile or login button */}
            <div className="w-10">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Sair"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
                </button>
              ) : null}
            </div>

            {/* Brand */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider">
                <span className="gold-text">Lux</span>
                <span className="text-[#F5F5F5]">Spin</span>
              </h1>
              <p className="text-[#A0A0A0] text-xs mt-1 tracking-widest uppercase">
                Premium Roulette Experience
              </p>
            </div>

            {/* User profile or register button */}
            <div className="w-10">
              {currentUser ? (
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-full gold-gradient"
                  title={currentUser.name}
                >
                  <span className="text-[#0B0B0F] font-bold text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegister(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Criar conta ou entrar"
                >
                  <User className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
                </button>
              )}
            </div>
          </div>

          {/* Welcome message for logged in users */}
          {currentUser && (
            <div className="mt-3 text-center">
              <p className="text-sm text-[#A0A0A0]">
                Bem-vindo, <span className="gold-text font-semibold">{currentUser.name.split(' ')[0]}</span>
              </p>
            </div>
          )}
        </header>

        {/* Roulette wheel */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <RouletteWheel
            isSpinning={isSpinning}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
            fastMode={fastMode}
          />
        </div>

        {/* Game controls */}
        <GameControls
          balance={balance}
          betAmount={betAmount}
          gain={gain}
          onBetChange={handleBetChange}
          onDeposit={handleDeposit}
          onRegister={() => setShowRegister(true)}
          isSpinning={isSpinning}
          isLoggedIn={!!currentUser}
          insufficientBalance={insufficientBalance}
          fastMode={fastMode}
          onToggleFastMode={() => setFastMode(!fastMode)}
          onWithdraw={() => setShowWithdraw(true)}
        />
      </div>

      {/* Floating notifications */}
      <FloatingNotification />

      {/* Register modal */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Deposit modal */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      {/* Withdraw modal */}
      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        balance={balance}
        onWithdrawRequest={handleWithdrawRequest}
        pendingWithdraws={withdrawRequests}
      />
    </main>
  )
}
