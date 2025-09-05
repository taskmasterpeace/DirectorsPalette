"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// ScrollArea not available, using div with overflow
import { Separator } from "@/components/ui/separator"
import { Users, MapPin, Package, Copy, X } from "lucide-react"

interface Reference {
  id: string
  name: string
  description: string
  chapters?: string[]
}

interface ReferencesPanelProps {
  characters: Reference[]
  locations: Reference[]
  props: Reference[]
  selectedDirector?: string
  onRemoveReference?: (type: 'character' | 'location' | 'prop', id: string) => void
  onEditReference?: (type: 'character' | 'location' | 'prop', id: string, description: string) => void
}

export function ReferencesPanel({
  characters,
  locations,
  props,
  selectedDirector,
  onRemoveReference,
  onEditReference
}: ReferencesPanelProps) {
  const copyReference = (ref: Reference) => {
    const text = `@${ref.name}: ${ref.description}`
    navigator.clipboard.writeText(text)
  }

  const ReferenceCard = ({ 
    ref, 
    type, 
    icon 
  }: { 
    ref: Reference
    type: 'character' | 'location' | 'prop'
    icon: React.ReactNode 
  }) => (
    <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="font-medium text-white">@{ref.name}</div>
            {ref.chapters && ref.chapters.length > 0 && (
              <div className="flex gap-1 mt-1">
                {ref.chapters.slice(0, 3).map((chapter, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-400">
                    Ch.{chapter}
                  </Badge>
                ))}
                {ref.chapters.length > 3 && (
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    +{ref.chapters.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyReference(ref)}
            className="h-7 w-7 p-0 hover:bg-slate-700"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {onRemoveReference && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveReference(type, ref.id)}
              className="h-7 w-7 p-0 hover:bg-red-900/20 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-300 italic">
        {ref.description}
      </p>
    </div>
  )

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>📚 Story References</span>
          {selectedDirector && (
            <Badge variant="secondary" className="bg-amber-600/20 text-amber-300">
              {selectedDirector} Style
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Characters Section */}
        {characters.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-blue-400" />
              <h3 className="font-medium text-white">Characters ({characters.length})</h3>
            </div>
            <div className="h-[200px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {characters.map((char) => (
                  <ReferenceCard
                    key={char.id}
                    ref={char}
                    type="character"
                    icon={<Users className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {(characters.length > 0 && locations.length > 0) && (
          <Separator className="bg-slate-600" />
        )}

        {/* Locations Section */}
        {locations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-400" />
              <h3 className="font-medium text-white">Locations ({locations.length})</h3>
            </div>
            <div className="h-[200px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {locations.map((loc) => (
                  <ReferenceCard
                    key={loc.id}
                    ref={loc}
                    type="location"
                    icon={<MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {(locations.length > 0 && props.length > 0) && (
          <Separator className="bg-slate-600" />
        )}

        {/* Props Section */}
        {props.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-purple-400" />
              <h3 className="font-medium text-white">Props ({props.length})</h3>
            </div>
            <div className="h-[200px] overflow-y-auto pr-4">
              <div className="space-y-2">
                {props.map((prop) => (
                  <ReferenceCard
                    key={prop.id}
                    ref={prop}
                    type="prop"
                    icon={<Package className="h-4 w-4 text-purple-400 flex-shrink-0" />}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {characters.length === 0 && locations.length === 0 && props.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No references extracted yet.</p>
            <p className="text-xs mt-1">Generate a story breakdown to see references.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}