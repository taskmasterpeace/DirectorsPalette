"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LibraryPicker } from "@/components/library-picker"

interface DirectorSelectorProps {
  selectedDirector: string
  onDirectorChange: (directorId: string) => void
  allDirectors: any[] // TODO: Type this properly with FilmDirector | MusicVideoDirector
  selectedDirectorInfo?: any
  domain: "film" | "music-video"
  onCreateCustom?: () => void
}

export function DirectorSelector({
  selectedDirector,
  onDirectorChange,
  allDirectors,
  selectedDirectorInfo,
  domain,
  onCreateCustom,
}: DirectorSelectorProps) {
  const [showCustomDirectorForm, setShowCustomDirectorForm] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">Director Style</label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (onCreateCustom) {
              onCreateCustom()
            } else {
              setShowCustomDirectorForm(!showCustomDirectorForm)
            }
          }}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Custom
        </Button>
      </div>

      <LibraryPicker
        value={selectedDirector}
        onValueChange={onDirectorChange}
        directors={allDirectors}
        placeholder={domain === "film" ? "Select a director style..." : "Select a music video director style..."}
        domain={domain}
      />

      {selectedDirectorInfo && (
        <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
          <div className="text-sm text-slate-300">
            <div className="font-medium text-white mb-1">{selectedDirectorInfo.name}</div>
            {selectedDirectorInfo.description && (
              <div className="mb-2">{selectedDirectorInfo.description}</div>
            )}
            
            {/* Film Director specific fields */}
            {domain === "film" && selectedDirectorInfo.visualLanguage && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Visual Language: </span>
                {selectedDirectorInfo.visualLanguage}
              </div>
            )}
            
            {/* Music Video Director specific fields */}
            {domain === "music-video" && (
              <>
                {selectedDirectorInfo.visualHallmarks && (
                  <div className="text-xs text-slate-400 mb-1">
                    <span className="text-slate-300 font-medium">Visual Hallmarks: </span>
                    {selectedDirectorInfo.visualHallmarks}
                  </div>
                )}
                {selectedDirectorInfo.genres && selectedDirectorInfo.genres.length > 0 && (
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Genres: </span>
                    {selectedDirectorInfo.genres.join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TODO: Add custom director creation form modal */}
      {showCustomDirectorForm && (
        <div className="p-4 bg-slate-800/50 rounded-md border border-slate-600">
          <p className="text-sm text-slate-300">
            Custom director creation form will be implemented here.
            For now, use the Create Custom button handler.
          </p>
        </div>
      )}
    </div>
  )
}