import { useEffect, useMemo, useRef, useState } from 'react'
import type { TitledParagraph } from '../../lib/guideParagraphs'

type Props = {
  sections: TitledParagraph[]
  label: string
}

/** Mild speed-up — still clear word-by-word (1.5× / 2× were too fast). */
const RATE_NORMAL = 1
const RATE_FASTER = 1.18
type RateOption = typeof RATE_NORMAL | typeof RATE_FASTER

/** Chrome silently fails on very long utterances — speak paragraph by paragraph. */
type SpeechUnit = {
  text: string
  paraIndex: number
}

function unitsForSections(sections: TitledParagraph[], maxLen = 220): SpeechUnit[] {
  const units: SpeechUnit[] = []
  sections.forEach((section, paraIndex) => {
    const para = `${section.title}. ${section.body}`.replace(/\s+/g, ' ').trim()
    const sentences = para.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [para]
    let buf = ''
    const flush = () => {
      if (buf) {
        units.push({ text: buf, paraIndex })
        buf = ''
      }
    }
    for (const raw of sentences) {
      const s = raw.trim()
      if (!s) continue
      if ((buf + ' ' + s).trim().length <= maxLen) {
        buf = (buf + ' ' + s).trim()
      } else {
        flush()
        if (s.length <= maxLen) {
          buf = s
        } else {
          for (let i = 0; i < s.length; i += maxLen) {
            units.push({ text: s.slice(i, i + maxLen), paraIndex })
          }
        }
      }
    }
    flush()
  })
  return units
}

function pickPoshVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0
    if (/en-GB/i.test(v.lang)) s += 50
    if (/en-US/i.test(v.lang)) s += 30
    if (/^en/i.test(v.lang)) s += 20
    if (/British|UK English|Google UK|Daniel|Serena|Martha|Libby|Ryan/i.test(v.name)) s += 40
    if (/Google US English|Microsoft (Aria|Jenny|Guy|Sara|Zira|David)/i.test(v.name)) s += 25
    if (v.localService) s += 5
    return s
  }
  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null
}

function unstickSynth(synth: SpeechSynthesis) {
  // Chrome often leaves synthesis in a paused / broken state
  try {
    synth.resume()
  } catch {
    /* ignore */
  }
  try {
    synth.cancel()
  } catch {
    /* ignore */
  }
}

export function GuideSpeechPlayer({ sections, label }: Props) {
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState<RateOption>(1)
  const [status, setStatus] = useState<string | null>(null)
  const [, setChunkIndex] = useState(0)
  const [paraIndex, setParaIndex] = useState(0)

  const chunksRef = useRef<SpeechUnit[]>([])
  const indexRef = useRef(0)
  const rateRef = useRef<RateOption>(1)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const pausedRef = useRef(false)
  const activeRef = useRef(false)
  const keepAliveRef = useRef<number | null>(null)

  const chunks = useMemo(() => unitsForSections(sections), [sections])
  const paraCount = useMemo(
    () => (chunks.length ? chunks[chunks.length - 1].paraIndex + 1 : 0),
    [chunks],
  )
  const voice = useMemo(() => pickPoshVoice(voices), [voices])

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    voiceRef.current = voice
  }, [voice])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    const synth = window.speechSynthesis
    const load = () => {
      const list = synth.getVoices()
      if (list.length) setVoices(list)
    }
    load()
    // Some browsers only populate voices after a delay
    const t = window.setTimeout(load, 250)
    synth.addEventListener('voiceschanged', load)
    return () => {
      window.clearTimeout(t)
      synth.removeEventListener('voiceschanged', load)
      stopKeepAlive()
      unstickSynth(synth)
      activeRef.current = false
    }
  }, [])

  useEffect(() => {
    // Reset when guide text changes (don't call stop() — avoid StrictMode cancel races)
    activeRef.current = false
    pausedRef.current = false
    indexRef.current = 0
    stopKeepAlive()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      unstickSynth(window.speechSynthesis)
    }
    setSpeaking(false)
    setPaused(false)
    setChunkIndex(0)
    setParaIndex(0)
    setStatus(null)
    chunksRef.current = unitsForSections(sections)
  }, [sections])

  function stopKeepAlive() {
    if (keepAliveRef.current != null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }

  function startKeepAlive(synth: SpeechSynthesis) {
    stopKeepAlive()
    // Chrome bug: speech can freeze; periodic resume keeps long readings alive
    keepAliveRef.current = window.setInterval(() => {
      if (activeRef.current && !pausedRef.current && synth.speaking) {
        try {
          synth.resume()
        } catch {
          /* ignore */
        }
      }
    }, 8000)
  }

  function speakNext() {
    const synth = window.speechSynthesis
    const list = chunksRef.current
    const i = indexRef.current
    if (!activeRef.current || pausedRef.current) return
    if (i >= list.length) {
      activeRef.current = false
      setSpeaking(false)
      setPaused(false)
      setStatus(null)
      setChunkIndex(0)
      setParaIndex(0)
      stopKeepAlive()
      return
    }

    const unit = list[i]
    const utter = new SpeechSynthesisUtterance(unit.text)
    utter.rate = rateRef.current
    utter.pitch = 1
    utter.volume = 1
    const v = voiceRef.current
    if (v) {
      utter.voice = v
      utter.lang = v.lang
    } else {
      utter.lang = 'en-GB'
    }

    utter.onstart = () => {
      setSpeaking(true)
      setPaused(false)
      setStatus(null)
      setChunkIndex(i + 1)
      setParaIndex(unit.paraIndex + 1)
    }

    utter.onend = () => {
      if (!activeRef.current || pausedRef.current) return
      const finished = list[i]
      indexRef.current += 1
      const next = list[indexRef.current]
      const gap = next && finished && next.paraIndex !== finished.paraIndex ? 450 : 40
      window.setTimeout(() => speakNext(), gap)
    }

    utter.onerror = (ev) => {
      // "interrupted" / "canceled" are expected on Stop
      const err = ev.error
      if (err === 'interrupted' || err === 'canceled') return
      activeRef.current = false
      setSpeaking(false)
      setPaused(false)
      stopKeepAlive()
      setStatus(
        err === 'not-allowed'
          ? 'Browser blocked speech — click Play again after interacting with the page.'
          : 'Could not play audio. Try another browser or check system sound settings.',
      )
    }

    try {
      synth.speak(utter)
    } catch {
      setStatus('Could not start speech synthesis.')
      activeRef.current = false
      setSpeaking(false)
      stopKeepAlive()
    }
  }

  function play() {
    if (!supported || !sections.length) {
      setStatus('Nothing to read yet.')
      return
    }
    const synth = window.speechSynthesis

    // Resume if paused mid-guide
    if (pausedRef.current && activeRef.current) {
      pausedRef.current = false
      setPaused(false)
      setSpeaking(true)
      try {
        synth.resume()
      } catch {
        /* ignore */
      }
      // If resume didn't restart, continue from current chunk
      if (!synth.speaking && !synth.pending) {
        speakNext()
      }
      startKeepAlive(synth)
      return
    }

    chunksRef.current = chunks.length ? chunks : unitsForSections(sections)
    if (!chunksRef.current.length) {
      setStatus('Nothing to read yet.')
      return
    }

    // Refresh voices on user gesture (required on some systems)
    const liveVoices = synth.getVoices()
    if (liveVoices.length) {
      setVoices(liveVoices)
      voiceRef.current = pickPoshVoice(liveVoices)
    }

    unstickSynth(synth)
    indexRef.current = 0
    activeRef.current = true
    pausedRef.current = false
    setPaused(false)
    setSpeaking(true)
    setStatus(`Reading…`)
    setChunkIndex(1)
    setParaIndex(chunksRef.current[0]?.paraIndex + 1 || 1)
    startKeepAlive(synth)

    // Delay after cancel so Chrome actually starts
    window.setTimeout(() => {
      if (!activeRef.current) return
      speakNext()
    }, 80)
  }

  function pause() {
    if (!activeRef.current || pausedRef.current) return
    pausedRef.current = true
    setPaused(true)
    setSpeaking(true)
    try {
      window.speechSynthesis.pause()
    } catch {
      /* ignore */
    }
  }

  function stop() {
    activeRef.current = false
    pausedRef.current = false
    indexRef.current = 0
    stopKeepAlive()
    unstickSynth(window.speechSynthesis)
    setSpeaking(false)
    setPaused(false)
    setChunkIndex(0)
    setParaIndex(0)
    setStatus(null)
  }

  function changeRate(next: RateOption) {
    setRate(next)
    rateRef.current = next
    if (!activeRef.current) return
    // Restart current chunk at new rate
    const wasPaused = pausedRef.current
    const i = indexRef.current
    unstickSynth(window.speechSynthesis)
    pausedRef.current = false
    setPaused(false)
    if (wasPaused) {
      pausedRef.current = true
      setPaused(true)
      setSpeaking(true)
      return
    }
    activeRef.current = true
    indexRef.current = i
    setSpeaking(true)
    startKeepAlive(window.speechSynthesis)
    window.setTimeout(() => speakNext(), 80)
  }

  function toggleFaster() {
    changeRate(rate === RATE_FASTER ? RATE_NORMAL : RATE_FASTER)
  }

  if (!supported) {
    return (
      <p className="mt-3 text-[0.8rem] text-muted">
        Text-to-speech is not available in this browser. Try Chrome or Edge on desktop.
      </p>
    )
  }

  const totalParas = paraCount || (chunksRef.current.at(-1)?.paraIndex ?? -1) + 1
  const showProgress = speaking && totalParas > 0 && paraIndex > 0
  const isFaster = rate === RATE_FASTER

  return (
    <div className="mt-4 rounded-[16px] border border-ink/8 bg-paper px-3 py-2.5 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-1 text-[0.72rem] font-bold uppercase tracking-wide text-muted">Listen</p>
        <button
          type="button"
          onClick={speaking && !paused ? pause : play}
          className="rounded-full bg-ink px-3.5 py-1.5 text-[0.78rem] font-bold text-paper"
          aria-label={speaking && !paused ? `Pause guide for ${label}` : `Play guide for ${label}`}
        >
          {speaking && !paused ? 'Pause' : paused ? 'Resume' : 'Play'}
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!speaking && !paused}
          className="rounded-full border border-ink/12 px-3 py-1.5 text-[0.78rem] font-bold text-ink disabled:opacity-40"
        >
          Stop
        </button>
        <span className="mx-1 hidden h-4 w-px bg-ink/10 sm:inline-block" />
        <button
          type="button"
          onClick={toggleFaster}
          className={`rounded-full px-3 py-1.5 text-[0.78rem] font-bold ${
            isFaster ? 'bg-terracotta text-paper' : 'bg-cream text-ink hover:bg-cream/80'
          }`}
          aria-pressed={isFaster}
          aria-label={isFaster ? 'Return to normal speaking speed' : 'Speak a little faster'}
        >
          {isFaster ? 'Normal' : 'Faster'}
        </button>
        {voice ? (
          <span className="ml-auto hidden text-[0.68rem] text-muted lg:inline">
            Voice · {voice.name.replace(/Microsoft |Google /g, '').slice(0, 28)}
          </span>
        ) : (
          <span className="ml-auto hidden text-[0.68rem] text-muted sm:inline">
            Using system English voice
          </span>
        )}
      </div>
      {showProgress ? (
        <p className="mt-1.5 text-[0.68rem] text-muted">
          Section {Math.min(paraIndex, totalParas)} of {totalParas}
          {sections[paraIndex - 1]?.title ? ` · ${sections[paraIndex - 1].title}` : ''}
        </p>
      ) : null}
      {status && !showProgress ? (
        <p className="mt-1.5 text-[0.72rem] text-muted">{status}</p>
      ) : null}
    </div>
  )
}
