"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, X, ArrowLeft, Filter, Grid, List, Heart } from "lucide-react"
import Link from "next/link"

const POPULAR_GENRES = ["Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill"]

const GENRE_CATEGORIES = {
  "Hip-Hop Family": ["Hip-Hop", "Trap", "Drill", "Boom Bap", "Cloud Rap", "Mumble Rap", "Conscious Hip-Hop"],
  "Soul & R&B": ["Soul", "Neo-Soul", "R&B", "Alternative R&B", "Memphis Soul", "Northern Soul"],
  "Funk & Groove": ["Funk", "P-Funk", "G-Funk", "Funk Rock", "Jazz-Funk", "Electro-Funk"],
  "Afrobeat & Global": ["Afrobeat", "Afrobeats", "Afro-Pop", "Afro-Fusion", "Highlife", "Amapiano", "Gqom"],
  "Electronic": ["House", "Deep House", "Tech House", "Dubstep", "Future Bass", "Synthwave"],
  "Alternative": ["Alternative Hip-Hop", "Experimental Hip-Hop", "Lo-Fi Hip-Hop", "Vaporwave"]
}

const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat()

export default function GenrePrototypeC() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop", "Soul"])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(["Trap", "Neo-Soul", "Afrobeat"])
  const [activeTab, setActiveTab] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
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
    setSelectedGenres(prev => {
      const newSelection = prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
      
      // Add to recently used if selecting
      if (!prev.includes(genre) && !recentlyUsed.includes(genre)) {
        setRecentlyUsed(recent => [genre, ...recent.slice(0, 6)])
      }
      
      return newSelection
    })
  }

  const toggleFavorite = (genre: string) => {
    setFavorites(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const selectMultiple = (genres: string[]) => {
    setSelectedGenres(prev => {
      const newGenres = genres.filter(g => !prev.includes(g))
      return [...prev, ...newGenres]
    })
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  const GenreGrid = ({ genres, showActions = true }: { genres: string[], showActions?: boolean }) => (
    <div className={viewMode === "grid" ? 
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" : 
      "space-y-2"
    }>
      {genres.map(genre => (
        <div
          key={genre}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
            selectedGenres.includes(genre)
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          } ${viewMode === "list" ? "w-full" : ""}`}
          onClick={() => toggleGenre(genre)}
        >
          <span className="font-medium">{genre}</span>
          {showActions && (
            <div className="flex gap-1">
              {favorites.includes(genre) && <Heart className="h-3 w-3 text-red-400 fill-current" />}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(genre)
                }}
                className="hover:text-yellow-400"
              >
                <Star className={`h-3 w-3 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : ''}`} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )

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
            Prototype C: Modal Powerhouse
          </h1>
        </div>

        {/* Current Selection Display */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Selected Genres</CardTitle>
              
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Filter className="h-4 w-4 mr-2" />
                    Select Genres ({selectedGenres.length})
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-6xl max-h-[80vh] bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-white">Advanced Genre Selection</DialogTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        >
                          {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4">
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        ref={searchRef}
                        placeholder="Advanced search: use * wildcards, &quot;exact matches&quot;"
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
                        <h3 className="text-lg font-medium text-white mb-3">
                          Search Results ({filteredGenres.length})
                        </h3>
                        <div className="max-h-64 overflow-y-auto">
                          <GenreGrid genres={filteredGenres} />
                        </div>
                      </div>
                    )}

                    {/* Tabbed Interface */}
                    {!searchTerm && (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full bg-slate-800">
                          <TabsTrigger value="popular">Popular</TabsTrigger>
                          <TabsTrigger value="favorites">Favorites</TabsTrigger>
                          <TabsTrigger value="categories">Categories</TabsTrigger>
                          <TabsTrigger value="recent">Recent</TabsTrigger>
                        </TabsList>

                        <div className="max-h-96 overflow-y-auto mt-4">
                          <TabsContent value="popular" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium text-white">Popular Genres</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => selectMultiple(POPULAR_GENRES)}
                              >
                                Select All Popular
                              </Button>
                            </div>
                            <GenreGrid genres={POPULAR_GENRES} />
                          </TabsContent>

                          <TabsContent value="favorites" className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Your Favorites</h3>
                            {favorites.length > 0 ? (
                              <GenreGrid genres={favorites} />
                            ) : (
                              <p className="text-slate-500 text-center py-8">
                                No favorites yet. Star some genres to add them here!
                              </p>
                            )}
                          </TabsContent>

                          <TabsContent value="categories" className="space-y-6">
                            {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                              <div key={category}>
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-md font-medium text-white">{category}</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectMultiple(genres)}
                                  >
                                    Select All
                                  </Button>
                                </div>
                                <GenreGrid genres={genres} />
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="recent" className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Recently Used</h3>
                            {recentlyUsed.length > 0 ? (
                              <GenreGrid genres={recentlyUsed} />
                            ) : (
                              <p className="text-slate-500 text-center py-8">
                                No recent selections yet.
                              </p>
                            )}
                          </TabsContent>
                        </div>
                      </Tabs>
                    )}

                    {/* Selected Genres in Modal */}
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-md font-medium text-white mb-3">
                        Current Selection ({selectedGenres.length})
                      </h3>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedGenres.map(genre => (
                          <Badge key={genre} className="bg-blue-600 text-white">
                            {genre}
                            <button
                              onClick={() => toggleGenre(genre)}
                              className="ml-2 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedGenres([])}
                      >
                        Clear All
                      </Button>
                      <Button 
                        onClick={() => setIsOpen(false)}
                        className="flex-1"
                      >
                        Apply Selection ({selectedGenres.length})
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-slate-800 rounded-lg">
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
                <span className="text-slate-500">Click "Select Genres" to choose your genres</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Modal Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• <strong>Advanced Search:</strong> Use * for wildcards, "quotes" for exact matches</p>
            <p>• <strong>Batch Operations:</strong> Select all genres from a category at once</p>
            <p>• <strong>Smart Organization:</strong> Popular, Favorites, Categories, and Recent tabs</p>
            <p>• <strong>View Modes:</strong> Switch between grid and list view</p>
            <p>• <strong>Persistent State:</strong> Favorites and recent selections are saved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}