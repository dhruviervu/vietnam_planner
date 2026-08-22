import { create } from 'zustand'

export type CartItem = {
  id: string
  name: string
  category: string
  imageUrl: string
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  hasItem: (id: string) => boolean
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      if (state.items.some((existing) => existing.id === item.id)) return state
      return { items: [...state.items, item] }
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  hasItem: (id) => get().items.some((item) => item.id === id),
}))
