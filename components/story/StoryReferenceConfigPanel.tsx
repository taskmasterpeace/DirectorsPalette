"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MapPin, Package, Eye, ArrowRight } from "lucide-react"
import { CharacterSelector, type StoryCharacter } from "./CharacterSelector"
import { StoryLocationSelector, type StoryLocation } from "./StoryLocationSelector"
import { StoryPropSelector, type StoryProp } from "./StoryPropSelector"

export interface StoryReferenceConfig {
  characters: StoryCharacter[]
  locations: StoryLocation[]
  props: StoryProp[]
  storyId: string
}

interface StoryReferenceConfigPanelProps {
  config: StoryReferenceConfig
  onConfigChange: (config: StoryReferenceConfig) => void
  onContinue: () => void
  onBack: () => void
  storyTitle: string
  availableChapters: Array<{ id: string; title: string }>
  isGenerating?: boolean
}

export function StoryReferenceConfigPanel({
  config,
  onConfigChange,
  onContinue,
  onBack,
  storyTitle,
  availableChapters,
  isGenerating = false
}: StoryReferenceConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("characters")

  const handleCharactersChange = (characters: StoryCharacter[]) => {
    onConfigChange({ ...config, characters })
  }

  const handleLocationsChange = (locations: StoryLocation[]) => {
    onConfigChange({ ...config, locations })
  }

  const handlePropsChange = (props: StoryProp[]) => {
    onConfigChange({ ...config, props })
  }

  const getTotalReferences = () => {
    return config.characters.length + config.locations.length + config.props.length
  }

  const getVariationCount = () => {
    return config.characters.filter(char => char.ageVariation).length
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-400" />
            Configure Story References for "{storyTitle}"
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Extract and customize characters, locations, and props from your story. These will be used to generate clean, consistent shots.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Reference Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="space-y-1">
              <p className="text-white font-medium">Current References</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                  {config.characters.length} Characters
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-300">
                  {config.locations.length} Locations
                </Badge>
                <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                  {config.props.length} Props
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                  {getTotalReferences()} Total
                </Badge>
                {getVariationCount() > 0 && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    {getVariationCount()} Age Variations
                  </Badge>
                )}
              </div>
            </div>
            
            {getTotalReferences() > 0 && (
              <div className="text-right">
                <p className="text-sm text-slate-400">Ready to generate story breakdown</p>
                <p className="text-xs text-green-400">✓ References configured</p>
              </div>
            )}
          </div>

          {/* Chapter Overview */}
          <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700">
            <p className="text-white font-medium mb-2">Story Structure ({availableChapters.length} chapters)</p>
            <div className="flex flex-wrap gap-2">
              {availableChapters.map((chapter, index) => (
                <Badge key={chapter.id} variant="outline" className="border-slate-600 text-slate-300">
                  {index + 1}. {chapter.title}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tabs for Reference Configuration */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger 
                value="characters" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Characters
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.characters.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="locations"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Locations
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.locations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="props"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Package className="h-4 w-4 mr-2" />
                Props
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.props.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="characters" className="space-y-4 mt-4">
              <div className="bg-blue-900/10 border border-blue-700/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">Character Reference Examples</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">@protagonist</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">@sarah_young</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">@sarah_old</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">@villain</code>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Add age variations (young/old/child/adult) for characters that change over time.
                </p>
              </div>
              <CharacterSelector
                characters={config.characters}
                onCharactersChange={handleCharactersChange}
                availableChapters={availableChapters}
              />
            </TabsContent>

            <TabsContent value="locations" className="space-y-4 mt-4">
              <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-4">
                <h4 className="text-green-300 font-medium mb-2">Location Reference Examples</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <code className="bg-slate-800 px-2 py-1 rounded text-green-300">@police_station</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-green-300">@apartment</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-green-300">@warehouse</code>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Interior/exterior info is hidden from display but used for generation.
                </p>
              </div>
              <StoryLocationSelector
                locations={config.locations}
                onLocationsChange={handleLocationsChange}
                availableChapters={availableChapters}
              />
            </TabsContent>

            <TabsContent value="props" className="space-y-4 mt-4">
              <div className="bg-orange-900/10 border border-orange-700/30 rounded-lg p-4">
                <h4 className="text-orange-300 font-medium mb-2">Prop Reference Examples</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <code className="bg-slate-800 px-2 py-1 rounded text-orange-300">@evidence_folder</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-orange-300">@gun</code>
                  <code className="bg-slate-800 px-2 py-1 rounded text-orange-300">@laptop</code>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Props can be objects, weapons, documents, vehicles, or symbolic items.
                </p>
              </div>
              <StoryPropSelector
                props={config.props}
                onPropsChange={handlePropsChange}
                availableChapters={availableChapters}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-700">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← Back to Story Input
            </Button>
            
            <Button
              onClick={onContinue}
              disabled={isGenerating || getTotalReferences() === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating Story Breakdown...
                </>
              ) : (
                <>
                  Generate Story Breakdown
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {getTotalReferences() === 0 && (
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <p className="text-orange-300 text-sm">
                ⚠️ Add characters, locations, or props to generate clean story shots with references
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700">
            <h4 className="text-slate-300 font-medium mb-2">💡 Tips for Better Results</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• Use descriptive character names and clear role definitions</li>
              <li>• Add age variations for time-jump or flashback stories</li>
              <li>• Include atmosphere details for locations (lighting, mood)</li>
              <li>• Assign references to relevant chapters for context-aware generation</li>
              <li>• Props with story significance create more meaningful shots</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}