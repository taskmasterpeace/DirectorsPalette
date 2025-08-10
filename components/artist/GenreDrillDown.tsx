"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, Music, Plus, X } from "lucide-react"
import { GENRE_STRUCTURE } from "@/lib/enhanced-genres"

interface GenreDrillDownProps {
  selectedGenres: string[]
  selectedSubgenres: string[]
  selectedMicrogenres: string[]
  onGenreChange: (genres: string[], subgenres: string[], microgenres: string[]) => void
}

export function GenreDrillDown({
  selectedGenres,
  selectedSubgenres,
  selectedMicrogenres,
  onGenreChange
}: GenreDrillDownProps) {
  const [currentLevel, setCurrentLevel] = useState<'genre' | 'subgenre' | 'microgenre'>('genre')
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null)
  const [selectedSubgenreId, setSelectedSubgenreId] = useState<string | null>(null)

  const selectedGenreData = GENRE_STRUCTURE.genres.find(g => g.id === selectedGenreId)
  const selectedSubgenreData = selectedGenreData?.subgenres.find(sg => sg.id === selectedSubgenreId)

  const addGenre = (genreName: string) => {
    if (!selectedGenres.includes(genreName)) {
      onGenreChange([...selectedGenres, genreName], selectedSubgenres, selectedMicrogenres)
    }
  }

  const addSubgenre = (subgenreName: string) => {
    if (!selectedSubgenres.includes(subgenreName)) {
      onGenreChange(selectedGenres, [...selectedSubgenres, subgenreName], selectedMicrogenres)
    }
  }

  const addMicrogenre = (microgenreName: string) => {
    if (!selectedMicrogenres.includes(microgenreName)) {
      onGenreChange(selectedGenres, selectedSubgenres, [...selectedMicrogenres, microgenreName])
    }
  }

  const removeGenre = (genreName: string) => {
    onGenreChange(
      selectedGenres.filter(g => g !== genreName),
      selectedSubgenres,
      selectedMicrogenres
    )
  }

  const removeSubgenre = (subgenreName: string) => {
    onGenreChange(
      selectedGenres,
      selectedSubgenres.filter(sg => sg !== subgenreName),
      selectedMicrogenres
    )
  }

  const removeMicrogenre = (microgenreName: string) => {
    onGenreChange(
      selectedGenres,
      selectedSubgenres,
      selectedMicrogenres.filter(mg => mg !== microgenreName)
    )
  }

  const navigateToSubgenres = (genreId: string) => {
    setSelectedGenreId(genreId)
    setCurrentLevel('subgenre')
  }

  const navigateToMicrogenres = (subgenreId: string) => {
    setSelectedSubgenreId(subgenreId)
    setCurrentLevel('microgenre')
  }

  const goBack = () => {
    if (currentLevel === 'microgenre') {
      setCurrentLevel('subgenre')
      setSelectedSubgenreId(null)
    } else if (currentLevel === 'subgenre') {
      setCurrentLevel('genre')
      setSelectedGenreId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Items Display */}
      <div className="space-y-3">
        {selectedGenres.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Primary Genres</h4>
            <div className="flex flex-wrap gap-2">
              {selectedGenres.map(genre => (
                <Badge key={genre} variant="outline" className="bg-blue-900/30 border-blue-500 text-blue-300">
                  {genre}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-red-400" 
                    onClick={() => removeGenre(genre)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedSubgenres.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Subgenres</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSubgenres.map(subgenre => (
                <Badge key={subgenre} variant="outline" className="bg-purple-900/30 border-purple-500 text-purple-300">
                  {subgenre}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-red-400" 
                    onClick={() => removeSubgenre(subgenre)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedMicrogenres.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Microgenres</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMicrogenres.map(microgenre => (
                <Badge key={microgenre} variant="outline" className="bg-amber-900/30 border-amber-500 text-amber-300">
                  {microgenre}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-red-400" 
                    onClick={() => removeMicrogenre(microgenre)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5" />
              {currentLevel === 'genre' && 'Select Genres'}
              {currentLevel === 'subgenre' && `${selectedGenreData?.name} Subgenres`}
              {currentLevel === 'microgenre' && `${selectedSubgenreData?.name} Microgenres`}
            </CardTitle>
            {currentLevel !== 'genre' && (
              <Button onClick={goBack} size="sm" variant="ghost">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {/* Genre Level */}
              {currentLevel === 'genre' && GENRE_STRUCTURE.genres.map(genre => (
                <div key={genre.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <div>
                    <div className="font-medium text-white">{genre.name}</div>
                    <div className="text-xs text-slate-400">{genre.subgenres.length} subgenres</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => addGenre(genre.name)}
                      disabled={selectedGenres.includes(genre.name)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {genre.subgenres.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigateToSubgenres(genre.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Subgenre Level */}
              {currentLevel === 'subgenre' && selectedGenreData && selectedGenreData.subgenres.map(subgenre => (
                <div key={subgenre.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <div>
                    <div className="font-medium text-white">{subgenre.name}</div>
                    {subgenre.microgenres && (
                      <div className="text-xs text-slate-400">{subgenre.microgenres.length} microgenres</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => addSubgenre(subgenre.name)}
                      disabled={selectedSubgenres.includes(subgenre.name)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {subgenre.microgenres && subgenre.microgenres.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigateToMicrogenres(subgenre.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Microgenre Level */}
              {currentLevel === 'microgenre' && selectedSubgenreData && selectedSubgenreData.microgenres?.map(microgenre => (
                <div key={microgenre.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="font-medium text-white">{microgenre.name}</div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => addMicrogenre(microgenre.name)}
                    disabled={selectedMicrogenres.includes(microgenre.name)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}