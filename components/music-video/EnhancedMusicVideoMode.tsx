"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Wand2,
  Target,
  Eye,
  Music,
  Film,
  Users,
  Sparkles,
  Settings,
  MessageSquare,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import ArtistPicker from "@/components/artist-picker"
import { useToast } from "@/components/ui/use-toast"
import { PerformanceBalanceSlider } from "./PerformanceBalanceSlider"
import { DirectorMVQuestionCards } from "./DirectorMVQuestionCards"
import { ArtistTextFeedback } from "./ArtistTextFeedback"
import { VisualEffectsPanel, type VisualEffectsConfig } from "./VisualEffectsPanel"
import type { ArtistProfile } from "@/lib/artist-types"
import type { MusicVideoDirector } from "@/lib/director-types"

// Wizard Steps
enum WizardStep {
  INPUT = 'input',
  ENTITY_EXTRACTION = 'entity_extraction', 
  ENTITY_REFINEMENT = 'entity_refinement',
  DIRECTOR_QUESTIONS = 'director_questions',
  ARTIST_FEEDBACK = 'artist_feedback',
  VISUAL_EFFECTS = 'visual_effects',
  GENERATION = 'generation',
  RESULTS = 'results'
}

interface EnhancedMusicVideoModeProps {
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
  allMusicVideoDirectors: MusicVideoDirector[]
  
  // Results
  musicVideoBreakdown: any
  setMusicVideoBreakdown: (breakdown: any) => void
  additionalMusicVideoShots: { [key: string]: string[] }
  
  // UI state
  expandedSections: { [key: string]: boolean }
  setExpandedSections: (sections: any) => void
  
  // Loading
  isLoading: boolean
  
  // Handlers
  onGenerateMusicVideoBreakdown: () => Promise<void>
  onCopyToClipboard: (text: string) => void
}

export function EnhancedMusicVideoMode({
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
  musicVideoBreakdown,
  setMusicVideoBreakdown,
  additionalMusicVideoShots,
  expandedSections,
  setExpandedSections,
  isLoading,
  onGenerateMusicVideoBreakdown,
  onCopyToClipboard,
}: EnhancedMusicVideoModeProps) {
  const { toast } = useToast()
  
  // Enhanced state
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INPUT)
  const [performanceRatio, setPerformanceRatio] = useState(70) // 70% performance, 30% narrative
  const [extractedEntities, setExtractedEntities] = useState<any>(null)
  const [directorAnswers, setDirectorAnswers] = useState<any[]>([])
  const [artistFeedback, setArtistFeedback] = useState<any[]>([])
  const [visualEffects, setVisualEffects] = useState<VisualEffectsConfig>({
    lighting: { primary: 'studio', mood: 'Bright & Energetic', intensity: 80 },
    atmosphere: { style: 'clean', elements: [] },
    effects: { visual: [], camera: [] },
    colorGrading: { tone: 'Natural', saturation: 100 }
  })
  
  // Wizard status messages
  const [statusMessage, setStatusMessage] = useState("")
  const [showStatus, setShowStatus] = useState(false)
  
  const selectedDirectorInfo = allMusicVideoDirectors.find((d) => d.id === selectedMusicVideoDirector)
  
  const wizardSteps = [
    { id: WizardStep.INPUT, label: 'Song Input', icon: Music },
    { id: WizardStep.ENTITY_EXTRACTION, label: 'Entity Extraction', icon: Eye },
    { id: WizardStep.ENTITY_REFINEMENT, label: 'Entity Setup', icon: Settings },
    { id: WizardStep.DIRECTOR_QUESTIONS, label: 'Director Questions', icon: MessageSquare },
    { id: WizardStep.ARTIST_FEEDBACK, label: 'Artist Feedback', icon: Users },
    { id: WizardStep.VISUAL_EFFECTS, label: 'Visual Effects', icon: Sparkles },
    { id: WizardStep.GENERATION, label: 'Generation', icon: Wand2 },
    { id: WizardStep.RESULTS, label: 'Results', icon: Film }
  ]
  
  const getCurrentStepIndex = () => wizardSteps.findIndex(step => step.id === currentStep)
  const getProgressPercentage = () => (getCurrentStepIndex() / (wizardSteps.length - 1)) * 100
  
  const showStatusMessage = (message: string, duration = 3000) => {
    setStatusMessage(message)
    setShowStatus(true)
    setTimeout(() => {
      setShowStatus(false)
      setStatusMessage("")
    }, duration)
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
  
  const handleStartGeneration = async () => {
    if (!lyrics.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter song lyrics first." })
      return
    }
    
    setCurrentStep(WizardStep.ENTITY_EXTRACTION)
    showStatusMessage(`🎬 ${selectedDirectorInfo?.name || 'Director'} is analyzing your lyrics...`)
    
    // Smart entity extraction based on lyrics content
    setTimeout(() => {
      const entities = extractEntitiesFromLyrics(lyrics, songTitle, artist, selectedArtistProfile)
      setExtractedEntities(entities)
      setCurrentStep(WizardStep.ENTITY_REFINEMENT)
      showStatusMessage(`✨ Found ${entities.artistVersions.length} looks, ${entities.locations.length} locations, and ${entities.props.length} props!`)
    }, 2000)
  }
  
  const handleEntitiesConfirmed = () => {
    setCurrentStep(WizardStep.DIRECTOR_QUESTIONS)
    showStatusMessage(`🎤 ${selectedDirectorInfo?.name || 'Director'} has some creative questions...`)
  }
  
  const handleDirectorQuestionsComplete = (answers: any[]) => {
    setDirectorAnswers(answers)
    setCurrentStep(WizardStep.ARTIST_FEEDBACK)
    showStatusMessage(`📱 ${selectedArtistProfile?.artist_name || 'Artist'} is reviewing the treatments...`)
  }
  
  const handleArtistFeedbackComplete = (feedback: any[]) => {
    setArtistFeedback(feedback)
    setCurrentStep(WizardStep.VISUAL_EFFECTS)
    showStatusMessage("🎨 Configure visual effects and atmosphere...")
  }
  
  const handleVisualEffectsComplete = () => {
    setCurrentStep(WizardStep.GENERATION)
    showStatusMessage("🚀 Generating your music video breakdown...")
    
    // Call the actual generation
    onGenerateMusicVideoBreakdown().then(() => {
      setCurrentStep(WizardStep.RESULTS)
      showStatusMessage("🎬 Music video breakdown complete!")
    }).catch(() => {
      setCurrentStep(WizardStep.INPUT)
      showStatusMessage("❌ Generation failed. Please try again.")
    })
  }
  
  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev: any) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const extractEntitiesFromLyrics = (lyrics: string, songTitle: string, artistName: string, artistProfile?: ArtistProfile) => {
    const lyricsLower = lyrics.toLowerCase()
    const words = lyrics.split(/\s+/)
    
    // Analyze lyric content for themes
    const isLoveSong = lyricsLower.includes('love') || lyricsLower.includes('heart') || lyricsLower.includes('baby')
    const isPartySong = lyricsLower.includes('party') || lyricsLower.includes('dance') || lyricsLower.includes('tonight')
    const isEmotionalSong = lyricsLower.includes('cry') || lyricsLower.includes('pain') || lyricsLower.includes('alone')
    const hasUrbanRefs = lyricsLower.includes('street') || lyricsLower.includes('city') || lyricsLower.includes('block')
    const hasCarRefs = lyricsLower.includes('car') || lyricsLower.includes('drive') || lyricsLower.includes('ride')
    const hasClubRefs = lyricsLower.includes('club') || lyricsLower.includes('floor') || lyricsLower.includes('lights')
    
    // Generate artist versions based on song mood and artist profile
    const artistVersions = []
    if (performanceRatio > 60) {
      artistVersions.push({
        id: 'av1',
        name: `${artistName} - Main Performance`,
        description: `High-energy performance outfit matching the song's ${isPartySong ? 'party' : isEmotionalSong ? 'emotional' : 'confident'} vibe`,
        referenceTag: '@main_performance'
      })
    }
    
    if (performanceRatio < 70) {
      artistVersions.push({
        id: 'av2', 
        name: `${artistName} - Story Version`,
        description: `Casual, authentic look for narrative scenes - ${isLoveSong ? 'romantic and intimate' : isEmotionalSong ? 'vulnerable and real' : 'natural and relatable'}`,
        referenceTag: '@story_look'
      })
    }
    
    // Add third look for variety
    artistVersions.push({
      id: 'av3',
      name: `${artistName} - Signature Style`,
      description: artistProfile?.visual_style ? `Signature ${artistProfile.visual_style} aesthetic` : 'Distinctive artistic look that represents their brand',
      referenceTag: '@signature_style'
    })
    
    // Generate locations based on lyric content and themes
    const locations = []
    
    if (isPartySong || hasClubRefs) {
      locations.push({
        id: 'loc1',
        name: 'Vibrant Club Scene',
        description: 'Pulsing lights, packed dance floor, high-energy atmosphere',
        referenceTag: '@club_main'
      })
    } else if (hasUrbanRefs) {
      locations.push({
        id: 'loc1',
        name: 'Urban Streetscape',
        description: 'Authentic city streets, real neighborhood, natural lighting',
        referenceTag: '@street_scene'
      })
    } else if (isEmotionalSong) {
      locations.push({
        id: 'loc1',
        name: 'Intimate Interior Space',
        description: 'Cozy, personal environment - bedroom, living room, or quiet cafe',
        referenceTag: '@intimate_space'
      })
    } else {
      locations.push({
        id: 'loc1',
        name: 'Professional Studio',
        description: 'High-end recording studio with warm lighting and vintage equipment',
        referenceTag: '@studio_main'
      })
    }
    
    // Second location for variety
    if (isLoveSong) {
      locations.push({
        id: 'loc2',
        name: 'Romantic Outdoor Setting',
        description: 'Beautiful natural backdrop - sunset, garden, or scenic overlook',
        referenceTag: '@romantic_scene'
      })
    } else if (performanceRatio > 50) {
      locations.push({
        id: 'loc2',
        name: 'Performance Venue',
        description: 'Concert stage, warehouse space, or unique performance environment',
        referenceTag: '@performance_venue'
      })
    } else {
      locations.push({
        id: 'loc2',
        name: 'Cinematic Backdrop',
        description: 'Visually striking location that enhances the story - rooftop, bridge, or artistic space',
        referenceTag: '@cinematic_location'
      })
    }
    
    // Third location for visual variety
    if (hasUrbanRefs || artistProfile?.genres?.some(g => g.toLowerCase().includes('hip'))) {
      locations.push({
        id: 'loc3',
        name: 'Urban Lifestyle Scene',
        description: 'Barbershop, corner store, community space, or neighborhood hangout spot',
        referenceTag: '@lifestyle_scene'
      })
    } else if (isPartySong) {
      locations.push({
        id: 'loc3',
        name: 'Party/Social Environment',
        description: 'House party, social gathering, or energetic group setting',
        referenceTag: '@party_scene'
      })
    } else {
      locations.push({
        id: 'loc3',
        name: 'Artistic/Creative Space',
        description: 'Art gallery, creative studio, or visually interesting interior',
        referenceTag: '@creative_space'
      })
    }
    
    // Fourth location for maximum variety
    locations.push({
      id: 'loc4',
      name: 'Transition/Movement Scene',
      description: isEmotionalSong ? 'Quiet car interior or peaceful walking path' : 
                   hasCarRefs ? 'Highway driving or parking garage' :
                   'Elevator, stairwell, or corridor for transitions',
      referenceTag: '@transition_scene'
    })
    
    // Generate props based on song content and genre
    const props = []
    
    // Always include microphone for performance sections
    props.push({
      id: 'prop1',
      name: 'Professional Microphone',
      description: `${artistProfile?.preferred_equipment?.includes('wireless') ? 'Wireless handheld mic' : 'Classic studio microphone'} for vocal performance`,
      referenceTag: '@mic_main'
    })
    
    // Add genre-specific or lyric-specific props
    if (hasCarRefs) {
      props.push({
        id: 'prop2',
        name: 'Featured Vehicle',
        description: 'Car, motorcycle, or ride that plays a role in the narrative',
        referenceTag: '@vehicle_main'
      })
    } else if (isLoveSong) {
      props.push({
        id: 'prop2',
        name: 'Romantic Elements',
        description: 'Flowers, candles, or personal items that enhance the love story',
        referenceTag: '@romantic_props'
      })
    } else if (artistProfile?.genres?.some(g => g.toLowerCase().includes('hip'))) {
      props.push({
        id: 'prop2',
        name: 'Urban Props',
        description: 'Authentic street elements - chains, speakers, or cultural items',
        referenceTag: '@urban_elements'
      })
    } else {
      props.push({
        id: 'prop2',
        name: 'Performance Props',
        description: 'Stage lights, smoke machines, or performance enhancement tools',
        referenceTag: '@performance_props'
      })
    }
    
    // Add styling/wardrobe prop
    props.push({
      id: 'prop3',
      name: 'Signature Wardrobe',
      description: artistProfile?.visual_style ? 
        `${artistProfile.visual_style} wardrobe pieces that define ${artistName}'s look` :
        `Signature clothing and accessories that represent ${artistName}'s style`,
      referenceTag: '@wardrobe_signature'
    })
    
    // Add lighting/atmosphere prop
    props.push({
      id: 'prop4',
      name: 'Atmospheric Elements',
      description: isPartySong ? 'Colorful party lights, disco balls, or neon signs' :
                   isEmotionalSong ? 'Soft candles, warm lamps, or intimate lighting' :
                   'Professional lighting rigs, colored gels, or dramatic shadows',
      referenceTag: '@atmosphere_elements'
    })
    
    // Add instruments if relevant
    if (artistProfile?.instruments?.length) {
      props.push({
        id: 'prop5',
        name: artistProfile.instruments[0],
        description: `${artistName}'s signature ${artistProfile.instruments[0]} for intimate performance moments`,
        referenceTag: '@instrument_main'
      })
    } else if (lyricsLower.includes('guitar') || lyricsLower.includes('piano')) {
      const instrument = lyricsLower.includes('guitar') ? 'guitar' : 'piano'
      props.push({
        id: 'prop5',
        name: `Featured ${instrument}`,
        description: `${instrument} referenced in the lyrics, key to the song's story`,
        referenceTag: `@${instrument}_main`
      })
    } else {
      props.push({
        id: 'prop5',
        name: 'Storytelling Elements',
        description: 'Photos, letters, jewelry, or personal items that help tell the story',
        referenceTag: '@story_props'
      })
    }
    
    return {
      artistVersions,
      locations,
      props
    }
  }

  return (
    <div className="space-y-6">
      {/* Wizard Progress Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Music Video Production</div>
            <Badge variant="outline" className="text-purple-300">
              Step {getCurrentStepIndex() + 1} of {wizardSteps.length}
            </Badge>
          </div>
          
          <Progress value={getProgressPercentage()} className="mb-3" />
          
          <div className="flex justify-between">
            {wizardSteps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = getCurrentStepIndex() > index
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    isActive ? 'bg-purple-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`text-xs text-center ${
                    isActive ? 'text-purple-300' : 
                    isCompleted ? 'text-green-300' : 
                    'text-slate-500'
                  }`}>
                    {step.label}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Status Message */}
          {showStatus && (
            <div className="mt-3 p-2 bg-slate-800/50 rounded text-center text-slate-300 text-sm animate-fade-in">
              {statusMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === WizardStep.INPUT && (
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
              <ArtistPicker value={selectedArtistId} onChange={handleArtistChange} />
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

            {/* Performance/Narrative Balance */}
            <PerformanceBalanceSlider
              value={performanceRatio}
              onChange={setPerformanceRatio}
            />

            {/* Director Selection */}
            <DirectorSelector
              selectedDirector={selectedMusicVideoDirector}
              onDirectorChange={setSelectedMusicVideoDirector}
              allDirectors={allMusicVideoDirectors}
              selectedDirectorInfo={selectedDirectorInfo}
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
              onClick={handleStartGeneration}
              disabled={isLoading || !lyrics.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Start Music Video Production
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entity Refinement Step */}
      {currentStep === WizardStep.ENTITY_REFINEMENT && extractedEntities && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-400" />
              Review & Refine Entities
            </CardTitle>
            <p className="text-slate-400 text-sm">
              The director has identified key elements. Add, remove, or edit as needed.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Artist Versions */}
            <div>
              <h4 className="text-white font-medium mb-2">Artist Versions (Different Looks)</h4>
              {extractedEntities.artistVersions.map((version: any) => (
                <div key={version.id} className="p-3 bg-slate-700/50 rounded border border-slate-600 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{version.name}</div>
                      <div className="text-slate-400 text-sm">{version.description}</div>
                      <Badge variant="outline" className="mt-1">{version.referenceTag}</Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="text-slate-400">Edit</Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="border-purple-500 text-purple-300">
                <Plus className="w-4 h-4 mr-1" /> Add Artist Look
              </Button>
            </div>

            <Separator className="bg-slate-600" />

            {/* Locations */}
            <div>
              <h4 className="text-white font-medium mb-2">Locations</h4>
              {extractedEntities.locations.map((location: any) => (
                <div key={location.id} className="p-3 bg-slate-700/50 rounded border border-slate-600 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{location.name}</div>
                      <div className="text-slate-400 text-sm">{location.description}</div>
                      <Badge variant="outline" className="mt-1">{location.referenceTag}</Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="text-slate-400">Edit</Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="border-blue-500 text-blue-300">
                <Plus className="w-4 h-4 mr-1" /> Add Location
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep(WizardStep.INPUT)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleEntitiesConfirmed} className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Target className="w-4 h-4 mr-2" />
                Confirm Entities
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Effects Step */}
      {currentStep === WizardStep.VISUAL_EFFECTS && (
        <Card className="bg-slate-900/95 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Step 6: Configure Visual Effects & Atmosphere
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Fine-tune the lighting, effects, and visual style for your music video
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <VisualEffectsPanel
              config={visualEffects}
              onConfigChange={setVisualEffects}
              performanceRatio={performanceRatio}
            />
            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep(WizardStep.ARTIST_FEEDBACK)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleVisualEffectsComplete} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Music Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Step */}
      {currentStep === WizardStep.RESULTS && (
        <Card className="bg-gradient-to-br from-green-900/30 to-slate-800/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-green-400" />
              🎬 Step 8: Music Video Production Complete!
              <Badge className="bg-green-600 ml-2">
                {performanceRatio}% Performance / {100 - performanceRatio}% Narrative
              </Badge>
            </CardTitle>
            <p className="text-green-200 text-sm">
              Your enhanced music video breakdown is ready with all the creative elements you configured!
            </p>
          </CardHeader>
          <CardContent>
            {/* Enhanced Results Display */}
            {musicVideoBreakdown?.musicVideoStructure?.sections ? (
              <div className="space-y-4">
                {musicVideoBreakdown.musicVideoStructure.sections.map((section: any, index: number) => {
                  const sectionBreakdown = musicVideoBreakdown.sectionBreakdowns[index]
                  const isExpanded = expandedSections[section.id]
                  
                  return (
                    <Card key={section.id} className="bg-slate-700/30 border-slate-600">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleSectionExpansion(section.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-slate-600/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white flex items-center gap-2 text-base">
                                <PlayCircle className="h-4 w-4 text-purple-400" />
                                {section.title}
                                <Badge variant="secondary" className="bg-slate-500/20 text-slate-300 text-xs">
                                  {section.type}
                                </Badge>
                                {sectionBreakdown?.shots && (
                                  <Badge variant="outline" className="text-xs">
                                    {sectionBreakdown.shots.length} shots
                                  </Badge>
                                )}
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-3">
                            {/* Lyrics */}
                            <div className="text-sm text-slate-300">
                              <div className="font-medium mb-2">Lyrics:</div>
                              <div className="p-2 bg-slate-800/50 rounded border border-slate-600 text-xs">
                                {section.lyrics}
                              </div>
                            </div>
                            
                            {/* Enhanced Shots */}
                            {sectionBreakdown?.shots && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-white flex items-center gap-2 text-sm">
                                    <Eye className="h-4 w-4 text-purple-400" />
                                    Shots ({sectionBreakdown.shots.length})
                                  </h4>
                                  <Button
                                    size="sm"
                                    onClick={() => onCopyToClipboard(sectionBreakdown.shots.join("\n"))}
                                    className="bg-slate-600 hover:bg-slate-500 text-white h-6 px-2 text-xs"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {sectionBreakdown.shots.map((shot: string, shotIndex: number) => (
                                    <div key={shotIndex} className="p-2 bg-slate-800/40 rounded border border-slate-700">
                                      <div className="text-xs text-slate-300">{shot}</div>
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
                
                {/* Summary Stats */}
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <h4 className="text-white font-medium mb-2 text-sm">Production Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Performance Ratio:</span>
                      <span className="text-green-300 ml-2">{performanceRatio}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Sections:</span>
                      <span className="text-blue-300 ml-2">{musicVideoBreakdown.musicVideoStructure.sections.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Artist Versions:</span>
                      <span className="text-purple-300 ml-2">{extractedEntities?.artistVersions?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Locations:</span>
                      <span className="text-amber-300 ml-2">{extractedEntities?.locations?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-green-400 text-2xl mb-4">🎬 Production Complete!</div>
                  <div className="text-slate-300 mb-4">
                    Your enhanced music video workflow is complete with all creative elements configured!
                  </div>
                </div>
                
                {/* Show what was configured */}
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3 text-center">Production Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Creative Elements:</div>
                      <div className="text-green-300 text-sm">✓ Performance Ratio: {performanceRatio}%</div>
                      <div className="text-green-300 text-sm">✓ Director Questions: {directorAnswers.length} answered</div>
                      <div className="text-green-300 text-sm">✓ Artist Feedback: {artistFeedback.length} treatments reviewed</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Entity Setup:</div>
                      <div className="text-purple-300 text-sm">✓ Artist Versions: {extractedEntities?.artistVersions?.length || 0}</div>
                      <div className="text-blue-300 text-sm">✓ Locations: {extractedEntities?.locations?.length || 0}</div>
                      <div className="text-amber-300 text-sm">✓ Props: {extractedEntities?.props?.length || 0}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                    <div className="text-purple-300 text-sm text-center">
                      🎨 Visual Effects: {visualEffects.lighting.primary} lighting, {visualEffects.atmosphere.style} atmosphere
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-slate-500 text-sm">
                  🚀 Ready for full generation with your configured creative workflow!
                </div>
              </div>
            )}
            
            <Button onClick={() => setCurrentStep(WizardStep.INPUT)} className="w-full mt-4">
              Start New Production
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Director Questions Dialog */}
      {currentStep === WizardStep.DIRECTOR_QUESTIONS && (
        <DirectorMVQuestionCards
          isOpen={true}
          onClose={() => {}} // Can't close, must complete
          director={selectedDirectorInfo || allMusicVideoDirectors[0]}
          artist={selectedArtistProfile || { artist_name: artist || 'Artist', genres: [genre] } as ArtistProfile}
          songTitle={songTitle || 'Untitled Song'}
          lyrics={lyrics}
          onQuestionsAnswered={handleDirectorQuestionsComplete}
        />
      )}

      {/* Artist Feedback Dialog */}
      {currentStep === WizardStep.ARTIST_FEEDBACK && (
        <ArtistTextFeedback
          isOpen={true}
          onClose={() => {}} // Can't close, must complete
          artist={selectedArtistProfile || { artist_name: artist || 'Artist', genres: [genre] } as ArtistProfile}
          treatmentOptions={[
            { id: '1', name: 'Performance Focus', concept: 'High-energy performance with dynamic visuals', visualTheme: 'Bold and energetic' },
            { id: '2', name: 'Narrative Story', concept: 'Story-driven concept with character development', visualTheme: 'Cinematic and emotional' },
            { id: '3', name: 'Abstract Art', concept: 'Artistic visuals with symbolic imagery', visualTheme: 'Creative and experimental' },
            { id: '4', name: 'Hybrid Approach', concept: 'Balanced mix of performance and story', visualTheme: 'Versatile and dynamic' }
          ]}
          onFeedbackComplete={handleArtistFeedbackComplete}
        />
      )}
    </div>
  )
}