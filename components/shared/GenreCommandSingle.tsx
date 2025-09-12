"use client"

import { useState, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { GENRE_STRUCTURE } from "@/lib/enhanced-genres"

interface GenreOption {
  id: string
  name: string
  type: "genre" | "subgenre" | "microgenre"
  parent?: string
  parentName?: string
}

interface GenreCommandSingleProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
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
  "Hip-Hop/Rap", "Pop", "R&B/Soul", "Rock", "Electronic/EDM", "Country", "Jazz",
  "Trap", "Alternative R&B", "Neo-Soul", "Indie Pop", "Folk-Pop"
]

export function GenreCommandSingle({
  value = "",
  onChange,
  placeholder = "Select genre...",
  className,
  triggerClassName
}: GenreCommandSingleProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const allGenres = useMemo(() => flattenGenres(), [])

  // Filter genres based on search
  const filteredGenres = useMemo(() => {
    if (!search) {
      return allGenres.filter(g => POPULAR_GENRES.includes(g.name)).slice(0, 12)
    }
    
    return allGenres.filter(genre => 
      genre.name.toLowerCase().includes(search.toLowerCase()) ||
      genre.parentName?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 30)
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
    onChange?.(genreName)
    setOpen(false)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "genre": return "G"
      case "subgenre": return "S"
      case "microgenre": return "M"
      default: return ""
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "genre": return "bg-green-900/30 text-green-400 border-green-700"
      case "subgenre": return "bg-blue-900/30 text-blue-400 border-blue-700"
      case "microgenre": return "bg-purple-900/30 text-purple-400 border-purple-700"
      default: return "bg-slate-700 text-slate-400 border-slate-600"
    }
  }

  const selectedGenre = allGenres.find(g => g.name === value)

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
              {value || placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[350px] p-0 bg-slate-900 border-slate-700" align="start">
          <Command className="bg-slate-900">
            <CommandInput
              placeholder="Search genres..."
              value={search}
              onValueChange={setSearch}
              className="bg-slate-900 border-0 text-white"
            />
            <CommandList className="max-h-[280px]">
              <CommandEmpty className="text-slate-400 text-sm py-6 text-center">
                No genres found.
              </CommandEmpty>
              
              {!search && (
                <CommandGroup heading="Popular">
                  {POPULAR_GENRES.map(genreName => {
                    const genre = allGenres.find(g => g.name === genreName)
                    const isSelected = value === genreName
                    
                    return (
                      <CommandItem
                        key={genreName}
                        onSelect={() => handleSelect(genreName)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isSelected && <Check className="w-3 h-3 text-green-400" />}
                          </div>
                          <span className="flex-1">{genreName}</span>
                          {genre && (
                            <Badge variant="outline" className={cn("text-xs", getBadgeColor(genre.type))}>
                              {getTypeBadge(genre.type)}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {search && groupedResults.genres.length > 0 && (
                <CommandGroup heading="Main Genres">
                  {groupedResults.genres.map(genre => {
                    const isSelected = value === genre.name
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isSelected && <Check className="w-3 h-3 text-green-400" />}
                          </div>
                          <span className="flex-1">{genre.name}</span>
                          <Badge variant="outline" className={cn("text-xs", getBadgeColor(genre.type))}>
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
                    const isSelected = value === genre.name
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <div>{genre.name}</div>
                            {genre.parentName && (
                              <div className="text-xs text-slate-500">in {genre.parentName}</div>
                            )}
                          </div>
                          <Badge variant="outline" className={cn("text-xs", getBadgeColor(genre.type))}>
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
                    const isSelected = value === genre.name
                    
                    return (
                      <CommandItem
                        key={genre.id}
                        onSelect={() => handleSelect(genre.name)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <div>{genre.name}</div>
                            {genre.parentName && (
                              <div className="text-xs text-slate-500">in {genre.parentName}</div>
                            )}
                          </div>
                          <Badge variant="outline" className={cn("text-xs", getBadgeColor(genre.type))}>
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
    </div>
  )
}