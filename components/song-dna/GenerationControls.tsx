"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Zap, Brain, Shuffle } from "lucide-react"
import type { SongDNA, GenerationOptions } from "@/lib/song-dna-types"

interface GenerationControlsProps {
  songDNA: SongDNA
  artistId: string | null
  onGenerate: (options: GenerationOptions) => void
  isGenerating: boolean
}

export function GenerationControls({
  songDNA,
  artistId,
  onGenerate,
  isGenerating,
}: GenerationControlsProps) {
  const [theme, setTheme] = useState("")
  const [creativity, setCreativity] = useState(5)
  const [complexity, setComplexity] = useState<"simpler" | "match" | "more_complex">("match")
  const [modernize, setModernize] = useState(false)
  const [explicitAllowed, setExplicitAllowed] = useState(true)
  const [songCount, setSongCount] = useState(2)
  const [variationMode, setVariationMode] = useState<"similar" | "diverse">("diverse")
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long" | "match">("match")
  const [emotionalOverride, setEmotionalOverride] = useState("")
  const [energyLevel, setEnergyLevel] = useState<number | null>(null)

  const handleGenerate = () => {
    if (!theme.trim()) {
      alert("Please enter a theme for generation")
      return
    }
    
    if (!songDNA) {
      alert("No Song DNA available. Please analyze a song first.")
      return
    }

    const options: GenerationOptions = {
      theme: theme.trim(),
      creativity,
      complexity_adjustment: complexity,
      modernize,
      explicit_allowed: explicitAllowed,
      count: songCount,
      variation_mode: variationMode,
      target_length: targetLength === "match" ? undefined : targetLength,
      emotional_override: emotionalOverride.trim() || undefined,
      energy_level: energyLevel || undefined,
      artist_profile_id: artistId || undefined,
    }

    onGenerate(options)
  }

  // Sample themes for quick selection
  const sampleThemes = [
    "Breaking free from toxic relationships",
    "Chasing dreams against all odds",
    "Late night thoughts and insomnia",
    "Finding yourself after heartbreak",
    "Celebrating success with friends",
    "Hometown nostalgia and memories",
    "Social media vs reality",
    "Environmental consciousness",
  ]

  return (
    <div className="space-y-4">
      {/* Theme Input */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Song Theme (Required)
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-slate-300 text-sm">What should the new songs be about?</Label>
            <Textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Enter the theme, topic, or story for your new songs..."
              className="bg-slate-950 border-slate-700 text-white"
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-slate-300 text-xs">Quick Themes:</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {sampleThemes.map((sampleTheme, i) => (
                <Button
                  key={i}
                  onClick={() => setTheme(sampleTheme)}
                  variant="outline"
                  size="sm"
                  className="text-xs text-slate-300 border-slate-600 hover:bg-slate-700"
                >
                  {sampleTheme}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Generation Settings */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Generation Settings
        </h3>
        
        <div className="space-y-4">
          {/* Creativity Slider */}
          <div>
            <Label className="text-slate-300 text-sm flex items-center justify-between">
              <span>Creativity Level</span>
              <span className="text-amber-500">{creativity}/10</span>
            </Label>
            <Slider
              value={[creativity]}
              onValueChange={([v]) => setCreativity(v)}
              max={10}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Match Original</span>
              <span>Very Creative</span>
            </div>
          </div>

          {/* Song Count and Variation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-sm">Number of Songs</Label>
              <Select value={songCount.toString()} onValueChange={(v) => setSongCount(parseInt(v))}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={n.toString()} className="text-slate-200">
                      {n} {n === 1 ? "Song" : "Songs"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Variation Mode</Label>
              <Select value={variationMode} onValueChange={(v: any) => setVariationMode(v)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="similar" className="text-slate-200">Similar Versions</SelectItem>
                  <SelectItem value="diverse" className="text-slate-200">Diverse Styles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Complexity and Length */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-sm">Complexity</Label>
              <Select value={complexity} onValueChange={(v: any) => setComplexity(v)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="simpler" className="text-slate-200">Simpler</SelectItem>
                  <SelectItem value="match" className="text-slate-200">Match Original</SelectItem>
                  <SelectItem value="more_complex" className="text-slate-200">More Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Song Length</Label>
              <Select value={targetLength} onValueChange={(v: any) => setTargetLength(v)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="short" className="text-slate-200">Short (2-3 min)</SelectItem>
                  <SelectItem value="medium" className="text-slate-200">Medium (3-4 min)</SelectItem>
                  <SelectItem value="long" className="text-slate-200">Long (4-5 min)</SelectItem>
                  <SelectItem value="match" className="text-slate-200">Match Original</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Modernize References</Label>
              <Switch
                checked={modernize}
                onCheckedChange={setModernize}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Allow Explicit Content</Label>
              <Switch
                checked={explicitAllowed}
                onCheckedChange={setExplicitAllowed}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Optional Overrides */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          Optional Overrides
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-slate-300 text-sm">Emotional Tone Override</Label>
            <Input
              value={emotionalOverride}
              onChange={(e) => setEmotionalOverride(e.target.value)}
              placeholder="e.g., hopeful, melancholic, aggressive (leave empty to match original)"
              className="bg-slate-950 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <Label className="text-slate-300 text-sm flex items-center justify-between">
              <span>Energy Level Override</span>
              <span className="text-amber-500">{energyLevel || "Auto"}</span>
            </Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[energyLevel || 5]}
                onValueChange={([v]) => setEnergyLevel(v)}
                max={10}
                step={1}
                className="flex-1"
              />
              <Button
                onClick={() => setEnergyLevel(null)}
                variant="outline"
                size="sm"
                className="text-xs text-slate-300 border-slate-600"
              >
                Auto
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={!theme.trim() || isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating {songCount} {songCount === 1 ? "Song" : "Songs"}...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {songCount} {songCount === 1 ? "Song" : "Songs"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}