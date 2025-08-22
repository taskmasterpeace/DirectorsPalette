'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Music } from 'lucide-react'
import musicGenresData from '@/music_genres.json'

interface GenreSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function GenreSelector({ value, onChange, className = '' }: GenreSelectorProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    value ? value.split(', ').filter(Boolean) : []
  )
  const [customGenre, setCustomGenre] = useState('')

  // Flatten all genres for easy selection
  const allGenres = musicGenresData.genres.flatMap(category => [
    { id: category.id, name: category.name, category: category.name },
    ...category.subgenres.flatMap(sub => [
      { id: sub.id, name: sub.name, category: category.name },
      ...(sub.microgenres || []).map(micro => ({
        id: micro.id,
        name: micro.name,
        category: `${category.name} > ${sub.name}`
      }))
    ])
  ])

  const addGenre = (genreName: string) => {
    if (!selectedGenres.includes(genreName) && selectedGenres.length < 5) {
      const newGenres = [...selectedGenres, genreName]
      setSelectedGenres(newGenres)
      onChange(newGenres.join(', '))
    }
  }

  const removeGenre = (genreName: string) => {
    const newGenres = selectedGenres.filter(g => g !== genreName)
    setSelectedGenres(newGenres)
    onChange(newGenres.join(', '))
  }

  const addCustomGenre = () => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      addGenre(customGenre.trim())
      setCustomGenre('')
    }
  }

  // Popular genres for quick selection
  const popularGenres = ['Hip-Hop/Rap', 'Pop', 'R&B/Soul', 'Rock', 'Electronic', 'Jazz', 'Country', 'Reggae/Caribbean']

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Genres Display */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map(genre => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="flex items-center gap-1 bg-purple-600/20 text-purple-300 border-purple-600/30"
            >
              {genre}
              <button 
                onClick={() => removeGenre(genre)}
                className="ml-1 hover:bg-purple-600/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Quick Popular Genres */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 block">Popular Genres:</label>
        <div className="flex flex-wrap gap-2">
          {popularGenres.map(genre => (
            <Button
              key={genre}
              variant="outline"
              size="sm"
              onClick={() => addGenre(genre)}
              disabled={selectedGenres.includes(genre)}
              className="text-xs h-7 px-2 border-slate-600 hover:border-purple-500"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Comprehensive Genre Selector */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 block">Browse All Genres:</label>
        <Select onValueChange={addGenre}>
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue placeholder="Choose from 600+ genres..." />
          </SelectTrigger>
          <SelectContent className="max-h-60 bg-slate-800 border-slate-600">
            {musicGenresData.genres.map((category, catIndex) => (
              <div key={`category-${category.id}-${catIndex}`}>
                <div className="px-2 py-1 text-xs font-semibold text-purple-300 bg-slate-700/50">
                  {category.name}
                </div>
                <SelectItem value={category.name} className="text-white hover:bg-slate-700">
                  {category.name}
                </SelectItem>
                {category.subgenres.map((sub, subIndex) => (
                  <div key={`sub-${sub.id}-${catIndex}-${subIndex}`}>
                    <SelectItem value={sub.name} className="text-slate-300 hover:bg-slate-700 pl-4">
                      {sub.name}
                    </SelectItem>
                    {(sub.microgenres || []).map((micro, microIndex) => (
                      <SelectItem 
                        key={`micro-${micro.id}-${catIndex}-${subIndex}-${microIndex}`} 
                        value={micro.name} 
                        className="text-slate-400 hover:bg-slate-700 pl-6 text-xs"
                      >
                        {micro.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Genre Input */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 block">Add Custom Genre:</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom genre"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomGenre()}
            className="bg-slate-900/50 border-slate-600 text-white text-sm"
          />
          <Button 
            onClick={addCustomGenre}
            disabled={!customGenre.trim() || selectedGenres.includes(customGenre.trim())}
            size="sm"
            variant="outline"
            className="border-slate-600 hover:border-purple-500"
          >
            Add
          </Button>
        </div>
      </div>

      {selectedGenres.length > 0 && (
        <div className="text-xs text-slate-500">
          Selected {selectedGenres.length}/5 genres • Helps directors understand your music style
        </div>
      )}
    </div>
  )
}