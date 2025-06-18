import { create, type ExtractState } from 'zustand'
import { combine } from 'zustand/middleware'

export type AppState = ExtractState<typeof useAppStore>

export const useAppStore = create(
  combine({ commandOpen: false }, (set) => ({
    setCommandOpen: (open: boolean) => set({ commandOpen: open }),
    toggleCommandOpen: () => set((state) => ({ commandOpen: !state.commandOpen })),
  })),
)