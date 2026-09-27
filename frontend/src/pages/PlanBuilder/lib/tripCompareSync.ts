import { useTripStore, type TripBasics } from '../../../store/tripStore'

const CHANNEL = 'vietnam-trip-compare-sync-v1'
const STORAGE_KEY = 'vietnam-trip-compare-mirror-v1'
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

type SyncPayload = {
  source: string
  basics: TripBasics
  selectedExperienceIds: string[]
  selectedHotelIds: string[]
  comparisonStayIds: string[]
  chosenStayId: string | null
  stayStyle: string | null
  preferredBaseId: string | null
  startingPointBaseId: string | null
}

let applyingRemote = false
let started = false

function sliceState(): SyncPayload {
  const s = useTripStore.getState()
  return {
    source: TAB_ID,
    basics: s.basics,
    selectedExperienceIds: s.selectedExperienceIds,
    selectedHotelIds: s.selectedHotelIds,
    comparisonStayIds: s.comparisonStayIds,
    chosenStayId: s.chosenStayId,
    stayStyle: s.stayStyle,
    preferredBaseId: s.preferredBaseId,
    startingPointBaseId: s.startingPointBaseId,
  }
}

function applyRemote(payload: SyncPayload) {
  if (payload.source === TAB_ID) return
  applyingRemote = true
  try {
    useTripStore.setState({
      basics: payload.basics,
      selectedExperienceIds: payload.selectedExperienceIds,
      selectedHotelIds: payload.selectedHotelIds,
      comparisonStayIds: payload.comparisonStayIds,
      chosenStayId: payload.chosenStayId,
      stayStyle: payload.stayStyle as ReturnType<typeof useTripStore.getState>['stayStyle'],
      preferredBaseId: payload.preferredBaseId,
      startingPointBaseId: payload.startingPointBaseId,
    })
  } finally {
    applyingRemote = false
  }
}

function publish(payload: SyncPayload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
  try {
    channel?.postMessage(payload)
  } catch {
    /* ignore */
  }
}

let channel: BroadcastChannel | null = null

/** Call once from app root / Where To Stay / Compare page */
export function startTripCompareSync() {
  if (started || typeof window === 'undefined') return
  started = true

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = (event) => {
      if (event.data?.source) applyRemote(event.data as SyncPayload)
    }
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'vn-itinerary-pipeline') {
      const on = e.newValue === '1'
      try {
        if (on) sessionStorage.setItem('vn-itinerary-pipeline', '1')
        else sessionStorage.removeItem('vn-itinerary-pipeline')
      } catch {
        /* ignore */
      }
      useTripStore.setState({ itineraryPipelineActive: on })
      return
    }
    if (e.key !== STORAGE_KEY || !e.newValue) return
    try {
      applyRemote(JSON.parse(e.newValue) as SyncPayload)
    } catch {
      /* ignore */
    }
  })

  let prev = sliceState()
  useTripStore.subscribe(() => {
    if (applyingRemote) return
    const next = sliceState()
    const changed =
      JSON.stringify({
        b: prev.basics,
        e: prev.selectedExperienceIds,
        h: prev.selectedHotelIds,
        c: prev.comparisonStayIds,
        ch: prev.chosenStayId,
        s: prev.stayStyle,
        p: prev.preferredBaseId,
        st: prev.startingPointBaseId,
      }) !==
      JSON.stringify({
        b: next.basics,
        e: next.selectedExperienceIds,
        h: next.selectedHotelIds,
        c: next.comparisonStayIds,
        ch: next.chosenStayId,
        s: next.stayStyle,
        p: next.preferredBaseId,
        st: next.startingPointBaseId,
      })
    if (!changed) return
    prev = next
    publish(next)
  })
}
