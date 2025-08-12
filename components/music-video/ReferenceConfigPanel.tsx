"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Shirt, Package, Eye, ArrowRight } from "lucide-react"
import { LocationSelector, type Location } from "./LocationSelector"
import { WardrobeSelector, type WardrobeItem } from "./WardrobeSelector"
import { PropSelector, type Prop } from "./PropSelector"

export interface ReferenceConfig {
  locations: Location[]
  wardrobe: WardrobeItem[]
  props: Prop[]
  selectedTreatmentId: string
}

interface ReferenceConfigPanelProps {
  config: ReferenceConfig
  onConfigChange: (config: ReferenceConfig) => void
  onContinue: () => void
  onBack: () => void
  artistName: string
  treatmentName: string
  isGenerating?: boolean
}

export function ReferenceConfigPanel({
  config,
  onConfigChange,
  onContinue,
  onBack,
  artistName,
  treatmentName,
  isGenerating = false
}: ReferenceConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("locations")

  const handleLocationsChange = (locations: Location[]) => {
    onConfigChange({ ...config, locations })
  }

  const handleWardrobeChange = (wardrobe: WardrobeItem[]) => {
    onConfigChange({ ...config, wardrobe })
  }

  const handlePropsChange = (props: Prop[]) => {
    onConfigChange({ ...config, props })
  }

  const getTotalReferences = () => {
    return config.locations.length + config.wardrobe.length + config.props.length
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-400" />
            Configure References for "{treatmentName}"
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Review and customize the auto-generated suggestions. These will be used to generate your final shots.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Reference Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="space-y-1">
              <p className="text-white font-medium">Current References</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                  {config.locations.length} Locations
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {config.wardrobe.length} Outfits
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-300">
                  {config.props.length} Props
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                  {getTotalReferences()} Total
                </Badge>
              </div>
            </div>
            
            {getTotalReferences() > 0 && (
              <div className="text-right">
                <p className="text-sm text-slate-400">Ready to generate shots</p>
                <p className="text-xs text-green-400">✓ References configured</p>
              </div>
            )}
          </div>

          {/* Tabs for Reference Configuration */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger 
                value="locations" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Locations
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.locations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="wardrobe"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Shirt className="h-4 w-4 mr-2" />
                Wardrobe
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.wardrobe.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="props"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Package className="h-4 w-4 mr-2" />
                Props
                <Badge variant="secondary" className="ml-2 bg-slate-600">
                  {config.props.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="space-y-4 mt-4">
              <LocationSelector
                locations={config.locations}
                onLocationsChange={handleLocationsChange}
              />
            </TabsContent>

            <TabsContent value="wardrobe" className="space-y-4 mt-4">
              <WardrobeSelector
                wardrobe={config.wardrobe}
                onWardrobeChange={handleWardrobeChange}
                artistName={artistName}
              />
            </TabsContent>

            <TabsContent value="props" className="space-y-4 mt-4">
              <PropSelector
                props={config.props}
                onPropsChange={handlePropsChange}
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
              ← Back to Treatments
            </Button>
            
            <Button
              onClick={onContinue}
              disabled={isGenerating || getTotalReferences() === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating Final Breakdown...
                </>
              ) : (
                <>
                  Generate Final Breakdown
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {getTotalReferences() === 0 && (
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <p className="text-orange-300 text-sm">
                ⚠️ Add at least one location, wardrobe, or prop to continue
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}