'use client'

import { useState } from 'react'
import { generateBreakdown } from '@/app/actions-story'

export default function TestGeneration() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGeneration = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateBreakdown(
        "A detective investigates a mysterious crime in a dark city.",
        "tarantino",
        "",
        { enabled: false, format: "full", approaches: [] },
        { includeCameraStyle: false, includeColorPalette: false },
        "single",
        1,
        (stage, current, total, message) => {
          console.log(`Progress: ${stage} - ${current}/${total} - ${message}`)
        }
      )
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl mb-4">Test Story Generation</h1>
      
      <button
        onClick={testGeneration}
        disabled={loading}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded"
      >
        {loading ? 'Generating...' : 'Test Generate Breakdown'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 rounded">
          <h2 className="font-bold">Error:</h2>
          <pre className="mt-2">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-900/50 rounded">
          <h2 className="font-bold">Success!</h2>
          <pre className="mt-2 text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}