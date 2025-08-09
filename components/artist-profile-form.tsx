"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, Sparkles, FileText, Trash2, Download, FileUp, AlertCircle } from "lucide-react"
import {
  type ArtistProfile,
  blankArtist,
  MBTI_TYPES,
  mergeArtist,
  toCSVArray,
  RACE_ETHNICITY_OPTIONS,
} from "@/lib/artist-types"
import { artistDB } from "@/lib/artist-db"
import { autofillArtistProfile, createArtistFromDescription, createArtistFromLyrics } from "@/app/actions-artist"
import { useArtistStore } from "@/lib/artist-store"

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
  "that's so random",
  "I'm literally obsessed",
  "touch grass",
  "ratio",
  "based",
  "cringe",
  "sus",
  "bet bet",
  "say less",
  "facts no printer",
  "lowkey highkey",
  "it hits different",
  "that's a whole mood",
  "I'm deceased",
]

// Required fields for validation
const REQUIRED_FIELDS = [
  "artist_name",
  "artist_identity.gender",
  "artist_identity.race_ethnicity",
  "genres",
  "vocal_description.tone_texture",
  "visual_look.skin_tone",
]

export default function ArtistProfileForm({ initial, onSaved }: Props) {
  const [state, setState] = useState<ArtistProfile>({ ...blankArtist(), ...(initial as any) })
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showLyricsInput, setShowLyricsInput] = useState(false)
  const [description, setDescription] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setActiveArtist } = useArtistStore()

  useEffect(() => {
    if (!initial) return
    setState((prev) => {
      const id = (initial.artist_id as string) || prev.artist_id
      return { ...blankArtist(), ...prev, ...initial, artist_id: id } as ArtistProfile
    })
  }, [initial])

  // Calculate completion with weighted fields
  const completionPercentage = useMemo(() => {
    const coreFields = [
      { path: "artist_name", weight: 3 },
      { path: "artist_identity.gender", weight: 2 },
      { path: "artist_identity.race_ethnicity", weight: 2 },
      { path: "genres", weight: 3 },
      { path: "vocal_description.tone_texture", weight: 2 },
      { path: "visual_look.skin_tone", weight: 2 },
    ]

    const optionalFields = [
      { path: "artist_identity.accent", weight: 1 },
      { path: "vocal_description.delivery_style", weight: 1 },
      { path: "signature_essence.sonic_hallmark", weight: 1 },
      { path: "production_preferences.tempo_energy", weight: 1 },
      { path: "writing_persona.narrative_pov", weight: 1 },
      { path: "personality.mbti", weight: 1 },
      { path: "visual_look.hair_style", weight: 1 },
      { path: "visual_look.fashion_style", weight: 1 },
    ]

    const getValue = (obj: any, path: string) => {
      return path.split(".").reduce((o, p) => o?.[p], obj)
    }

    const totalWeight = [...coreFields, ...optionalFields].reduce((sum, field) => sum + field.weight, 0)
    const filledWeight = [...coreFields, ...optionalFields].reduce((sum, field) => {
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
    onSaved?.(normalized)
  }

  async function onAutoFill() {
    setIsLoading(true)
    try {
      const res = await autofillArtistProfile(state)
      const merged = mergeArtist<ArtistProfile>(state, res.fill)
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
        setState({ ...imported, artist_id: state.artist_id }) // Keep current ID
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

  function isRequired(fieldPath: string) {
    return REQUIRED_FIELDS.includes(fieldPath)
  }

  function getFieldError(fieldPath: string) {
    return missingRequiredFields.includes(fieldPath)
  }

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 rounded-t">
        <CardTitle className="text-white flex items-center justify-between">
          <span>🎤 {state.artist_id ? "Artist Profile" : "Create Artist"}</span>
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
            <label className="text-slate-300 text-sm mb-2 block">Describe the Artist</label>
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
            <label className="text-slate-300 text-sm mb-2 block">Paste Song Lyrics</label>
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

        {/* 👤 Basic Identity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">👤 Basic Identity</h3>

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
                      src={state.image_data_url || "/placeholder.svg"}
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
                <label className="text-slate-300 text-sm flex items-center gap-1">
                  Artist Name {isRequired("artist_name") && <span className="text-red-400">*</span>}
                </label>
                <Input
                  value={state.artist_name || ""}
                  onChange={(e) => set("artist_name", e.target.value)}
                  className={`bg-slate-950 border-slate-700 text-white ${getFieldError("artist_name") ? "border-red-500" : ""}`}
                  placeholder="Stage name"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Real Name</label>
                <Input
                  value={state.real_name || ""}
                  onChange={(e) => set("real_name", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 text-sm flex items-center gap-1">
                Gender {isRequired("artist_identity.gender") && <span className="text-red-400">*</span>}
              </label>
              <Input
                value={state.artist_identity?.gender || ""}
                onChange={(e) => set("artist_identity.gender", e.target.value)}
                className={`bg-slate-950 border-slate-700 text-white ${getFieldError("artist_identity.gender") ? "border-red-500" : ""}`}
                placeholder="Male/Female/Non-binary"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">Age Range</label>
              <Input
                value={state.artist_identity?.age_range || ""}
                onChange={(e) => set("artist_identity.age_range", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="e.g., early 20s"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-300 text-sm flex items-center gap-1">
                Race / Ethnicity{" "}
                {isRequired("artist_identity.race_ethnicity") && <span className="text-red-400">*</span>}
              </label>
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
                  <SelectTrigger
                    className={`bg-slate-950 border-slate-700 text-white flex-1 ${getFieldError("artist_identity.race_ethnicity") ? "border-red-500" : ""}`}
                  >
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
                    className={`bg-slate-950 border-slate-700 text-white flex-1 ${getFieldError("artist_identity.race_ethnicity") ? "border-red-500" : ""}`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 text-sm">🗣️ Accent / Dialect</label>
              <Input
                value={state.artist_identity?.accent || ""}
                onChange={(e) => set("artist_identity.accent", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder='e.g., "hood Black male from Miami, FL"'
              />
              <div className="text-[11px] text-slate-400 mt-1">Short, locale-aware phrasing</div>
            </div>
            <div>
              <label className="text-slate-300 text-sm">🏠 Hometown</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={state.artist_identity?.city || state.artist_identity?.hometown_city || ""}
                  onChange={(e) => set("artist_identity.city", e.target.value)}
                  placeholder="City"
                  className="bg-slate-950 border-slate-700 text-white"
                />
                <Input
                  value={state.artist_identity?.state || state.artist_identity?.hometown_state || ""}
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
        </div>

        {/* 🎵 Musical Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">🎵 Musical Style</h3>

          <div>
            <label className="text-slate-300 text-sm flex items-center gap-1">
              Genres / Sub-genres / Micro-genres {isRequired("genres") && <span className="text-red-400">*</span>}
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              <Input
                value={(state.genres || []).join(", ")}
                onChange={(e) => set("genres", toCSVArray(e.target.value))}
                className={`bg-slate-950 border-slate-700 text-white ${getFieldError("genres") ? "border-red-500" : ""}`}
                placeholder="Hip-Hop, Pop"
              />
              <Input
                value={(state.sub_genres || []).join(", ")}
                onChange={(e) => set("sub_genres", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Trap, Alt-R&B"
              />
              <Input
                value={(state.micro_genres || []).join(", ")}
                onChange={(e) => set("micro_genres", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Miami Bass, Bronx Drill"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 text-sm flex items-center gap-1">
                🎤 Vocal Tone / Texture{" "}
                {isRequired("vocal_description.tone_texture") && <span className="text-red-400">*</span>}
              </label>
              <Input
                value={state.vocal_description?.tone_texture || ""}
                onChange={(e) => set("vocal_description.tone_texture", e.target.value)}
                className={`bg-slate-950 border-slate-700 text-white ${getFieldError("vocal_description.tone_texture") ? "border-red-500" : ""}`}
                placeholder='e.g., "raspy baritone; warm presence"'
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🎭 Delivery Style</label>
              <Input
                value={state.vocal_description?.delivery_style || ""}
                onChange={(e) => set("vocal_description.delivery_style", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder='e.g., "laid-back; behind the beat"'
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-300 text-sm">✨ Vocal Quirks</label>
              <Input
                value={(state.vocal_description?.quirks || []).join(", ")}
                onChange={(e) => set("vocal_description.quirks", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="ad-lib stacks, breathy whispers"
              />
            </div>
          </div>
        </div>

        {/* 🎛️ Production & Sound */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">🎛️ Production & Sound</h3>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 text-sm">🔊 Sonic Hallmark</label>
              <Input
                value={state.signature_essence?.sonic_hallmark || ""}
                onChange={(e) => set("signature_essence.sonic_hallmark", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="808-heavy low end; eerie pads"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">⏱️ Tempo / Groove</label>
              <Input
                value={state.production_preferences?.tempo_energy || ""}
                onChange={(e) => set("production_preferences.tempo_energy", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="mid-tempo 80–95 BPM; swung hi-hats"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🥁 Drums / Bass / Chords</label>
              <Textarea
                value={state.production_preferences?.drums_bass_chords || ""}
                onChange={(e) => set("production_preferences.drums_bass_chords", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">📹 Camera & Lighting Rules</label>
              <Textarea
                value={
                  state.production_preferences?.emotional_arc_rules || state.production_preferences?.emotional_arc || ""
                }
                onChange={(e) => set("production_preferences.emotional_arc_rules", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                rows={3}
                placeholder="lift lighting on chorus; handheld on bridge"
              />
            </div>
          </div>
        </div>

        {/* ✍️ Writing & Personality */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">✍️ Writing & Personality</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 text-sm">📖 Narrative POV</label>
              <Input
                value={state.writing_persona?.narrative_pov || ""}
                onChange={(e) => set("writing_persona.narrative_pov", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="first-person"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🗣️ Linguistic Base</label>
              <Input
                value={state.writing_persona?.linguistic_base || ""}
                onChange={(e) => set("writing_persona.linguistic_base", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Southern AAVE"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🎯 Rhyme Form</label>
              <Input
                value={state.writing_persona?.rhyme_form || ""}
                onChange={(e) => set("writing_persona.rhyme_form", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="multi-syllabic"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🧠 MBTI</label>
              <Select value={state.personality?.mbti || ""} onValueChange={(v) => set("personality.mbti", v)}>
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
            <div className="md:col-span-2">
              <label className="text-slate-300 text-sm">💭 Themes</label>
              <Input
                value={(state.writing_persona?.themes || []).join(", ")}
                onChange={(e) => set("writing_persona.themes", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="love, struggle, success"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-300 text-sm">🎨 Signature Devices</label>
              <Input
                value={(state.writing_persona?.signature_devices || []).join(", ")}
                onChange={(e) => set("writing_persona.signature_devices", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="metaphors, wordplay, storytelling"
              />
            </div>
          </div>
        </div>

        {/* 👗 Visual Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">👗 Visual Appearance</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 text-sm flex items-center gap-1">
                🎨 Skin Tone {isRequired("visual_look.skin_tone") && <span className="text-red-400">*</span>}
              </label>
              <Input
                value={state.visual_look?.skin_tone || ""}
                onChange={(e) => set("visual_look.skin_tone", e.target.value)}
                className={`bg-slate-950 border-slate-700 text-white ${getFieldError("visual_look.skin_tone") ? "border-red-500" : ""}`}
                placeholder="medium brown"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">💇 Hair Style</label>
              <Input
                value={state.visual_look?.hair_style || ""}
                onChange={(e) => set("visual_look.hair_style", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="locs, fade, braids"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">👕 Fashion Style</label>
              <Input
                value={state.visual_look?.fashion_style || ""}
                onChange={(e) => set("visual_look.fashion_style", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="streetwear, designer"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">💎 Jewelry</label>
              <Input
                value={state.visual_look?.jewelry || ""}
                onChange={(e) => set("visual_look.jewelry", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="chains, grillz, rings"
              />
            </div>
          </div>
        </div>

        {/* 💰 Material Preferences & Ad-libs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            💰 Material Preferences & Ad-libs
          </h3>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 text-sm">🚗 Material Preferences</label>
              <Textarea
                value={[
                  `Cars: ${(state.material_prefs?.cars || []).join(", ")}`,
                  `Diamonds: ${(state.material_prefs?.diamonds || []).join(", ")}`,
                  `Weapons: ${(state.material_prefs?.weapons || []).join(", ")}`,
                  `Exclude: ${(state.material_prefs?.exclude || []).join(", ")}`,
                ].join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n")
                  const get = (p: string) => (lines.find((l) => l.startsWith(p)) || "").slice(p.length).trim()
                  set("material_prefs.cars", toCSVArray(get("Cars: ")))
                  set("material_prefs.diamonds", toCSVArray(get("Diamonds: ")))
                  set("material_prefs.weapons", toCSVArray(get("Weapons: ")))
                  set("material_prefs.exclude", toCSVArray(get("Exclude: ")))
                }}
                className="bg-slate-950 border-slate-700 text-white"
                rows={4}
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">🎤 Ad-lib Profile</label>
              <Textarea
                value={[
                  `Bank: ${(state.adlib_profile?.bank || []).join(", ")}`,
                  `Placement: ${state.adlib_profile?.placement_rules || ""}`,
                ].join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n")
                  const bank = (lines.find((l) => l.startsWith("Bank: ")) || "").slice(6)
                  const place = (lines.find((l) => l.startsWith("Placement: ")) || "").slice(11)
                  set("adlib_profile.bank", toCSVArray(bank))
                  set("adlib_profile.placement_rules", place.trim())
                }}
                className="bg-slate-950 border-slate-700 text-white"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* 🎯 Career & Chat Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">🎯 Career & Chat Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 text-sm">🌍 Target Markets</label>
              <Input
                value={(state.career_direction?.target_markets || []).join(", ")}
                onChange={(e) => set("career_direction.target_markets", toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="US, UK, Canada"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">⭐ North Star</label>
              <Input
                value={state.career_direction?.north_star || ""}
                onChange={(e) => set("career_direction.north_star", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Grammy winner, cultural icon"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">💬 Chat Tone</label>
              <Input
                value={state.chat_voice?.tone || ""}
                onChange={(e) => set("chat_voice.tone", e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="friendly, gritty, playful"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-slate-300 text-sm">🚫 Never Say (words/phrases to avoid)</label>
              <Input
                value={visibleNeverSayItems.join(", ")}
                onChange={(e) => setNeverSay(toCSVArray(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="comma-separated list"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                Additional filtered terms are automatically included
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onAutoFill} disabled={isLoading} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
            {isLoading ? "Filling..." : "Auto-fill Remaining"}
          </Button>
          <Button
            onClick={onSave}
            disabled={missingRequiredFields.length > 0}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Save to Artist Bank
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
