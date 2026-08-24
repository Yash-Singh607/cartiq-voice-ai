import { useState, useRef, useCallback, useEffect } from 'react'
import type { VoiceState, Language } from '@/types'

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SRInstance extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string; maxAlternatives: number
  start(): void; stop(): void; abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}
declare global {
  interface Window { SpeechRecognition?: new () => SRInstance; webkitSpeechRecognition?: new () => SRInstance }
}

export interface UseVoiceOpts {
  language: Language
  onFinal: (transcript: string) => void
  onInterim?: (transcript: string) => void
  onError?: (msg: string) => void
}

export function useVoiceRecognition({ language, onFinal, onInterim, onError }: UseVoiceOpts) {
  const [state, setState] = useState<VoiceState>('idle')
  const [interim, setInterim] = useState('')
  const recRef = useRef<SRInstance | null>(null)
  const isSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => () => { recRef.current?.abort() }, [])

  const start = useCallback(() => {
    if (!isSupported) { onError?.('Voice recognition not supported. Use Chrome or Edge.'); setState('error'); return }
    recRef.current?.abort()
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = false; r.interimResults = true; r.lang = language; r.maxAlternatives = 3
    r.onstart = () => { setState('listening'); setInterim('') }
    r.onresult = (e: SpeechRecognitionEvent) => {
      let fin = '', int = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) {
          fin += res[0].transcript
        } else {
          int += res[0].transcript
        }
      }
      const cleanInt = int.replace(/[\.\,\?\!\'\"]/g, '').trim()
      const cleanFin = fin.replace(/[\.\,\?\!\'\"]/g, '').trim()
      if (cleanInt) { setInterim(cleanInt); onInterim?.(cleanInt) }
      if (cleanFin) { setState('processing'); setInterim(''); onFinal(cleanFin) }
    }
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      const msgs: Record<string, string> = {
        'no-speech': 'No speech detected. Try again.',
        'not-allowed': 'Microphone access denied. Please allow microphone permissions in browser settings.',
        'service-not-allowed': 'Speech recognition service blocked or unallowed by browser.',
        'audio-capture': 'Microphone hardware not found or audio capture failed.',
        'network': 'Network error while connecting to speech recognition service.',
        'aborted': '',
      }
      const msg = msgs[e.error] ?? (e.error ? `Speech error: ${e.error}` : '')
      if (msg) { setState('error'); onError?.(msg) } else setState('idle')
    }
    r.onend = () => { if (state === 'listening') setState('idle'); recRef.current = null }
    recRef.current = r
    try { r.start() } catch { setState('error'); onError?.('Could not start microphone.') }
  }, [isSupported, language, onFinal, onInterim, onError, state])

  const stop = useCallback(() => {
    recRef.current?.stop(); recRef.current = null; setState('idle'); setInterim('')
  }, [])

  const setStateExternal = useCallback((s: VoiceState) => setState(s), [])

  return { state, interim, isSupported, start, stop, setState: setStateExternal }
}
