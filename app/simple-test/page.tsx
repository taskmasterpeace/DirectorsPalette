'use client'

import { useSimpleAppStore } from '@/stores/app-store-simple'
import { Button } from '@/components/ui/button'

export default function SimpleTestPage() {
  const { mode, setMode } = useSimpleAppStore()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Store Test</h1>
      <p className="mb-4 text-2xl">Current mode: <span className="font-bold text-amber-400">{mode}</span></p>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            console.log('Clicking story button')
            setMode('story')
          }} 
          variant={mode === 'story' ? 'default' : 'outline'}
          size="lg"
        >
          Story Mode
        </Button>
        <Button 
          onClick={() => {
            console.log('Clicking music-video button')
            setMode('music-video')
          }} 
          variant={mode === 'music-video' ? 'default' : 'outline'}
          size="lg"
        >
          Music Video Mode
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-green-900/20 border border-green-500 rounded">
        <p>This uses a SIMPLE Zustand store without persist or devtools.</p>
        <p>If this works but the main store doesn't, the problem is with the middleware.</p>
        <p>Check browser console (F12) for logs!</p>
      </div>
    </div>
  )
}