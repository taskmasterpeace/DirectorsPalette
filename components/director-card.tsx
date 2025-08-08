"use client"

import React from "react"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FilmIcon, PlayCircle, Tags, Settings, Palette, BookOpenText } from 'lucide-react'

type Props = {
  director: (FilmDirector | MusicVideoDirector) & {
    // Backward compat fields for earlier records
    visualStyle?: string
    cameraStyle?: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  // Optional compact mode for curated items (no edit/delete)
  compact?: boolean
}

export function DirectorCard({ director, onEdit, onDelete, compact }: Props) {
  const isFilm = director.domain === "film"

  // Film details
  const filmVisual = isFilm
    ? (director as FilmDirector).visualLanguage ||
      [director.visualStyle, director.cameraStyle].filter(Boolean).join("; ")
    : undefined

  const filmColor = isFilm ? (director as FilmDirector).colorPalette : undefined
  const filmNarr = isFilm ? (director as FilmDirector).narrativeFocus : undefined

  // Music video details
  const mvHallmarks = !isFilm ? (director as MusicVideoDirector).visualHallmarks : undefined
  const mvNarr = !isFilm ? (director as MusicVideoDirector).narrativeStyle : undefined
  const mvPacing = !isFilm ? (director as MusicVideoDirector).pacingAndEnergy : undefined
  const mvGenres = !isFilm ? (director as MusicVideoDirector).genres : undefined

  const tags = director.tags || []
  const disciplines = director.disciplines || []

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-500/70 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isFilm ? (
              <FilmIcon className="h-4 w-4 text-amber-400" />
            ) : (
              <PlayCircle className="h-4 w-4 text-purple-400" />
            )}
            <CardTitle className="text-white text-base">{director.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {director.isCustom && (
              <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                Custom
              </Badge>
            )}
            <Badge variant="secondary" className="bg-slate-600/20 text-slate-300">
              {director.category || "Uncategorized"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {director.description && (
          <div className="text-sm text-slate-300">{director.description}</div>
        )}

        {/* Details */}
        {isFilm ? (
          <div className="space-y-2">
            {filmVisual && (
              <div className="text-xs text-slate-400 flex items-start gap-2">
                <BookOpenText className="h-3.5 w-3.5 text-amber-300 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">Visual Language: </span>
                  <span className="text-slate-300">{filmVisual}</span>
                </div>
              </div>
            )}
            {filmColor && (
              <div className="text-xs text-slate-400 flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-amber-300 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">Color Palette: </span>
                  <span className="text-slate-300">{filmColor}</span>
                </div>
              </div>
            )}
            {filmNarr && (
              <div className="text-xs text-slate-400 flex items-start gap-2">
                <Settings className="h-3.5 w-3.5 text-amber-300 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">Narrative Focus: </span>
                  <span className="text-slate-300">{filmNarr}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {mvHallmarks && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Visual Hallmarks: </span>
                <span className="text-slate-300">{mvHallmarks}</span>
              </div>
            )}
            {mvNarr && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Narrative Style: </span>
                <span className="text-slate-300">{mvNarr}</span>
              </div>
            )}
            {mvPacing && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Pacing & Energy: </span>
                <span className="text-slate-300">{mvPacing}</span>
              </div>
            )}
            {mvGenres && mvGenres.length > 0 && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Genres: </span>
                <span className="text-slate-300">{mvGenres.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Tags className="h-3.5 w-3.5" />
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="bg-slate-700/50 text-slate-300">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines */}
        {disciplines.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {disciplines.map((d) => (
              <Badge key={d} variant="outline" className="border-slate-600 text-slate-300">
                {d}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {!compact && (onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-1">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(director.id)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete?.(director.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
