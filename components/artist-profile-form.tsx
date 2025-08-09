"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  type ArtistProfile,
  blankArtist,
  MBTI_TYPES,
  mergeArtist,
  toCSVArray,
  RACE_ETHNICITY_OPTIONS,
} from "@/lib/artist-types"
import { artistDB } from "@/lib/artist-db"
import { autofillArtistProfile } from "@/app/actions-artist"
import { useArtistStore } from "@/lib/artist-store"

type Props = {
  initial?: Partial<ArtistProfile>
  onSaved?: (saved: ArtistProfile) => void
}

export default function ArtistProfileForm({ initial, onSaved }: Props) {
  const [state, setState] = useState<ArtistProfile>({ ...blankArtist(), ...(initial as any) })
  const { setActiveArtist } = useArtistStore()

  useEffect(() => {
    if (!initial) return
    setState((prev) => {
      const id = (initial.artist_id as string) || prev.artist_id
      return { ...blankArtist(), ...prev, ...initial, artist_id: id } as ArtistProfile
    })
  }, [initial])

  const completionPercentage = useMemo(() => {
    const fields = [
      state.artist_name,
      state.artist_identity?.gender,
      state.artist_identity?.race_ethnicity,
      state.artist_identity?.accent,
      state.genres?.length ? state.genres.join("") : "",
      state.vocal_description?.tone_texture,
      state.vocal_description?.delivery_style,
      state.signature_essence?.sonic_hallmark,
      state.production_preferences?.tempo_energy,
      state.writing_persona?.narrative_pov,
      state.personality?.mbti,
      state.visual_look?.skin_tone,
      state.visual_look?.hair_style,
      state.visual_look?.fashion_style,
    ]
    const filledFields = fields.filter((field) => field && field.toString().trim().length > 0).length
    return Math.round((filledFields / fields.length) * 100)
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

  async function onSave() {
    const normalized: ArtistProfile = {
      ...state,
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
    const res = await autofillArtistProfile(state)
    const merged = mergeArtist<ArtistProfile>(state, res.fill)
    setState((prev) => ({ ...prev, ...merged }))
  }

  function fileToDataUrl(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set("image_data_url", String(reader.result))
    reader.readAsDataURL(file)
  }

  const glance = useMemo(() => {
    const id = state.artist_identity || ({} as any)
    const identity = [id.gender, id.race_ethnicity, id.age_range].filter(Boolean).join(", ")
    const hometown = [id.neighborhood, id.city || id.hometown_city, id.state || id.hometown_state]
      .filter(Boolean)
      .join(", ")
    const zip = id.zip ? ` (${id.zip})` : ""
    return [state.artist_name, identity, id.accent, hometown ? `${hometown}${zip}` : ""].filter(Boolean).join(" — ")
  }, [state])

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 rounded-t">
        <CardTitle className="text-white flex items-center justify-between">
          <span>{state.artist_id ? "Artist Profile" : "Create Artist"}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{completionPercentage}% complete</span>
            <Progress value={completionPercentage} className="w-24" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="p-3 rounded bg-slate-900 border border-slate-700 text-slate-200 text-sm">
          <div className="font-medium text-white mb-1">Must-include header (one glance):</div>
          <div className="text-slate-300">{glance || "—"}</div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Artist Name</label>
            <Input
              value={state.artist_name || ""}
              onChange={(e) => set("artist_name", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
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
          <div>
            <label className="text-slate-300 text-sm">Artist Image</label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => fileToDataUrl(e.target.files?.[0])}
                className="bg-slate-950 border-slate-700 flex-1"
              />
              {state.image_data_url && (
                <img
                  src={state.image_data_url || "/placeholder.svg?height=48&width=48&query=artist"}
                  alt="Artist preview"
                  className="w-12 h-12 rounded border border-slate-700 object-cover flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Gender</label>
            <Input
              value={state.artist_identity?.gender || ""}
              onChange={(e) => set("artist_identity.gender", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="Male / Female / Non-binary"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Race / Ethnicity</label>
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
              <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
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
              !(RACE_ETHNICITY_OPTIONS as readonly string[]).includes(state.artist_identity?.race_ethnicity || "")) && (
              <Input
                value={state.artist_identity?.race_ethnicity || ""}
                onChange={(e) => set("artist_identity.race_ethnicity", e.target.value)}
                placeholder="Specify..."
                className="mt-2 bg-slate-950 border-slate-700 text-white"
              />
            )}
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
          <div>
            <label className="text-slate-300 text-sm">Accent / Dialect</label>
            <Input
              value={state.artist_identity?.accent || ""}
              onChange={(e) => set("artist_identity.accent", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder={'e.g., "hood Black male from Miami, FL"'}
            />
            <div className="text-[11px] text-slate-400 mt-1">Short, locale-aware phrasing.</div>
          </div>
          <div>
            <label className="text-slate-300 text-sm">Hometown / ZIP</label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={state.artist_identity?.neighborhood || ""}
                onChange={(e) => set("artist_identity.neighborhood", e.target.value)}
                placeholder="Neighborhood"
                className="bg-slate-950 border-slate-700 text-white"
              />
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
            </div>
            <Input
              value={state.artist_identity?.zip || ""}
              onChange={(e) => set("artist_identity.zip", e.target.value)}
              placeholder="ZIP"
              className="mt-2 bg-slate-950 border-slate-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-300 text-sm">Genres / Sub-genres / Micro-genres</label>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              value={(state.genres || []).join(", ")}
              onChange={(e) => set("genres", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
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
            <label className="text-slate-300 text-sm">Vocal Tone / Texture</label>
            <Input
              value={state.vocal_description?.tone_texture || ""}
              onChange={(e) => set("vocal_description.tone_texture", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder='e.g., "raspy baritone; warm presence"'
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Delivery Style</label>
            <Input
              value={state.vocal_description?.delivery_style || ""}
              onChange={(e) => set("vocal_description.delivery_style", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder='e.g., "laid-back; behind the beat"'
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-slate-300 text-sm">Vocal Quirks (comma-separated)</label>
            <Input
              value={(state.vocal_description?.quirks || []).join(", ")}
              onChange={(e) => set("vocal_description.quirks", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="ad-lib stacks, breathy whispers"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Sonic Hallmark</label>
            <Input
              value={state.signature_essence?.sonic_hallmark || ""}
              onChange={(e) => set("signature_essence.sonic_hallmark", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="808-heavy low end; eerie pads"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Tempo / Groove</label>
            <Input
              value={state.production_preferences?.tempo_energy || ""}
              onChange={(e) => set("production_preferences.tempo_energy", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="mid-tempo 80–95 BPM; swung hi-hats"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Drums / Bass / Chords</label>
            <Textarea
              value={state.production_preferences?.drums_bass_chords || ""}
              onChange={(e) => set("production_preferences.drums_bass_chords", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              rows={3}
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Emotional Arc / Camera & Lighting Rules</label>
            <Textarea
              value={
                state.production_preferences?.emotional_arc_rules || state.production_preferences?.emotional_arc || ""
              }
              onChange={(e) => set("production_preferences.emotional_arc_rules", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              rows={3}
              placeholder="lift lighting on chorus; handheld on bridge; lock-off on outros"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Narrative POV</label>
            <Input
              value={state.writing_persona?.narrative_pov || ""}
              onChange={(e) => set("writing_persona.narrative_pov", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="first-person / second-person / omniscient"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Linguistic Base</label>
            <Input
              value={state.writing_persona?.linguistic_base || ""}
              onChange={(e) => set("writing_persona.linguistic_base", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder='e.g., "Southern AAVE", "Jamaican Patois"'
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Rhyme Form</label>
            <Input
              value={state.writing_persona?.rhyme_form || ""}
              onChange={(e) => set("writing_persona.rhyme_form", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder='e.g., "multi-syllabic storytelling"'
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">MBTI</label>
            <Select value={state.personality?.mbti || ""} onValueChange={(v) => set("personality.mbti", v)}>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                <SelectValue placeholder="Select MBTI" />
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
            <label className="text-slate-300 text-sm">Themes</label>
            <Input
              value={(state.writing_persona?.themes || []).join(", ")}
              onChange={(e) => set("writing_persona.themes", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="comma-separated"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-slate-300 text-sm">Signature Devices</label>
            <Input
              value={(state.writing_persona?.signature_devices || []).join(", ")}
              onChange={(e) => set("writing_persona.signature_devices", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="comma-separated"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Skin Tone</label>
            <Input
              value={state.visual_look?.skin_tone || ""}
              onChange={(e) => set("visual_look.skin_tone", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Hair Style</label>
            <Input
              value={state.visual_look?.hair_style || ""}
              onChange={(e) => set("visual_look.hair_style", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Fashion Style</label>
            <Input
              value={state.visual_look?.fashion_style || ""}
              onChange={(e) => set("visual_look.fashion_style", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Jewelry</label>
            <Input
              value={state.visual_look?.jewelry || ""}
              onChange={(e) => set("visual_look.jewelry", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Material Prefs</label>
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
              className="bg-slate-950 border-slate-700 text-white min-h-[120px]"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Ad-lib Profile</label>
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
              className="bg-slate-950 border-slate-700 text-white min-h-[120px]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-300 text-sm">Target Markets</label>
            <Input
              value={(state.career_direction?.target_markets || []).join(", ")}
              onChange={(e) => set("career_direction.target_markets", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="comma-separated"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">North Star</label>
            <Input
              value={state.career_direction?.north_star || ""}
              onChange={(e) => set("career_direction.north_star", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Chat Tone</label>
            <Input
              value={state.chat_voice?.tone || ""}
              onChange={(e) => set("chat_voice.tone", e.target.value)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="friendly / gritty / playful / stoic"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-slate-300 text-sm">Never Say</label>
            <Input
              value={(state.chat_voice?.never_say || []).join(", ")}
              onChange={(e) => set("chat_voice.never_say", toCSVArray(e.target.value))}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="comma-separated"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onAutoFill} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
            Auto-fill Remaining
          </Button>
          <Button onClick={onSave} className="bg-amber-600 hover:bg-amber-700 text-white">
            Save to Artist Bank
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
