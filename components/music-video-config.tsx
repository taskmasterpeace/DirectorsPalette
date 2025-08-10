"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Settings, Plus, X, MapPin, Palette, Target, PlayCircle, Eye, Sparkles } from "lucide-react"
import type { LocationConfig, WardrobeConfig, PropConfig } from "@/lib/indexeddb"
import { generateMusicVideoSuggestions } from "@/app/actions-mv"

interface Treatment {
  id: string
  name: string
  concept: string
  visualTheme: string
  performanceRatio: number
  hookStrategy: string
}

interface MusicVideoSection {
  id: string
  title: string
  type: string
  startTime?: string
  endTime?: string
  isHook?: boolean
  repetitionNumber?: number
  lyrics: string
}

interface MusicVideoStructure {
  sections: MusicVideoSection[]
  songTitle: string
  artist: string
  genre: string
}

interface MusicVideoConfigProps {
  treatments: Treatment[]
  selectedTreatment: Treatment
  musicVideoStructure: MusicVideoStructure
  lyrics: string
  onTreatmentChange: (treatmentId: string) => void
  onConfigurationComplete: (config: {
    selectedTreatmentId: string
    locations: LocationConfig[]
    wardrobe: WardrobeConfig[]
    props: PropConfig[]
  }) => void
  onBack: () => void
  initialConfig?: {
    selectedTreatmentId?: string
    locations?: LocationConfig[]
    wardrobe?: WardrobeConfig[]
    props?: PropConfig[]
  }
}

export function MusicVideoConfig({
  treatments,
  selectedTreatment,
  musicVideoStructure,
  onTreatmentChange,
  onConfigurationComplete,
  onBack,
  initialConfig,
  lyrics,
}: MusicVideoConfigProps) {
  const [currentTreatmentId, setCurrentTreatmentId] = useState(
    initialConfig?.selectedTreatmentId || selectedTreatment.id,
  )
  const [locations, setLocations] = useState<LocationConfig[]>(initialConfig?.locations || [])
  const [wardrobe, setWardrobe] = useState<WardrobeConfig[]>(initialConfig?.wardrobe || [])
  const [props, setProps] = useState<PropConfig[]>(initialConfig?.props || [])
  const [activeTab, setActiveTab] = useState<"treatment" | "locations" | "wardrobe" | "props">("treatment")
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [showCustomTreatment, setShowCustomTreatment] = useState(false)
  const [customTreatment, setCustomTreatment] = useState({
    name: "",
    concept: "",
    visualTheme: "",
    performanceRatio: 60,
    hookStrategy: "",
  })

  const currentTreatmentDetails = treatments.find((t) => t.id === currentTreatmentId) || selectedTreatment

  // Auto-generate suggestions when component loads if none provided
  useEffect(() => {
    if (!initialConfig || (!initialConfig.locations && !initialConfig.wardrobe && !initialConfig.props)) {
      generateSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      const suggestions = await generateMusicVideoSuggestions({
        lyrics,
        songTitle: musicVideoStructure.songTitle,
        artist: musicVideoStructure.artist,
        genre: musicVideoStructure.genre,
        treatment: currentTreatmentDetails,
        sections: musicVideoStructure.sections,
      })

      setLocations(suggestions.locations)
      setWardrobe(suggestions.wardrobe)
      setProps(suggestions.props)
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const addLocation = () => {
    const newLocation: LocationConfig = {
      id: `location${locations.length + 1}`,
      reference: `@location${locations.length + 1}`,
      name: "",
      description: "",
      purpose: "performance-space",
      assignedSections: [],
    }
    setLocations([...locations, newLocation])
  }

  const updateLocation = (id: string, updates: Partial<LocationConfig>) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc)))
  }

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id))
  }

  const addWardrobeItem = () => {
    const newItem: WardrobeConfig = {
      id: `outfit${wardrobe.length + 1}`,
      reference: `@outfit${wardrobe.length + 1}`,
      name: "",
      description: "",
      purpose: "establish-character",
      assignedSections: [],
    }
    setWardrobe([...wardrobe, newItem])
  }

  const updateWardrobeItem = (id: string, updates: Partial<WardrobeConfig>) => {
    setWardrobe(wardrobe.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeWardrobeItem = (id: string) => {
    setWardrobe(wardrobe.filter((item) => item.id !== id))
  }

  const addProp = () => {
    const newProp: PropConfig = {
      id: `prop${props.length + 1}`,
      reference: `@prop${props.length + 1}`,
      name: "",
      description: "",
      purpose: "narrative-element",
      assignedSections: [],
    }
    setProps([...props, newProp])
  }

  const updateProp = (id: string, updates: Partial<PropConfig>) => {
    setProps(props.map((prop) => (prop.id === id ? { ...prop, ...updates } : prop)))
  }

  const removeProp = (id: string) => {
    setProps(props.filter((prop) => prop.id !== id))
  }

  const toggleSectionAssignment = (itemId: string, sectionId: string, type: "location" | "wardrobe" | "prop") => {
    const items = type === "location" ? locations : type === "wardrobe" ? wardrobe : props
    const updateFn = type === "location" ? setLocations : type === "wardrobe" ? setWardrobe : setProps

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const isAssigned = item.assignedSections.includes(sectionId)
        const newSections = isAssigned
          ? item.assignedSections.filter((sId) => sId !== sectionId)
          : [...item.assignedSections, sectionId]
        return { ...item, assignedSections: newSections }
      }
      return item
    })

    // @ts-ignore
    updateFn(updatedItems)
  }

  const createCustomTreatment = () => {
    if (!customTreatment.name.trim()) return

    const newTreatment: Treatment = {
      id: `custom-${Date.now()}`,
      name: customTreatment.name,
      concept: customTreatment.concept,
      visualTheme: customTreatment.visualTheme,
      performanceRatio: customTreatment.performanceRatio,
      hookStrategy: customTreatment.hookStrategy,
    }

    treatments.push(newTreatment)
    setCurrentTreatmentId(newTreatment.id)
    onTreatmentChange(newTreatment.id)
    setShowCustomTreatment(false)
    setCustomTreatment({
      name: "",
      concept: "",
      visualTheme: "",
      performanceRatio: 60,
      hookStrategy: "",
    })
  }

  const handleComplete = () => {
    onConfigurationComplete({
      selectedTreatmentId: currentTreatmentId,
      locations,
      wardrobe,
      props,
    })
  }

  const isConfigurationValid = () => {
    return currentTreatmentId && (locations.length > 0 || wardrobe.length > 0 || props.length > 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Input
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">Configure Music Video</h2>
            <p className="text-slate-400 text-sm">
              Customize treatment, locations, wardrobe, and props for &quot;{musicVideoStructure.songTitle}&quot; by{" "}
              {musicVideoStructure.artist}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateSuggestions}
            disabled={isGeneratingSuggestions}
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20 bg-transparent"
          >
            {isGeneratingSuggestions ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-Generate
              </>
            )}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!isConfigurationValid()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Generate Final Breakdown
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-800/30 rounded-lg p-1">
        {[
          { key: "treatment", label: "Treatment", icon: PlayCircle, count: 1 },
          { key: "locations", label: "Locations", icon: MapPin, count: locations.length },
          { key: "wardrobe", label: "Wardrobe", icon: Palette, count: wardrobe.length },
          { key: "props", label: "Props", icon: Target, count: props.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "ghost"}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 ${
              activeTab === key ? "bg-purple-600 hover:bg-purple-700" : "text-slate-300 hover:bg-slate-700"
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

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "treatment" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Choose or Create Treatment</h3>
              <Button
                onClick={() => setShowCustomTreatment(!showCustomTreatment)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCustomTreatment ? "Cancel" : "Create Custom Treatment"}
              </Button>
            </div>

            {showCustomTreatment && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create Custom Treatment</CardTitle>
                  <CardDescription className="text-slate-300">Design your own unique visual treatment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Treatment Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Neon Dreams, Urban Grit"
                        value={customTreatment.name}
                        onChange={(e) => setCustomTreatment((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Performance Ratio (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={customTreatment.performanceRatio}
                        onChange={(e) =>
                          setCustomTreatment((p) => ({ ...p, performanceRatio: Number.parseInt(e.target.value) || 60 }))
                        }
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Concept</label>
                    <Textarea
                      placeholder="Describe the overall concept and story..."
                      value={customTreatment.concept}
                      onChange={(e) => setCustomTreatment((p) => ({ ...p, concept: e.target.value }))}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Visual Theme</label>
                    <Textarea
                      placeholder="Describe the visual style, colors, lighting..."
                      value={customTreatment.visualTheme}
                      onChange={(e) => setCustomTreatment((p) => ({ ...p, visualTheme: e.target.value }))}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Hook Strategy</label>
                    <Textarea
                      placeholder="How will repeated sections (choruses) be handled?"
                      value={customTreatment.hookStrategy}
                      onChange={(e) => setCustomTreatment((p) => ({ ...p, hookStrategy: e.target.value }))}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={createCustomTreatment}
                    disabled={!customTreatment.name.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create Treatment
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((treatment) => (
                <Card
                  key={treatment.id}
                  className={`cursor-pointer transition-all ${currentTreatmentId === treatment.id ? "bg-purple-900/20 border-purple-500/50" : "bg-slate-800/50 border-slate-700 hover:border-slate-600"}`}
                  onClick={() => {
                    setCurrentTreatmentId(treatment.id)
                    onTreatmentChange(treatment.id)
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{treatment.name}</CardTitle>
                      {currentTreatmentId === treatment.id && (
                        <Badge className="bg-purple-600/20 text-purple-300 border-purple-700/30">Selected</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-slate-300 text-sm">{treatment.concept}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-purple-400 text-xs font-semibold">Visual Theme:</span>
                        <p className="text-slate-400 text-xs">{treatment.visualTheme}</p>
                      </div>
                      <div>
                        <span className="text-purple-400 text-xs font-semibold">Performance Ratio:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${treatment.performanceRatio}%` }}
                            ></div>
                          </div>
                          <span className="text-purple-300 text-xs font-semibold">{treatment.performanceRatio}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-purple-400 text-xs font-semibold">Hook Strategy:</span>
                        <p className="text-slate-400 text-xs">{treatment.hookStrategy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "locations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filming Locations</h3>
              <Button onClick={addLocation} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
            {locations.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No locations configured yet</p>
                  <p className="text-slate-500 text-sm">Add locations to reference in your shots</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {locations.map((location) => (
                  <Card key={location.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-500/30 text-green-300">
                            {location.reference}
                          </Badge>
                          <input
                            type="text"
                            placeholder="Location name..."
                            value={location.name}
                            onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                            className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLocation(location.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe the location for AI generation..."
                          value={location.description}
                          onChange={(e) => updateLocation(location.id, { description: e.target.value })}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Purpose</label>
                        <Select
                          value={location.purpose}
                          onValueChange={(value) => updateLocation(location.id, { purpose: value as any })}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="performance-space">Performance Space</SelectItem>
                            <SelectItem value="narrative-transition">Narrative Transition</SelectItem>
                            <SelectItem value="establish-character">Establish Character</SelectItem>
                            <SelectItem value="build-intensity">Build Intensity</SelectItem>
                            <SelectItem value="emotional-climax">Emotional Climax</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Assign to Sections</label>
                        <div className="flex flex-wrap gap-2">
                          {musicVideoStructure.sections.map((section) => (
                            <Button
                              key={section.id}
                              size="sm"
                              variant={location.assignedSections.includes(section.id) ? "default" : "outline"}
                              onClick={() => toggleSectionAssignment(location.id, section.id, "location")}
                              className={`h-7 px-3 text-xs ${location.assignedSections.includes(section.id) ? "bg-green-600 hover:bg-green-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                            >
                              {section.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wardrobe" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Wardrobe & Styling</h3>
                <p className="text-slate-400 text-sm">Styling for {musicVideoStructure.artist}</p>
              </div>
              <Button onClick={addWardrobeItem} className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Outfit
              </Button>
            </div>
            {wardrobe.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8">
                  <Palette className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No wardrobe configured yet</p>
                  <p className="text-slate-500 text-sm">Add outfits to reference in your shots</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {wardrobe.map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-pink-500/30 text-pink-300">
                            {item.reference}
                          </Badge>
                          <input
                            type="text"
                            placeholder="Outfit name..."
                            value={item.name}
                            onChange={(e) => updateWardrobeItem(item.id, { name: e.target.value })}
                            className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeWardrobeItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe the outfit for AI generation..."
                          value={item.description}
                          onChange={(e) => updateWardrobeItem(item.id, { description: e.target.value })}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Purpose</label>
                        <Select
                          value={item.purpose}
                          onValueChange={(value) => updateWardrobeItem(item.id, { purpose: value as any })}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="establish-character">Establish Character</SelectItem>
                            <SelectItem value="transformation">Character Transformation</SelectItem>
                            <SelectItem value="emotional-state">Reflect Emotional State</SelectItem>
                            <SelectItem value="performance-energy">Match Performance Energy</SelectItem>
                            <SelectItem value="visual-contrast">Create Visual Contrast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Assign to Sections</label>
                        <div className="flex flex-wrap gap-2">
                          {musicVideoStructure.sections.map((section) => (
                            <Button
                              key={section.id}
                              size="sm"
                              variant={item.assignedSections.includes(section.id) ? "default" : "outline"}
                              onClick={() => toggleSectionAssignment(item.id, section.id, "wardrobe")}
                              className={`h-7 px-3 text-xs ${item.assignedSections.includes(section.id) ? "bg-pink-600 hover:bg-pink-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                            >
                              {section.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "props" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Props & Objects</h3>
              <Button onClick={addProp} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Prop
              </Button>
            </div>
            {props.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No props configured yet</p>
                  <p className="text-slate-500 text-sm">Add props to reference in your shots</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {props.map((prop) => (
                  <Card key={prop.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                            {prop.reference}
                          </Badge>
                          <input
                            type="text"
                            placeholder="Prop name..."
                            value={prop.name}
                            onChange={(e) => updateProp(prop.id, { name: e.target.value })}
                            className="bg-transparent text-white font-semibold placeholder:text-slate-500 border-none outline-none focus:ring-0"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProp(prop.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Description</label>
                        <Textarea
                          placeholder="Describe the prop for AI generation..."
                          value={prop.description}
                          onChange={(e) => updateProp(prop.id, { description: e.target.value })}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Purpose</label>
                        <Select
                          value={prop.purpose}
                          onValueChange={(value) => updateProp(prop.id, { purpose: value as any })}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="narrative-element">Narrative Element</SelectItem>
                            <SelectItem value="symbolic-meaning">Symbolic Meaning</SelectItem>
                            <SelectItem value="performance-tool">Performance Tool</SelectItem>
                            <SelectItem value="visual-interest">Visual Interest</SelectItem>
                            <SelectItem value="interaction-focus">Interaction Focus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Assign to Sections</label>
                        <div className="flex flex-wrap gap-2">
                          {musicVideoStructure.sections.map((section) => (
                            <Button
                              key={section.id}
                              size="sm"
                              variant={prop.assignedSections.includes(section.id) ? "default" : "outline"}
                              onClick={() => toggleSectionAssignment(prop.id, section.id, "prop")}
                              className={`h-7 px-3 text-xs ${prop.assignedSections.includes(section.id) ? "bg-orange-600 hover:bg-orange-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                            >
                              {section.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{currentTreatmentDetails.name}</div>
              <div className="text-sm text-slate-400">Treatment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{locations.length}</div>
              <div className="text-sm text-slate-400">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{wardrobe.length}</div>
              <div className="text-sm text-slate-400">Outfits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{props.length}</div>
              <div className="text-sm text-slate-400">Props</div>
            </div>
          </div>
          {!isConfigurationValid() && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-yellow-300 text-sm">⚠️ Add at least one location, outfit, or prop to continue</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
