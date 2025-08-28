"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Star, X, ChevronDown, ChevronRight, Music, Hash } from "lucide-react"
import { 
  getAllMainGenres, 
  searchGenres, 
  getGenreStats,
  POPULAR_GENRES,
  type Genre,
  type Subgenre,
  type Microgenre
} from "@/lib/genre-data-loader"

interface CompactGenreSelectorProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  maxSelections?: number
  placeholder?: string
  className?: string
  mode?: "single" | "multi"
}

// Simple localStorage-based favorites management
function useFavoritesManager() {
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
  
  const toggleFavorite = (genre: string) => {
    if (favorites.includes(genre)) {
      saveFavorites(favorites.filter(f => f !== genre))
    } else {
      saveFavorites([...favorites, genre])
    }
  }
  
  return { favorites, toggleFavorite }
}

export function CompactGenreSelector({
  value = [],
  onChange,
  maxSelections = 5,
  placeholder = "Select genres...",
  className = "",
  mode = "multi"
}: CompactGenreSelectorProps) {
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("popular")
  const [expandedGenres, setExpandedGenres] = useState<string[]>([])
  const [expandedSubgenres, setExpandedSubgenres] = useState<string[]>([])
  const [filteredResults, setFilteredResults] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  // Parse current selections
  const selectedGenres = Array.isArray(value) ? value : (value ? [value] : [])
  
  const allGenres = getAllMainGenres()
  const stats = getGenreStats()
  const { favorites, toggleFavorite } = useFavoritesManager()

  useEffect(() => {
    if (!searchTerm) {
      setFilteredResults([])
      return
    }

    const results = searchGenres(searchTerm)
    setFilteredResults(results)
  }, [searchTerm])

  const handleSelectionChange = (newSelections: string[]) => {
    if (!onChange) return
    
    if (mode === "single") {
      onChange(newSelections[0] || "")
    } else {
      onChange(newSelections)
    }
  }

  const toggleSelection = (name: string) => {
    if (mode === "single") {
      handleSelectionChange([name])
      setIsOpen(false) // Close on single selection
      return
    }
    
    const newSelections = selectedGenres.includes(name) 
      ? selectedGenres.filter(g => g !== name)
      : selectedGenres.length < maxSelections 
        ? [...selectedGenres, name]
        : selectedGenres
    
    handleSelectionChange(newSelections)
  }

  const toggleAccordion = (genreId: string) => {
    setExpandedGenres(prev =>
      prev.includes(genreId) ? prev.filter(g => g !== genreId) : [...prev, genreId]
    )
  }

  const toggleSubgenreAccordion = (subgenreId: string) => {
    setExpandedSubgenres(prev =>
      prev.includes(subgenreId) ? prev.filter(g => g !== subgenreId) : [...prev, subgenreId]
    )
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  const getDisplayText = () => {
    if (selectedGenres.length === 0) return placeholder
    if (selectedGenres.length === 1) return selectedGenres[0]
    if (selectedGenres.length <= 3) return selectedGenres.join(", ")
    return `${selectedGenres.slice(0, 2).join(", ")} +${selectedGenres.length - 2} more`
  }

  const renderMicrogenres = (microgenres: Microgenre[], subgenreId: string) => {
    return (
      <div className="ml-6 mt-2 space-y-1">
        {microgenres.map(microgenre => (
          <div
            key={microgenre.id}
            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
              selectedGenres.includes(microgenre.name)
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-800/30"
            }`}
            onClick={() => toggleSelection(microgenre.name)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{microgenre.name}</span>
              {microgenre.microgenres && microgenre.microgenres.length > 0 && (
                <span className="text-xs text-purple-400">({microgenre.microgenres.length})</span>
              )}
            </div>
            
            <div className="flex gap-1">
              {selectedGenres.includes(microgenre.name) && <span className="text-green-400 text-xs">✓</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(microgenre.name)
                }}
                className="text-purple-400 hover:text-yellow-400"
              >
                <Star className={`h-2 w-2 ${favorites.includes(microgenre.name) ? 'fill-current text-yellow-400' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderSubgenre = (subgenre: Subgenre, genreId: string) => {
    const isExpanded = expandedSubgenres.includes(subgenre.id)
    const hasMicrogenres = subgenre.microgenres.length > 0
    const isSelected = selectedGenres.includes(subgenre.name)
    
    return (
      <div key={subgenre.id} className="mb-2">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/70 border border-slate-700 hover:bg-slate-700/70">
          <div className="flex items-center gap-3 flex-1">
            {hasMicrogenres && (
              <button
                onClick={() => toggleSubgenreAccordion(subgenre.id)}
                className="text-blue-400 hover:text-white p-1"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            
            <Badge
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer text-sm px-3 py-1 ${
                isSelected 
                  ? "bg-blue-600 text-white" 
                  : "bg-blue-800/30 border-blue-600 text-blue-300 hover:bg-blue-700/40"
              }`}
              onClick={() => toggleSelection(subgenre.name)}
            >
              {subgenre.name}
            </Badge>
            
            {hasMicrogenres && (
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {subgenre.microgenres.length} microgenres
              </span>
            )}
          </div>
          
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => toggleFavorite(subgenre.name)}
              className="text-blue-400 hover:text-yellow-400 p-1"
            >
              <Star className={`h-3 w-3 ${favorites.includes(subgenre.name) ? 'fill-current text-yellow-400' : ''}`} />
            </button>
          </div>
        </div>
        
        {hasMicrogenres && isExpanded && renderMicrogenres(subgenre.microgenres, subgenre.id)}
      </div>
    )
  }

  const renderGenreAccordion = (genre: Genre) => {
    const isExpanded = expandedGenres.includes(genre.id)
    const isPopular = POPULAR_GENRES.includes(genre.name)
    const isSelected = selectedGenres.includes(genre.name)
    
    return (
      <div key={genre.id} className="mb-3">
        <Collapsible open={isExpanded} onOpenChange={() => toggleAccordion(genre.id)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto p-4 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer text-sm px-3 py-1 ${
                    isSelected 
                      ? "bg-green-600 text-white" 
                      : isPopular
                        ? "bg-green-900/30 border-green-600 text-green-300"
                        : "bg-slate-700 border-slate-600 text-slate-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelection(genre.name)
                  }}
                >
                  {genre.name}
                  {isPopular && <span className="ml-1">⭐</span>}
                </Badge>
                
                <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {genre.subgenres.length} subgenres • {genre.subgenres.reduce((acc, s) => acc + s.microgenres.length, 0)} microgenres
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(genre.name)
                  }}
                  className="text-slate-400 hover:text-yellow-400 p-1"
                >
                  <Star className={`h-4 w-4 ${favorites.includes(genre.name) ? 'fill-current text-yellow-400' : ''}`} />
                </button>
                <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-2 py-3 space-y-3">
              {genre.subgenres.map(subgenre => renderSubgenre(subgenre, genre.id))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <div className={className}>
      
      {/* Compact Display */}
      <div className="space-y-2">
        
        {/* Selected Genres Display */}
        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedGenres.map(genre => (
              <Badge key={genre} className="bg-blue-600 text-white text-xs">
                {genre}
                <button
                  onClick={() => {
                    const newSelections = selectedGenres.filter(g => g !== genre)
                    handleSelectionChange(newSelections)
                  }}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Trigger Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-10 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="truncate">{getDisplayText()}</span>
              </div>
              <div className="flex items-center gap-1">
                {selectedGenres.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedGenres.length}/{maxSelections}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-96 bg-slate-900 border-slate-700">
            <SheetHeader>
              <SheetTitle className="text-white">Select Genres</SheetTitle>
              <div className="text-sm text-slate-400">
                {stats.total} genres • {selectedGenres.length}/{maxSelections} selected
              </div>
            </SheetHeader>

            <div className="space-y-4 mt-6">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  ref={searchRef}
                  placeholder="Search genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white"
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
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    Results ({filteredResults.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredResults.slice(0, 30).map(result => (
                      <div
                        key={result}
                        className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                          selectedGenres.includes(result)
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}
                        onClick={() => toggleSelection(result)}
                      >
                        <span className="text-sm">{result}</span>
                        <div className="flex gap-1">
                          {selectedGenres.includes(result) && <span className="text-green-400 text-xs">✓</span>}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(result)
                            }}
                            className="text-slate-400 hover:text-yellow-400"
                          >
                            <Star className={`h-3 w-3 ${favorites.includes(result) ? 'fill-current text-yellow-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabbed Interface - Only when not searching */}
              {!searchTerm && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full bg-slate-800">
                    <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
                    <TabsTrigger value="favorites" className="text-xs">Favorites</TabsTrigger>
                    <TabsTrigger value="all" className="text-xs">All Genres</TabsTrigger>
                  </TabsList>

                  <div className="max-h-80 overflow-y-auto mt-4">
                    <TabsContent value="popular" className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {POPULAR_GENRES.map(genre => (
                          <Button
                            key={genre}
                            variant={selectedGenres.includes(genre) ? "default" : "outline"}
                            className={`justify-between h-12 px-4 ${
                              selectedGenres.includes(genre) 
                                ? "bg-green-600 text-white hover:bg-green-700" 
                                : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                            }`}
                            onClick={() => toggleSelection(genre)}
                            disabled={!selectedGenres.includes(genre) && selectedGenres.length >= maxSelections}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{genre}</span>
                              {selectedGenres.includes(genre) && (
                                <Badge variant="secondary" className="bg-green-800 text-green-200 text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {selectedGenres.includes(genre) && <span className="text-green-300">✓</span>}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(genre)
                                }}
                                className="hover:text-yellow-400 p-1"
                              >
                                <Star className={`h-3 w-3 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
                              </button>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="favorites">
                      {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {favorites.map(genre => (
                            <Button
                              key={genre}
                              variant={selectedGenres.includes(genre) ? "default" : "outline"}
                              className={`justify-start h-10 ${
                                selectedGenres.includes(genre) 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-yellow-900/20 border-yellow-600 text-yellow-300 hover:bg-yellow-800/30"
                              }`}
                              onClick={() => toggleSelection(genre)}
                              disabled={!selectedGenres.includes(genre) && selectedGenres.length >= maxSelections}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{genre}</span>
                                <div className="flex gap-1">
                                  {selectedGenres.includes(genre) && <span className="text-green-400">✓</span>}
                                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-center py-8 text-sm">
                          No favorites yet. Star some genres to save them here!
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="all">
                      <div className="space-y-2">
                        {allGenres.map(genre => renderGenreAccordion(genre))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              )}

              {/* Current Selection Summary */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">
                    Selected ({selectedGenres.length}/{maxSelections})
                  </h3>
                  {selectedGenres.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectionChange([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[40px] max-h-24 overflow-y-auto">
                  {selectedGenres.length > 0 ? (
                    selectedGenres.map(genre => (
                      <Badge key={genre} className="bg-blue-600 text-white text-xs">
                        {genre}
                        <button
                          onClick={() => toggleSelection(genre)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No genres selected</span>
                  )}
                </div>
              </div>

              {/* Done Button */}
              <div className="border-t border-slate-700 pt-4">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Done ({selectedGenres.length} selected)
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}