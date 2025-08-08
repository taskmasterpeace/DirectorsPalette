"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Wand2, Users, MapPin, Package, Plus, X, Sparkles } from 'lucide-react'

type ChapterLite = {
  id: string
  title: string
}

export type StoryCharacter = {
  id: string
  reference: string // "@character_name"
  name: string
  age?: string
  role: "main" | "supporting" | "background"
  description: string
  wardrobe?: string
  assignedChapters: string[]
}

export type StoryLocation = {
  id: string
  reference: string // "@loc1" or "@location_school"
  name: string
  description: string
  assignedChapters: string[]
}

export type StoryProp = {
  id: string
  reference: string // "@prop1" or "@prop_basket"
  name: string
  description: string
  assignedChapters: string[]
}

export type StoryEntities = {
  characters: StoryCharacter[]
  locations: StoryLocation[]
  props: StoryProp[]
}

export function StoryEntitiesConfig({
  chapters,
  initial,
  onChange,
  onAutoGenerate,
  isGenerating = false,
}: {
  chapters: ChapterLite[]
  initial: StoryEntities | null
  onChange: (entities: StoryEntities) => void
  onAutoGenerate?: () => void
  isGenerating?: boolean
}) {
  const [tab, setTab] = useState<"characters" | "locations" | "props">("characters")
  const [entities, setEntities] = useState<StoryEntities>(
    initial || { characters: [], locations: [], props: [] }
  )

  useEffect(() => {
    if (initial) setEntities(initial)
  }, [initial])

  const apply = (next: StoryEntities) => {
    setEntities(next)
    onChange(next)
  }

  // Character CRUD
  const addCharacter = () => {
    const idx = entities.characters.length + 1
    const newItem: StoryCharacter = {
      id: `char${idx}`,
      name: "",
      reference: `@character_${idx}`,
      age: "",
      role: "supporting",
      description: "",
      wardrobe: "",
      assignedChapters: [],
    }
    apply({ ...entities, characters: [...entities.characters, newItem] })
  }
  const updateCharacter = (id: string, updates: Partial<StoryCharacter>) => {
    apply({
      ...entities,
      characters: entities.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }
  const removeCharacter = (id: string) => {
    apply({ ...entities, characters: entities.characters.filter((c) => c.id !== id) })
  }

  // Location CRUD
  const addLocation = () => {
    const idx = entities.locations.length + 1
    const newItem: StoryLocation = {
      id: `loc${idx}`,
      name: "",
      reference: `@loc${idx}`,
      description: "",
      assignedChapters: [],
    }
    apply({ ...entities, locations: [...entities.locations, newItem] })
  }
  const updateLocation = (id: string, updates: Partial<StoryLocation>) => {
    apply({
      ...entities,
      locations: entities.locations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }
  const removeLocation = (id: string) => {
    apply({ ...entities, locations: entities.locations.filter((c) => c.id !== id) })
  }

  // Prop CRUD
  const addProp = () => {
    const idx = entities.props.length + 1
    const newItem: StoryProp = {
      id: `prop${idx}`,
      name: "",
      reference: `@prop${idx}`,
      description: "",
      assignedChapters: [],
    }
    apply({ ...entities, props: [...entities.props, newItem] })
  }
  const updateProp = (id: string, updates: Partial<StoryProp>) => {
    apply({
      ...entities,
      props: entities.props.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }
  const removeProp = (id: string) => {
    apply({ ...entities, props: entities.props.filter((c) => c.id !== id) })
  }

  const toggleAssign = (
    type: "characters" | "locations" | "props",
    itemId: string,
    chapterId: string
  ) => {
    const list = entities[type] as any[]
    const next = list.map((it) => {
      if (it.id !== itemId) return it
      const isAssigned = (it.assignedChapters as string[]).includes(chapterId)
      return {
        ...it,
        assignedChapters: isAssigned
          ? (it.assignedChapters as string[]).filter((x: string) => x !== chapterId)
          : [...(it.assignedChapters as string[]), chapterId],
      }
    })
    apply({ ...entities, [type]: next } as StoryEntities)
  }

  const counts = useMemo(
    () => ({
      characters: entities.characters.length,
      locations: entities.locations.length,
      props: entities.props.length,
    }),
    [entities]
  )

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Story Entities
        </CardTitle>
        <div className="flex items-center gap-2">
          {onAutoGenerate && (
            <Button
              onClick={onAutoGenerate}
              disabled={isGenerating}
              variant="outline"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-900/20"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Generate
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-2 bg-slate-800/30 rounded-lg p-1">
          {[
            { key: "characters", label: "Characters", icon: Users, count: counts.characters },
            { key: "locations", label: "Locations", icon: MapPin, count: counts.locations },
            { key: "props", label: "Props", icon: Package, count: counts.props },
          ].map(({ key, label, icon: Icon, count }) => (
            <Button
              key={key}
              variant={tab === (key as any) ? "default" : "ghost"}
              onClick={() => setTab(key as any)}
              className={`flex-1 ${
                tab === key ? "bg-amber-600 hover:bg-amber-700" : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-2 bg-slate-600/20 text-slate-300">
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Characters */}
        {tab === "characters" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Characters</h3>
              <Button onClick={addCharacter} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Character
              </Button>
            </div>
            {entities.characters.length === 0 ? (
              <Card className="bg-slate-900/40 border-slate-700">
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No characters extracted yet</p>
                  <p className="text-slate-500 text-sm">
                    Use Auto-Generate or add characters manually
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entities.characters.map((c) => (
                  <Card key={c.id} className="relative bg-slate-900/40 border-slate-700">
                    <CardHeader className="flex-row items-center justify-between pr-10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                          {c.reference}
                        </Badge>
                        <input
                          placeholder="Character name..."
                          value={c.name}
                          onChange={(e) => {
                            const name = e.target.value
                            let ref = c.reference
                            if (!c.name || c.reference.startsWith("@character_")) {
                              const normalized = name
                                .trim()
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "_")
                                .replace(/^_+|_+$/g, "")
                              ref = normalized ? `@${normalized}` : c.reference
                            }
                            updateCharacter(c.id, { name, reference: ref })
                          }}
                          className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0 pr-2"
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCharacter(c.id)}
                        aria-label={`Remove ${c.name || 'character'}`}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Age</label>
                          <input
                            placeholder="e.g., 7, 20s, elderly"
                            value={c.age || ""}
                            onChange={(e) => updateCharacter(c.id, { age: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-md text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Role</label>
                          <Select
                            value={c.role}
                            onValueChange={(v) => updateCharacter(c.id, { role: v as any })}
                          >
                            <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700">
                              <SelectItem value="main">Main</SelectItem>
                              <SelectItem value="supporting">Supporting</SelectItem>
                              <SelectItem value="background">Background</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe key traits, goals, and visual identifiers..."
                          value={c.description}
                          onChange={(e) => updateCharacter(c.id, { description: e.target.value })}
                          className="bg-slate-950/50 border-slate-700 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Wardrobe</label>
                        <Textarea
                          placeholder="Wardrobe informed by director's style..."
                          value={c.wardrobe || ""}
                          onChange={(e) => updateCharacter(c.id, { wardrobe: e.target.value })}
                          className="bg-slate-950/50 border-slate-700 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Assign to Chapters
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {chapters.map((ch) => {
                            const active = c.assignedChapters.includes(ch.id)
                            return (
                              <Button
                                key={ch.id}
                                size="sm"
                                variant={active ? "default" : "outline"}
                                onClick={() => toggleAssign("characters", c.id, ch.id)}
                                className={`h-7 px-3 text-xs ${
                                  active
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                }`}
                              >
                                {ch.title}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Locations */}
        {tab === "locations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Locations</h3>
              <Button onClick={addLocation} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
            {entities.locations.length === 0 ? (
              <Card className="bg-slate-900/40 border-slate-700">
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No locations extracted yet</p>
                  <p className="text-slate-500 text-sm">
                    Use Auto-Generate or add locations manually
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entities.locations.map((l) => (
                  <Card key={l.id} className="relative bg-slate-900/40 border-slate-700">
                    <CardHeader className="flex-row items-center justify-between pr-10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500/30 text-green-300">
                          {l.reference}
                        </Badge>
                        <input
                          placeholder="Location name..."
                          value={l.name}
                          onChange={(e) => updateLocation(l.id, { name: e.target.value })}
                          className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0 pr-2"
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeLocation(l.id)}
                        aria-label={`Remove ${l.name || 'location'}`}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe the setting, time of day, mood..."
                          value={l.description}
                          onChange={(e) => updateLocation(l.id, { description: e.target.value })}
                          className="bg-slate-950/50 border-slate-700 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Assign to Chapters
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {chapters.map((ch) => {
                            const active = l.assignedChapters.includes(ch.id)
                            return (
                              <Button
                                key={ch.id}
                                size="sm"
                                variant={active ? "default" : "outline"}
                                onClick={() => toggleAssign("locations", l.id, ch.id)}
                                className={`h-7 px-3 text-xs ${
                                  active
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                }`}
                              >
                                {ch.title}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Props */}
        {tab === "props" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Props</h3>
              <Button onClick={addProp} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Prop
              </Button>
            </div>
            {entities.props.length === 0 ? (
              <Card className="bg-slate-900/40 border-slate-700">
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No props extracted yet</p>
                  <p className="text-slate-500 text-sm">Use Auto-Generate or add props manually</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entities.props.map((p) => (
                  <Card key={p.id} className="relative bg-slate-900/40 border-slate-700">
                    <CardHeader className="flex-row items-center justify-between pr-10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                          {p.reference}
                        </Badge>
                        <input
                          placeholder="Prop name..."
                          value={p.name}
                          onChange={(e) => updateProp(p.id, { name: e.target.value })}
                          className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0 pr-2"
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeProp(p.id)}
                        aria-label={`Remove ${p.name || 'prop'}`}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe look/condition, symbolism, story relevance..."
                          value={p.description}
                          onChange={(e) => updateProp(p.id, { description: e.target.value })}
                          className="bg-slate-950/50 border-slate-700 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Assign to Chapters
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {chapters.map((ch) => {
                            const active = p.assignedChapters.includes(ch.id)
                            return (
                              <Button
                                key={ch.id}
                                size="sm"
                                variant={active ? "default" : "outline"}
                                onClick={() => toggleAssign("props", p.id, ch.id)}
                                className={`h-7 px-3 text-xs ${
                                  active
                                    ? "bg-orange-600 hover:bg-orange-700"
                                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                }`}
                              >
                                {ch.title}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator className="bg-slate-700" />
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{counts.characters}</div>
            <div className="text-sm text-slate-400">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{counts.locations}</div>
            <div className="text-sm text-slate-400">Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{counts.props}</div>
            <div className="text-sm text-slate-400">Props</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
