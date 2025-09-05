"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Music, Sparkles, Copy, Download } from "lucide-react"
import { useArtistStore } from "@/lib/artist-store"
import type { 
  SongDNA, 
  GeneratedSong, 
  AnalysisResult,
  GenerationOptions 
} from "@/lib/song-dna-types"
import { analyzeSongDNA, generateFromDNA } from "@/app/actions/song-dna"
import { analyzeSongDNAEnhanced, generateFromDNAEnhanced } from "@/app/actions/song-dna"
import { LyricsInput } from "./LyricsInput"
import { AnalysisDisplay } from "./AnalysisDisplay"
import { GenerationControls } from "./GenerationControls"
import { SongOutput } from "./SongOutput"
import { ArtistSelector } from "./ArtistSelector"

interface SongDNAReplicatorProps {
  initialDNA?: SongDNA | null
  autoGenerateFromDNA?: SongDNA | null
}

export function SongDNAReplicator({ initialDNA, autoGenerateFromDNA }: SongDNAReplicatorProps) {
  // State management
  const [activeTab, setActiveTab] = useState("input")
  const [referenceLyrics, setReferenceLyrics] = useState("")
  const [referenceTitle, setReferenceTitle] = useState("")
  const [referenceArtist, setReferenceArtist] = useState("")
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [generatedSongs, setGeneratedSongs] = useState<GeneratedSong[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { activeArtist } = useArtistStore()

  // Handle initial DNA from library
  useEffect(() => {
    if (initialDNA) {
      setAnalysis({
        song_dna: initialDNA,
        confidence_scores: {
          structure: 1,
          rhyme: 1,
          emotion: 1,
          overall: 1
        },
        suggestions: ["DNA loaded from library"]
      })
      setReferenceTitle(initialDNA.reference_song.title || "")
      setReferenceArtist(initialDNA.reference_song.artist || "")
      setReferenceLyrics(initialDNA.reference_song.lyrics || "")
      setActiveTab("analysis")
    }
  }, [initialDNA])

  // Handle auto-generation from library
  useEffect(() => {
    if (autoGenerateFromDNA) {
      setAnalysis({
        song_dna: autoGenerateFromDNA,
        confidence_scores: {
          structure: 1,
          rhyme: 1,
          emotion: 1,
          overall: 1
        },
        suggestions: ["Ready to generate from DNA"]
      })
      setReferenceTitle(autoGenerateFromDNA.reference_song.title || "")
      setReferenceArtist(autoGenerateFromDNA.reference_song.artist || "")
      setReferenceLyrics(autoGenerateFromDNA.reference_song.lyrics || "")
      setActiveTab("generation")
    }
  }, [autoGenerateFromDNA])

  // Progress calculation
  const progress = {
    input: referenceLyrics ? 100 : 0,
    analysis: analysis ? 100 : 0,
    generation: generatedSongs.length > 0 ? 100 : 0,
  }
  const overallProgress = (progress.input + progress.analysis + progress.generation) / 3

  // Handlers
  async function handleAnalyze() {
    if (!referenceLyrics.trim()) {
      setError("Please enter lyrics to analyze")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Use enhanced analyzer for better syllable and rhyme detection
      const result = await analyzeSongDNAEnhanced({
        lyrics: referenceLyrics,
        title: referenceTitle,
        artist: referenceArtist,
        artist_profile_id: selectedArtistId || undefined,
      })
      
      setAnalysis(result)
      setActiveTab("analysis")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleGenerate(options: GenerationOptions) {
    if (!analysis?.song_dna) {
      setError("Please analyze a song first")
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // Use enhanced generator for better syllable and rhyme matching
      const song = await generateFromDNAEnhanced(
        analysis.song_dna,
        options
      )
      
      // generateFromDNAEnhanced returns a single song, wrap it in an array
      setGeneratedSongs([song])
      setActiveTab("output")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  function handleReset() {
    setReferenceLyrics("")
    setReferenceTitle("")
    setReferenceArtist("")
    setAnalysis(null)
    setGeneratedSongs([])
    setActiveTab("input")
    setError(null)
  }

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            <span>Song DNA Replicator</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Progress</span>
              <Progress value={overallProgress} className="w-32" />
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600"
            >
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-1 bg-slate-800 p-1">
            <TabsTrigger 
              value="input" 
              className="text-xs data-[state=active]:bg-amber-600"
              disabled={isAnalyzing || isGenerating}
            >
              1. Input
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="text-xs data-[state=active]:bg-amber-600"
              disabled={!analysis || isGenerating}
            >
              2. Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="generate" 
              className="text-xs data-[state=active]:bg-amber-600"
              disabled={!analysis || isGenerating}
            >
              3. Generate
            </TabsTrigger>
            <TabsTrigger 
              value="output" 
              className="text-xs data-[state=active]:bg-amber-600"
              disabled={generatedSongs.length === 0}
            >
              4. Output
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <LyricsInput
                  lyrics={referenceLyrics}
                  title={referenceTitle}
                  artist={referenceArtist}
                  onLyricsChange={setReferenceLyrics}
                  onTitleChange={setReferenceTitle}
                  onArtistChange={setReferenceArtist}
                />
              </div>
              
              <div className="space-y-4">
                <ArtistSelector
                  selectedId={selectedArtistId}
                  onSelect={setSelectedArtistId}
                  showActiveFirst={true}
                />
                
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-white font-medium mb-2">Quick Tips</h3>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Paste complete song lyrics for best results</li>
                    <li>• Include [Verse], [Chorus] markers if known</li>
                    <li>• Select an artist to match their style</li>
                    <li>• Title and artist name help improve analysis</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={!referenceLyrics.trim() || isAnalyzing}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing DNA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Song DNA
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            {analysis && (
              <AnalysisDisplay 
                analysis={analysis}
                onEdit={(updated) => setAnalysis(updated)}
              />
            )}
            
            <div className="flex justify-between">
              <Button
                onClick={() => setActiveTab("input")}
                variant="outline"
                className="text-slate-300 border-slate-600"
              >
                ← Back to Input
              </Button>
              <Button
                onClick={() => setActiveTab("generate")}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continue to Generate →
              </Button>
            </div>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            {analysis && (
              <GenerationControls
                songDNA={analysis.song_dna}
                artistId={selectedArtistId}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
          </TabsContent>

          {/* Output Tab */}
          <TabsContent value="output" className="space-y-4">
            <SongOutput 
              songs={generatedSongs}
              originalDNA={analysis?.song_dna}
            />
            
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => {
                  // Generate more variations
                  if (analysis) {
                    setActiveTab("generate")
                  }
                }}
                variant="outline"
                className="text-slate-300 border-slate-600"
              >
                Generate More
              </Button>
              <Button
                onClick={handleReset}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Start New Analysis
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}