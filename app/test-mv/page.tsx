'use client'

import { useState } from 'react'
import { generateFullMusicVideoBreakdown } from '@/app/actions/music-video'

export default function TestMVGeneration() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGeneration = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateFullMusicVideoBreakdown({
        songTitle: "Test Song",
        artist: "Test Artist",
        genre: "Hip Hop",
        lyrics: `[Verse 1]
This is a test verse
With some test lyrics
To see if it works

[Chorus]
This is the test chorus
It repeats multiple times
This is the test chorus
For testing purposes

[Verse 2]
Second verse here
More test content
Making sure it generates`,
        concept: "",
        directorNotes: "",
        selectedDirector: null,
        artistProfile: undefined
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      console.error('MV Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl mb-4">Test Music Video Generation</h1>
      
      <button
        onClick={testGeneration}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded"
      >
        {loading ? 'Generating...' : 'Test Generate MV Breakdown'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 rounded">
          <h2 className="font-bold">Error:</h2>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-900/50 rounded">
          <h2 className="font-bold">Success!</h2>
          <p>Success: {result.success ? 'true' : 'false'}</p>
          {result.error && <p>Error: {result.error}</p>}
          <pre className="mt-2 text-xs overflow-auto max-h-96">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}