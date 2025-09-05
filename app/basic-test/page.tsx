'use client'

import { useState } from 'react'

export default function BasicTestPage() {
  const [mode, setMode] = useState('story')
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">BASIC React useState Test</h1>
      <p className="text-2xl mb-4">Mode: <span className="text-yellow-400">{mode}</span></p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setMode('story')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Story
        </button>
        <button 
          onClick={() => setMode('music-video')}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Music Video
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-red-900 text-white rounded">
        <p>This uses BASIC React useState - no Zustand, no stores, nothing fancy.</p>
        <p>If this doesn't work, React itself is broken.</p>
      </div>
    </div>
  )
}