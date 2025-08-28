"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Star, X, ArrowLeft, ChevronDown, ChevronUp, Plus, Sparkles } from "lucide-react"
import Link from "next/link"

const POPULAR_GENRES = ["Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill"]

const SMART_SUGGESTIONS = {
  "Hip-Hop": ["Trap", "Drill", "Conscious Hip-Hop"],
  "Soul": ["Neo-Soul", "R&B", "Gospel"],
  "Funk": ["P-Funk", "G-Funk", "Jazz-Funk"],
  "Afrobeat": ["Afrobeats", "Amapiano", "Afro-Pop"],
  "Drill": ["UK Drill", "Chicago Drill", "New York Drill"]
}

const ALL_GENRES = [
  "Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill", "Trap", "R&B", "Neo-Soul",
  "Alternative R&B", "Experimental Hip-Hop", "UK Drill", "Chicago Drill", 
  "Afro-Pop", "Dancehall", "Reggaeton", "Latin Trap", "Boom Bap", "Lo-Fi Hip-Hop",
  "Cloud Rap", "Mumble Rap", "Conscious Hip-Hop", "Gospel", "Contemporary Gospel",
  "Blues", "Electric Blues", "Delta Blues", "Chicago Blues", "Memphis Soul",
  "Northern Soul", "Southern Soul", "Philly Soul", "Motown", "P-Funk",
  "G-Funk", "Funk Rock", "Jazz-Funk", "Electro-Funk", "Afrobeats", "Afro-Fusion",
  "Highlife", "Amapiano", "Gqom", "Baile Funk", "UK Garage", "Grime"
]

export default function GenrePrototypeD() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop", "Soul"])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [filteredGenres, setFilteredGenres] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGenres([])
      return
    }

    const filtered = ALL_GENRES.filter(genre => {
      if (searchTerm.includes('"')) {
        const quoted = searchTerm.replace(/"/g, '')
        return genre.toLowerCase().includes(quoted.toLowerCase())
      }
      
      if (searchTerm.includes('*')) {
        const pattern = searchTerm.replace(/\*/g, '.*')
        const regex = new RegExp(pattern, 'i')
        return regex.test(genre)
      }

      return genre.toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredGenres(filtered)
  }, [searchTerm])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const toggleFavorite = (genre: string) => {
    setFavorites(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const getSmartSuggestions = () => {
    const suggestions = new Set<string>()
    
    selectedGenres.forEach(genre => {
      if (SMART_SUGGESTIONS[genre as keyof typeof SMART_SUGGESTIONS]) {
        SMART_SUGGESTIONS[genre as keyof typeof SMART_SUGGESTIONS].forEach(suggestion => {
          if (!selectedGenres.includes(suggestion)) {
            suggestions.add(suggestion)
          }
        })
      }
    })
    
    return Array.from(suggestions)
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  const smartSuggestions = getSmartSuggestions()

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/demo">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Demo Index
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Music Video
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Prototype D: Inline Expandable
          </h1>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Genre Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Compact Initial View */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-slate-300">Popular Genres</span>
                <Badge variant="outline" className="text-xs">
                  Quick Select
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_GENRES.map(genre => (
                  <Badge 
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedGenres.includes(genre) 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(genre)
                      }}
                      className="ml-2 hover:text-yellow-400"
                    >
                      <Star className={`h-3 w-3 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && showSuggestions && (
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Smart Suggestions</span>
                    <Badge variant="outline" className="text-xs border-purple-600 text-purple-300">
                      Based on your selection
                    </Badge>
                  </div>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {smartSuggestions.map(genre => (
                    <Badge 
                      key={genre}
                      variant="outline"
                      className="cursor-pointer bg-purple-900/30 border-purple-600 text-purple-300 hover:bg-purple-800/40"
                      onClick={() => toggleGenre(genre)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Quick Access */}
            {favorites.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Your Favorites</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorites.map(genre => (
                    <Badge 
                      key={genre}
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedGenres.includes(genre) 
                          ? "bg-blue-600 text-white" 
                          : "bg-yellow-900/20 border-yellow-600 text-yellow-300 hover:bg-yellow-800/30"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                      {selectedGenres.includes(genre) && <span className="ml-1">✓</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable Advanced Section */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Advanced Genre Search</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    ref={searchRef}
                    placeholder="Search all genres... (use * for wildcards, &quot;quotes&quot; for exact)"
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
                    <h4 className="text-sm font-medium text-slate-300 mb-3">
                      Search Results ({filteredGenres.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {filteredGenres.map(genre => (
                        <Badge 
                          key={genre}
                          variant={selectedGenres.includes(genre) ? "default" : "outline"}
                          className={`cursor-pointer justify-between ${
                            selectedGenres.includes(genre) 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                          }`}
                          onClick={() => toggleGenre(genre)}
                        >
                          <span className="truncate">{genre}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(genre)
                            }}
                            className="ml-1 hover:text-yellow-400 flex-shrink-0"
                          >
                            <Star className={`h-3 w-3 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Genres (when not searching) */}
                {!searchTerm && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">
                      All Available Genres
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {ALL_GENRES.map(genre => (
                        <Badge 
                          key={genre}
                          variant={selectedGenres.includes(genre) ? "default" : "outline"}
                          className={`cursor-pointer justify-between ${
                            selectedGenres.includes(genre) 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                          }`}
                          onClick={() => toggleGenre(genre)}
                        >
                          <span className="truncate">{genre}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(genre)
                            }}
                            className="ml-1 hover:text-yellow-400 flex-shrink-0"
                          >
                            <Star className={`h-3 w-3 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              </CollapsibleContent>
            </Collapsible>

            {/* Selected Genres Display */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                Selected Genres ({selectedGenres.length})
              </h3>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-800 rounded-lg min-h-[60px]">
                {selectedGenres.length > 0 ? (
                  selectedGenres.map(genre => (
                    <Badge 
                      key={genre}
                      className="bg-blue-600 text-white"
                    >
                      {genre}
                      <button
                        onClick={() => toggleGenre(genre)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500">Select genres from the options above</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedGenres([])}>
                Clear All
              </Button>
              <Button onClick={() => console.log('Selected:', selectedGenres)}>
                Apply Selection ({selectedGenres.length})
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Progressive Disclosure Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• <strong>Compact Start:</strong> Popular genres visible immediately</p>
            <p>• <strong>Smart Suggestions:</strong> AI-powered genre recommendations based on selection</p>
            <p>• <strong>Quick Favorites:</strong> One-click access to starred genres</p>
            <p>• <strong>Expandable Search:</strong> Advanced features hidden until needed</p>
            <p>• <strong>Progressive Complexity:</strong> Simple to advanced in logical steps</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}