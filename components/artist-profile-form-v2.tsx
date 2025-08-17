"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, Sparkles, FileText, Trash2, Download, FileUp, AlertCircle,
  ChevronDown, ChevronRight, Music, Mic, PenTool, Dna, Settings, Shield
} from "lucide-react"
import {
  type ArtistProfileV2,
  createBlankArtistV2,
  MBTI_TYPES,
  migrateArtistToV2,
  GENRE_TEMPLATES
} from "@/lib/artist-types-v2"
import { artistDB } from "@/lib/artist-db"
import { useArtistStore } from "@/lib/artist-store"
import { cn } from "@/lib/utils"
import { autofillArtistProfile, createArtistFromDescription, createArtistFromLyrics } from "@/app/actions/artists/index"

type Props = {
  initial?: Partial<ArtistProfileV2>
  onSaved?: (saved: ArtistProfileV2) => void
}

// Collapsible Section Component
function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean 
}) {
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
        <div className="p-4 space-y-4 bg-slate-900/50">
          {children}
        </div>
      )}
    </div>
  )
}

// Required fields for validation
const REQUIRED_FIELDS = [
  "identity_persona.artist_name",
  "identity_persona.gender",
  "musical_dna.genres.primary",
]

export default function ArtistProfileFormV2({ initial, onSaved }: Props) {
  const [state, setState] = useState<ArtistProfileV2>(() => {
    if (initial) {
      // Check if it's an old format and migrate
      if (!initial.version || initial.version !== "2.0") {
        return migrateArtistToV2(initial)
      }
      return { ...createBlankArtistV2(), ...initial }
    }
    return createBlankArtistV2()
  })
  
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showLyricsInput, setShowLyricsInput] = useState(false)
  const [description, setDescription] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const { setActiveArtist } = useArtistStore()

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    let total = 0
    let filled = 0
    
    // Check Identity & Persona
    const identityFields = ["artist_name", "gender", "origin_city"]
    identityFields.forEach(field => {
      total++
      if ((state.identity_persona as any)[field]) filled++
    })
    
    // Check Musical DNA
    total++
    if (state.musical_dna.genres.primary.length > 0) filled++
    
    // Check Vocal Performance
    if (state.vocal_performance) {
      total += 3
      if (state.vocal_performance.vocal_timbre) filled++
      if (state.vocal_performance.flow_phrasing) filled++
      if (state.vocal_performance.performance_persona) filled++
    }
    
    // Check Songwriting
    if (state.songwriting_system) {
      total += 2
      if (state.songwriting_system.themes?.primary_themes?.length) filled++
      if (state.songwriting_system.lyrical_content) filled++
    }
    
    return Math.round((filled / Math.max(total, 1)) * 100)
  }, [state])

  // Check missing required fields
  const missingRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((path) => {
      const value = path.split(".").reduce((obj: any, key) => obj?.[key], state)
      if (Array.isArray(value)) return value.length === 0
      return !value || value.toString().trim() === ""
    })
  }, [state])

  function updateState(updater: (prev: ArtistProfileV2) => ArtistProfileV2) {
    setState(prev => {
      const next = updater(structuredClone(prev))
      next.updated_at = new Date().toISOString()
      return next
    })
  }

  function set(path: string, value: any) {
    updateState(prev => {
      const parts = path.split(".")
      let obj: any = prev
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i]
        obj[k] = obj[k] ?? {}
        obj = obj[k]
      }
      obj[parts[parts.length - 1]] = value
      return prev
    })
  }

  async function onAutoFill() {
    setIsLoading(true)
    try {
      const res = await autofillArtistProfile(state)
      updateState(prev => {
        const filled = res.fill
        return {
          ...prev,
          identity_persona: { ...prev.identity_persona, ...filled.identity_persona },
          vocal_performance: { ...prev.vocal_performance, ...filled.vocal_performance },
          songwriting_system: { ...prev.songwriting_system, ...filled.songwriting_system },
          musical_dna: { ...prev.musical_dna, ...filled.musical_dna },
          production_blueprint: { ...prev.production_blueprint, ...filled.production_blueprint },
          content_safety: { ...prev.content_safety, ...filled.content_safety },
        }
      })
    } catch (error) {
      console.error("Auto-fill failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onCreateFromDescription() {
    if (!description.trim()) return
    setIsLoading(true)
    try {
      const res = await createArtistFromDescription(description)
      setState(res.profile)
      setDescription("")
      setShowDescriptionInput(false)
    } catch (error) {
      console.error("Create from description failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onCreateFromLyrics() {
    if (!lyrics.trim()) return
    setIsLoading(true)
    try {
      const res = await createArtistFromLyrics(lyrics)
      setState(res.profile)
      setLyrics("")
      setShowLyricsInput(false)
    } catch (error) {
      console.error("Create from lyrics failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSave() {
    // For now, save to the old format until we update the database
    const v1Format: any = {
      ...state,
      artist_id: state.artist_id,
      artist_name: state.identity_persona.artist_name,
      real_name: state.identity_persona.real_name,
      image_data_url: state.identity_persona.image_data_url,
      artist_identity: {
        gender: state.identity_persona.gender,
        age_range: state.identity_persona.age_range,
        accent: state.identity_persona.vocal_phonetics?.regional_dialect,
        city: state.identity_persona.origin_city,
        state: state.identity_persona.origin_state,
      },
      genres: state.musical_dna.genres.primary,
      sub_genres: state.musical_dna.genres.sub,
      micro_genres: state.musical_dna.genres.micro,
      personality: {
        mbti: state.identity_persona.mbti,
      },
      meta: {
        version: "2.0",
        created_at: state.created_at,
        updated_at: state.updated_at,
      },
    }
    
    await artistDB.upsert(v1Format)
    setActiveArtist(v1Format)
    onSaved?.(state)
  }

  function applyTemplate(templateName: keyof typeof GENRE_TEMPLATES) {
    const template = GENRE_TEMPLATES[templateName]
    updateState(prev => {
      return {
        ...prev,
        ...template,
        vocal_performance: { ...prev.vocal_performance, ...template.vocal_performance },
        songwriting_system: { ...prev.songwriting_system, ...template.songwriting_system },
        musical_dna: { ...prev.musical_dna, ...template.musical_dna },
        production_blueprint: { ...prev.production_blueprint, ...template.production_blueprint },
      }
    })
  }

  function onClearForm() {
    setState(createBlankArtistV2())
    setDescription("")
    setLyrics("")
    setShowDescriptionInput(false)
    setShowLyricsInput(false)
  }

  function onExportArtist() {
    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${state.identity_persona.artist_name || "artist"}-profile-v2.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function onImportArtist(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        // Check version and migrate if needed
        if (!imported.version || imported.version !== "2.0") {
          setState(migrateArtistToV2(imported))
        } else {
          setState({ ...imported, artist_id: state.artist_id })
        }
      } catch (error) {
        console.error("Failed to import artist:", error)
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  function fileToDataUrl(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set("identity_persona.image_data_url", String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 rounded-t">
        <CardTitle className="text-white flex items-center justify-between">
          <span>🎤 Artist Profile v2.0 - AI Song Creation</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{completionPercentage}% complete</span>
            <Progress value={completionPercentage} className="w-24" />
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Missing Required Fields Warning */}
        {missingRequiredFields.length > 0 && (
          <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-red-300 text-sm">
              <div className="font-medium mb-1">Required fields missing:</div>
              <div className="text-xs text-red-400">
                {missingRequiredFields.map((field) => field.replace(/\./g, " → ")).join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* AI Description Input */}
        {showDescriptionInput && (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <Label className="text-slate-300 text-sm mb-2 block">Describe the Artist</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A mixture between Drake and The Weeknd, melodic rap with dark R&B production..."
              className="bg-slate-950 border-slate-700 text-white mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={onCreateFromDescription}
                disabled={!description.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Creating..." : "Create Profile"}
              </Button>
              <Button
                onClick={() => setShowDescriptionInput(false)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* AI Lyrics Input */}
        {showLyricsInput && (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <Label className="text-slate-300 text-sm mb-2 block">Paste Song Lyrics</Label>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste the full lyrics here and AI will analyze the style, flow patterns, and characteristics..."
              className="bg-slate-950 border-slate-700 text-white mb-3"
              rows={6}
            />
            <div className="flex gap-2">
              <Button
                onClick={onCreateFromLyrics}
                disabled={!lyrics.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Analyzing..." : "Analyze & Create"}
              </Button>
              <Button
                onClick={() => setShowLyricsInput(false)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions & Templates */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg border border-slate-600">
          <Select value={selectedTemplate} onValueChange={(v) => {
            setSelectedTemplate(v)
            if (v) applyTemplate(v as keyof typeof GENRE_TEMPLATES)
          }}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-200">
              <SelectValue placeholder="Apply Template" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="rapper" className="text-slate-200">Rapper Template</SelectItem>
              <SelectItem value="singer" className="text-slate-200">Singer Template</SelectItem>
              <SelectItem value="country" className="text-slate-200">Country Template</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setShowDescriptionInput(!showDescriptionInput)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Describe
          </Button>
          
          <Button
            onClick={() => setShowLyricsInput(!showLyricsInput)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            From Lyrics
          </Button>
          
          <Button
            onClick={onClearForm}
            variant="outline"
            size="sm"
            className="bg-red-700 border-red-600 text-red-200 hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          
          <Button
            onClick={onExportArtist}
            variant="outline"
            size="sm"
            className="bg-blue-700 border-blue-600 text-blue-200 hover:bg-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={onImportArtist}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-green-700 border-green-600 text-green-200 hover:bg-green-600"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Main Content - 6 Categories as Tabs */}
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-1 bg-slate-800 p-1">
            <TabsTrigger value="identity" className="text-xs">
              <span className="hidden lg:inline">Identity</span>
              <span className="lg:hidden">ID</span>
            </TabsTrigger>
            <TabsTrigger value="vocal" className="text-xs">
              <span className="hidden lg:inline">Vocal</span>
              <span className="lg:hidden">Voc</span>
            </TabsTrigger>
            <TabsTrigger value="songwriting" className="text-xs">
              <span className="hidden lg:inline">Writing</span>
              <span className="lg:hidden">Wrt</span>
            </TabsTrigger>
            <TabsTrigger value="musical" className="text-xs">
              <span className="hidden lg:inline">Musical</span>
              <span className="lg:hidden">Mus</span>
            </TabsTrigger>
            <TabsTrigger value="production" className="text-xs">
              <span className="hidden lg:inline">Production</span>
              <span className="lg:hidden">Prod</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="text-xs">
              <span className="hidden lg:inline">Safety</span>
              <span className="lg:hidden">Safe</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. IDENTITY & PERSONA */}
          <TabsContent value="identity" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Identity & Persona
            </h3>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => fileToDataUrl(e.target.files?.[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800 overflow-hidden hover:border-slate-500 transition-colors">
                    {state.identity_persona.image_data_url ? (
                      <img
                        src={state.identity_persona.image_data_url}
                        alt="Artist"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Upload className="w-4 h-4 mb-1" />
                        <span className="text-[10px] text-center">Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Artist Name *</Label>
                  <Input
                    value={state.identity_persona.artist_name}
                    onChange={(e) => set("identity_persona.artist_name", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Stage name"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Real Name</Label>
                  <Input
                    value={state.identity_persona.real_name || ""}
                    onChange={(e) => set("identity_persona.real_name", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Legal name"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Gender *</Label>
                  <Input
                    value={state.identity_persona.gender || ""}
                    onChange={(e) => set("identity_persona.gender", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Male/Female/Non-binary"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Age Range</Label>
                  <Input
                    value={state.identity_persona.age_range || ""}
                    onChange={(e) => set("identity_persona.age_range", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="e.g., early 20s"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Origin City</Label>
                  <Input
                    value={state.identity_persona.origin_city || ""}
                    onChange={(e) => set("identity_persona.origin_city", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Atlanta"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Origin State</Label>
                  <Input
                    value={state.identity_persona.origin_state || ""}
                    onChange={(e) => set("identity_persona.origin_state", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="GA"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">MBTI Type</Label>
                  <Select 
                    value={state.identity_persona.mbti || ""} 
                    onValueChange={(v) => set("identity_persona.mbti", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {MBTI_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <CollapsibleSection title="Vocal Phonetics" icon={<span>🗣️</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Regional Dialect</Label>
                  <Input
                    value={state.identity_persona.vocal_phonetics?.regional_dialect || ""}
                    onChange={(e) => set("identity_persona.vocal_phonetics.regional_dialect", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Southern drawl, NYC rapid-fire"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Vowel Color</Label>
                  <Input
                    value={state.identity_persona.vocal_phonetics?.vowel_color || ""}
                    onChange={(e) => set("identity_persona.vocal_phonetics.vowel_color", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="rounded, bright, nasal"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Consonant Attack</Label>
                  <Input
                    value={state.identity_persona.vocal_phonetics?.consonant_attack || ""}
                    onChange={(e) => set("identity_persona.vocal_phonetics.consonant_attack", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="soft, percussive, clipped"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Diction Clarity (0-10)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[state.identity_persona.vocal_phonetics?.diction_clarity || 5]}
                      onValueChange={([v]) => set("identity_persona.vocal_phonetics.diction_clarity", v)}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white w-8">{state.identity_persona.vocal_phonetics?.diction_clarity || 5}</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Brand Positioning" icon={<span>🎯</span>}>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300 text-sm">Sonic References</Label>
                  <Input
                    value={(state.identity_persona.brand_positioning?.sonic_references || []).join(", ")}
                    onChange={(e) => set("identity_persona.brand_positioning.sonic_references", 
                      e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    )}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Drake, J. Cole, Kendrick"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Market Position</Label>
                  <Input
                    value={state.identity_persona.brand_positioning?.market_position || ""}
                    onChange={(e) => set("identity_persona.brand_positioning.market_position", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="conscious mainstream, underground experimental"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* 2. VOCAL & PERFORMANCE */}
          <TabsContent value="vocal" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Vocal & Performance Profile
            </h3>
            
            <CollapsibleSection title="Vocal Timbre" icon={<span>🎤</span>} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Voice Type</Label>
                  <Select 
                    value={state.vocal_performance?.vocal_timbre?.voice_type || ""} 
                    onValueChange={(v) => set("vocal_performance.vocal_timbre.voice_type", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["soprano", "alto", "tenor", "baritone", "bass", "varied"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Weight</Label>
                  <Select 
                    value={state.vocal_performance?.vocal_timbre?.weight || ""} 
                    onValueChange={(v) => set("vocal_performance.vocal_timbre.weight", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["light", "lyric", "dramatic", "heavy"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Range Low</Label>
                  <Input
                    value={state.vocal_performance?.vocal_timbre?.range_low || ""}
                    onChange={(e) => set("vocal_performance.vocal_timbre.range_low", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="C2"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Range High</Label>
                  <Input
                    value={state.vocal_performance?.vocal_timbre?.range_high || ""}
                    onChange={(e) => set("vocal_performance.vocal_timbre.range_high", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="C5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Texture Settings</Label>
                {["breathiness", "rasp", "nasality", "warmth"].map(param => (
                  <div key={param} className="flex items-center gap-3">
                    <Label className="text-slate-400 text-xs w-20 capitalize">{param}</Label>
                    <Slider
                      value={[state.vocal_performance?.vocal_timbre?.texture?.[param as keyof typeof state.vocal_performance.vocal_timbre.texture] || 5]}
                      onValueChange={([v]) => set(`vocal_performance.vocal_timbre.texture.${param}`, v)}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white w-8">
                      {state.vocal_performance?.vocal_timbre?.texture?.[param as keyof typeof state.vocal_performance.vocal_timbre.texture] || 5}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Flow & Phrasing" icon={<span>🎵</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Timing Preference</Label>
                  <Select 
                    value={state.vocal_performance?.flow_phrasing?.timing_preference || ""} 
                    onValueChange={(v) => set("vocal_performance.flow_phrasing.timing_preference", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["behind", "on", "ahead", "varies"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Phrasing Style</Label>
                  <Select 
                    value={state.vocal_performance?.flow_phrasing?.phrasing_style || ""} 
                    onValueChange={(v) => set("vocal_performance.flow_phrasing.phrasing_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["legato", "staccato", "mixed"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Performance Persona" icon={<span>🎭</span>}>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300 text-sm">Ad-libs Bank</Label>
                  <Input
                    value={(state.vocal_performance?.performance_persona?.adlibs_bank || []).join(", ")}
                    onChange={(e) => set("vocal_performance.performance_persona.adlibs_bank", 
                      e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    )}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="yeah, uh, okay, let's go"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300 text-sm">Ad-lib Frequency</Label>
                    <Select 
                      value={state.vocal_performance?.performance_persona?.adlib_frequency || ""} 
                      onValueChange={(v) => set("vocal_performance.performance_persona.adlib_frequency", v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {["sparse", "moderate", "heavy"].map((t) => (
                          <SelectItem key={t} value={t} className="text-slate-200">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Energy Level</Label>
                    <Select 
                      value={state.vocal_performance?.performance_persona?.energy_level || ""} 
                      onValueChange={(v) => set("vocal_performance.performance_persona.energy_level", v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {["laid-back", "moderate", "high-energy", "dynamic"].map((t) => (
                          <SelectItem key={t} value={t} className="text-slate-200">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* 3. SONGWRITING SYSTEM */}
          <TabsContent value="songwriting" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Songwriting System
            </h3>
            
            <CollapsibleSection title="Song Structure" icon={<span>🏗️</span>} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Intro Style</Label>
                  <Select 
                    value={state.songwriting_system?.song_forms?.intro_style || ""} 
                    onValueChange={(v) => set("songwriting_system.song_forms.intro_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["instrumental", "vocal", "cold-open", "build-up"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Outro Style</Label>
                  <Select 
                    value={state.songwriting_system?.song_forms?.outro_style || ""} 
                    onValueChange={(v) => set("songwriting_system.song_forms.outro_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["fade", "hard-stop", "instrumental", "repeat-hook"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Prosody & Rhyme" icon={<span>📝</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Verse Syllables/Bar</Label>
                  <Input
                    type="number"
                    value={state.songwriting_system?.prosody_rhyme?.syllables_per_bar?.verse_avg || ""}
                    onChange={(e) => set("songwriting_system.prosody_rhyme.syllables_per_bar.verse_avg", parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="12"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Chorus Syllables/Bar</Label>
                  <Input
                    type="number"
                    value={state.songwriting_system?.prosody_rhyme?.syllables_per_bar?.chorus_avg || ""}
                    onChange={(e) => set("songwriting_system.prosody_rhyme.syllables_per_bar.chorus_avg", parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Rhyme Density (0-10)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[state.songwriting_system?.prosody_rhyme?.rhyme_density || 5]}
                      onValueChange={([v]) => set("songwriting_system.prosody_rhyme.rhyme_density", v)}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white w-8">{state.songwriting_system?.prosody_rhyme?.rhyme_density || 5}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Multisyllabic Frequency</Label>
                  <Select 
                    value={state.songwriting_system?.prosody_rhyme?.multisyllabic_frequency || ""} 
                    onValueChange={(v) => set("songwriting_system.prosody_rhyme.multisyllabic_frequency", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["rare", "moderate", "heavy"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Themes & Content" icon={<span>💭</span>}>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300 text-sm">Primary Themes</Label>
                  <Input
                    value={(state.songwriting_system?.themes?.primary_themes || []).join(", ")}
                    onChange={(e) => set("songwriting_system.themes.primary_themes", 
                      e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    )}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="struggle, success, love, loyalty"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Narrative Style</Label>
                  <Select 
                    value={state.songwriting_system?.themes?.narrative_style || ""} 
                    onValueChange={(v) => set("songwriting_system.themes.narrative_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["linear", "vignettes", "abstract", "storytelling"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* 4. MUSICAL DNA */}
          <TabsContent value="musical" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Dna className="w-5 h-5" />
              Musical DNA
            </h3>
            
            <div>
              <Label className="text-slate-300 text-sm">Genres *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={(state.musical_dna.genres.primary || []).join(", ")}
                  onChange={(e) => set("musical_dna.genres.primary", 
                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  )}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Primary: Hip-Hop, Pop"
                />
                <Input
                  value={(state.musical_dna.genres.sub || []).join(", ")}
                  onChange={(e) => set("musical_dna.genres.sub", 
                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  )}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Sub: Trap, Alt-R&B"
                />
                <Input
                  value={(state.musical_dna.genres.micro || []).join(", ")}
                  onChange={(e) => set("musical_dna.genres.micro", 
                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  )}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Micro: Miami Bass"
                />
              </div>
            </div>
            
            <CollapsibleSection title="Rhythm & Groove" icon={<span>🥁</span>}>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">BPM Min</Label>
                  <Input
                    type="number"
                    value={state.musical_dna.rhythm_groove?.bpm_range?.min || ""}
                    onChange={(e) => set("musical_dna.rhythm_groove.bpm_range.min", parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">BPM Max</Label>
                  <Input
                    type="number"
                    value={state.musical_dna.rhythm_groove?.bpm_range?.max || ""}
                    onChange={(e) => set("musical_dna.rhythm_groove.bpm_range.max", parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="140"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Sweet Spot</Label>
                  <Input
                    type="number"
                    value={state.musical_dna.rhythm_groove?.bpm_range?.sweet_spot || ""}
                    onChange={(e) => set("musical_dna.rhythm_groove.bpm_range.sweet_spot", parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="110"
                  />
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Melody Profile (Singers)" icon={<span>🎶</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Scale Modes</Label>
                  <Input
                    value={(state.musical_dna.melody_profile?.scale_modes || []).join(", ")}
                    onChange={(e) => set("musical_dna.melody_profile.scale_modes", 
                      e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    )}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="minor, major, dorian"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Melisma Usage</Label>
                  <Select 
                    value={state.musical_dna.melody_profile?.melisma_usage || ""} 
                    onValueChange={(v) => set("musical_dna.melody_profile.melisma_usage", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["none", "minimal", "moderate", "heavy"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* 5. PRODUCTION BLUEPRINT */}
          <TabsContent value="production" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Production Blueprint
            </h3>
            
            <CollapsibleSection title="Core Palette" icon={<span>🎛️</span>} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Drum Character</Label>
                  <Select 
                    value={state.production_blueprint?.core_palette?.drum_character || ""} 
                    onValueChange={(v) => set("production_blueprint.core_palette.drum_character", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["acoustic", "electronic", "hybrid", "vintage"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Bass Type</Label>
                  <Select 
                    value={state.production_blueprint?.core_palette?.bass_type || ""} 
                    onValueChange={(v) => set("production_blueprint.core_palette.bass_type", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["808", "synth", "electric", "upright", "hybrid"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-300 text-sm">Primary Instruments</Label>
                  <Input
                    value={(state.production_blueprint?.core_palette?.primary_instruments || []).join(", ")}
                    onChange={(e) => set("production_blueprint.core_palette.primary_instruments", 
                      e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    )}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="piano, guitar, strings, synths"
                  />
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Mix Character" icon={<span>🎚️</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Frequency Balance</Label>
                  <Select 
                    value={state.production_blueprint?.mix_character?.frequency_balance || ""} 
                    onValueChange={(v) => set("production_blueprint.mix_character.frequency_balance", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["bass-heavy", "balanced", "bright", "mid-focused"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Compression Style</Label>
                  <Select 
                    value={state.production_blueprint?.mix_character?.compression_style || ""} 
                    onValueChange={(v) => set("production_blueprint.mix_character.compression_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["transparent", "pumping", "vintage", "modern"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          {/* 6. CONTENT & SAFETY */}
          <TabsContent value="safety" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Content & Safety
            </h3>
            
            <CollapsibleSection title="Content Filters" icon={<span>🚫</span>} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Profanity Level</Label>
                  <Select 
                    value={state.content_safety?.content_filters?.profanity_level || ""} 
                    onValueChange={(v) => set("content_safety.content_filters.profanity_level", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["none", "mild", "moderate", "explicit"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Violence References</Label>
                  <Select 
                    value={state.content_safety?.content_filters?.violence_references || ""} 
                    onValueChange={(v) => set("content_safety.content_filters.violence_references", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["none", "metaphorical", "mild", "graphic"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Chat Personality" icon={<span>💬</span>}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-sm">Base Tone</Label>
                  <Select 
                    value={state.content_safety?.chat_personality?.base_tone || ""} 
                    onValueChange={(v) => set("content_safety.chat_personality.base_tone", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["friendly", "professional", "casual", "intense"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Humor Style</Label>
                  <Select 
                    value={state.content_safety?.chat_personality?.humor_style || ""} 
                    onValueChange={(v) => set("content_safety.chat_personality.humor_style", v)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {["none", "dry", "playful", "sarcastic"].map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-200">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={onAutoFill}
            disabled={isLoading || !state.identity_persona.artist_name}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            {isLoading ? "Filling..." : "AI Auto-fill Missing Fields"}
          </Button>
          <Button
            onClick={onSave}
            disabled={missingRequiredFields.length > 0}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Save Artist Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}