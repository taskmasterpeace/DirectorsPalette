"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, ChevronRight, Music, Hash, Heart, 
  BarChart, Edit2, Check, X, Save, Download, Copy, Upload, Library
} from "lucide-react"
import Link from "next/link"
import type { AnalysisResult, SongDNA } from "@/lib/song-dna-types"
import { saveSongDNA, exportDNAToJSON } from "@/app/actions/song-dna/manage"
import { downloadJSON, copyToClipboard } from "@/lib/song-dna-utils"
import { useToast } from "@/hooks/use-toast"

interface AnalysisDisplayProps {
  analysis: AnalysisResult
  onEdit?: (updated: AnalysisResult) => void
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AnalysisSection({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2 text-white font-medium">
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-900/50">
          {children}
        </div>
      )}
    </div>
  )
}

export function AnalysisDisplay({ analysis, onEdit }: AnalysisDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDNA, setEditedDNA] = useState(analysis.song_dna)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  const dna = isEditing ? editedDNA : analysis.song_dna

  const handleSaveDNA = async () => {
    setIsSaving(true)
    try {
      const result = await saveSongDNA(dna, {
        title: dna.reference_song.title,
        artist: dna.reference_song.artist,
        tags: dna.genre_tags || [],
        notes: `Analyzed on ${new Date().toLocaleDateString()}`
      })
      
      if (result.success) {
        toast({
          title: "DNA Saved",
          description: "Song DNA has been saved to your library",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save DNA",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportDNA = async () => {
    try {
      // First save if not already saved
      const saveResult = await saveSongDNA(dna)
      if (!saveResult.success || !saveResult.id) {
        throw new Error("Failed to prepare for export")
      }
      
      const exportResult = await exportDNAToJSON(saveResult.id)
      if (!exportResult.success || !exportResult.data) {
        throw new Error("Failed to export")
      }
      
      // Download the JSON file using client-side utility
      const filename = `song-dna-${dna.reference_song.title.replace(/\s+/g, '-')}-${Date.now()}.json`
      downloadJSON(exportResult.data, filename)
      
      toast({
        title: "DNA Exported",
        description: "Song DNA has been downloaded as JSON",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export DNA",
        variant: "destructive",
      })
    }
  }

  const handleCopyDNA = async () => {
    try {
      const exportData = {
        version: "2.0",
        dna: dna,
        metadata: {
          syllable_pattern: dna.lyrical.syllables_per_line.distribution?.slice(0, 16),
          rhyme_schemes: dna.lyrical.rhyme_schemes,
          flow_type: dna.production_notes,
        }
      }
      
      await copyToClipboard(JSON.stringify(exportData, null, 2))
      
      toast({
        title: "DNA Copied",
        description: "Song DNA has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy DNA to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({
        ...analysis,
        song_dna: editedDNA,
      })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedDNA(analysis.song_dna)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      {/* Header with confidence scores */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Analysis Results</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDNA}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleExportDNA}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={handleCopyDNA}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Link href="/studio/dna-library">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                size="sm"
              >
                <Library className="w-4 h-4 mr-1" />
                Library
              </Button>
            </Link>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="text-slate-300 border-slate-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-slate-400 mb-1">Structure</div>
            <Progress value={analysis.confidence_scores.structure * 100} className="h-2" />
            <div className="text-xs text-slate-300 mt-1">
              {Math.round(analysis.confidence_scores.structure * 100)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Rhyme</div>
            <Progress value={analysis.confidence_scores.rhyme * 100} className="h-2" />
            <div className="text-xs text-slate-300 mt-1">
              {Math.round(analysis.confidence_scores.rhyme * 100)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Emotion</div>
            <Progress value={analysis.confidence_scores.emotion * 100} className="h-2" />
            <div className="text-xs text-slate-300 mt-1">
              {Math.round(analysis.confidence_scores.emotion * 100)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Overall</div>
            <Progress value={analysis.confidence_scores.overall * 100} className="h-2" />
            <div className="text-xs text-slate-300 mt-1">
              {Math.round(analysis.confidence_scores.overall * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Song Info */}
      <Card className="p-4 bg-slate-800/50 border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Title</div>
            <div className="text-white font-medium">{dna.reference_song.title}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Artist</div>
            <div className="text-white font-medium">{dna.reference_song.artist}</div>
          </div>
        </div>
      </Card>

      {/* Collapsible Analysis Sections */}
      <div className="space-y-3">
        {/* Structure Analysis */}
        <AnalysisSection 
          title="Song Structure" 
          icon={<Music className="w-4 h-4" />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-400 mb-2">Pattern</div>
              <div className="flex flex-wrap gap-1">
                {(dna.structure.pattern || []).map((section, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-700 text-white">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-400">Verse Lines</div>
                <div className="text-white font-medium">{dna.structure.verse_lines}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Chorus Lines</div>
                <div className="text-white font-medium">{dna.structure.chorus_lines}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Bars</div>
                <div className="text-white font-medium">{dna.structure.total_bars}</div>
              </div>
            </div>
          </div>
        </AnalysisSection>

        {/* Lyrical Patterns - ENHANCED */}
        <AnalysisSection 
          title="Lyrical Patterns & Flow Analysis" 
          icon={<Hash className="w-4 h-4" />}
          defaultOpen
        >
          <div className="space-y-4">
            {/* Syllable Analysis - PRIMARY FOCUS */}
            <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg">
              <div className="text-sm text-amber-400 font-medium mb-2">🎯 Critical Flow Metrics</div>
              <div className="text-2xl text-white font-bold">
                {dna.lyrical.syllables_per_line.average.toFixed(1)} syllables/line
              </div>
              {dna.lyrical.syllables_per_line.distribution && (
                <div className="mt-3">
                  <div className="text-xs text-slate-400 mb-2">Exact syllable pattern (first 16 lines):</div>
                  <div className="grid grid-cols-8 gap-1">
                    {(dna.lyrical.syllables_per_line.distribution || []).slice(0, 16).map((count, i) => (
                      <div key={i} className="bg-slate-800 p-1 text-center rounded text-xs">
                        <div className="text-slate-500">L{i+1}</div>
                        <div className="text-white font-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 text-sm">
                <div className="text-slate-400">Flow Consistency: <span className="text-white font-medium">{((1 - Math.sqrt(dna.lyrical.syllables_per_line.variance) / dna.lyrical.syllables_per_line.average) * 100).toFixed(0)}%</span></div>
                {dna.production_notes && (
                  <div className="text-slate-400 mt-1">Style: <span className="text-white font-medium">{dna.production_notes}</span></div>
                )}
              </div>
            </div>

            {/* Enhanced Rhyme Schemes Display */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Rhyme Patterns (Phonetic Analysis)</div>
              <div className="space-y-2">
                {Object.entries(dna.lyrical.rhyme_schemes).map(([section, scheme]) => (
                  <div key={section} className="bg-slate-800/50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {section}
                      </Badge>
                      <span className="text-white font-mono text-lg tracking-wide">
                        {scheme || 'VARIED'}
                      </span>
                    </div>
                    {/* Show rhyme complexity indicator */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Complexity:</span>
                      <div className="flex gap-1">
                        {[...new Set(scheme?.split('') || [])].map((letter, i) => (
                          <span key={i} className="px-1 bg-slate-700 rounded text-white">
                            {letter}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-500">
                        ({[...new Set(scheme?.split('') || [])].length} unique patterns)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Internal Rhyme Density */}
            {dna.lyrical.internal_rhyme_density > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">Internal Rhyme Density</div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={dna.lyrical.internal_rhyme_density * 10} 
                    className="flex-1 h-2"
                  />
                  <span className="text-white text-sm font-medium">
                    {dna.lyrical.internal_rhyme_density.toFixed(1)}/10
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400">Avg Syllables/Line</div>
                <div className="text-white font-medium">
                  {dna.lyrical.syllables_per_line.average.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Vocabulary Level</div>
                <div className="text-white font-medium capitalize">
                  {dna.lyrical.vocabulary_level}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-slate-400 mb-2">Themes</div>
              <div className="flex flex-wrap gap-1">
                {(dna.lyrical.themes || []).map((theme, i) => (
                  <Badge key={i} className="bg-blue-900/50 text-blue-300 border-blue-700">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-slate-400 mb-2">Signature Words</div>
              <div className="flex flex-wrap gap-1">
                {(dna.lyrical.signature_words || []).slice(0, 10).map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-white">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnalysisSection>

        {/* Emotional Mapping */}
        <AnalysisSection 
          title="Emotional Mapping" 
          icon={<Heart className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400">Primary Emotion</div>
                <div className="text-white font-medium capitalize">
                  {dna.emotional.primary_emotion}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Overall Intensity</div>
                <div className="flex items-center gap-2">
                  <Progress value={dna.emotional.overall_intensity * 10} className="flex-1 h-2" />
                  <span className="text-white text-sm">{dna.emotional.overall_intensity}/10</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-slate-400 mb-2">Emotional Arc</div>
              <div className="space-y-2">
                {(dna.emotional.emotional_arc || []).map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 min-w-[80px]">
                      {point.section}
                    </Badge>
                    <span className="text-white text-sm">{point.emotion}</span>
                    <Progress value={point.intensity * 10} className="flex-1 h-2" />
                    <span className="text-slate-400 text-xs">{point.intensity}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnalysisSection>

        {/* Musical DNA */}
        <AnalysisSection 
          title="Musical DNA" 
          icon={<BarChart className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {dna.musical.tempo_bpm && (
                <div>
                  <div className="text-xs text-slate-400">Tempo</div>
                  <div className="text-white font-medium">{dna.musical.tempo_bpm} BPM</div>
                </div>
              )}
              {dna.musical.suggested_key && (
                <div>
                  <div className="text-xs text-slate-400">Key</div>
                  <div className="text-white font-medium">{dna.musical.suggested_key}</div>
                </div>
              )}
              {dna.musical.time_signature && (
                <div>
                  <div className="text-xs text-slate-400">Time Signature</div>
                  <div className="text-white font-medium">{dna.musical.time_signature}</div>
                </div>
              )}
            </div>
            
            {dna.production_notes && (
              <div>
                <div className="text-xs text-slate-400 mb-1">Production Notes</div>
                <div className="text-sm text-slate-300 p-2 bg-slate-800 rounded">
                  {dna.production_notes}
                </div>
              </div>
            )}
          </div>
        </AnalysisSection>
      </div>

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="text-blue-300 text-sm font-medium mb-2">Suggestions</div>
          <ul className="space-y-1">
            {(analysis.suggestions || []).map((suggestion, i) => (
              <li key={i} className="text-xs text-blue-200">• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}