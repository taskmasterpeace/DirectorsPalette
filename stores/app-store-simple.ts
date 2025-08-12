import { create } from 'zustand'

type Mode = "story" | "music-video"

interface AppState {
  mode: Mode
  setMode: (mode: Mode) => void
}

// Simple store without persist or devtools to test if that's the issue
export const useSimpleAppStore = create<AppState>((set) => ({
  mode: "story",
  setMode: (mode) => {
    console.log('Setting mode to:', mode)
    set({ mode })
  }
}))