"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Palette, Target, User } from "lucide-react"

interface ReferenceItem {
  reference: string
  name: string
  description: string
  type: 'location' | 'wardrobe' | 'prop' | 'artist'
}

interface ReferenceLegendProps {
  artist: string
  locations?: Array<{ reference: string; name: string; description: string }>
  wardrobe?: Array<{ reference: string; name: string; description: string }>
  props?: Array<{ reference: string; name: string; description: string }>
  isOpen?: boolean
}

export function ReferenceLegend({ 
  artist, 
  locations = [], 
  wardrobe = [], 
  props = [],
  isOpen = false 
}: ReferenceLegendProps) {
  if (!isOpen) return null

  const artistReference = `@${artist.toLowerCase().replace(/\s+/g, '')}`
  
  const allReferences: ReferenceItem[] = [
    {
      reference: artistReference,
      name: artist,
      description: `Primary artist/performer`,
      type: 'artist'
    },
    ...locations.map(loc => ({
      reference: loc.reference,
      name: loc.name,
      description: loc.description,
      type: 'location' as const
    })),
    ...wardrobe.map(outfit => ({
      reference: outfit.reference,
      name: outfit.name,
      description: outfit.description,
      type: 'wardrobe' as const
    })),
    ...props.map(prop => ({
      reference: prop.reference,
      name: prop.name,
      description: prop.description,
      type: 'prop' as const
    }))
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'artist': return <User className="h-3 w-3" />
      case 'location': return <MapPin className="h-3 w-3" />
      case 'wardrobe': return <Palette className="h-3 w-3" />
      case 'prop': return <Target className="h-3 w-3" />
      default: return null
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'artist': return "bg-blue-600/20 text-blue-300 border-blue-500/30"
      case 'location': return "bg-green-600/20 text-green-300 border-green-500/30"
      case 'wardrobe': return "bg-purple-600/20 text-purple-300 border-purple-500/30"
      case 'prop': return "bg-amber-600/20 text-amber-300 border-amber-500/30"
      default: return "bg-slate-600/20 text-slate-300 border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          📋 Reference Legend
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          What each @ reference means in your shots
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {allReferences.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded bg-slate-700/30">
              <Badge 
                variant="outline" 
                className={`text-xs font-mono ${getColor(item.type)} flex items-center gap-1 shrink-0`}
              >
                {getIcon(item.type)}
                {item.reference}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {item.name}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-600">
          <p className="text-xs text-slate-500">
            💡 These references will appear in your generated shots to maintain consistency
          </p>
        </div>
      </CardContent>
    </Card>
  )
}