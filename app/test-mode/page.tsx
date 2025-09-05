'use client'

import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'

export default function TestModePage() {
  const { mode, setMode } = useAppStore()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mode Test Page</h1>
      <p className="mb-4">Current mode: <span className="font-bold text-amber-400">{mode}</span></p>
      
      <div className="flex gap-4">
        <Button onClick={() => setMode('story')} variant={mode === 'story' ? 'default' : 'outline'}>
          Set Story Mode
        </Button>
        <Button onClick={() => setMode('music-video')} variant={mode === 'music-video' ? 'default' : 'outline'}>
          Set Music Video Mode
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-slate-800 rounded">
        <p>This page tests if the Zustand store is working properly.</p>
        <p>If clicking the buttons changes the mode display above, the store works.</p>
        <p>If the mode changes here match the sidebar and main page, everything is synced.</p>
      </div>
    </div>
  )
}