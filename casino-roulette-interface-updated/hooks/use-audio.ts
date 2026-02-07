import { useCallback, useRef, useEffect } from 'react'

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const generateSpinBuffer = useCallback(() => {
    if (!audioContextRef.current) return null
    const audioContext = audioContextRef.current
    const duration = 4.5
    const sampleRate = audioContext.sampleRate
    const numSamples = sampleRate * duration
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const frequency = 200 + Math.sin(t * 3) * 150
      const envelope = Math.exp(-t * 0.5) * (1 - t / duration)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }, [])

  const generateWinBuffer = useCallback(() => {
    if (!audioContextRef.current) return null
    const audioContext = audioContextRef.current
    const duration = 1.5
    const sampleRate = audioContext.sampleRate
    const numSamples = sampleRate * duration
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const frequency = 400 + t * 600
      const envelope = Math.exp(-t * 2)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4
    }

    return buffer
  }, [])

  const generateLossBuffer = useCallback(() => {
    if (!audioContextRef.current) return null
    const audioContext = audioContextRef.current
    const duration = 1
    const sampleRate = audioContext.sampleRate
    const numSamples = sampleRate * duration
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const frequency = 300 - t * 200
      const envelope = Math.exp(-t * 3)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }, [])

  const playSpin = useCallback(() => {
    if (!audioContextRef.current) return
    try {
      const buffer = generateSpinBuffer()
      if (!buffer) return
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      console.error('Failed to play spin sound:', err)
    }
  }, [generateSpinBuffer])

  const playWin = useCallback(() => {
    if (!audioContextRef.current) return
    try {
      const buffer = generateWinBuffer()
      if (!buffer) return
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      console.error('Failed to play win sound:', err)
    }
  }, [generateWinBuffer])

  const playLoss = useCallback(() => {
    if (!audioContextRef.current) return
    try {
      const buffer = generateLossBuffer()
      if (!buffer) return
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      console.error('Failed to play loss sound:', err)
    }
  }, [generateLossBuffer])

  return { playSpin, playWin, playLoss }
}
