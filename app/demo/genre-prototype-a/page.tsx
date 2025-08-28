"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, X, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Updated popular genres based on requirements
const POPULAR_GENRES = [
  "Hip-Hop",
  "Soul", 
  "Funk",
  "Afrobeat", 
  "Drill"
]

const ALL_GENRES = [
  "Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill", "Trap", "R&B", "Neo-Soul",
  "Alternative R&B", "Experimental Hip-Hop", "UK Drill", "Chicago Drill", 
  "Afro-Pop", "Dancehall", "Reggaeton", "Latin Trap", "Boom Bap", "Lo-Fi Hip-Hop",
  "Cloud Rap", "Mumble Rap", "Conscious Hip-Hop", "Gospel", "Contemporary Gospel",
  "Blues", "Electric Blues", "Delta Blues", "Chicago Blues", "Memphis Soul",
  "Northern Soul", "Southern Soul", "Philly Soul", "Motown", "P-Funk",
  "G-Funk", "Funk Rock", "Jazz-Funk", "Electro-Funk", "Afrobeats", "Afro-Fusion",
  "Highlife", "Amapiano", "Gqom", "Baile Funk", "UK Garage", "Grime",
  "Breakbeat", "Drum & Bass", "Dubstep", "Future Bass", "Synthwave",
  "Vaporwave", "House", "Deep House", "Tech House", "Progressive House"
]

export default function GenrePrototypeA() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop", "Soul"])
  const [filteredGenres, setFilteredGenres] = useState<string[]>(ALL_GENRES)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGenres(ALL_GENRES)
      return
    }

    const filtered = ALL_GENRES.filter(genre => {
      // Support wildcards and quotes
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

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        
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
            Prototype A: Smart Tags with Favorites Bar
          </h1>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Genre Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Favorites Bar */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-slate-300">Favorites</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.map(genre => (
                  <Badge 
                    key={genre}
                    variant="outline"
                    className="bg-yellow-900/20 border-yellow-400 text-yellow-300 cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {genre}
                    {selectedGenres.includes(genre) && <span className="ml-1">✓</span>}
                  </Badge>
                ))}
                {favorites.length === 0 && (
                  <span className="text-slate-500 text-sm">No favorites yet. Star genres below to add them.</span>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                ref={searchRef}
                placeholder="Search genres... (use * for wildcards, &quot;quotes&quot; for exact)"
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

            {/* Popular Genres */}
            {!searchTerm && (
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Popular Genres</h3>
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
            )}

            {/* All Genres Grid */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                {searchTerm ? `Search Results (${filteredGenres.length})` : "All Genres"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {filteredGenres.map(genre => (
                  <Badge 
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer transition-all justify-between ${
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
                  <span className="text-slate-500">No genres selected</span>
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
      </div>
    </div>
  )
}