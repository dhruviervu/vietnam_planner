import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: SpeechResultEvent) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechResultEvent = {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

function getRecognition(): SpeechRec | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec
    webkitSpeechRecognition?: new () => SpeechRec
  }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  return new Ctor()
}

export function speechInputSupported() {
  if (typeof window === 'undefined') return false
  const w = window as Window & {
    SpeechRecognition?: unknown
    webkitSpeechRecognition?: unknown
  }
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function useSpeechInput(onLive: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wantRef = useRef(false)
  const recRef = useRef<SpeechRec | null>(null)
  const baseRef = useRef('')
  const finalRef = useRef('')
  const startingRef = useRef(false)
  const onLiveRef = useRef(onLive)
  onLiveRef.current = onLive

  const stopRec = useCallback(() => {
    wantRef.current = false
    startingRef.current = false
    setListening(false)
    try {
      recRef.current?.abort()
    } catch {
      /* already stopped */
    }
  }, [])

  const startRec = useCallback((existingDraft: string) => {
    setError(null)
    const rec = recRef.current ?? getRecognition()
    if (!rec) {
      setError('Voice input needs Chrome or Edge, on HTTPS or localhost.')
      return
    }
    recRef.current = rec
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    baseRef.current = existingDraft.replace(/\s+$/, '')
    finalRef.current = ''
    wantRef.current = true

    rec.onresult = (ev) => {
      let finals = ''
      let interim = ''
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const piece = ev.results[i][0]?.transcript ?? ''
        if (ev.results[i].isFinal) finals += `${piece} `
        else interim += piece
      }
      if (finals) finalRef.current = `${finalRef.current} ${finals}`.replace(/\s+/g, ' ').trim()
      const live = [baseRef.current, finalRef.current, interim].filter(Boolean).join(' ').replace(/\s+/g, ' ')
      onLiveRef.current(live.trim())
    }

    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        wantRef.current = false
        setListening(false)
        setError('Microphone permission was blocked.')
        return
      }
      if (ev.error === 'aborted' || ev.error === 'no-speech') return
      setError('Voice input hiccuped — tap the mic and try again.')
    }

    rec.onend = () => {
      startingRef.current = false
      if (!wantRef.current) {
        setListening(false)
        return
      }
      window.setTimeout(() => {
        if (!wantRef.current || !recRef.current || startingRef.current) return
        startingRef.current = true
        try {
          recRef.current.start()
        } catch {
          startingRef.current = false
          wantRef.current = false
          setListening(false)
        }
      }, 80)
    }

    try {
      startingRef.current = true
      rec.start()
      setListening(true)
    } catch {
      startingRef.current = false
      wantRef.current = false
      setListening(false)
      setError('Could not start the microphone. Tap once and try again.')
    }
  }, [])

  const toggle = useCallback(
    (existingDraft: string) => {
      if (listening || wantRef.current) stopRec()
      else startRec(existingDraft)
    },
    [listening, startRec, stopRec],
  )

  useEffect(() => () => stopRec(), [stopRec])

  return {
    supported: speechInputSupported(),
    listening,
    error,
    toggle,
    stop: stopRec,
  }
}
