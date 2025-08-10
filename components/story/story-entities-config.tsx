"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  MapPin,
  Package,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Wand2,
  Target,
  Eye,
  BookOpen
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface Character {
  id: string
  name: string
  description: string
  appearance?: string
  role: "protagonist" | "antagonist" | "supporting" | "background"
  referenceTag: string // @character_name
}

export interface Location {
  id: string
  name: string
  description: string
  atmosphere?: string
  type: "interior" | "exterior" | "mixed"
  referenceTag: string // @loc1, @loc2, etc.
}

export interface Prop {
  id: string
  name: string
  description: string
  significance?: string
  type: "object" | "vehicle" | "weapon" | "tool" | "symbolic"
  referenceTag: string // @prop1, @prop2, etc.
}

export interface StoryEntities {
  characters: Character[]
  locations: Location[]
  props: Prop[]
}

export interface ExtractedEntities {
  suggestedCharacters: Partial<Character>[]
  suggestedLocations: Partial<Location>[]
  suggestedProps: Partial<Prop>[]
  entityReferences: {
    characters: string[]
    locations: string[]
    props: string[]
  }
}

interface StoryEntitiesConfigProps {
  isOpen: boolean
  onClose: () => void
  story: string
  extractedEntities?: ExtractedEntities | null
  currentEntities: StoryEntities
  onEntitiesUpdate: (entities: StoryEntities) => void
  onExtractEntities: () => Promise<void>
  onGenerateWithEntities: () => Promise<void>
  isExtracting: boolean
  isGenerating: boolean
}

export function StoryEntitiesConfig({
  isOpen,
  onClose,
  story,
  extractedEntities,
  currentEntities,
  onEntitiesUpdate,
  onExtractEntities,
  onGenerateWithEntities,
  isExtracting,
  isGenerating
}: StoryEntitiesConfigProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"characters" | "locations" | "props">("characters")
  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(null)

  // Character management
  const addCharacter = (character?: Partial<Character>) => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: character?.name || "",
      description: character?.description || "",
      appearance: character?.appearance || "",
      role: character?.role || "supporting",
      referenceTag: `@${(character?.name || "character").toLowerCase().replace(/\s+/g, "_")}`
    }

    onEntitiesUpdate({
      ...currentEntities,
      characters: [...currentEntities.characters, newCharacter]
    })
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const updatedCharacters = currentEntities.characters.map(char =>
      char.id === id 
        ? { 
            ...char, 
            ...updates, 
            referenceTag: updates.name 
              ? `@${updates.name.toLowerCase().replace(/\s+/g, "_")}`
              : char.referenceTag
          }
        : char
    )

    onEntitiesUpdate({
      ...currentEntities,
      characters: updatedCharacters
    })
  }

  const deleteCharacter = (id: string) => {
    onEntitiesUpdate({
      ...currentEntities,
      characters: currentEntities.characters.filter(char => char.id !== id)
    })
  }

  // Location management
  const addLocation = (location?: Partial<Location>) => {
    const locIndex = currentEntities.locations.length + 1
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name: location?.name || "",
      description: location?.description || "",
      atmosphere: location?.atmosphere || "",
      type: location?.type || "interior",
      referenceTag: `@loc${locIndex}`
    }

    onEntitiesUpdate({
      ...currentEntities,
      locations: [...currentEntities.locations, newLocation]
    })
  }

  const updateLocation = (id: string, updates: Partial<Location>) => {
    const updatedLocations = currentEntities.locations.map(loc =>
      loc.id === id ? { ...loc, ...updates } : loc
    )

    onEntitiesUpdate({
      ...currentEntities,
      locations: updatedLocations
    })
  }

  const deleteLocation = (id: string) => {
    onEntitiesUpdate({
      ...currentEntities,
      locations: currentEntities.locations.filter(loc => loc.id !== id)
    })
  }

  // Prop management
  const addProp = (prop?: Partial<Prop>) => {
    const propIndex = currentEntities.props.length + 1
    const newProp: Prop = {
      id: `prop-${Date.now()}`,
      name: prop?.name || "",
      description: prop?.description || "",
      significance: prop?.significance || "",
      type: prop?.type || "object",
      referenceTag: `@prop${propIndex}`
    }

    onEntitiesUpdate({
      ...currentEntities,
      props: [...currentEntities.props, newProp]
    })
  }

  const updateProp = (id: string, updates: Partial<Prop>) => {
    const updatedProps = currentEntities.props.map(prop =>
      prop.id === id ? { ...prop, ...updates } : prop
    )

    onEntitiesUpdate({
      ...currentEntities,
      props: updatedProps
    })
  }

  const deleteProp = (id: string) => {
    onEntitiesUpdate({
      ...currentEntities,
      props: currentEntities.props.filter(prop => prop.id !== id)
    })
  }

  const getRoleColor = (role: Character["role"]) => {
    switch (role) {
      case "protagonist": return "bg-blue-500/20 text-blue-300"
      case "antagonist": return "bg-red-500/20 text-red-300"
      case "supporting": return "bg-yellow-500/20 text-yellow-300"
      case "background": return "bg-gray-500/20 text-gray-300"
      default: return "bg-gray-500/20 text-gray-300"
    }
  }

  const getTypeColor = (type: Location["type"] | Prop["type"]) => {
    switch (type) {
      case "interior": return "bg-purple-500/20 text-purple-300"
      case "exterior": return "bg-green-500/20 text-green-300"
      case "mixed": return "bg-blue-500/20 text-blue-300"
      case "object": return "bg-slate-500/20 text-slate-300"
      case "vehicle": return "bg-orange-500/20 text-orange-300"
      case "weapon": return "bg-red-500/20 text-red-300"
      case "tool": return "bg-blue-500/20 text-blue-300"
      case "symbolic": return "bg-amber-500/20 text-amber-300"
      default: return "bg-gray-500/20 text-gray-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-900 border-slate-700 text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-amber-400" />
            Story Entities Configuration
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Define and customize characters, locations, and props for your story. Use reference tags in your breakdown generation.
          </DialogDescription>
        </DialogHeader>

        {/* Entity Extraction Section */}
        {!extractedEntities && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white mb-1">Phase 1: Extract Story Entities</h3>
                  <p className="text-sm text-slate-300">
                    Automatically detect characters, locations, and props from your story.
                  </p>
                </div>
                <Button
                  onClick={onExtractEntities}
                  disabled={isExtracting || !story.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isExtracting ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Extract Entities
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggested Entities (after extraction) */}
        {extractedEntities && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Suggested Entities (Click to Add)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">Characters:</div>
                <div className="flex flex-wrap gap-2">
                  {extractedEntities.suggestedCharacters.map((char, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addCharacter(char)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {char.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">Locations:</div>
                <div className="flex flex-wrap gap-2">
                  {extractedEntities.suggestedLocations.map((loc, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addLocation(loc)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {loc.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">Props:</div>
                <div className="flex flex-wrap gap-2">
                  {extractedEntities.suggestedProps.map((prop, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addProp(prop)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      {prop.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entity Management Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 w-full bg-slate-800">
              <TabsTrigger value="characters" className="data-[state=active]:bg-slate-700">
                <Users className="h-4 w-4 mr-2" />
                Characters ({currentEntities.characters.length})
              </TabsTrigger>
              <TabsTrigger value="locations" className="data-[state=active]:bg-slate-700">
                <MapPin className="h-4 w-4 mr-2" />
                Locations ({currentEntities.locations.length})
              </TabsTrigger>
              <TabsTrigger value="props" className="data-[state=active]:bg-slate-700">
                <Package className="h-4 w-4 mr-2" />
                Props ({currentEntities.props.length})
              </TabsTrigger>
            </TabsList>

            {/* Characters Tab */}
            <TabsContent value="characters" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                <Button
                  onClick={() => addCharacter()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Character
                </Button>

                {currentEntities.characters.map((character) => (
                  <Card key={character.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Input
                              value={character.name}
                              onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                              placeholder="Character name"
                              className="bg-slate-900/50 border-slate-600 text-white"
                            />
                            <Badge className={getRoleColor(character.role)}>
                              {character.role}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              {character.referenceTag}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCharacter(character.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Role</label>
                            <select
                              value={character.role}
                              onChange={(e) => updateCharacter(character.id, { role: e.target.value as Character["role"] })}
                              className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm"
                            >
                              <option value="protagonist">Protagonist</option>
                              <option value="antagonist">Antagonist</option>
                              <option value="supporting">Supporting</option>
                              <option value="background">Background</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Appearance</label>
                            <Input
                              value={character.appearance || ""}
                              onChange={(e) => updateCharacter(character.id, { appearance: e.target.value })}
                              placeholder="Physical appearance"
                              className="bg-slate-900/50 border-slate-600 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                          <Textarea
                            value={character.description}
                            onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                            placeholder="Character background, personality, motivation..."
                            rows={2}
                            className="bg-slate-900/50 border-slate-600 text-white text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                <Button
                  onClick={() => addLocation()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>

                {currentEntities.locations.map((location) => (
                  <Card key={location.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Input
                              value={location.name}
                              onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                              placeholder="Location name"
                              className="bg-slate-900/50 border-slate-600 text-white"
                            />
                            <Badge className={getTypeColor(location.type)}>
                              {location.type}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              {location.referenceTag}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteLocation(location.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Type</label>
                            <select
                              value={location.type}
                              onChange={(e) => updateLocation(location.id, { type: e.target.value as Location["type"] })}
                              className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm"
                            >
                              <option value="interior">Interior</option>
                              <option value="exterior">Exterior</option>
                              <option value="mixed">Mixed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Atmosphere</label>
                            <Input
                              value={location.atmosphere || ""}
                              onChange={(e) => updateLocation(location.id, { atmosphere: e.target.value })}
                              placeholder="Mood, lighting, feel..."
                              className="bg-slate-900/50 border-slate-600 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                          <Textarea
                            value={location.description}
                            onChange={(e) => updateLocation(location.id, { description: e.target.value })}
                            placeholder="Physical details, layout, significance..."
                            rows={2}
                            className="bg-slate-900/50 border-slate-600 text-white text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Props Tab */}
            <TabsContent value="props" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                <Button
                  onClick={() => addProp()}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prop
                </Button>

                {currentEntities.props.map((prop) => (
                  <Card key={prop.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Input
                              value={prop.name}
                              onChange={(e) => updateProp(prop.id, { name: e.target.value })}
                              placeholder="Prop name"
                              className="bg-slate-900/50 border-slate-600 text-white"
                            />
                            <Badge className={getTypeColor(prop.type)}>
                              {prop.type}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              {prop.referenceTag}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProp(prop.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Type</label>
                            <select
                              value={prop.type}
                              onChange={(e) => updateProp(prop.id, { type: e.target.value as Prop["type"] })}
                              className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm"
                            >
                              <option value="object">Object</option>
                              <option value="vehicle">Vehicle</option>
                              <option value="weapon">Weapon</option>
                              <option value="tool">Tool</option>
                              <option value="symbolic">Symbolic</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Significance</label>
                            <Input
                              value={prop.significance || ""}
                              onChange={(e) => updateProp(prop.id, { significance: e.target.value })}
                              placeholder="Story importance..."
                              className="bg-slate-900/50 border-slate-600 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                          <Textarea
                            value={prop.description}
                            onChange={(e) => updateProp(prop.id, { description: e.target.value })}
                            placeholder="Physical details, usage, symbolism..."
                            rows={2}
                            className="bg-slate-900/50 border-slate-600 text-white text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={onGenerateWithEntities}
              disabled={isGenerating || !story.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Generate Story Breakdown
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}