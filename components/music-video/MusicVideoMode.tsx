"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Wand2,
  Target,
  Eye,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import { MusicVideoConfig } from "@/components/music-video-config"
import ArtistPicker from "@/components/artist-picker"
import { useToast } from "@/components/ui/use-toast"
import type { ArtistProfile } from "@/lib/artist-types"
import type { MusicVideoDirector } from "@/lib/director-types"

interface MusicVideoModeProps {
  // Song details
  lyrics: string
  setLyrics: (lyrics: string) => void
  songTitle: string
  setSongTitle: (title: string) => void
  artist: string
  setArtist: (artist: string) => void
  genre: string
  setGenre: (genre: string) => void
  
  // Creative direction
  mvConcept: string
  setMvConcept: (concept: string) => void
  mvDirectorNotes: string
  setMvDirectorNotes: (notes: string) => void
  
  // Artist selection
  selectedArtistId: string | null
  setSelectedArtistId: (id: string | null) => void
  selectedArtistProfile: ArtistProfile | undefined
  setSelectedArtistProfile: (profile: ArtistProfile | undefined) => void
  
  // Director selection
  selectedMusicVideoDirector: string
  setSelectedMusicVideoDirector: (directorId: string) => void
  allMusicVideoDirectors: any[] // TODO: Type this properly
  
  // Music video config
  musicVideoConfig: any
  setMusicVideoConfig: (config: any) => void
  showMusicVideoConfig: boolean
  setShowMusicVideoConfig: (show: boolean) => void
  
  // Results
  musicVideoBreakdown: any // TODO: Type this properly
  setMusicVideoBreakdown: (breakdown: any) => void
  additionalMusicVideoShots: { [key: string]: string[] }
  setAdditionalMusicVideoShots: (shots: any) => void
  
  // UI state
  expandedSections: { [key: string]: boolean }
  setExpandedSections: (sections: any) => void
  
  // Loading
  isLoading: boolean
  
  // Handlers
  onGenerateMusicVideoBreakdown: () => Promise<void>
  onGenerateAdditionalMusicVideoShots: (sectionId: string, customRequest: string) => Promise<void>
  onCopyToClipboard: (text: string) => void
}

export function MusicVideoMode({
  lyrics,
  setLyrics,
  songTitle,
  setSongTitle,
  artist,
  setArtist,
  genre,
  setGenre,
  mvConcept,
  setMvConcept,
  mvDirectorNotes,
  setMvDirectorNotes,
  selectedArtistId,
  setSelectedArtistId,
  selectedArtistProfile,
  setSelectedArtistProfile,
  selectedMusicVideoDirector,
  setSelectedMusicVideoDirector,
  allMusicVideoDirectors,
  musicVideoConfig,
  setMusicVideoConfig,
  showMusicVideoConfig,
  setShowMusicVideoConfig,
  musicVideoBreakdown,
  setMusicVideoBreakdown,
  additionalMusicVideoShots,
  setAdditionalMusicVideoShots,
  expandedSections,
  setExpandedSections,
  isLoading,
  onGenerateMusicVideoBreakdown,
  onGenerateAdditionalMusicVideoShots,
  onCopyToClipboard,
}: MusicVideoModeProps) {
  const { toast } = useToast()
  
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find((d) => d.id === selectedMusicVideoDirector)

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev: any) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleArtistChange = (id: string | null, profile: ArtistProfile | undefined) => {
    setSelectedArtistId(id)
    setSelectedArtistProfile(profile)
    if (profile?.artist_name) {
      setArtist(profile.artist_name)
    }
    if (profile?.genres?.length) {
      setGenre(profile.genres[0] || "")
    }
  }

  return (
    <div className="space-y-6">
      {/* Music Video Input Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-purple-400" />
            Music Video Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Artist Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Artist (from Artist Bank)</label>
            <ArtistPicker
              value={selectedArtistId}
              onChange={handleArtistChange}
            />
          </div>

          {/* Song Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Song Title</label>
              <input
                placeholder="Enter song title..."
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Artist Name</label>
              <input
                placeholder="Enter artist name..."
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Genre</label>
              <input
                placeholder="Enter genre..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
              />
            </div>
          </div>

          <Textarea
            placeholder="Enter song lyrics here..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />

          {/* Director Selection */}
          <DirectorSelector
            selectedDirector={selectedMusicVideoDirector}
            onDirectorChange={setSelectedMusicVideoDirector}
            allDirectors={allMusicVideoDirectors}
            selectedDirectorInfo={selectedMusicVideoDirectorInfo}
            domain="music-video"
          />

          {/* Concept + Director Notes */}
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Video Concept / Story (optional)</label>
            <Textarea
              placeholder="Your narrative concept, structure ideas, references..."
              value={mvConcept}
              onChange={(e) => setMvConcept(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Director&apos;s Notes (optional)</label>
            <Textarea
              placeholder="Overall creative direction, mood, pacing, visual hallmarks, references..."
              value={mvDirectorNotes}
              onChange={(e) => setMvDirectorNotes(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <Button
            onClick={onGenerateMusicVideoBreakdown}
            disabled={isLoading || !lyrics.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Breakdown...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Generate Music Video Breakdown
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Music Video Config */}
      {showMusicVideoConfig && musicVideoBreakdown && (
        <MusicVideoConfig
          treatments={musicVideoBreakdown.treatments}
          selectedTreatment={musicVideoBreakdown.selectedTreatment}
          musicVideoStructure={musicVideoBreakdown.musicVideoStructure}
          lyrics={lyrics}
          onTreatmentChange={(id) => {
            setMusicVideoConfig((prev: any) => ({ ...(prev || {}), selectedTreatmentId: id }))
          }}
          initialConfig={musicVideoConfig || undefined}
          onBack={() => setShowMusicVideoConfig(false)}
          onConfigurationComplete={(config) => {
            setMusicVideoConfig({ ...config, isConfigured: true })
            setShowMusicVideoConfig(false)
            onGenerateMusicVideoBreakdown()
          }}
        />
      )}

      {/* Music Video Results */}
      {musicVideoBreakdown && musicVideoBreakdown.isConfigured && (
        <div className="space-y-6">
          {musicVideoBreakdown.musicVideoStructure.sections.map((section: any, index: number) => {
            const sectionBreakdown = musicVideoBreakdown.sectionBreakdowns[index]
            const isExpanded = expandedSections[section.id]
            const sectionAdditionalShots = additionalMusicVideoShots[section.id] || []

            return (
              <Card key={section.id} className="bg-slate-800/50 border-slate-700">
                <Collapsible open={isExpanded} onOpenChange={() => toggleSectionExpansion(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-purple-400" />
                          {section.title}
                          <Badge variant="secondary" className="bg-slate-600/20 text-slate-300">
                            {section.type}
                          </Badge>
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-slate-300">
                        <div className="mb-4">
                          <strong>Lyrics:</strong>
                        </div>
                        <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700 mb-4">
                          {section.lyrics}
                        </div>
                      </div>

                      <Separator className="bg-slate-600" />

                      {/* Shots */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-400" />
                            Shot List ({sectionBreakdown.shots.length + sectionAdditionalShots.length} shots)
                          </h4>
                          <Button
                            size="sm"
                            onClick={() =>
                              onCopyToClipboard([...sectionBreakdown.shots, ...sectionAdditionalShots].join("\n"))
                            }
                            className="bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {sectionBreakdown.shots.map((shot: string, shotIndex: number) => (
                            <div
                              key={shotIndex}
                              className="p-3 bg-slate-900/40 rounded-md border border-slate-700"
                            >
                              <div className="text-sm text-slate-300">{shot}</div>
                            </div>
                          ))}
                          {sectionAdditionalShots.map((shot: string, shotIndex: number) => (
                            <div
                              key={`additional-${shotIndex}`}
                              className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30"
                            >
                              <div className="text-sm text-slate-300">{shot}</div>
                              <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                                Additional Shot
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Shots Generator */}
                      <div className="p-4 bg-slate-900/30 rounded-md border border-slate-600">
                        <h5 className="font-medium text-white mb-3">Generate Additional Shots</h5>
                        <div className="space-y-3">
                          <input
                            placeholder="Describe what kind of shots you want..."
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                onGenerateAdditionalMusicVideoShots(section.id, e.currentTarget.value)
                                e.currentTarget.value = ""
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              onGenerateAdditionalMusicVideoShots(
                                section.id,
                                "More creative performance shots"
                              )
                            }
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Generate More Shots
                          </Button>
                        </div>
                      </div>

                      {/* Performance Notes */}
                      {sectionBreakdown.performanceNotes && sectionBreakdown.performanceNotes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Performance Notes</h4>
                          <div className="space-y-2">
                            {sectionBreakdown.performanceNotes.map((note: string, noteIndex: number) => (
                              <div
                                key={noteIndex}
                                className="p-3 bg-slate-900/40 rounded-md border border-slate-700"
                              >
                                <div className="text-sm text-slate-300">{note}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}