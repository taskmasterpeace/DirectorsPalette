'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Shirt, Package, Sparkles, Check, X, Plus } from 'lucide-react'

interface MusicVideoReferenceConfigProps {
  references: {
    locations?: Array<{ name: string; description: string; type: string }>
    wardrobe?: Array<{ name: string; description: string; style: string }>
    props?: Array<{ name: string; description: string; purpose: string }>
    visualThemes?: string[]
  }
  isLoading: boolean
  onConfigurationComplete: (configuredRefs: any) => void
  onCancel: () => void
}

export function MusicVideoReferenceConfig({
  references,
  isLoading,
  onConfigurationComplete,
  onCancel
}: MusicVideoReferenceConfigProps) {
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set())
  const [selectedWardrobe, setSelectedWardrobe] = useState<Set<number>>(new Set())
  const [selectedProps, setSelectedProps] = useState<Set<number>>(new Set())
  const [customLocations, setCustomLocations] = useState<string[]>([])
  const [customWardrobe, setCustomWardrobe] = useState<string[]>([])
  const [customProps, setCustomProps] = useState<string[]>([])
  const [newCustomLocation, setNewCustomLocation] = useState('')
  const [newCustomWardrobe, setNewCustomWardrobe] = useState('')
  const [newCustomProp, setNewCustomProp] = useState('')

  const handleGenerate = () => {
    const configuredRefs = {
      locations: [
        ...(references.locations || []).filter((_, i) => selectedLocations.has(i)),
        ...customLocations.map(name => ({ name, description: 'Custom location', type: 'custom' }))
      ],
      wardrobe: [
        ...(references.wardrobe || []).filter((_, i) => selectedWardrobe.has(i)),
        ...customWardrobe.map(name => ({ name, description: 'Custom wardrobe', style: 'custom' }))
      ],
      props: [
        ...(references.props || []).filter((_, i) => selectedProps.has(i)),
        ...customProps.map(name => ({ name, description: 'Custom prop', purpose: 'custom' }))
      ],
      visualThemes: references.visualThemes || []
    }
    onConfigurationComplete(configuredRefs)
  }

  const toggleLocation = (index: number) => {
    const newSet = new Set(selectedLocations)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedLocations(newSet)
  }

  const toggleWardrobe = (index: number) => {
    const newSet = new Set(selectedWardrobe)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedWardrobe(newSet)
  }

  const toggleProp = (index: number) => {
    const newSet = new Set(selectedProps)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedProps(newSet)
  }

  const addCustomLocation = () => {
    if (newCustomLocation.trim()) {
      setCustomLocations([...customLocations, newCustomLocation.trim()])
      setNewCustomLocation('')
    }
  }

  const addCustomWardrobe = () => {
    if (newCustomWardrobe.trim()) {
      setCustomWardrobe([...customWardrobe, newCustomWardrobe.trim()])
      setNewCustomWardrobe('')
    }
  }

  const addCustomProp = () => {
    if (newCustomProp.trim()) {
      setCustomProps([...customProps, newCustomProp.trim()])
      setNewCustomProp('')
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Configure Music Video References
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="locations" className="data-[state=active]:bg-purple-600">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="wardrobe" className="data-[state=active]:bg-purple-600">
              <Shirt className="h-4 w-4 mr-2" />
              Wardrobe
            </TabsTrigger>
            <TabsTrigger value="props" className="data-[state=active]:bg-purple-600">
              <Package className="h-4 w-4 mr-2" />
              Props
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <div className="h-[300px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {references.locations?.map((location, i) => (
                  <Card
                    key={i}
                    className={`cursor-pointer transition-all ${
                      selectedLocations.has(i)
                        ? 'bg-purple-900/30 border-purple-600'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                    }`}
                    onClick={() => toggleLocation(i)}
                  >
                    <CardContent className="p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{location.name}</div>
                        <div className="text-sm text-slate-400">{location.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {location.type}
                        </Badge>
                      </div>
                      {selectedLocations.has(i) && (
                        <Check className="h-5 w-5 text-purple-400 ml-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Custom locations */}
                {customLocations.map((location, i) => (
                  <Card key={`custom-${i}`} className="bg-purple-900/20 border-purple-600">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="text-white">{location}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCustomLocations(customLocations.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom location..."
                value={newCustomLocation}
                onChange={(e) => setNewCustomLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomLocation()}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Button onClick={addCustomLocation} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-4">
            <div className="h-[300px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {references.wardrobe?.map((item, i) => (
                  <Card
                    key={i}
                    className={`cursor-pointer transition-all ${
                      selectedWardrobe.has(i)
                        ? 'bg-purple-900/30 border-purple-600'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                    }`}
                    onClick={() => toggleWardrobe(i)}
                  >
                    <CardContent className="p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-sm text-slate-400">{item.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.style}
                        </Badge>
                      </div>
                      {selectedWardrobe.has(i) && (
                        <Check className="h-5 w-5 text-purple-400 ml-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Custom wardrobe */}
                {customWardrobe.map((item, i) => (
                  <Card key={`custom-${i}`} className="bg-purple-900/20 border-purple-600">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="text-white">{item}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCustomWardrobe(customWardrobe.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom wardrobe..."
                value={newCustomWardrobe}
                onChange={(e) => setNewCustomWardrobe(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomWardrobe()}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Button onClick={addCustomWardrobe} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="props" className="space-y-4">
            <div className="h-[300px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {references.props?.map((prop, i) => (
                  <Card
                    key={i}
                    className={`cursor-pointer transition-all ${
                      selectedProps.has(i)
                        ? 'bg-purple-900/30 border-purple-600'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                    }`}
                    onClick={() => toggleProp(i)}
                  >
                    <CardContent className="p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{prop.name}</div>
                        <div className="text-sm text-slate-400">{prop.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {prop.purpose}
                        </Badge>
                      </div>
                      {selectedProps.has(i) && (
                        <Check className="h-5 w-5 text-purple-400 ml-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Custom props */}
                {customProps.map((prop, i) => (
                  <Card key={`custom-${i}`} className="bg-purple-900/20 border-purple-600">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="text-white">{prop}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCustomProps(customProps.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom prop..."
                value={newCustomProp}
                onChange={(e) => setNewCustomProp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomProp()}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Button onClick={addCustomProp} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Generate with Selected References
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}