"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, X, ChevronRight, ChevronDown, BarChart3, Hash } from "lucide-react"
import { 
  getAllMainGenres, 
  searchGenres, 
  getGenreStats,
  POPULAR_GENRES,
  type Genre,
  type Subgenre,
  type Microgenre
} from "@/lib/genre-data-loader"

interface EnhancedGenreSelectorProps {
  // Selection mode
  mode?: "single" | "multi" | "three-tier"
  
  // Values
  value?: string | string[] | { primary: string[], sub: string[], micro: string[] }
  onChange?: (value: string | string[] | { primary: string[], sub: string[], micro: string[] }) => void
  
  // Configuration
  maxSelections?: number
  placeholder?: string
  showStats?: boolean
  showFavorites?: boolean
  
  // Layout
  height?: "compact" | "standard" | "expanded"
  
  // Styling
  className?: string
}

interface FavoritesManager {
  favorites: string[]
  addFavorite: (genre: string) => void
  removeFavorite: (genre: string) => void
  toggleFavorite: (genre: string) => void
}

// Simple localStorage-based favorites management
function useFavoritesManager(): FavoritesManager {
  const [favorites, setFavorites] = useState<string[]>([])
  
  useEffect(() => {
    const saved = localStorage.getItem('dsvb:genre-favorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch {
        setFavorites([])
      }
    }
  }, [])
  
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites)
    localStorage.setItem('dsvb:genre-favorites', JSON.stringify(newFavorites))
  }
  
  return {
    favorites,
    addFavorite: (genre: string) => {
      if (!favorites.includes(genre)) {
        saveFavorites([...favorites, genre])
      }
    },
    removeFavorite: (genre: string) => {
      saveFavorites(favorites.filter(f => f !== genre))
    },
    toggleFavorite: (genre: string) => {
      if (favorites.includes(genre)) {
        saveFavorites(favorites.filter(f => f !== genre))
      } else {
        saveFavorites([...favorites, genre])
      }
    }
  }
}

export function EnhancedGenreSelector({
  mode = "multi",
  value = [],
  onChange,
  maxSelections = 10,
  placeholder = "Search genres...",
  showStats = true,
  showFavorites = true,
  height = "standard",
  className = ""
}: EnhancedGenreSelectorProps) {
  
  // Parse current value based on mode
  const getCurrentSelections = (): string[] => {
    if (mode === "single") {
      return typeof value === "string" ? (value ? [value] : []) : []
    } else if (mode === "multi") {
      return Array.isArray(value) ? value : []
    } else if (mode === "three-tier") {
      const tierValue = value as { primary: string[], sub: string[], micro: string[] }
      return [...(tierValue?.primary || []), ...(tierValue?.sub || []), ...(tierValue?.micro || [])]
    }
    return []
  }

  const [selectedGenres, setSelectedGenres] = useState<string[]>(getCurrentSelections)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedGenres, setExpandedGenres] = useState<string[]>([])
  const [expandedSubgenres, setExpandedSubgenres] = useState<string[]>([])
  const [expandedMicrogenres, setExpandedMicrogenres] = useState<string[]>([])
  const [filteredResults, setFilteredResults] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const allGenres = getAllMainGenres()
  const stats = getGenreStats()
  const favoritesManagerHook = useFavoritesManager()
  const favoritesManager = showFavorites ? favoritesManagerHook : { favorites: [], toggleFavorite: () => {} }

  // Update internal state when external value changes
  useEffect(() => {
    setSelectedGenres(getCurrentSelections())
  }, [value])

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredResults([])
      return
    }

    const results = searchGenres(searchTerm)
    setFilteredResults(results)
  }, [searchTerm])

  const handleSelectionChange = (newSelections: string[]) => {
    setSelectedGenres(newSelections)
    
    if (!onChange) return
    
    if (mode === "single") {
      onChange(newSelections[0] || "")
    } else if (mode === "multi") {
      onChange(newSelections)
    } else if (mode === "three-tier") {
      // For three-tier mode, maintain current structure and just update with new selections
      const currentValue = value as { primary: string[], sub: string[], micro: string[] }
      onChange({
        primary: currentValue?.primary || [],
        sub: currentValue?.sub || [],
        micro: currentValue?.micro || []
      })
    }
  }

  const toggleSelection = (name: string) => {
    if (mode === "single") {
      handleSelectionChange([name])
      return
    }
    
    const newSelections = selectedGenres.includes(name) 
      ? selectedGenres.filter(g => g !== name)
      : selectedGenres.length < maxSelections 
        ? [...selectedGenres, name]
        : selectedGenres
    
    handleSelectionChange(newSelections)
  }

  const toggleExpanded = (id: string, level: 'genre' | 'subgenre' | 'microgenre') => {
    if (level === 'genre') {
      setExpandedGenres(prev => 
        prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
      )
    } else if (level === 'subgenre') {
      setExpandedSubgenres(prev => 
        prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
      )
    } else {
      setExpandedMicrogenres(prev => 
        prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
      )
    }
  }

  const selectMultiple = (names: string[]) => {
    const availableSlots = maxSelections - selectedGenres.length
    const newNames = names.slice(0, availableSlots).filter(n => !selectedGenres.includes(n))
    handleSelectionChange([...selectedGenres, ...newNames])
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  // Component height classes
  const heightClasses = {
    compact: "max-h-48",
    standard: "max-h-96", 
    expanded: "max-h-[600px]"
  }

  const renderMicrogenre = (microgenre: Microgenre, level = 0) => {
    const hasNested = microgenre.microgenres && microgenre.microgenres.length > 0
    const isExpanded = expandedMicrogenres.includes(microgenre.id)
    const indentClass = level > 0 ? "ml-4" : ""
    
    return (
      <div key={microgenre.id} className={indentClass}>
        <div className={`flex items-center justify-between p-2 rounded border-l-2 border-purple-600 bg-purple-900/20 mb-1`}>
          <div className="flex items-center gap-2">
            {hasNested && (
              <button
                onClick={() => toggleExpanded(microgenre.id, 'microgenre')}
                className="text-purple-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            <Badge
              variant={selectedGenres.includes(microgenre.name) ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                selectedGenres.includes(microgenre.name) 
                  ? "bg-purple-600 text-white" 
                  : "bg-purple-800/30 border-purple-600 text-purple-300 hover:bg-purple-700/40"
              }`}
              onClick={() => toggleSelection(microgenre.name)}
            >
              {microgenre.name}
            </Badge>
          </div>
          
          <div className="flex gap-1">
            {showFavorites && (
              <>
                {favoritesManager.favorites.includes(microgenre.name) && <Hash className="h-3 w-3 text-yellow-400" />}
                <button
                  onClick={() => favoritesManager.toggleFavorite(microgenre.name)}
                  className="text-purple-400 hover:text-yellow-400"
                >
                  <Star className={`h-3 w-3 ${favoritesManager.favorites.includes(microgenre.name) ? 'fill-current text-yellow-400' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {hasNested && isExpanded && (
          <div className="ml-2 space-y-1">
            {microgenre.microgenres!.map(nested => renderMicrogenre(nested, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderSubgenre = (subgenre: Subgenre, genreId: string) => {
    const isExpanded = expandedSubgenres.includes(subgenre.id)
    const hasMicrogenres = subgenre.microgenres.length > 0
    
    return (
      <div key={subgenre.id} className="ml-3">
        <div className="flex items-center justify-between p-2 rounded border-l-2 border-blue-600 bg-blue-900/20 mb-1">
          <div className="flex items-center gap-2">
            {hasMicrogenres && (
              <button
                onClick={() => toggleExpanded(subgenre.id, 'subgenre')}
                className="text-blue-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            <Badge
              variant={selectedGenres.includes(subgenre.name) ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                selectedGenres.includes(subgenre.name) 
                  ? "bg-blue-600 text-white" 
                  : "bg-blue-800/30 border-blue-600 text-blue-300 hover:bg-blue-700/40"
              }`}
              onClick={() => toggleSelection(subgenre.name)}
            >
              {subgenre.name}
            </Badge>
            {hasMicrogenres && (
              <span className="text-xs text-blue-400">({subgenre.microgenres.length})</span>
            )}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => selectMultiple(subgenre.microgenres.map(m => m.name))}
              className="text-xs text-blue-400 hover:text-white"
            >
              All
            </button>
            {showFavorites && (
              <button
                onClick={() => favoritesManager.toggleFavorite(subgenre.name)}
                className="text-blue-400 hover:text-yellow-400"
              >
                <Star className={`h-3 w-3 ${favoritesManager.favorites.includes(subgenre.name) ? 'fill-current text-yellow-400' : ''}`} />
              </button>
            )}
          </div>
        </div>
        
        {hasMicrogenres && isExpanded && (
          <div className="ml-2 space-y-1">
            {subgenre.microgenres.map(microgenre => renderMicrogenre(microgenre))}
          </div>
        )}
      </div>
    )
  }

  const renderGenre = (genre: Genre) => {
    const isExpanded = expandedGenres.includes(genre.id)
    const isPopular = POPULAR_GENRES.includes(genre.name)
    
    return (
      <div key={genre.id} className="border border-slate-700 rounded-lg overflow-hidden mb-2">
        <div className="flex items-center justify-between p-3 bg-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleExpanded(genre.id, 'genre')}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <Badge
              variant={selectedGenres.includes(genre.name) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedGenres.includes(genre.name) 
                  ? "bg-green-600 text-white" 
                  : isPopular
                    ? "bg-green-900/30 border-green-600 text-green-300 hover:bg-green-800/40"
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              }`}
              onClick={() => toggleSelection(genre.name)}
            >
              {genre.name}
              {isPopular && <span className="ml-1">⭐</span>}
            </Badge>
            <span className="text-xs text-slate-400">
              ({genre.subgenres.length} subgenres, {genre.subgenres.reduce((acc, s) => acc + s.microgenres.length, 0)} microgenres)
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => selectMultiple(genre.subgenres.map(s => s.name))}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-700 rounded"
            >
              All Subs
            </button>
            {showFavorites && (
              <button
                onClick={() => favoritesManager.toggleFavorite(genre.name)}
                className="text-slate-400 hover:text-yellow-400"
              >
                <Star className={`h-4 w-4 ${favoritesManager.favorites.includes(genre.name) ? 'fill-current text-yellow-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 bg-slate-850 space-y-2">
            {genre.subgenres.map(subgenre => renderSubgenre(subgenre, genre.id))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Pane - Search & Favorites */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-sm">Search & Favorites</CardTitle>
            {showStats && (
              <div className="text-xs text-slate-400">
                {stats.total} total genres available
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                ref={searchRef}
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  Search Results ({filteredResults.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredResults.slice(0, 20).map(result => (
                    <div
                      key={result}
                      className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:bg-slate-700"
                      onClick={() => toggleSelection(result)}
                    >
                      <span className={`text-sm ${selectedGenres.includes(result) ? 'text-green-400' : 'text-slate-300'}`}>
                        {result}
                      </span>
                      <div className="flex gap-1">
                        {selectedGenres.includes(result) && <span className="text-green-400 text-xs">✓</span>}
                        {showFavorites && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              favoritesManager.toggleFavorite(result)
                            }}
                            className="text-slate-400 hover:text-yellow-400"
                          >
                            <Star className={`h-3 w-3 ${favoritesManager.favorites.includes(result) ? 'fill-current text-yellow-400' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredResults.length > 20 && (
                    <p className="text-xs text-slate-500 p-2">
                      ... and {filteredResults.length - 20} more results
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Favorites */}
            {showFavorites && !searchTerm && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Favorites ({favoritesManager.favorites.length})</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {favoritesManager.favorites.map(genre => (
                    <div 
                      key={genre}
                      className="flex items-center justify-between p-2 bg-yellow-900/20 rounded border border-yellow-800 cursor-pointer"
                      onClick={() => toggleSelection(genre)}
                    >
                      <span className="text-yellow-300 text-sm">{genre}</span>
                      <div className="flex gap-1">
                        {selectedGenres.includes(genre) && <span className="text-green-400">✓</span>}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            favoritesManager.removeFavorite(genre)
                          }}
                          className="text-yellow-400 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {favoritesManager.favorites.length === 0 && (
                    <p className="text-slate-500 text-sm">Star genres to add favorites</p>
                  )}
                </div>
              </div>
            )}

            {/* Popular Quick Add */}
            {!searchTerm && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Popular Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_GENRES.filter(g => !selectedGenres.includes(g)).map(genre => (
                    <Button
                      key={genre}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSelection(genre)}
                      className="text-xs"
                      disabled={selectedGenres.length >= maxSelections}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Pane - Genre Hierarchy */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-sm">
                Genre Hierarchy ({allGenres.length} main genres)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`space-y-2 ${heightClasses[height]} overflow-y-auto`}>
                {allGenres.map(genre => renderGenre(genre))}
              </div>

              {/* Selected Summary */}
              <div className="mt-4 p-3 bg-slate-800 rounded-lg border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-2">
                  Selected ({selectedGenres.length}{mode !== "single" && maxSelections && `/${maxSelections}`})
                </h3>
                <div className="flex flex-wrap gap-2 min-h-[40px] max-h-24 overflow-y-auto">
                  {selectedGenres.length > 0 ? (
                    selectedGenres.map(genre => (
                      <Badge key={genre} className="bg-green-600 text-white">
                        {genre}
                        <button
                          onClick={() => toggleSelection(genre)}
                          className="ml-2 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-500">No genres selected</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {mode === "multi" && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectionChange([])}
                  >
                    Clear All
                  </Button>
                  {selectedGenres.length >= maxSelections && (
                    <div className="text-xs text-amber-400 flex items-center">
                      Max {maxSelections} genres selected
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}