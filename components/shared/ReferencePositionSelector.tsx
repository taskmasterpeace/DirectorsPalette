'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Upload, ChevronDown } from 'lucide-react'

interface ReferencePositionSelectorProps {
  onSendToPosition: (position: 1 | 2 | 3) => void
  disabled?: boolean
  className?: string
  variant?: 'button' | 'icon'
  currentReferenceImages?: any[] // To show which slots are occupied
}

const POSITION_CONFIG = [
  {
    position: 1 as const,
    label: '1st Reference',
    description: 'Primary reference image',
    shortLabel: '1st'
  },
  {
    position: 2 as const,
    label: '2nd Reference', 
    description: 'Secondary reference image',
    shortLabel: '2nd'
  },
  {
    position: 3 as const,
    label: '3rd Reference',
    description: 'Tertiary reference image', 
    shortLabel: '3rd'
  }
]

export function ReferencePositionSelector({
  onSendToPosition,
  disabled = false,
  className = '',
  variant = 'button',
  currentReferenceImages = []
}: ReferencePositionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSendToPosition = (position: 1 | 2 | 3) => {
    onSendToPosition(position)
    setIsOpen(false)
  }

  const getSlotStatus = (position: number) => {
    const hasImage = currentReferenceImages && currentReferenceImages[position - 1]
    return hasImage ? 'occupied' : 'empty'
  }

  const getSlotStatusColor = (position: number) => {
    return getSlotStatus(position) === 'occupied' 
      ? 'text-orange-400' 
      : 'text-green-400'
  }

  if (variant === 'icon') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            className={`h-8 w-8 p-0 ${className}`}
            title="Send to Gen4 reference slot"
          >
            <Upload className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {POSITION_CONFIG.map((config) => (
            <DropdownMenuItem
              key={config.position}
              onClick={() => handleSendToPosition(config.position)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{config.description}</span>
              </div>
              <div className={`text-xs font-medium ${getSlotStatusColor(config.position)}`}>
                {getSlotStatus(config.position) === 'occupied' ? '●' : '○'}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`flex items-center gap-2 ${className}`}
        >
          <Upload className="w-4 h-4" />
          Send to Gen4
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 border-b">
          <h4 className="text-sm font-medium">Choose Reference Position</h4>
          <p className="text-xs text-muted-foreground">Select which Gen4 reference slot to use</p>
        </div>
        {POSITION_CONFIG.map((config) => (
          <DropdownMenuItem
            key={config.position}
            onClick={() => handleSendToPosition(config.position)}
            className="flex items-center justify-between p-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{config.label}</span>
              <span className="text-xs text-muted-foreground">{config.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs font-medium ${getSlotStatusColor(config.position)}`}>
                {getSlotStatus(config.position) === 'occupied' ? 'Occupied' : 'Empty'}
              </div>
              <div className={`w-2 h-2 rounded-full ${
                getSlotStatus(config.position) === 'occupied' 
                  ? 'bg-orange-400' 
                  : 'bg-green-400'
              }`} />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}