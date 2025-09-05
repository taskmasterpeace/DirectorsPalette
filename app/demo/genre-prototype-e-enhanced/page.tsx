"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, X, ArrowLeft, Filter, Clock, TrendingUp, Bookmark, BarChart3 } from "lucide-react"
import Link from "next/link"
import { 
  getAllMainGenres, 
  searchGenres, 
  getGenreStats,
  POPULAR_GENRES,
  type Genre
} from "@/lib/genre-data-loader"

const TRENDING_GENRES = ["Amapiano", "Jersey Club", "Phonk", "Hyperpop", "Drill"]

export default function GenrePrototypeEEnhanced() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop/Rap", "Soul"])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(["Trap", "Neo-Soul", "Afrobeat"])
  const [activeTab, setActiveTab] = useState("popular")
  const [filteredGenres, setFilteredGenres] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const allMainGenres = getAllMainGenres()
  const stats = getGenreStats()

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGenres([])
      return
    }

    const filtered = searchGenres(searchTerm).slice(0, 50) // Limit for performance
    setFilteredGenres(filtered)
  }, [searchTerm])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      const newSelection = prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
      
      // Add to recently used if selecting
      if (!prev.includes(genre) && !recentlyUsed.includes(genre)) {
        setRecentlyUsed(recent => [genre, ...recent.slice(0, 9)])
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

  const getSmartSuggestions = () => {
    // Simple suggestion logic based on selected genres
    const suggestions = new Set<string>()
    
    selectedGenres.forEach(genre => {
      if (genre.includes("Hip-Hop") || genre.includes("Rap")) {
        suggestions.add("Trap")
        suggestions.add("Drill")
        suggestions.add("Boom Bap")
      }
      if (genre.includes("Soul") || genre.includes("R&B")) {
        suggestions.add("Neo-Soul")
        suggestions.add("Gospel")
        suggestions.add("Funk")
      }
    })
    
    return Array.from(suggestions).filter(s => !selectedGenres.includes(s)).slice(0, 6)
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  const GenreList = ({ genres, showIcon = false, icon }: { 
    genres: string[], 
    showIcon?: boolean, 
    icon?: React.ReactNode 
  }) => (
    <div className="space-y-2">
      {genres.map(genre => (
        <div
          key={genre}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
            selectedGenres.includes(genre)
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
          onClick={() => toggleGenre(genre)}
        >
          <div className="flex items-center gap-3">
            {showIcon && icon}
            <span className="font-medium">{genre}</span>
            {selectedGenres.includes(genre) && <span className="text-green-400">✓</span>}
          </div>
          
          <div className="flex gap-1">
            {favorites.includes(genre) && (
              <Bookmark className="h-4 w-4 text-yellow-400 fill-current" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(genre)
              }}
              className="hover:text-yellow-400"
            >
              <Star className={`h-4 w-4 ${favorites.includes(genre) ? 'fill-current text-yellow-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const smartSuggestions = getSmartSuggestions()

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
            Enhanced Sidebar Drawer - Full Database
          </h1>
        </div>

        {/* Stats Bar */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Database: {stats.total} total genres</span>
              </div>
              <div className="text-slate-400">
                {stats.mainGenres} main • {stats.subgenres} sub • {stats.microgenres} micro • {stats.nestedMicrogenres} nested
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Content Simulation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Selection */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Selected Genres</CardTitle>
                  
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Manage Genres ({selectedGenres.length})
                      </Button>
                    </SheetTrigger>
                    
                    <SheetContent side="right" className="w-96 bg-slate-900 border-slate-700">
                      <SheetHeader>
                        <SheetTitle className="text-white">Genre Selection - Full Database</SheetTitle>
                      </SheetHeader>

                      <div className="space-y-4 mt-6">
                        
                        {/* Database Stats */}
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="text-xs text-slate-400">
                            Searching {stats.total} genres across 4 tiers
                          </div>
                        </div>
                        
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            ref={searchRef}
                            placeholder={`Search ${stats.total} genres...`}
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
                              Search Results ({filteredGenres.length})
                            </h3>
                            <div className="max-h-48 overflow-y-auto">
                              <GenreList genres={filteredGenres} />
                            </div>
                          </div>
                        )}

                        {/* Tabbed Content */}
                        {!searchTerm && (
                          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-4 w-full bg-slate-800 text-xs">
                              <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
                              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
                              <TabsTrigger value="favorites" className="text-xs">Saved</TabsTrigger>
                              <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                            </TabsList>

                            <div className="max-h-48 overflow-y-auto mt-4">
                              <TabsContent value="popular">
                                <GenreList genres={POPULAR_GENRES} />
                              </TabsContent>

                              <TabsContent value="trending">
                                <GenreList 
                                  genres={TRENDING_GENRES} 
                                  showIcon={true}
                                  icon={<TrendingUp className="h-4 w-4 text-green-400" />}
                                />
                              </TabsContent>

                              <TabsContent value="favorites">
                                {favorites.length > 0 ? (
                                  <GenreList 
                                    genres={favorites} 
                                    showIcon={true}
                                    icon={<Bookmark className="h-4 w-4 text-yellow-400" />}
                                  />
                                ) : (
                                  <p className="text-slate-500 text-center py-8 text-sm">
                                    Star genres to save them here
                                  </p>
                                )}
                              </TabsContent>

                              <TabsContent value="recent">
                                {recentlyUsed.length > 0 ? (
                                  <GenreList 
                                    genres={recentlyUsed} 
                                    showIcon={true}
                                    icon={<Clock className="h-4 w-4 text-blue-400" />}
                                  />
                                ) : (
                                  <p className="text-slate-500 text-center py-8 text-sm">
                                    Recently selected genres will appear here
                                  </p>
                                )}
                              </TabsContent>
                            </div>
                          </Tabs>
                        )}

                        {/* Current Selection in Drawer */}
                        <div className="border-t border-slate-700 pt-4 mt-4">
                          <h3 className="text-sm font-medium text-slate-300 mb-3">
                            Current Selection ({selectedGenres.length})
                          </h3>
                          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                            {selectedGenres.map(genre => (
                              <Badge key={genre} className="bg-blue-600 text-white text-xs">
                                {genre}
                                <button
                                  onClick={() => toggleGenre(genre)}
                                  className="ml-1 hover:text-red-400"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-slate-700">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedGenres([])}
                          >
                            Clear All
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
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
                    <span className="text-slate-500">Click "Manage Genres" to select from {stats.total} available genres</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Other Form Fields Simulation */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Other Music Video Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Song Title</label>
                  <Input className="bg-slate-800 border-slate-700 text-white" placeholder="Enter song title" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Artist</label>
                  <Input className="bg-slate-800 border-slate-700 text-white" placeholder="Enter artist name" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Lyrics</label>
                  <textarea 
                    className="w-full h-32 p-3 bg-slate-800 border border-slate-700 rounded-md text-white resize-none"
                    placeholder="Enter lyrics with timestamps..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div>
            
            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Suggested for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {smartSuggestions.map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className="w-full flex items-center justify-between p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 text-sm"
                      >
                        <span>{genre}</span>
                        <span className="text-green-400 text-xs">+</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">Genre Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span className="text-blue-400">{selectedGenres.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorites:</span>
                  <span className="text-yellow-400">{favorites.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recent:</span>
                  <span className="text-slate-400">{recentlyUsed.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Available:</span>
                  <span className="text-green-400">{stats.total}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 text-xs">
                  <div>Main: {stats.mainGenres}</div>
                  <div>Sub: {stats.subgenres}</div>
                  <div>Micro: {stats.microgenres}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Overview */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Enhanced Sidebar Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• <strong>Full Database:</strong> Access to all {stats.total} genres across 4 hierarchy levels</p>
            <p>• <strong>Smart Search:</strong> Real-time search with wildcard support across entire database</p>
            <p>• <strong>Organized Tabs:</strong> Popular, Trending, Saved, and Recent for easy discovery</p>
            <p>• <strong>Context Awareness:</strong> Suggestions adapt based on your current selections</p>
            <p>• <strong>Persistent Access:</strong> Same drawer component works across Music Video and Artist Bank forms</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}