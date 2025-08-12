'use client'

import { useState } from 'react'
import { generateBreakdown } from '@/app/actions/story'
import { generateFullMusicVideoBreakdown } from '@/app/actions-mv'

const TEST_STORY = `
John walked into the abandoned warehouse. The place was dark and dusty. 
He heard footsteps behind him. It was Sarah, his partner.
"We need to find the evidence before they come back," she whispered.
They searched through old boxes until they found a briefcase.
Inside was exactly what they were looking for - the stolen documents.
Suddenly, the door slammed shut. They were trapped.
`

const TEST_LYRICS = `
[Verse 1]
Walking through the city lights
Everything feels so right
Got my dreams in sight
Ready for the fight

[Chorus]
We rise, we fall, we stand tall
Through it all, through it all
Never gonna stop, gonna give it all
We rise, we fall, we stand tall

[Verse 2]
Every step I take
Every move I make
Building something great
It's never too late
`

export default function TestWorkflow() {
  const [storyResult, setStoryResult] = useState<any>(null)
  const [mvResult, setMvResult] = useState<any>(null)
  const [loading, setLoading] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)

  const testStoryGeneration = async () => {
    setLoading('story')
    setAnalysis(null)
    try {
      console.log('Testing story generation...')
      const result = await generateBreakdown(
        TEST_STORY,
        'tarantino',
        'Make it intense and stylized',
        { enabled: false, format: 'full', approaches: [] },
        { includeCameraStyle: true, includeColorPalette: true },
        'ai-suggested',
        3
      )
      
      setStoryResult(result)
      
      // Analyze results
      if (result.success) {
        const storyCharacters = ['John', 'Sarah']
        const generatedCharacters = new Set<string>()
        
        result.data.chapterBreakdowns?.forEach((breakdown: any) => {
          breakdown.characterReferences?.forEach((char: string) => {
            generatedCharacters.add(char.replace('@', ''))
          })
        })
        
        const extraCharacters = Array.from(generatedCharacters).filter(
          char => !storyCharacters.some(sc => 
            char.toLowerCase().includes(sc.toLowerCase()) || 
            sc.toLowerCase().includes(char.toLowerCase())
          )
        )
        
        setAnalysis({
          expectedCharacters: storyCharacters,
          generatedCharacters: Array.from(generatedCharacters),
          extraCharacters,
          hasIssues: extraCharacters.length > 0
        })
      }
    } catch (error) {
      console.error('Story test error:', error)
      setStoryResult({ success: false, error: String(error) })
    } finally {
      setLoading('')
    }
  }

  const testMusicVideoGeneration = async () => {
    setLoading('mv')
    try {
      console.log('Testing music video generation...')
      const result = await generateFullMusicVideoBreakdown({
        lyrics: TEST_LYRICS,
        songTitle: 'Rise and Stand',
        artist: 'Test Artist',
        genre: 'Pop',
        concept: 'Urban journey of determination',
        directorNotes: 'High energy, urban aesthetic',
        selectedDirector: null,
        artistProfile: undefined
      })
      
      setMvResult(result)
    } catch (error) {
      console.error('MV test error:', error)
      setMvResult({ success: false, error: String(error) })
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Full Workflow Test</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Story Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-amber-400">Story Mode Test</h2>
          
          <div className="p-4 bg-slate-800 rounded">
            <h3 className="font-medium mb-2">Test Story:</h3>
            <pre className="text-xs whitespace-pre-wrap text-slate-300">{TEST_STORY}</pre>
            <p className="text-xs mt-2 text-blue-400">
              Expected characters: John, Sarah
            </p>
          </div>
          
          <button
            onClick={testStoryGeneration}
            disabled={loading === 'story'}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded"
          >
            {loading === 'story' ? 'Testing Story Generation...' : 'Test Story Generation'}
          </button>
          
          {storyResult && (
            <div className={`p-4 rounded ${storyResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              <h3 className="font-bold mb-2">
                {storyResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              {storyResult.success ? (
                <div className="space-y-2 text-sm">
                  <p>Chapters: {storyResult.data.chapters?.length || 0}</p>
                  <p>Breakdowns: {storyResult.data.chapterBreakdowns?.length || 0}</p>
                  
                  {storyResult.data.chapterBreakdowns?.map((bd: any, i: number) => (
                    <div key={i} className="mt-2 p-2 bg-slate-800 rounded">
                      <p className="font-medium">Chapter {i + 1}:</p>
                      <p className="text-xs">Characters: {bd.characterReferences?.join(', ') || 'none'}</p>
                      <p className="text-xs">Locations: {bd.locationReferences?.join(', ') || 'none'}</p>
                      <p className="text-xs">Props: {bd.propReferences?.join(', ') || 'none'}</p>
                      <p className="text-xs">Shots: {bd.shots?.length || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">{storyResult.error}</p>
              )}
            </div>
          )}
          
          {analysis && (
            <div className={`p-4 rounded ${analysis.hasIssues ? 'bg-yellow-900/50' : 'bg-green-900/50'}`}>
              <h3 className="font-bold mb-2">Character Analysis:</h3>
              <div className="text-sm space-y-1">
                <p>Expected: {analysis.expectedCharacters.join(', ')}</p>
                <p>Generated: {analysis.generatedCharacters.join(', ')}</p>
                {analysis.hasIssues && (
                  <p className="text-yellow-400">
                    ⚠️ Extra characters not in story: {analysis.extraCharacters.join(', ')}
                  </p>
                )}
                {!analysis.hasIssues && (
                  <p className="text-green-400">✅ All characters match the story!</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Music Video Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-400">Music Video Mode Test</h2>
          
          <div className="p-4 bg-slate-800 rounded">
            <h3 className="font-medium mb-2">Test Lyrics:</h3>
            <pre className="text-xs whitespace-pre-wrap text-slate-300">{TEST_LYRICS}</pre>
          </div>
          
          <button
            onClick={testMusicVideoGeneration}
            disabled={loading === 'mv'}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded"
          >
            {loading === 'mv' ? 'Testing MV Generation...' : 'Test Music Video Generation'}
          </button>
          
          {mvResult && (
            <div className={`p-4 rounded ${mvResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              <h3 className="font-bold mb-2">
                {mvResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              {mvResult.success ? (
                <div className="space-y-2 text-sm">
                  <p>Sections: {mvResult.data.breakdown.sections?.length || 0}</p>
                  <p>Treatments: {mvResult.data.breakdown.treatments?.length || 0}</p>
                  <p>Configured: {mvResult.data.breakdown.isConfigured ? 'Yes' : 'No'}</p>
                  
                  <div className="mt-2 p-2 bg-slate-800 rounded">
                    <p className="font-medium mb-1">Two-Stage Process:</p>
                    <p className="text-xs text-green-400">
                      ✅ Stage 1: References generated (locations, wardrobe, props)
                    </p>
                    <p className="text-xs text-yellow-400">
                      ⏸️ Stage 2: User configures references
                    </p>
                    <p className="text-xs text-gray-400">
                      ⏸️ Stage 3: Final breakdown with configured references
                    </p>
                  </div>
                  
                  {mvResult.data.breakdown.sections?.map((section: any, i: number) => (
                    <div key={i} className="text-xs">
                      Section {i + 1}: {section.title} ({section.type})
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">{mvResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-slate-800 rounded">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Findings & Recommendations:</h2>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-red-900/30 rounded">
            <p className="font-semibold text-red-400">🔴 Story Mode Issue:</p>
            <p>Generating characters not in the original story</p>
          </div>
          
          <div className="p-3 bg-green-900/30 rounded">
            <p className="font-semibold text-green-400">✅ Music Video Mode Success:</p>
            <p>Two-stage process works well: References → Configuration → Final</p>
          </div>
          
          <div className="p-3 bg-blue-900/30 rounded">
            <p className="font-semibold text-blue-400">💡 Recommendation:</p>
            <p>Add reference configuration stage to Story Mode:</p>
            <ul className="list-disc list-inside mt-2 ml-2">
              <li>Stage 1: Extract characters, locations, props from story</li>
              <li>Stage 2: User reviews and configures references (add/remove/edit)</li>
              <li>Stage 3: Generate final breakdown with approved references</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}