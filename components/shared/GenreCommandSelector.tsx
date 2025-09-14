"use client"

import { useState, useEffect, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, ChevronDown, Hash, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { GENRE_STRUCTURE } from "@/lib/enhanced-genres"

interface GenreOption {
  id: string
  name: string
  type: "genre" | "subgenre" | "microgenre"
  parent?: string
  parentName?: string
}

interface GenreCommandSelectorProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  maxSelections?: number
  className?: string
  triggerClassName?: string
}

// Flatten the genre structure for searching
function flattenGenres(): GenreOption[] {
  const options: GenreOption[] = []
  
  GENRE_STRUCTURE.genres.forEach(genre => {
    // Add main genre
    options.push({
      id: genre.id,
      name: genre.name,
      type: "genre"
    })
    
    // Add subgenres
    genre.subgenres.forEach(subgenre => {
      options.push({
        id: subgenre.id,
        name: subgenre.name,
        type: "subgenre",
        parent: genre.id,
        parentName: genre.name
      })
      
      // Add microgenres
      subgenre.microgenres.forEach(microgenre => {
        options.push({
          id: microgenre.id,
          name: microgenre.name,
          type: "microgenre",
          parent: subgenre.id,
          parentName: subgenre.name
        })
      })
    })
  })
  
  return options
}

const POPULAR_GENRES = [
  "Hip-Hop/Rap", "Pop", "R&B/Soul", "Rock", "Electronic/EDM", "Country", "Jazz"
]

export function GenreCommandSelector({
  value = [],
  onChange,
  placeholder = "Search genres...",
  maxSelections = 10,
  className,
  triggerClassName
}: GenreCommandSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const allGenres = useMemo(() => flattenGenres(), [])

  const selectedGenres = value || []
  const canAddMore = selectedGenres.length < maxSelections

  // Filter genres based on search
  const filteredGenres = useMemo(() => {
    if (!search) {
      return allGenres.filter(g => POPULAR_GENRES.includes(g.name)).slice(0, 20)
    }
    
    return allGenres.filter(genre => 
      genre.name.toLowerCase().includes(search.toLowerCase()) ||
      genre.parentName?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50)
  }, [search, allGenres])

  // Group filtered results
  const groupedResults = useMemo(() => {
    const groups: Record<string, GenreOption[]> = {
      genres: [],
      subgenres: [],
      microgenres: []
    }
    
    filteredGenres.forEach(genre => {
      if (genre.type === "genre") groups.genres.push(genre)
      else if (genre.type === "subgenre") groups.subgenres.push(genre)
      else groups.microgenres.push(genre)
    })
    
    return groups
  }, [filteredGenres])

  const handleSelect = (genreName: string) => {
    if (!canAddMore && !selectedGenres.includes(genreName)) return
    
    const newSelection = selectedGenres.includes(genreName)
      ? selectedGenres.filter(g => g !== genreName)
      : [...selectedGenres, genreName]
    
    onChange?.(newSelection)
  }

  const removeGenre = (genreName: string) => {
    onChange?.(selectedGenres.filter(g => g !== genreName))
  }

  const clearAll = () => {
    onChange?.([])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "genre": return "text-green-400"
      case "subgenre": return "text-blue-400" 
      case "microgenre": return "text-purple-400"
      default: return "text-slate-400"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "genre": return "G"
      case "subgenre": return "S"
      case "microgenre": return "M"
      default: return ""
    }
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-slate-900 border-slate-700 text-white hover:bg-slate-800",
              triggerClassName
            )}
          >
            <span className="truncate">
              {selectedGenres.length > 0 
                ? `${selectedGenres.length} genre${selectedGenres.length === 1 ? '' : 's'} selected`
                : placeholder
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0 bg-slate-900 border-slate-700" align="start">
          <Command className="bg-slate-900">
            <CommandInput
              placeholder="Search genres, subgenres, microgenres..."
              value={search}
              onValueChange={setSearch}
              className="bg-slate-900 border-0 text-white"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty className="text-slate-400 text-sm py-6 text-center">
                No genres found.
              </CommandEmpty>
              
              {!search && (
                <CommandGroup heading="Popular Genres">
                  {POPULAR_GENRES.map(genreName => {
                    const isSelected = selectedGenres.includes(genreName)
                    const canSelect = canAddMore || isSelected
                    
                    return (
                      <CommandItem
                        key={genreName}
                        onSelect={() => handleSelect(genreName)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && "bg-green-900/30 text-green-300",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isSelected ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            ) : (
                              <div className="w-3 h-3 border border-slate-500 rounded-full" />
                            )}
                          </div>
                          <span className="flex-1">{genreName}</span>
                          <Badge variant="outline" className="text-xs bg-green-900/30 text-green-400 border-green-700">
                            G
                          </Badge>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {search && groupedResults.genres.length > 0 && (
                <CommandGroup heading="Main Genres">
                  {groupedResults.genres.map(genre => {
                    const isSelected = selectedGenres.includes(genre.name)
                    const canSelect = canAddMore || isSelected
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && "bg-green-900/30 text-green-300",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isSelected ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            ) : (
                              <div className="w-3 h-3 border border-slate-500 rounded-full" />
                            )}
                          </div>
                          <span className="flex-1">{genre.name}</span>
                          <Badge variant="outline" className="text-xs bg-green-900/30 text-green-400 border-green-700">
                            {getTypeBadge(genre.type)}
                          </Badge>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {search && groupedResults.subgenres.length > 0 && (
                <CommandGroup heading="Subgenres">
                  {groupedResults.subgenres.map(genre => {
                    const isSelected = selectedGenres.includes(genre.name)
                    const canSelect = canAddMore || isSelected
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && "bg-blue-900/30 text-blue-300",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isSelected ? (
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            ) : (
                              <div className="w-3 h-3 border border-slate-500 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div>{genre.name}</div>
                            {genre.parentName && (
                              <div className="text-xs text-slate-500">in {genre.parentName}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs bg-blue-900/30 text-blue-400 border-blue-700">
                            {getTypeBadge(genre.type)}
                          </Badge>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {search && groupedResults.microgenres.length > 0 && (
                <CommandGroup heading="Microgenres">
                  {groupedResults.microgenres.map(genre => {
                    const isSelected = selectedGenres.includes(genre.name)
                    const canSelect = canAddMore || isSelected
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && "bg-purple-900/30 text-purple-300",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isSelected ? (
                              <div className="w-3 h-3 bg-purple-500 rounded-full" />
                            ) : (
                              <div className="w-3 h-3 border border-slate-500 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div>{genre.name}</div>
                            {genre.parentName && (
                              <div className="text-xs text-slate-500">in {genre.parentName}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs bg-purple-900/30 text-purple-400 border-purple-700">
                            {getTypeBadge(genre.type)}
                          </Badge>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Genres Display */}
      {selectedGenres.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Selected ({selectedGenres.length}/{maxSelections})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-auto p-1 text-xs text-slate-500 hover:text-white"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map(genre => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-slate-800 text-white hover:bg-slate-700 pr-1"
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre)}
                  className="ml-2 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}