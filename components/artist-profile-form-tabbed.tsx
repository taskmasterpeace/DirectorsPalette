"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, Sparkles, FileText, Trash2, Download, FileUp, AlertCircle,
  User, Music, Mic, PenTool, Image, Settings
} from "lucide-react"
import {
  type ArtistProfile,
  blankArtist,
  MBTI_TYPES,
  mergeArtist,
  toCSVArray,
  RACE_ETHNICITY_OPTIONS,
} from "@/lib/artist-types"
import { artistDB } from "@/lib/artist-db"
import { autofillArtistProfile, createArtistFromDescription, createArtistFromLyrics } from "@/app/actions/artists"
import { useArtistStore } from "@/lib/artist-store"
import { GenreCommandMulti } from "@/components/shared/GenreCommandMulti"

type Props = {
  initial?: Partial<ArtistProfile>
  onSaved?: (saved: ArtistProfile) => void
}

// Hidden items that are always included in "never say" but not visible to user
const HIDDEN_NEVER_SAY_ITEMS = [
  "slay queen",
  "periodt", 
  "bestie",
  "no cap fr fr",
  "it's giving",
  "main character energy",
  "touch grass",
  "ratio",
  "based",
  "cringe",
  "sus",
]

// Required fields for validation
const REQUIRED_FIELDS = [
  "artist_name",
  "artist_identity.gender",
  "genres",
]

export default function ArtistProfileFormTabbed({ initial, onSaved }: Props) {
  const [state, setState] = useState<ArtistProfile>(() => {
    if (initial && initial.artist_id) {
      // Editing existing artist
      return { ...blankArtist(), ...initial } as ArtistProfile
    } else {
      // Creating new artist
      return blankArtist()
    }
  })
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showLyricsInput, setShowLyricsInput] = useState(false)
  const [description, setDescription] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isNew, setIsNew] = useState(!initial?.artist_id)
  const { setActiveArtist } = useArtistStore()

  useEffect(() => {
    if (initial && initial.artist_id) {
      // Editing existing artist
      setState({ ...blankArtist(), ...initial } as ArtistProfile)
      setIsNew(false)
    } else if (!initial || !initial.artist_id) {
      // Creating new artist - ensure we have a fresh ID
      const newArtist = blankArtist()
      setState(newArtist)
      setIsNew(true)
    }
  }, [initial])

  // Calculate completion with weighted fields
  const completionPercentage = useMemo(() => {
    const fields = [
      { path: "artist_name", weight: 3 },
      { path: "artist_identity.gender", weight: 2 },
      { path: "genres", weight: 3 },
      { path: "vocal_description.tone_texture", weight: 2 },
      { path: "writing_persona.themes", weight: 1 },
      { path: "visual_look.fashion_style", weight: 1 },
    ]

    const getValue = (obj: any, path: string) => {
      return path.split(".").reduce((o, p) => o?.[p], obj)
    }

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0)
    const filledWeight = fields.reduce((sum, field) => {
      const value = getValue(state, field.path)
      const isFilled = value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)
      return sum + (isFilled ? field.weight : 0)
    }, 0)

    return Math.round((filledWeight / totalWeight) * 100)
  }, [state])

  // Get user-visible never say items (excluding hidden ones)
  const visibleNeverSayItems = useMemo(() => {
    const allItems = state.chat_voice?.never_say || []
    return allItems.filter((item) => !HIDDEN_NEVER_SAY_ITEMS.includes(item))
  }, [state.chat_voice?.never_say])

  // Get all never say items (visible + hidden)
  const allNeverSayItems = useMemo(() => {
    const visible = visibleNeverSayItems
    return [...visible, ...HIDDEN_NEVER_SAY_ITEMS]
  }, [visibleNeverSayItems])

  // Check if required fields are filled
  const missingRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((path) => {
      const value = path.split(".").reduce((obj: any, key) => obj?.[key], state)
      if (Array.isArray(value)) return value.length === 0
      return !value || value.toString().trim() === ""
    })
  }, [state])

  function set(path: string, value: any) {
    setState((prev) => {
      const next = structuredClone(prev) as any
      const parts = path.split(".")
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i]
        obj[k] = obj[k] ?? {}
        obj = obj[k]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  // Special handler for never_say that combines visible + hidden items
  function setNeverSay(visibleItems: string[]) {
    const combined = [...visibleItems, ...HIDDEN_NEVER_SAY_ITEMS]
    set("chat_voice.never_say", combined)
  }

  async function onSave() {
    // Check for duplicate names when creating new artist
    if (isNew && state.artist_name) {
      const existing = await artistDB.all()
      const duplicate = existing.find(a => 
        a.artist_name?.toLowerCase() === state.artist_name?.toLowerCase() && 
        a.artist_id !== state.artist_id
      )
      if (duplicate) {
        if (!confirm(`An artist named "${state.artist_name}" already exists. Save anyway?`)) {
          return
        }
      }
    }
    
    const normalized: ArtistProfile = {
      ...state,
      chat_voice: {
        ...state.chat_voice,
        never_say: allNeverSayItems,
      },
      meta: {
        version: state.meta?.version || "1.0",
        created_at: state.meta?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }
    await artistDB.upsert(normalized)
    setActiveArtist(normalized)
    setIsNew(false) // Mark as no longer new after saving
    onSaved?.(normalized)
  }

  async function onAutoFill() {
    setIsLoading(true)
    try {
      const res = await autofillArtistProfile(state)
      const merged = mergeArtist<ArtistProfile>(state, res.fill as any)
      setState((prev) => ({ ...prev, ...merged }))
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
      setState(res.profile as any)
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
      setState(res.profile as any)
      setLyrics("")
      setShowLyricsInput(false)
    } catch (error) {
      console.error("Create from lyrics failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function onClearForm() {
    setState(blankArtist())
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
    link.download = `${state.artist_name || "artist"}-profile.json`
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
        setState({ ...imported, artist_id: state.artist_id })
      } catch (error) {
        console.error("Failed to import artist:", error)
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  function fileToDataUrl(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set("image_data_url", String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 rounded-t">
        <CardTitle className="text-white flex items-center justify-between">
          <span>
            🎤 {isNew ? "Create New Artist" : `Edit: ${state.artist_name || "Artist"}`}
          </span>
          <div className="flex items-center gap-3">
            {!isNew && state.artist_id && (
              <span className="text-xs text-slate-400">ID: {state.artist_id.slice(-6)}</span>
            )}
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

        {/* AI Creation Tools */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg border border-slate-600">
          <Button
            onClick={() => setShowDescriptionInput(!showDescriptionInput)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Describe Artist
          </Button>
          <Button
            onClick={() => setShowLyricsInput(!showLyricsInput)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            Analyze Lyrics
          </Button>
          <Button
            onClick={onClearForm}
            variant="outline"
            size="sm"
            className="bg-red-700 border-red-600 text-red-200 hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Form
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

        {showDescriptionInput && (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <Label className="text-slate-300 text-sm mb-2 block">Describe the Artist</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A mixture between KRS-One and Big Daddy Kane, conscious rap with boom-bap production..."
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

        {showLyricsInput && (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <Label className="text-slate-300 text-sm mb-2 block">Paste Song Lyrics</Label>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste the full lyrics here and AI will analyze the style, themes, and characteristics..."
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

        {/* Main Content - Organized in Tabs */}
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-1 bg-slate-800 p-1">
            <TabsTrigger value="identity" className="text-xs flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="hidden lg:inline">Identity</span>
            </TabsTrigger>
            <TabsTrigger value="musical" className="text-xs flex items-center gap-1">
              <Music className="w-3 h-3" />
              <span className="hidden lg:inline">Musical</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span className="hidden lg:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="writing" className="text-xs flex items-center gap-1">
              <PenTool className="w-3 h-3" />
              <span className="hidden lg:inline">Writing</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs flex items-center gap-1">
              <Image className="w-3 h-3" />
              <span className="hidden lg:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span className="hidden lg:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: IDENTITY */}
          <TabsContent value="identity" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">👤 Identity & Background</h3>
            
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
                    {state.image_data_url ? (
                      <img
                        src={state.image_data_url}
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
                    value={state.artist_name || ""}
                    onChange={(e) => set("artist_name", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Stage name"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Real Name</Label>
                  <Input
                    value={state.real_name || ""}
                    onChange={(e) => set("real_name", e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Legal name"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Gender *</Label>
                <Input
                  value={state.artist_identity?.gender || ""}
                  onChange={(e) => set("artist_identity.gender", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Male/Female/Non-binary"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Age Range</Label>
                <Input
                  value={state.artist_identity?.age_range || ""}
                  onChange={(e) => set("artist_identity.age_range", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g., early 20s"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-slate-300 text-sm">Race / Ethnicity</Label>
                <div className="flex gap-2">
                  <Select
                    value={
                      state.artist_identity?.race_ethnicity &&
                      (RACE_ETHNICITY_OPTIONS as readonly string[]).includes(state.artist_identity?.race_ethnicity)
                        ? state.artist_identity?.race_ethnicity
                        : "Other"
                    }
                    onValueChange={(v) => {
                      if (v === "Other") {
                        set("artist_identity.race_ethnicity", "")
                      } else {
                        set("artist_identity.race_ethnicity", v)
                      }
                    }}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white flex-1">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {RACE_ETHNICITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-slate-200">
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other" className="text-slate-200">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(state.artist_identity?.race_ethnicity === "" ||
                    !(RACE_ETHNICITY_OPTIONS as readonly string[]).includes(
                      state.artist_identity?.race_ethnicity || "",
                    )) && (
                    <Input
                      value={state.artist_identity?.race_ethnicity || ""}
                      onChange={(e) => set("artist_identity.race_ethnicity", e.target.value)}
                      placeholder="Specify..."
                      className="bg-slate-950 border-slate-700 text-white flex-1"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Accent / Regional Dialect</Label>
                <Input
                  value={state.artist_identity?.accent || ""}
                  onChange={(e) => set("artist_identity.accent", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g., Southern drawl, NYC, British"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Hometown</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={state.artist_identity?.city || ""}
                    onChange={(e) => set("artist_identity.city", e.target.value)}
                    placeholder="City"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                  <Input
                    value={state.artist_identity?.state || ""}
                    onChange={(e) => set("artist_identity.state", e.target.value)}
                    placeholder="State"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                  <Input
                    value={state.artist_identity?.zip || ""}
                    onChange={(e) => set("artist_identity.zip", e.target.value)}
                    placeholder="ZIP"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">MBTI Personality Type</Label>
              <Select value={state.personality?.mbti || ""} onValueChange={(v) => set("personality.mbti", v)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white w-48">
                  <SelectValue placeholder="Select personality type" />
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
          </TabsContent>

          {/* TAB 2: MUSICAL STYLE */}
          <TabsContent value="musical" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">🎵 Musical Style</h3>
            
            <GenreCommandMulti
              primaryGenres={state.genres || []}
              subGenres={state.sub_genres || []}
              microGenres={state.micro_genres || []}
              onPrimaryGenresChange={(genres) => set("genres", genres)}
              onSubGenresChange={(genres) => set("sub_genres", genres)}
              onMicroGenresChange={(genres) => set("micro_genres", genres)}
            />
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Vocal Tone / Texture</Label>
                <Input
                  value={state.vocal_description?.tone_texture || ""}
                  onChange={(e) => set("vocal_description.tone_texture", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g., raspy baritone, smooth alto"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Delivery Style</Label>
                <Input
                  value={state.vocal_description?.delivery_style || ""}
                  onChange={(e) => set("vocal_description.delivery_style", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g., laid-back, aggressive, melodic"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Vocal Quirks</Label>
              <Input
                value={(state.vocal_description?.quirks || []).join(", ")}
                onChange={(e) => set("vocal_description.quirks", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="ad-lib stacks, breathy whispers, vocal runs"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Signature Sound</Label>
                <Input
                  value={state.signature_essence?.sonic_hallmark || ""}
                  onChange={(e) => set("signature_essence.sonic_hallmark", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="808-heavy beats, orchestral strings"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Tempo / Energy</Label>
                <Input
                  value={state.production_preferences?.tempo_energy || ""}
                  onChange={(e) => set("production_preferences.tempo_energy", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="mid-tempo 80-95 BPM, high energy"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Production Notes</Label>
              <Textarea
                value={state.production_preferences?.drums_bass_chords || ""}
                onChange={(e) => set("production_preferences.drums_bass_chords", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Heavy 808s, trap hi-hats, minor key progressions..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* TAB 3: PERFORMANCE */}
          <TabsContent value="performance" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">🎤 Performance Style</h3>
            
            <div>
              <Label className="text-slate-300 text-sm">Ad-libs</Label>
              <Input
                value={(state.adlib_profile?.bank || []).join(", ")}
                onChange={(e) => set("adlib_profile.bank", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="yeah, uh, okay, skrrt, let's go"
              />
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Ad-lib Placement Rules</Label>
              <Input
                value={state.adlib_profile?.placement_rules || ""}
                onChange={(e) => set("adlib_profile.placement_rules", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="End of bars, throughout verses, hooks only"
              />
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Stage Presence / Energy</Label>
              <Textarea
                value={state.production_preferences?.emotional_arc_rules || ""}
                onChange={(e) => set("production_preferences.emotional_arc_rules", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="High energy performer, interacts with crowd, choreographed moves..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* TAB 4: WRITING */}
          <TabsContent value="writing" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">✍️ Writing & Themes</h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Narrative POV</Label>
                <Input
                  value={state.writing_persona?.narrative_pov || ""}
                  onChange={(e) => set("writing_persona.narrative_pov", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="first-person, storyteller"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Language Style</Label>
                <Input
                  value={state.writing_persona?.linguistic_base || ""}
                  onChange={(e) => set("writing_persona.linguistic_base", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Street vernacular, poetic, conversational"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Rhyme Style</Label>
                <Input
                  value={state.writing_persona?.rhyme_form || ""}
                  onChange={(e) => set("writing_persona.rhyme_form", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="multi-syllabic, internal rhymes"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Signature Devices</Label>
                <Input
                  value={(state.writing_persona?.signature_devices || []).join(", ")}
                  onChange={(e) => set("writing_persona.signature_devices", toCSVArray(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="metaphors, wordplay, storytelling"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Common Themes</Label>
              <Input
                value={(state.writing_persona?.themes || []).join(", ")}
                onChange={(e) => set("writing_persona.themes", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="struggle, success, love, loyalty, growth"
              />
            </div>
          </TabsContent>

          {/* TAB 5: VISUAL/BRAND */}
          <TabsContent value="visual" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">👗 Visual & Brand</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Skin Tone</Label>
                <Input
                  value={state.visual_look?.skin_tone || ""}
                  onChange={(e) => set("visual_look.skin_tone", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="light, medium, dark"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Hair Style</Label>
                <Input
                  value={state.visual_look?.hair_style || ""}
                  onChange={(e) => set("visual_look.hair_style", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="dreads, fade, braids"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Fashion Style</Label>
                <Input
                  value={state.visual_look?.fashion_style || ""}
                  onChange={(e) => set("visual_look.fashion_style", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="streetwear, designer, vintage"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Jewelry</Label>
                <Input
                  value={state.visual_look?.jewelry || ""}
                  onChange={(e) => set("visual_look.jewelry", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="chains, watches, rings"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Visual Description (for @artist replacement in videos)</Label>
              <Textarea
                value={state.visual_look?.visual_description || ""}
                onChange={(e) => set("visual_look.visual_description", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Detailed visual: A confident performer with gold chains, designer streetwear, and distinctive tattoos..."
                rows={3}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Target Audience</Label>
                <Input
                  value={(state.career_direction?.target_markets || []).join(", ")}
                  onChange={(e) => set("career_direction.target_markets", toCSVArray(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Gen Z, millennials, hip-hop heads"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Brand Identity</Label>
                <Input
                  value={state.career_direction?.north_star || ""}
                  onChange={(e) => set("career_direction.north_star", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Authentic storyteller, party starter, conscious artist"
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">⚙️ Chat & Content Settings</h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Chat Tone</Label>
                <Input
                  value={state.chat_voice?.tone || ""}
                  onChange={(e) => set("chat_voice.tone", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="friendly, professional, casual, edgy"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Never Say (filtered words/phrases)</Label>
                <Input
                  value={visibleNeverSayItems.join(", ")}
                  onChange={(e) => setNeverSay(toCSVArray(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="comma-separated list"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Content Restrictions</Label>
              <Textarea
                value={(state.material_prefs?.exclude || []).join(", ")}
                onChange={(e) => set("material_prefs.exclude", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Topics or themes to avoid..."
                rows={2}
              />
            </div>
            
            <div className="text-xs text-slate-400 p-3 bg-slate-800 rounded">
              <p className="mb-2">This profile will be used for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>AI-generated music and lyrics in this artist's style</li>
                <li>Music video shot generation with consistent character</li>
                <li>Interactive chat responses matching their personality</li>
                <li>Content filtering based on brand guidelines</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            {isNew ? "Creating new artist" : `Editing: ${state.artist_name}`}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onAutoFill}
              disabled={isLoading || !state.artist_name}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            >
              {isLoading ? "Filling..." : "AI Auto-fill"}
            </Button>
            <Button
              onClick={onSave}
              disabled={missingRequiredFields.length > 0}
              className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              {isNew ? "Create Artist" : "Update Artist"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}