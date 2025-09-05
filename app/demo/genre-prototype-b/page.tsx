"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, X, ArrowLeft, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"

const POPULAR_GENRES = ["Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill"]

const GENRE_HIERARCHY = {
  "Hip-Hop": {
    subgenres: ["Trap", "Boom Bap", "Drill", "Cloud Rap", "Mumble Rap", "Conscious Hip-Hop"],
    microgenres: ["UK Drill", "Chicago Drill", "Memphis Rap", "Atlanta Trap", "Lo-Fi Hip-Hop"]
  },
  "Soul": {
    subgenres: ["Neo-Soul", "Memphis Soul", "Northern Soul", "Southern Soul", "Philly Soul"],
    microgenres: ["Alternative R&B", "Contemporary Gospel", "Blue-Eyed Soul"]
  },
  "Funk": {
    subgenres: ["P-Funk", "G-Funk", "Funk Rock", "Jazz-Funk", "Electro-Funk"],
    microgenres: ["New Jack Swing", "Minneapolis Sound", "Afro-Funk"]
  },
  "Afrobeat": {
    subgenres: ["Afrobeats", "Afro-Pop", "Afro-Fusion", "Highlife"],
    microgenres: ["Amapiano", "Gqom", "Afro-House", "Afro-Jazz"]
  },
  "Drill": {
    subgenres: ["UK Drill", "Chicago Drill", "New York Drill", "Australian Drill"],
    microgenres: ["Brooklyn Drill", "Bronx Drill", "South London Drill"]
  }
}

export default function GenrePrototypeB() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop", "Soul"])
  const [expandedGenres, setExpandedGenres] = useState<string[]>([])
  const [filteredGenres, setFilteredGenres] = useState(Object.keys(GENRE_HIERARCHY))
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGenres(Object.keys(GENRE_HIERARCHY))
      return
    }

    const allGenres = Object.keys(GENRE_HIERARCHY)
    const filtered = allGenres.filter(genre => {
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

  const toggleExpanded = (genre: string) => {
    setExpandedGenres(prev => 
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
      <div className="max-w-7xl mx-auto">
        
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
            Prototype B: Split-Pane Explorer
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Pane - Search & Favorites */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Search & Favorites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
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

              {/* Favorites Tree */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Favorites</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {favorites.map(genre => (
                    <div 
                      key={genre}
                      className="flex items-center justify-between p-2 bg-yellow-900/20 rounded border border-yellow-800 cursor-pointer"
                      onClick={() => toggleGenre(genre)}
                    >
                      <span className="text-yellow-300 text-sm">{genre}</span>
                      <div className="flex gap-1">
                        {selectedGenres.includes(genre) && <span className="text-green-400">✓</span>}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(genre)
                          }}
                          className="text-yellow-400 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-slate-500 text-sm">Drag genres here or click star</p>
                  )}
                </div>
              </div>

              {/* Quick Popular */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Quick Add</h4>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_GENRES.filter(g => !favorites.includes(g)).map(genre => (
                    <Button
                      key={genre}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavorite(genre)}
                      className="text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Pane - Genre Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Genre Hierarchy ({filteredGenres.length} main genres)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredGenres.map(genre => (
                    <div key={genre} className="border border-slate-700 rounded-lg overflow-hidden">
                      
                      {/* Main Genre */}
                      <div className="flex items-center justify-between p-3 bg-slate-800">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpanded(genre)}
                            className="text-slate-400 hover:text-white"
                          >
                            {expandedGenres.includes(genre) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </button>
                          <Badge
                            variant={selectedGenres.includes(genre) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedGenres.includes(genre) 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                            }`}
                            onClick={() => toggleGenre(genre)}
                          >
                            {genre}
                          </Badge>
                        </div>
                        
                        <button
                          onClick={() => toggleFavorite(genre)}
                          className="text-slate-400 hover:text-yellow-400"
                        >
                          <Star className={`h-4 w-4 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
                        </button>
                      </div>

                      {/* Subgenres & Microgenres */}
                      {expandedGenres.includes(genre) && (
                        <div className="p-3 bg-slate-850 space-y-3">
                          
                          {/* Subgenres */}
                          <div>
                            <h4 className="text-xs text-slate-400 mb-2">SUBGENRES</h4>
                            <div className="flex flex-wrap gap-1">
                              {GENRE_HIERARCHY[genre as keyof typeof GENRE_HIERARCHY]?.subgenres.map(subgenre => (
                                <Badge
                                  key={subgenre}
                                  variant={selectedGenres.includes(subgenre) ? "default" : "outline"}
                                  className={`cursor-pointer text-xs ${
                                    selectedGenres.includes(subgenre) 
                                      ? "bg-blue-500 text-white" 
                                      : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600"
                                  }`}
                                  onClick={() => toggleGenre(subgenre)}
                                >
                                  {subgenre}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Microgenres */}
                          <div>
                            <h4 className="text-xs text-slate-400 mb-2">MICROGENRES</h4>
                            <div className="flex flex-wrap gap-1">
                              {GENRE_HIERARCHY[genre as keyof typeof GENRE_HIERARCHY]?.microgenres.map(microgenre => (
                                <Badge
                                  key={microgenre}
                                  variant={selectedGenres.includes(microgenre) ? "default" : "outline"}
                                  className={`cursor-pointer text-xs ${
                                    selectedGenres.includes(microgenre) 
                                      ? "bg-purple-500 text-white" 
                                      : "bg-slate-800 border-slate-600 text-slate-500 hover:bg-slate-700"
                                  }`}
                                  onClick={() => toggleGenre(microgenre)}
                                >
                                  {microgenre}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Selected Genres Summary */}
                <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    Selected ({selectedGenres.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {selectedGenres.length > 0 ? (
                      selectedGenres.map(genre => (
                        <Badge key={genre} className="bg-blue-600 text-white">
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

                {/* Actions */}
                <div className="flex gap-2 mt-4">
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
      </div>
    </div>
  )
}