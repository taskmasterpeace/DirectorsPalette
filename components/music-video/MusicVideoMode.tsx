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
  X,
  FileText,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import { SendToPostProductionEnhanced } from "@/components/shared/SendToPostProductionEnhanced"
import { TemplateManager } from "@/components/shared/TemplateManager"
import { EnhancedMusicVideoConfig } from "@/components/music-video/EnhancedMusicVideoConfig"
import { EnhancedShotGenerator } from "@/components/music-video/EnhancedShotGenerator"
import ArtistPicker from "@/components/artist-picker"
import { useToast } from "@/components/ui/use-toast"
import type { ArtistProfile } from "@/lib/artist-types"
import type { MusicVideoDirector } from "@/lib/director-types"
import type { ShotData } from "@/lib/export-processor"
import { useRouter } from "next/navigation"

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
  artistVisualDescription: string
  setArtistVisualDescription: (description: string) => void
  showDescriptions: boolean
  setShowDescriptions: (show: boolean) => void
  
  // Director selection
  selectedMusicVideoDirector: string
  setSelectedMusicVideoDirector: (directorId: string) => void
  curatedDirectors: any[]
  customDirectors: any[]
  
  // Music video config
  musicVideoConfig: any
  setMusicVideoConfig: (config: any) => void
  showMusicVideoConfig: boolean
  setShowMusicVideoConfig: (show: boolean) => void
  
  // Results
  musicVideoBreakdown: any
  setMusicVideoBreakdown: (breakdown: any) => void
  additionalMusicVideoShots: { [key: string]: string[] }
  setAdditionalMusicVideoShots: (shots: any) => void
  
  // UI state
  expandedSections: { [key: string]: boolean }
  setExpandedSections: (sections: any) => void
  
  // Loading
  isLoading: boolean
  
  // Handlers  
  onGenerateMusicVideoReferences: () => Promise<void>
  onGenerateMusicVideoBreakdown: () => Promise<void>
  onClearMusicVideo: () => void
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
  artistVisualDescription,
  setArtistVisualDescription,
  showDescriptions,
  setShowDescriptions,
  selectedMusicVideoDirector,
  setSelectedMusicVideoDirector,
  curatedDirectors,
  customDirectors,
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
  onGenerateMusicVideoReferences,
  onGenerateMusicVideoBreakdown,
  onClearMusicVideo,
  onGenerateAdditionalMusicVideoShots,
  onCopyToClipboard,
}: MusicVideoModeProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  console.log('MusicVideoMode - breakdown:', {
    hasBreakdown: !!musicVideoBreakdown,
    isConfigured: musicVideoBreakdown?.isConfigured,
    sectionBreakdownsLength: musicVideoBreakdown?.sectionBreakdowns?.length,
    sections: musicVideoBreakdown?.sections,
    musicVideoStructure: musicVideoBreakdown?.musicVideoStructure
  })
  
  const allMusicVideoDirectors = [...(curatedDirectors || []), ...(customDirectors || [])]
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors?.find((d) => d?.id === selectedMusicVideoDirector)

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

  // Helper function to process shots with artist descriptions
  const processShot = (shot: string) => {
    if (showDescriptions && artistVisualDescription) {
      return shot.replace(/@artist/gi, artistVisualDescription)
    }
    return shot
  }

  const handleCopyShot = (shot: string) => {
    // Copy the processed shot (with description if enabled)
    navigator.clipboard.writeText(processShot(shot))
    toast({
      title: "Copied!",
      description: "Shot copied to clipboard"
    })
  }

  const toggleShotSelection = (shotId: string) => {
    const newSelection = new Set(selectedShots)
    if (newSelection.has(shotId)) {
      newSelection.delete(shotId)
    } else {
      newSelection.add(shotId)
    }
    setSelectedShots(newSelection)
  }

  // Prepare all shots for bulk export
  const prepareAllShotsForExport = (): ShotData[] => {
    if (!musicVideoBreakdown?.sectionBreakdowns) return []

    const allShots: ShotData[] = []
    let shotCounter = 1

    musicVideoBreakdown.sectionBreakdowns.forEach((sectionBreakdown: any, sectionIndex: number) => {
      const section = musicVideoBreakdown.musicVideoStructure?.sections?.[sectionIndex] || 
                     musicVideoBreakdown.sections?.[sectionIndex]
      
      // Add main shots from section
      if (sectionBreakdown.shots) {
        sectionBreakdown.shots.forEach((shot: string, shotIndex: number) => {
          allShots.push({
            id: `section-${sectionIndex}-shot-${shotIndex}`,
            description: shot,
            section: section?.title || `Section ${sectionIndex + 1}`,
            shotNumber: shotCounter++,
            metadata: {
              directorStyle: selectedMusicVideoDirectorInfo?.name,
              timestamp: new Date().toISOString(),
              sourceType: 'music-video'
            }
          })
        })
      }

      // Add additional shots if any
      const sectionId = section?.id || `section-${sectionIndex}`
      const sectionAdditionalShots = additionalMusicVideoShots[sectionId] || []
      sectionAdditionalShots.forEach((shot: string, shotIndex: number) => {
        allShots.push({
          id: `section-${sectionIndex}-additional-${shotIndex}`,
          description: shot,
          section: `${section?.title || `Section ${sectionIndex + 1}`} (Additional)`,
          shotNumber: shotCounter++,
          metadata: {
            directorStyle: selectedMusicVideoDirectorInfo?.name,
            timestamp: new Date().toISOString(),
            sourceType: 'music-video'
          }
        })
      })
    })

    return allShots
  }

  const handleNavigateToExport = () => {
    const allShots = prepareAllShotsForExport()
    
    if (allShots.length === 0) {
      toast({
        title: "No Shots to Export",
        description: "Please generate shots first.",
        variant: "destructive"
      })
      return
    }

    // Store data in localStorage for the export page
    localStorage.setItem('bulk-export-shots', JSON.stringify(allShots))
    localStorage.setItem('bulk-export-project-data', JSON.stringify({
      type: 'music-video',
      artistName: artist,
      artistDescription: showDescriptions ? artistVisualDescription : undefined,
      director: selectedMusicVideoDirectorInfo?.name,
      projectTitle: songTitle || "Music Video Project"
    }))

    // Navigate to export page
    router.push('/export')
  }

  const copySelectedShots = () => {
    const shotsToCopy: string[] = []
    
    musicVideoBreakdown?.sectionBreakdowns?.forEach((sectionBreakdown: any) => {
      sectionBreakdown.shots?.forEach((shot: string, index: number) => {
        const shotId = `${sectionBreakdown.sectionId}-${index}`
        if (selectedShots.has(shotId)) {
          // Process shots with descriptions if enabled
          shotsToCopy.push(processShot(shot))
        }
      })
    })
    
    if (shotsToCopy.length > 0) {
      navigator.clipboard.writeText(shotsToCopy.join('\n\n'))
      toast({
        title: "Copied!",
        description: `${shotsToCopy.length} shots copied to clipboard`
      })
      setSelectedShots(new Set())
      setIsSelectionMode(false)
    }
  }

  const selectAllSectionShots = (sectionId: string, sectionBreakdown: any) => {
    const newSelection = new Set(selectedShots)
    const allShotsInSection: string[] = []
    
    sectionBreakdown.shots?.forEach((shot: string, index: number) => {
      allShotsInSection.push(`${sectionId}-${index}`)
    })
    
    const allSelected = allShotsInSection.every(id => selectedShots.has(id))
    
    if (allSelected) {
      // Deselect all
      allShotsInSection.forEach(id => newSelection.delete(id))
    } else {
      // Select all
      allShotsInSection.forEach(id => newSelection.add(id))
    }
    
    setSelectedShots(newSelection)
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
            placeholder="Enter song lyrics here... (Ctrl+Enter to generate breakdown)"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && lyrics.trim() && !isLoading) {
                e.preventDefault()
                onGenerateMusicVideoBreakdown()
              }
            }}
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

          {/* Template Manager */}
          <TemplateManager
            type="music-video"
            currentData={{
              lyrics,
              songTitle,
              artist,
              genre,
              mvConcept,
              mvDirectorNotes,
              selectedMusicVideoDirector
            }}
            onLoadTemplate={(template) => {
              const content = template.content as any
              setLyrics(content.lyrics || '')
              setSongTitle(content.songTitle || '')
              setArtist(content.artist || '')
              setGenre(content.genre || '')
              setMvConcept(content.mvConcept || '')
              setMvDirectorNotes(content.mvDirectorNotes || '')
              if (content.selectedMusicVideoDirector) {
                setSelectedMusicVideoDirector(content.selectedMusicVideoDirector)
              }
            }}
          />

          <div className="w-full space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={onClearMusicVideo}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-red-600/30 text-red-400 hover:bg-red-600/10 hover:text-red-300"
              >
                <X className="h-4 w-4 mr-2" />
                Clear & Start Over
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Video Config */}
      {showMusicVideoConfig && musicVideoBreakdown && (
        <EnhancedMusicVideoConfig
          treatments={musicVideoBreakdown.treatments || []}
          selectedTreatment={musicVideoBreakdown.selectedTreatment}
          musicVideoStructure={musicVideoBreakdown.musicVideoStructure || { sections: musicVideoBreakdown.sections || [] }}
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

      {/* Music Video Results - Show if we have any breakdown */}
      {musicVideoBreakdown && musicVideoBreakdown.sectionBreakdowns?.length > 0 && (
        <div className="space-y-6">
          <div className="text-center mb-4 space-y-3">
            <Badge variant="default" className="bg-green-600">
              ✅ Generated {musicVideoBreakdown.sectionBreakdowns.length} Shot Lists
            </Badge>
            
            {/* Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                onClick={handleNavigateToExport}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                disabled={!musicVideoBreakdown?.sectionBreakdowns || musicVideoBreakdown.sectionBreakdowns.length === 0}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Export All Shots</span>
              </Button>
              <div className="w-full sm:w-auto">
                <SendToPostProductionEnhanced
                  type="music-video"
                  data={musicVideoBreakdown.sectionBreakdowns}
                  projectId={`mv_${Date.now()}`}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Toggle for showing descriptions */}
            {artistVisualDescription && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant={showDescriptions ? "outline" : "default"}
                  onClick={() => setShowDescriptions(false)}
                  className={`w-full sm:w-auto ${!showDescriptions ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  <span className="truncate">Show @artist</span>
                </Button>
                <Button
                  size="sm"
                  variant={showDescriptions ? "default" : "outline"}
                  onClick={() => setShowDescriptions(true)}
                  className={`w-full sm:w-auto ${showDescriptions ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  <span className="truncate">Show Descriptions</span>
                </Button>
              </div>
            )}
          </div>
          {(musicVideoBreakdown.sections || musicVideoBreakdown.musicVideoStructure?.sections || []).map((section: any, index: number) => {
            const sectionBreakdown = musicVideoBreakdown.sectionBreakdowns?.find(
              (sb: any) => sb.sectionId === section.id
            ) || musicVideoBreakdown.sectionBreakdowns[index]
            
            if (!sectionBreakdown) {
              console.warn(`No breakdown found for section ${section.id}`)
              return null
            }
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
                            Shot List ({(sectionBreakdown?.shots?.length || 0) + sectionAdditionalShots.length} shots)
                          </h4>
                          <div className="flex gap-2">
                            {selectedShots.size > 0 && (
                              <Button
                                size="sm"
                                onClick={copySelectedShots}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Selected ({selectedShots.size})
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={isSelectionMode ? "secondary" : "outline"}
                              onClick={() => {
                                setIsSelectionMode(!isSelectionMode)
                                if (isSelectionMode) setSelectedShots(new Set())
                              }}
                              className="border-slate-600"
                            >
                              {isSelectionMode ? "Cancel Select" : "Select Shots"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => selectAllSectionShots(section.id, sectionBreakdown)}
                              className="bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                onCopyToClipboard([...(sectionBreakdown?.shots || []), ...sectionAdditionalShots].join("\n"))
                              }
                              className="bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy All
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(sectionBreakdown?.shots || []).map((shot: string, shotIndex: number) => {
                            const shotId = `${section.id}-${shotIndex}`
                            const isSelected = selectedShots.has(shotId)
                            return (
                              <div
                                key={shotIndex}
                                className={`p-3 bg-slate-900/40 rounded-md border ${
                                  isSelected ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'
                                } ${isSelectionMode ? 'cursor-pointer' : ''} relative group`}
                                onClick={() => isSelectionMode && toggleShotSelection(shotId)}
                              >
                                <div className="flex items-start gap-3">
                                  {isSelectionMode && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleShotSelection(shotId)}
                                      className="mt-1"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  <div className="flex-1 text-sm text-slate-300">{processShot(shot)}</div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCopyShot(shot)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                          {sectionAdditionalShots.map((shot: string, shotIndex: number) => (
                            <div
                              key={`additional-${shotIndex}`}
                              className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30"
                            >
                              <div className="text-sm text-slate-300">{processShot(shot)}</div>
                              <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                                Additional Shot
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Additional Shots Generator */}
                      <EnhancedShotGenerator
                        sectionId={section.id}
                        sectionTitle={section.title}
                        locations={musicVideoConfig?.locations || []}
                        wardrobe={musicVideoConfig?.wardrobe || []}
                        props={musicVideoConfig?.props || []}
                        currentShots={sectionBreakdown?.shots || []}
                        onGenerateShots={onGenerateAdditionalMusicVideoShots}
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Show message if breakdown exists but no shots */}
      {musicVideoBreakdown && (!musicVideoBreakdown.sectionBreakdowns || musicVideoBreakdown.sectionBreakdowns.length === 0) && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <p className="text-yellow-400">
              Breakdown structure created but no shots generated yet. 
              Please check the configuration and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}