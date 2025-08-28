"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, X, ArrowLeft, Filter, Grid, List, Heart, BarChart3, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { 
  getAllMainGenres, 
  searchGenres, 
  getGenreStats,
  POPULAR_GENRES,
  type Genre,
  type Subgenre
} from "@/lib/genre-data-loader"

export default function GenrePrototypeCEnhanced() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(["Hip-Hop/Rap", "Soul"])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(["Trap", "Neo-Soul", "Afrobeat"])
  const [activeTab, setActiveTab] = useState("categories")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [filteredGenres, setFilteredGenres] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const allMainGenres = getAllMainGenres()
  const stats = getGenreStats()

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGenres([])
      return
    }

    const filtered = searchGenres(searchTerm)
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

  const selectMultiple = (genres: string[]) => {
    setSelectedGenres(prev => {
      const newGenres = genres.filter(g => !prev.includes(g))
      return [...prev, ...newGenres]
    })
  }

  const selectAllSubgenres = (genre: Genre) => {
    const allSubs = genre.subgenres.map(s => s.name)
    selectMultiple(allSubs)
  }

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const clearSearch = () => {
    setSearchTerm("")
    searchRef.current?.focus()
  }

  const GenreGrid = ({ genres, showActions = true }: { genres: string[], showActions?: boolean }) => (
    <div className={viewMode === "grid" ? 
      "grid grid-cols-2 md:grid-cols-3 gap-2" : 
      "space-y-2"
    }>
      {genres.slice(0, 50).map(genre => (
        <div
          key={genre}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
            selectedGenres.includes(genre)
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          } ${viewMode === "list" ? "w-full" : ""}`}
          onClick={() => toggleGenre(genre)}
        >
          <span className="font-medium text-sm">{genre}</span>
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
      {genres.length > 50 && (
        <p className="text-xs text-slate-500 p-2">
          ... and {genres.length - 50} more. Use search to find specific genres.
        </p>
      )}
    </div>
  )

  const CategoryView = ({ genre }: { genre: Genre }) => {
    const isExpanded = expandedCategories.includes(genre.id)
    
    return (
      <div key={genre.id} className="border border-slate-700 rounded-lg overflow-hidden mb-3">
        <div className="flex items-center justify-between p-3 bg-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleCategoryExpanded(genre.id)}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            <div className="flex items-center gap-2">
              <Badge
                variant={selectedGenres.includes(genre.name) ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedGenres.includes(genre.name) 
                    ? "bg-green-600 text-white" 
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => toggleGenre(genre.name)}
              >
                {genre.name}
              </Badge>
              
              <span className="text-xs text-slate-400">
                ({genre.subgenres.length} subgenres)
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => selectAllSubgenres(genre)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-700 rounded"
            >
              Select All
            </button>
            <button
              onClick={() => toggleFavorite(genre.name)}
              className="text-slate-400 hover:text-yellow-400"
            >
              <Star className={`h-4 w-4 ${favorites.includes(genre.name) ? 'fill-current text-yellow-400' : ''}`} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 bg-slate-850 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {genre.subgenres.map(subgenre => (
                <div
                  key={subgenre.id}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    selectedGenres.includes(subgenre.name)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                  onClick={() => toggleGenre(subgenre.name)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{subgenre.name}</span>
                    <div className="flex gap-1">
                      {subgenre.microgenres.length > 0 && (
                        <span className="text-xs text-blue-400">({subgenre.microgenres.length})</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(subgenre.name)
                        }}
                        className="hover:text-yellow-400"
                      >
                        <Star className={`h-3 w-3 ${favorites.includes(subgenre.name) ? 'fill-current text-yellow-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
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
            Enhanced Modal Powerhouse - Full Database
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

        {/* Current Selection Display */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Selected Genres</CardTitle>
              
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Filter className="h-4 w-4 mr-2" />
                    Browse {stats.total} Genres ({selectedGenres.length})
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-7xl max-h-[90vh] bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-white">Advanced Genre Selection - Complete Database</DialogTitle>
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
                        placeholder={`Advanced search across ${stats.total} genres: use * wildcards, "exact matches"`}
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
                        <div className="max-h-96 overflow-y-auto">
                          <GenreGrid genres={filteredGenres} />
                        </div>
                      </div>
                    )}

                    {/* Tabbed Interface */}
                    {!searchTerm && (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full bg-slate-800">
                          <TabsTrigger value="popular">Popular</TabsTrigger>
                          <TabsTrigger value="categories">Categories</TabsTrigger>
                          <TabsTrigger value="favorites">Favorites</TabsTrigger>
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

                          <TabsContent value="categories" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium text-white">Main Categories ({allMainGenres.length})</h3>
                              <div className="text-xs text-slate-400">
                                Click categories to expand subgenres
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {allMainGenres.map(genre => (
                                <CategoryView key={genre.id} genre={genre} />
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="favorites" className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Your Favorites ({favorites.length})</h3>
                            {favorites.length > 0 ? (
                              <GenreGrid genres={favorites} />
                            ) : (
                              <p className="text-slate-500 text-center py-8">
                                No favorites yet. Star some genres to add them here!
                              </p>
                            )}
                          </TabsContent>

                          <TabsContent value="recent" className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Recently Used ({recentlyUsed.length})</h3>
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
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
                <span className="text-slate-500">Click "Browse {stats.total} Genres" to choose from the complete database</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Enhanced Modal Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• <strong>Complete Database:</strong> Access to all {stats.total} genres across 4 hierarchy levels</p>
            <p>• <strong>Advanced Search:</strong> Search entire database with * wildcards and "exact matches"</p>
            <p>• <strong>Category Navigation:</strong> Explore {stats.mainGenres} main categories with expandable subgenres</p>
            <p>• <strong>Batch Operations:</strong> "Select All" for entire categories or subgenre groups</p>
            <p>• <strong>Smart Organization:</strong> Popular, Categories, Favorites, and Recent tabs</p>
            <p>• <strong>Performance Optimized:</strong> Intelligent limiting and pagination for smooth experience</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}