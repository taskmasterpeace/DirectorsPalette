"use client"

import { useState, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { genreDatabase } from "@/lib/genre-data-loader"

interface GenreOption {
  id: string
  name: string
  type: "genre" | "subgenre" | "microgenre"
  parent?: string
  parentName?: string
}

interface GenreCommandMultiProps {
  primaryGenres: string[]
  subGenres: string[]
  microGenres: string[]
  onPrimaryGenresChange: (genres: string[]) => void
  onSubGenresChange: (genres: string[]) => void
  onMicroGenresChange: (genres: string[]) => void
  className?: string
}

// Flatten the genre structure for searching
function flattenGenres(): GenreOption[] {
  const options: GenreOption[] = []
  
  genreDatabase.genres.forEach(genre => {
    // Add main genre
    options.push({
      id: genre.id,
      name: genre.name,
      type: "genre"
    })
    
    // Add subgenres
    genre.subgenres.forEach(subgenre => {
      options.push({
        id: `${genre.id}-${subgenre.id}`, // Use compound ID to ensure uniqueness
        name: subgenre.name,
        type: "subgenre",
        parent: genre.id,
        parentName: genre.name
      })
      
      // Add microgenres
      subgenre.microgenres.forEach(microgenre => {
        options.push({
          id: `${genre.id}-${subgenre.id}-${microgenre.id}`, // Use compound ID
          name: microgenre.name,
          type: "microgenre",
          parent: subgenre.id,
          parentName: subgenre.name
        })
        
        // Handle nested microgenres (like drill variants under Trap)
        if (microgenre.microgenres) {
          microgenre.microgenres.forEach(nestedMicro => {
            options.push({
              id: `${genre.id}-${subgenre.id}-${microgenre.id}-${nestedMicro.id}`, // Fully unique ID
              name: nestedMicro.name,
              type: "microgenre",
              parent: microgenre.id,
              parentName: microgenre.name
            })
          })
        }
      })
    })
  })
  
  return options
}

const POPULAR_BY_TYPE = {
  genres: ["Hip-Hop/Rap", "Pop", "R&B/Soul", "Rock", "Electronic/EDM", "Country", "Blues", "Jazz", "Folk", "Reggae"],
  subgenres: ["Trap", "Alternative R&B", "Neo-Soul", "Indie Pop", "Contemporary R&B", "Electropop", "Gangsta Rap", "Conscious Rap", "Boom Bap", "Memphis Rap"],
  microgenres: ["Brooklyn Drill", "UK Drill", "Chicago Drill", "Melodic Trap Soul", "Dark R&B", "Lo-Fi Hip-Hop", "Phonk", "Latin Trap", "Country Trap", "Gospel Trap"]
}

export function GenreCommandMulti({
  primaryGenres,
  subGenres,
  microGenres,
  onPrimaryGenresChange,
  onSubGenresChange,
  onMicroGenresChange,
  className
}: GenreCommandMultiProps) {
  const [primaryOpen, setPrimaryOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [microOpen, setMicroOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const allGenres = useMemo(() => flattenGenres(), [])

  const getFilteredGenres = (type: "genre" | "subgenre" | "microgenre", searchTerm: string) => {
    const genresOfType = allGenres.filter(g => g.type === type)
    
    if (!searchTerm) {
      // Show popular genres first, then all others
      const popular = genresOfType.filter(g => POPULAR_BY_TYPE[type + 's' as keyof typeof POPULAR_BY_TYPE].includes(g.name))
      const others = genresOfType.filter(g => !POPULAR_BY_TYPE[type + 's' as keyof typeof POPULAR_BY_TYPE].includes(g.name))
      return [...popular, ...others].slice(0, 50) // Show more options
    }
    
    return genresOfType.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50) // Increased limit for better search
  }

  const handleGenreSelect = (genreName: string, type: "genre" | "subgenre" | "microgenre") => {
    switch (type) {
      case "genre":
        if (primaryGenres.includes(genreName)) {
          onPrimaryGenresChange(primaryGenres.filter(g => g !== genreName))
        } else if (primaryGenres.length < 5) {
          onPrimaryGenresChange([...primaryGenres, genreName])
        }
        break
      case "subgenre":
        if (subGenres.includes(genreName)) {
          onSubGenresChange(subGenres.filter(g => g !== genreName))
        } else if (subGenres.length < 8) {
          onSubGenresChange([...subGenres, genreName])
        }
        break
      case "microgenre":
        if (microGenres.includes(genreName)) {
          onMicroGenresChange(microGenres.filter(g => g !== genreName))
        } else if (microGenres.length < 10) {
          onMicroGenresChange([...microGenres, genreName])
        }
        break
    }
  }

  const removeGenre = (genreName: string, type: "genre" | "subgenre" | "microgenre") => {
    switch (type) {
      case "genre":
        onPrimaryGenresChange(primaryGenres.filter(g => g !== genreName))
        break
      case "subgenre":
        onSubGenresChange(subGenres.filter(g => g !== genreName))
        break
      case "microgenre":
        onMicroGenresChange(microGenres.filter(g => g !== genreName))
        break
    }
  }

  const GenreSelector = ({ 
    type, 
    selectedGenres, 
    isOpen, 
    setIsOpen, 
    maxCount,
    title,
    placeholder 
  }: {
    type: "genre" | "subgenre" | "microgenre"
    selectedGenres: string[]
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    maxCount: number
    title: string
    placeholder: string
  }) => {
    const [localSearch, setLocalSearch] = useState("")
    const filteredGenres = getFilteredGenres(type, localSearch)
    const canAddMore = selectedGenres.length < maxCount

    const getTypeColor = () => {
      switch (type) {
        case "genre": return "green"
        case "subgenre": return "blue" 
        case "microgenre": return "purple"
        default: return "slate"
      }
    }

    const color = getTypeColor()

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-300">{title}</label>
          <span className="text-xs text-slate-500">({selectedGenres.length}/{maxCount})</span>
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between bg-slate-900 border-slate-700 text-white hover:bg-slate-800 h-10",
                selectedGenres.length > 0 && color === "green" && "border-green-600",
                selectedGenres.length > 0 && color === "blue" && "border-blue-600",
                selectedGenres.length > 0 && color === "purple" && "border-purple-600"
              )}
              disabled={!canAddMore && selectedGenres.length === 0}
            >
              <span className="truncate">
                {selectedGenres.length > 0 
                  ? `${selectedGenres.length} selected`
                  : placeholder
                }
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[320px] p-0 bg-slate-900 border-slate-700" align="start">
            <Command className="bg-slate-900">
              <CommandInput
                placeholder="Search genres..."
                value={localSearch}
                onValueChange={setLocalSearch}
                className="bg-slate-900 border-0 text-white"
              />
              <CommandList className="max-h-[200px]">
                <CommandEmpty className="text-slate-400 text-sm py-4 text-center">
                  No genres found.
                </CommandEmpty>
                
                <CommandGroup>
                  {filteredGenres.map(genre => {
                    const isSelected = selectedGenres.includes(genre.name)
                    const canSelect = canAddMore || isSelected
                    
                    return (
                      <CommandItem
                        key={genre.id} // Now uses unique compound IDs
                        onSelect={() => handleGenreSelect(genre.name, type)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && color === "green" && "bg-green-900/30 text-green-300",
                          isSelected && color === "blue" && "bg-blue-900/30 text-blue-300",
                          isSelected && color === "purple" && "bg-purple-900/30 text-purple-300",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {isSelected ? (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                color === "green" && "bg-green-500",
                                color === "blue" && "bg-blue-500", 
                                color === "purple" && "bg-purple-500"
                              )} />
                            ) : (
                              <div className="w-3 h-3 border border-slate-500 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">{genre.name}</div>
                            {genre.parentName && (
                              <div className="text-xs text-slate-500">in {genre.parentName}</div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Genres */}
        {selectedGenres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedGenres.map(genre => (
              <Badge
                key={genre}
                variant="secondary"
                className={cn(
                  "text-xs pr-1",
                  type === "genre" && "bg-green-900/30 text-green-300 border-green-700",
                  type === "subgenre" && "bg-blue-900/30 text-blue-300 border-blue-700", 
                  type === "microgenre" && "bg-purple-900/30 text-purple-300 border-purple-700"
                )}
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre, type)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <GenreSelector
        type="genre"
        selectedGenres={primaryGenres}
        isOpen={primaryOpen}
        setIsOpen={setPrimaryOpen}
        maxCount={5}
        title="Primary Genres *"
        placeholder="Select main genres..."
      />
      
      <GenreSelector
        type="subgenre"
        selectedGenres={subGenres}
        isOpen={subOpen}
        setIsOpen={setSubOpen}
        maxCount={8}
        title="Subgenres"
        placeholder="Select subgenres..."
      />
      
      <GenreSelector
        type="microgenre"
        selectedGenres={microGenres}
        isOpen={microOpen}
        setIsOpen={setMicroOpen}
        maxCount={10}
        title="Microgenres"
        placeholder="Select microgenres..."
      />

      {/* Summary */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">Genre Selection Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-slate-400">
            Total: {primaryGenres.length + subGenres.length + microGenres.length} genres selected
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div>• {primaryGenres.length}/5 primary genres</div>
            <div>• {subGenres.length}/8 subgenres</div>
            <div>• {microGenres.length}/10 microgenres</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}