'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Upload, Camera, Image as ImageIcon, Check, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MobileReferenceSelectorProps {
  onSendToPosition: (position: 1 | 2 | 3) => void
  disabled?: boolean
  currentReferenceImages?: any[]
  triggerLabel?: string
}

const POSITION_CONFIG = [
  {
    position: 1 as const,
    label: '1st Reference',
    description: 'Primary character or main element',
    shortLabel: '1st',
    color: 'bg-blue-500'
  },
  {
    position: 2 as const,
    label: '2nd Reference', 
    description: 'Secondary character or location',
    shortLabel: '2nd',
    color: 'bg-purple-500'
  },
  {
    position: 3 as const,
    label: '3rd Reference',
    description: 'Props, objects, or background elements', 
    shortLabel: '3rd',
    color: 'bg-orange-500'
  }
]

export function MobileReferenceSelector({
  onSendToPosition,
  disabled = false,
  currentReferenceImages = [],
  triggerLabel = "Assign Reference"
}: MobileReferenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSendToPosition = (position: 1 | 2 | 3) => {
    onSendToPosition(position)
    setIsOpen(false)
  }

  const getSlotStatus = (position: number) => {
    const hasImage = currentReferenceImages && currentReferenceImages[position - 1]
    return hasImage ? 'occupied' : 'empty'
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="w-full h-12 text-base font-medium"
        >
          <Upload className="w-5 h-5 mr-2" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[400px] rounded-t-2xl">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="text-xl">Choose Reference Position</SheetTitle>
          <p className="text-muted-foreground">Select where to store this image for consistent character/location use</p>
        </SheetHeader>
        
        <div className="space-y-3">
          {POSITION_CONFIG.map((config) => {
            const status = getSlotStatus(config.position)
            
            return (
              <Card 
                key={config.position}
                className={`cursor-pointer transition-all active:scale-95 border-2 ${
                  status === 'occupied' ? 'border-orange-400 bg-orange-900/20' : 'border-slate-600 hover:border-slate-400'
                }`}
                onClick={() => handleSendToPosition(config.position)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Visual Position Indicator */}
                      <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-white font-bold text-lg`}>
                        {config.position}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Status Indicator */}
                      <Badge 
                        variant={status === 'occupied' ? 'default' : 'outline'}
                        className={`text-xs ${
                          status === 'occupied' 
                            ? 'bg-orange-500 text-white' 
                            : 'border-green-500 text-green-400'
                        }`}
                      >
                        {status === 'occupied' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Occupied
                          </>
                        ) : (
                          <>
                            <Circle className="w-3 h-3 mr-1" />
                            Empty
                          </>
                        )}
                      </Badge>
                      
                      {/* Touch-friendly action indicator */}
                      <div className="text-2xl">→</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Images will be available in Post Production for AI generation
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Quick action buttons for one-handed operation
export function QuickReferenceButtons({
  onSendToPosition,
  currentReferenceImages = []
}: Pick<MobileReferenceSelectorProps, 'onSendToPosition' | 'currentReferenceImages'>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITION_CONFIG.map((config) => {
        const status = getSlotStatus(config.position, currentReferenceImages)
        
        return (
          <Button
            key={config.position}
            variant={status === 'occupied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSendToPosition(config.position)}
            className="h-10 px-2"
          >
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-xs">{config.shortLabel}</span>
              {status === 'occupied' && <Check className="w-3 h-3" />}
            </div>
          </Button>
        )
      })}
    </div>
  )
}

function getSlotStatus(position: number, currentReferenceImages: any[]) {
  const hasImage = currentReferenceImages && currentReferenceImages[position - 1]
  return hasImage ? 'occupied' : 'empty'
}