"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Film, Users, Camera } from "lucide-react"

interface PerformanceBalanceSliderProps {
  value: number
  onChange: (value: number) => void
}

export function PerformanceBalanceSlider({ value, onChange }: PerformanceBalanceSliderProps) {
  const getBalanceLabel = (ratio: number) => {
    if (ratio >= 90) return { label: "Performance Heavy", desc: "Concert feel, mostly performance shots" }
    if (ratio >= 70) return { label: "Performance Focus", desc: "Performance-driven with narrative touches" }
    if (ratio >= 30) return { label: "Balanced Mix", desc: "Equal performance and story elements" }
    if (ratio >= 10) return { label: "Narrative Focus", desc: "Story-driven with performance cuts" }
    return { label: "Narrative Heavy", desc: "Cinematic story, minimal performance" }
  }

  const getPerformanceShots = (ratio: number) => {
    const shots = []
    if (ratio >= 70) {
      shots.push("Wide performance shots")
      shots.push("Close-up lip sync")
      shots.push("Artist movement/dance")
    }
    if (ratio >= 50) {
      shots.push("Instrument focus")
      shots.push("Crowd reactions")
    }
    if (ratio >= 30) {
      shots.push("Stage/venue atmosphere")
    }
    return shots
  }

  const getNarrativeShots = (narrativeRatio: number) => {
    const shots = []
    if (narrativeRatio >= 70) {
      shots.push("Character interactions")
      shots.push("Story-driven scenes")
      shots.push("Cinematic B-roll")
    }
    if (narrativeRatio >= 50) {
      shots.push("Abstract/artistic shots")
      shots.push("Location-based story")
    }
    if (narrativeRatio >= 30) {
      shots.push("Narrative cutaways")
    }
    return shots
  }

  const balance = getBalanceLabel(value)
  const narrativeRatio = 100 - value
  const performanceShots = getPerformanceShots(value)
  const narrativeShots = getNarrativeShots(narrativeRatio)

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Music className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400">{value}%</span>
          </div>
          <span className="text-slate-400">vs</span>
          <div className="flex items-center gap-1">
            <span className="text-amber-400">{narrativeRatio}%</span>
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          Performance / Narrative Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Performance Focus</span>
              <Badge variant="outline" className="text-xs">{value}%</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{narrativeRatio}%</Badge>
              <span className="text-sm font-medium text-amber-300">Narrative Focus</span>
              <Film className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            max={100}
            min={0}
            step={10}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>0% Performance</span>
            <span>Balanced</span>
            <span>100% Performance</span>
          </div>
        </div>

        {/* Balance Description */}
        <div className="text-center">
          <Badge variant="outline" className="mb-2">
            {balance.label}
          </Badge>
          <p className="text-sm text-slate-400">
            {balance.desc}
          </p>
        </div>

        {/* Shot Type Preview */}
        <div className="grid grid-cols-2 gap-4">
          {/* Performance Shots */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-medium text-white">Performance Shots</h4>
              <Badge variant="secondary" className="text-xs">
                {Math.round((performanceShots.length / (performanceShots.length + narrativeShots.length)) * 100) || 0}%
              </Badge>
            </div>
            <div className="space-y-1">
              {performanceShots.map((shot, index) => (
                <div key={index} className="text-xs text-purple-300 flex items-center gap-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  {shot}
                </div>
              ))}
              {performanceShots.length === 0 && (
                <div className="text-xs text-slate-500 italic">
                  Minimal performance focus
                </div>
              )}
            </div>
          </div>

          {/* Narrative Shots */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-medium text-white">Narrative Shots</h4>
              <Badge variant="secondary" className="text-xs">
                {Math.round((narrativeShots.length / (performanceShots.length + narrativeShots.length)) * 100) || 0}%
              </Badge>
            </div>
            <div className="space-y-1">
              {narrativeShots.map((shot, index) => (
                <div key={index} className="text-xs text-amber-300 flex items-center gap-1">
                  <div className="w-1 h-1 bg-amber-400 rounded-full" />
                  {shot}
                </div>
              ))}
              {narrativeShots.length === 0 && (
                <div className="text-xs text-slate-500 italic">
                  Minimal narrative elements
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onChange(90)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === 90 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Concert Style
          </button>
          <button
            onClick={() => onChange(70)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === 70 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Performance +
          </button>
          <button
            onClick={() => onChange(50)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === 50 
                ? 'bg-slate-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Balanced
          </button>
          <button
            onClick={() => onChange(30)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === 30 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Story Focus
          </button>
          <button
            onClick={() => onChange(10)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === 10 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cinematic
          </button>
        </div>
      </CardContent>
    </Card>
  )
}