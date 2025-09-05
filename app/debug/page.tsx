'use client'

import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const store = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div>Loading...</div>
  }
  
  const handleStoryClick = () => {
    console.log('Story button clicked')
    setClickCount(c => c + 1)
    try {
      store.setMode('story')
      console.log('Called setMode with story')
    } catch (e) {
      console.error('Error setting mode:', e)
    }
  }
  
  const handleMusicVideoClick = () => {
    console.log('Music video button clicked')
    setClickCount(c => c + 1)
    try {
      store.setMode('music-video')
      console.log('Called setMode with music-video')
    } catch (e) {
      console.error('Error setting mode:', e)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Store Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-red-900/20 border border-red-500 rounded">
          <p>Store exists: {store ? 'YES' : 'NO'}</p>
          <p>Current mode from store: <span className="font-bold text-yellow-400">{store?.mode || 'UNDEFINED'}</span></p>
          <p>setMode function exists: {store?.setMode ? 'YES' : 'NO'}</p>
          <p>Button clicks: {clickCount}</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleStoryClick}
            variant="outline"
            className="border-green-500"
          >
            Set Story Mode
          </Button>
          <Button 
            onClick={handleMusicVideoClick}
            variant="outline"
            className="border-blue-500"
          >
            Set Music Video Mode
          </Button>
        </div>
        
        <div className="p-4 bg-slate-800 rounded">
          <h2 className="font-bold mb-2">Full Store State:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(store, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-amber-900/20 border border-amber-500 rounded">
          <p className="font-bold">Check browser console for logs!</p>
          <p>Press F12 and look at Console tab</p>
        </div>
      </div>
    </div>
  )
}