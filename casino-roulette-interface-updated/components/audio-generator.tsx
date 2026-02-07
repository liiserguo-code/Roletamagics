"use client"

import { useEffect } from 'react'

// Generate audio files using Web Audio API
export function AudioGenerator() {
  useEffect(() => {
    const generateSpinSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const duration = 4.5
      const sampleRate = audioContext.sampleRate
      const numSamples = sampleRate * duration
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)

      // Create a rising and falling pitch sound
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        const frequency = 200 + Math.sin(t * 3) * 150
        const envelope = Math.exp(-t * 0.5) * (1 - t / duration)
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
      }

      return buffer
    }

    const generateWinSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const duration = 1.5
      const sampleRate = audioContext.sampleRate
      const numSamples = sampleRate * duration
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)

      // Create celebratory ascending tones
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        const frequency = 400 + t * 600
        const envelope = Math.exp(-t * 2)
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4
      }

      return buffer
    }

    const generateLossSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const duration = 1
      const sampleRate = audioContext.sampleRate
      const numSamples = sampleRate * duration
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)

      // Create descending "sad" tone
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        const frequency = 300 - t * 200
        const envelope = Math.exp(-t * 3)
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
      }

      return buffer
    }

    // Pre-generate sounds (optional, for performance)
    try {
      generateSpinSound()
      generateWinSound()
      generateLossSound()
    } catch (err) {
      console.error('Failed to pre-generate audio:', err)
    }
  }, [])

  return null
}
