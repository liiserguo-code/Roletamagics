import { useCallback, useRef, useEffect } from 'react'

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const initializedRef = useRef(false)
  const buffersRef = useRef<{
    spin: AudioBuffer | null
    win: AudioBuffer | null
    loss: AudioBuffer | null
  }>({ spin: null, win: null, loss: null })

  useEffect(() => {
    // Initialize Web Audio API only once
    if (typeof window !== 'undefined' && !initializedRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        initializedRef.current = true
        
        // Pre-generate buffers
        if (audioContextRef.current) {
          buffersRef.current.spin = generateSpinBufferInternal(audioContextRef.current)
          buffersRef.current.win = generateWinBufferInternal(audioContextRef.current)
          buffersRef.current.loss = generateLossBufferInternal(audioContextRef.current)
        }
      } catch (e) {
        console.error('Failed to initialize audio:', e)
      }
    }
  }, [])

  const playSpin = useCallback(() => {
    if (!audioContextRef.current || !buffersRef.current.spin) return
    try {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffersRef.current.spin
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      // Silently fail if audio can't play
    }
  }, [])

  const playWin = useCallback(() => {
    if (!audioContextRef.current || !buffersRef.current.win) return
    try {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffersRef.current.win
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      // Silently fail if audio can't play
    }
  }, [])

  const playLoss = useCallback(() => {
    if (!audioContextRef.current || !buffersRef.current.loss) return
    try {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffersRef.current.loss
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (err) {
      // Silently fail if audio can't play
    }
  }, [])

  return { playSpin, playWin, playLoss }
}

function generateSpinBufferInternal(audioContext: AudioContext): AudioBuffer | null {
  try {
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
  } catch (e) {
    return null
  }
}

function generateWinBufferInternal(audioContext: AudioContext): AudioBuffer | null {
  try {
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
  } catch (e) {
    return null
  }
}

function generateLossBufferInternal(audioContext: AudioContext): AudioBuffer | null {
  try {
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
  } catch (e) {
    return null
  }
}


