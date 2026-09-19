import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import { useTripStore, type TripState } from './tripStore'

export type BoundTripStore = UseBoundStore<StoreApi<TripState>>

const ItineraryTripStoreContext = createContext<BoundTripStore | null>(null)

let boundApi: BoundTripStore | null = null

export function getBoundTripStore() {
  return boundApi ?? useTripStore
}

export function ItineraryTripStoreProvider({
  store,
  children,
}: {
  store: BoundTripStore
  children: ReactNode
}) {
  useLayoutEffect(() => {
    boundApi = store
    return () => {
      boundApi = null
    }
  }, [store])
  return (
    <ItineraryTripStoreContext.Provider value={store}>{children}</ItineraryTripStoreContext.Provider>
  )
}

export function useItineraryTripStore() {
  return useContext(ItineraryTripStoreContext) ?? useTripStore
}
