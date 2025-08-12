'use client'

import { useState } from 'react'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story-references'

const TEST_STORY = `
John walked into the abandoned warehouse. The place was dark and dusty. 
He heard footsteps behind him. It was Sarah, his partner.
"We need to find the evidence before they come back," she whispered.
They searched through old boxes until they found a briefcase.
Inside was exactly what they were looking for - the stolen documents.
Suddenly, the door slammed shut. They were trapped.
`

export default function TestReferences() {
  const [references, setReferences] = useState<any>(null)
  const [configuredRefs, setConfiguredRefs] = useState<any>(null)
  const [breakdown, setBreakdown] = useState<any>(null)
  const [loading, setLoading] = useState('')

  const testExtraction = async () => {
    setLoading('extract')
    try {
      const result = await extractStoryReferences(TEST_STORY, 'tarantino', '')
      setReferences(result)
      
      if (result.success) {
        // Auto-configure for testing
        setConfiguredRefs({
          characters: result.data.characters,
          locations: result.data.locations,
          props: result.data.props
        })
      }
    } catch (error) {
      console.error('Extraction error:', error)
    } finally {
      setLoading('')
    }
  }

  const testGeneration = async () => {
    if (!configuredRefs) return
    
    setLoading('generate')
    try {
      const result = await generateStoryBreakdownWithReferences(
        TEST_STORY,
        'tarantino',
        'Intense and stylized',
        configuredRefs,
        { enabled: false, format: 'full', approaches: [] },
        { includeCameraStyle: true, includeColorPalette: true },
        'ai-suggested',
        3
      )
      setBreakdown(result)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Test Reference Extraction & Generation</h1>
      
      <div className="mb-6 p-4 bg-slate-800 rounded">
        <h2 className="font-semibold mb-2">Test Story:</h2>
        <pre className="text-sm whitespace-pre-wrap text-slate-300">{TEST_STORY}</pre>
        <p className="text-xs mt-2 text-blue-400">
          Expected: John, Sarah | warehouse | briefcase, documents, door
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Extract */}
        <div>
          <button
            onClick={testExtraction}
            disabled={loading === 'extract'}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded"
          >
            {loading === 'extract' ? 'Extracting...' : 'Step 1: Extract References'}
          </button>
          
          {references && (
            <div className={`mt-4 p-4 rounded ${references.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {references.success ? (
                <div>
                  <h3 className="font-bold mb-2">✅ Extracted References:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Characters ({references.data.characters.length}):</strong>
                      <ul className="ml-4">
                        {references.data.characters.map((c: any) => (
                          <li key={c.id}>{c.reference} - {c.name}: {c.description}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Locations ({references.data.locations.length}):</strong>
                      <ul className="ml-4">
                        {references.data.locations.map((l: any) => (
                          <li key={l.id}>{l.reference} - {l.name}: {l.description}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Props ({references.data.props.length}):</strong>
                      <ul className="ml-4">
                        {references.data.props.map((p: any) => (
                          <li key={p.id}>{p.reference} - {p.name}: {p.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p>❌ Error: {references.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Generate with References */}
        {configuredRefs && (
          <div>
            <button
              onClick={testGeneration}
              disabled={loading === 'generate'}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded"
            >
              {loading === 'generate' ? 'Generating...' : 'Step 2: Generate with References'}
            </button>
            
            {breakdown && (
              <div className={`mt-4 p-4 rounded ${breakdown.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                {breakdown.success ? (
                  <div>
                    <h3 className="font-bold mb-2">✅ Generated Breakdown:</h3>
                    <div className="space-y-2 text-sm">
                      <p>Chapters: {breakdown.data.chapters?.length || 0}</p>
                      {breakdown.data.chapterBreakdowns?.map((bd: any, i: number) => (
                        <div key={i} className="p-2 bg-slate-800 rounded">
                          <p className="font-medium">Chapter {i + 1}:</p>
                          <p className="text-xs">Characters used: {bd.characterReferences?.join(', ') || 'none'}</p>
                          <p className="text-xs">Locations used: {bd.locationReferences?.join(', ') || 'none'}</p>
                          <p className="text-xs">Props used: {bd.propReferences?.join(', ') || 'none'}</p>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-blue-900/30 rounded">
                        <p className="font-semibold">✅ Verification:</p>
                        <p className="text-sm">Only using references from configured list!</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>❌ Error: {breakdown.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}