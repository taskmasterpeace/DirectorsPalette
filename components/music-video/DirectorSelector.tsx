'use client'

import { useState } from 'react'
import { ChevronDown, Camera, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MusicVideoDirector } from '@/lib/director-types'

interface DirectorSelectorProps {
  directors: MusicVideoDirector[]
  selectedDirectorId: string
  onDirectorSelect: (directorId: string) => void
  className?: string
}

export function DirectorSelector({
  directors,
  selectedDirectorId,
  onDirectorSelect,
  className = ''
}: DirectorSelectorProps) {
  const selectedDirector = directors.find(d => d.id === selectedDirectorId)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-purple-400 font-medium">
        <Camera className="w-4 h-4" />
        Director Style
      </div>
      
      <Select value={selectedDirectorId} onValueChange={onDirectorSelect}>
        <SelectTrigger className="bg-white/5 border-white/10 text-white">
          <SelectValue>
            {selectedDirector ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{selectedDirector.name}</span>
              </div>
            ) : (
              "Select a director style..."
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {directors.map((director) => (
            <SelectItem 
              key={director.id} 
              value={director.id}
              className="text-white hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="space-y-1">
                <div className="font-medium">{director.name}</div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {director.description}
                </div>
                <div className="flex gap-1 mt-1">
                  {director.genres.slice(0, 2).map((genre) => (
                    <span 
                      key={genre} 
                      className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedDirector && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-400 hover:text-white">
              <span>View Style Details</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700 text-white" side="bottom" align="start">
            <div className="space-y-3 p-4">
              <div>
                <h4 className="font-medium text-purple-400 mb-1">{selectedDirector.name}</h4>
                <p className="text-sm text-slate-300">{selectedDirector.description}</p>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-slate-400 mb-1">Visual Style</h5>
                <p className="text-xs text-slate-300">{selectedDirector.visualHallmarks}</p>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-slate-400 mb-1">Narrative Approach</h5>
                <p className="text-xs text-slate-300">{selectedDirector.narrativeStyle}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedDirector.genres.map((genre) => (
                  <span 
                    key={genre} 
                    className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}