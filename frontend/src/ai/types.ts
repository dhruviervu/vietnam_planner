export type AskIntent =
  | 'help'
  | 'hours'
  | 'about'
  | 'cost'
  | 'fit'
  | 'similar'
  | 'add'
  | 'remove'
  | 'build_day'
  | 'show'
  | 'navigate'

export type AskVerdict = 'allow' | 'refuse' | 'ask'

export type AskEntityKind = 'experience' | 'activity'

export type AskEntity = {
  id: string
  kind: AskEntityKind
  name: string
  city: string
}

export type AskTicket = {
  verdict: AskVerdict
  intent: AskIntent
  entities: AskEntity[]
  compact: string
  promptQuestions: string[]
  choices?: AskEntity[]
  cityHint?: string
}

export type AskPageContext = {
  pathname: string
  focus: AskEntity | null
  city: string | null
}

export type AskFact = {
  id: string
  kind: AskEntityKind
  name: string
  city: string
  hook: string
  hours: string
  closedToday: boolean
  duration: string
  durationHours: number
  cost: string
  timePreference: string
  path: string
}

export type DaySketchStop = {
  id: string
  kind: AskEntityKind
  name: string
  city: string
  period: 'morning' | 'afternoon' | 'evening'
  duration: string
  hours: string
  skipped?: string
}

export type DaySketch = {
  city: string
  dateLabel: string
  stops: DaySketchStop[]
  skipped: DaySketchStop[]
  totalHours: number
}

export type NavigateOffer = {
  label: string
  path: string
  hash?: string
  confirm?: boolean
}

export type AskToolResult = {
  did: string[]
  daySketch: DaySketch | null
  offers: NavigateOffer[]
}

export type AskMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  offers?: NavigateOffer[]
  daySketch?: DaySketch | null
  pendingApplyIds?: string[]
  source?: 'gemini' | 'groq' | 'local'
}
