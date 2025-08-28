"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, X, ArrowLeft, Filter, Clock, TrendingUp, Bookmark } from "lucide-react"
import Link from "next/link"

const POPULAR_GENRES = ["Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill"]

const TRENDING_GENRES = ["Amapiano", "Jersey Club", "Phonk", "Hyperpop", "Afro-Drill"]

const GENRE_SUGGESTIONS = {
  "Hip-Hop": ["Trap", "Drill", "Conscious Hip-Hop", "Cloud Rap"],
  "Soul": ["Neo-Soul", "R&B", "Gospel", "Memphis Soul"],
  "Funk": ["P-Funk", "G-Funk", "Jazz-Funk", "Afro-Funk"],
  "Afrobeat": ["Afrobeats", "Amapiano", "Afro-Pop", "Highlife"],
  "Drill": ["UK Drill", "Chicago Drill", "New York Drill", "Brooklyn Drill"]
}

const ALL_GENRES = [
  "Hip-Hop", "Soul", "Funk", "Afrobeat", "Drill", "Trap", "R&B", "Neo-Soul",
  "Alternative R&B", "Experimental Hip-Hop", "UK Drill", "Chicago Drill", 
  "Afro-Pop", "Dancehall", "Reggaeton", "Latin Trap", "Boom Bap", "Lo-Fi Hip-Hop",
  "Cloud Rap", "Mumble Rap", "Conscious Hip-Hop", "Gospel", "Contemporary Gospel",
  "Blues", "Electric Blues", "Delta Blues", "Chicago Blues", "Memphis Soul",
  "Northern Soul", "Southern Soul", "Philly Soul", "Motown", "P-Funk",
  "G-Funk", "Funk Rock", "Jazz-Funk", "Electro-Funk", "Afrobeats", "Afro-Fusion",
  "Highlife", "Amapiano", "Gqom", "Baile Funk", "UK Garage", "Grime",
  "Jersey Club", "Phonk", "Hyperpop", "Afro-Drill", "Dembow", "Breakbeat"
]

export default function GenrePrototypeE() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop", "Soul"])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(["Trap", "Neo-Soul", "Afrobeat"])
  const [activeTab, setActiveTab] = useState("popular")
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
        setRecentlyUsed(recent => [genre, ...recent.slice(0, 7)])
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
    const suggestions = new Set<string>()
    
    selectedGenres.forEach(genre => {
      if (GENRE_SUGGESTIONS[genre as keyof typeof GENRE_SUGGESTIONS]) {
        GENRE_SUGGESTIONS[genre as keyof typeof GENRE_SUGGESTIONS].forEach(suggestion => {
          if (!selectedGenres.includes(suggestion)) {
            suggestions.add(suggestion)
          }
        })
      }
    })
    
    return Array.from(suggestions).slice(0, 6)
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
            Prototype E: Sidebar Drawer
          </h1>
        </div>

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
                        <SheetTitle className="text-white">Genre Selection</SheetTitle>
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
                              Search Results ({filteredGenres.length})
                            </h3>
                            <div className="max-h-64 overflow-y-auto">
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

                            <div className="max-h-64 overflow-y-auto mt-4">
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
                    <span className="text-slate-500">Click "Manage Genres" to select</span>
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
                  <span>Available:</span>
                  <span className="text-slate-400">{ALL_GENRES.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Overview */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Sidebar Drawer Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• <strong>Persistent Access:</strong> Always available without disrupting workflow</p>
            <p>• <strong>Smart Context:</strong> Suggestions based on current selections</p>
            <p>• <strong>Organized Tabs:</strong> Popular, Trending, Saved, and Recent for easy discovery</p>
            <p>• <strong>Non-Intrusive:</strong> Slides over content instead of modal overlay</p>
            <p>• <strong>Reusable Component:</strong> Same drawer can be used across Music Video and Artist Bank</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}