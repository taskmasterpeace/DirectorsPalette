"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Copy, Download, Music, Heart, Play, Save, 
  FileText, Hash, Zap, Share2, Video 
} from "lucide-react"
import type { GeneratedSong, SongDNA } from "@/lib/song-dna-types"
import { formatSongForMusicVideo, storeSongForExport } from "@/lib/song-export-utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface SongOutputProps {
  songs: GeneratedSong[]
  originalDNA?: SongDNA
}

export function SongOutput({ songs, originalDNA }: SongOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedSongs, setSavedSongs] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  const handleCopyLyrics = (song: GeneratedSong) => {
    const text = formatSongForCopy(song)
    navigator.clipboard.writeText(text)
    setCopiedId(song.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (song: GeneratedSong) => {
    const text = formatSongForCopy(song)
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${song.title.replace(/[^a-z0-9]/gi, "_")}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = (song: GeneratedSong) => {
    // In a real app, this would save to database
    setSavedSongs(prev => new Set(prev).add(song.id))
  }

  const handleExportToMusicVideo = (song: GeneratedSong) => {
    // Format and store the song data
    const exportData = formatSongForMusicVideo(song, originalDNA)
    storeSongForExport(exportData)
    
    // Show success toast
    toast({
      title: "Song Exported",
      description: "Navigating to Music Video generator...",
    })
    
    // Navigate to main page with music video mode
    // The main page will detect the exported song and switch to music video mode
    router.push('/?mode=music-video')
  }

  const formatSongForCopy = (song: GeneratedSong) => {
    let text = `${song.title}\n${"=".repeat(song.title.length)}\n\n`
    
    if (song.theme) {
      text += `Theme: ${song.theme}\n`
    }
    if (song.emotional_tone) {
      text += `Mood: ${song.emotional_tone}\n`
    }
    if (song.estimated_bpm) {
      text += `BPM: ${song.estimated_bpm}\n`
    }
    if (song.suggested_key) {
      text += `Key: ${song.suggested_key}\n`
    }
    
    text += "\n" + song.lyrics
    text += `\n\n---\nGenerated with Song DNA Replicator\n`
    
    return text
  }

  if (songs.length === 0) {
    return (
      <div className="p-8 text-center">
        <Music className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No songs generated yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Generation Complete</h3>
            <p className="text-sm text-slate-400 mt-1">
              Generated {songs.length} {songs.length === 1 ? "song" : "songs"} based on the analyzed DNA
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => songs.forEach(handleDownload)}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </Card>

      {/* Songs Display */}
      {songs.length === 1 ? (
        // Single song view
        <SongCard 
          song={songs[0]} 
          onCopy={handleCopyLyrics}
          onDownload={handleDownload}
          onSave={handleSave}
          onExportToMV={handleExportToMusicVideo}
          isCopied={copiedId === songs[0].id}
          isSaved={savedSongs.has(songs[0].id)}
        />
      ) : (
        // Multiple songs in tabs
        <Tabs defaultValue={songs[0].id} className="space-y-4">
          <TabsList className="grid gap-1 bg-slate-800 p-1" style={{ gridTemplateColumns: `repeat(${songs.length}, 1fr)` }}>
            {songs.map((song, index) => (
              <TabsTrigger 
                key={song.id} 
                value={song.id}
                className="text-xs data-[state=active]:bg-amber-600"
              >
                <Music className="w-3 h-3 mr-1" />
                Song {String.fromCharCode(65 + index)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {songs.map((song) => (
            <TabsContent key={song.id} value={song.id}>
              <SongCard 
                song={song} 
                onCopy={handleCopyLyrics}
                onDownload={handleDownload}
                onSave={handleSave}
                onExportToMV={handleExportToMusicVideo}
                isCopied={copiedId === song.id}
                isSaved={savedSongs.has(song.id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* DNA Comparison */}
      {originalDNA && (
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            DNA Comparison
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Original</div>
              <div className="space-y-1">
                <div className="text-slate-300">Structure: {originalDNA.structure.pattern.join(" → ")}</div>
                <div className="text-slate-300">Emotion: {originalDNA.emotional.primary_emotion}</div>
                <div className="text-slate-300">Themes: {originalDNA.lyrical.themes.slice(0, 3).join(", ")}</div>
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Generated</div>
              <div className="space-y-1">
                <div className="text-slate-300">Theme: {songs[0].theme}</div>
                <div className="text-slate-300">Mood: {songs[0].emotional_tone}</div>
                <div className="text-slate-300">Variations: {songs.length}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Individual Song Card Component
function SongCard({ 
  song, 
  onCopy, 
  onDownload, 
  onSave,
  onExportToMV,
  isCopied,
  isSaved 
}: {
  song: GeneratedSong
  onCopy: (song: GeneratedSong) => void
  onDownload: (song: GeneratedSong) => void
  onSave: (song: GeneratedSong) => void
  onExportToMV?: (song: GeneratedSong) => void
  isCopied: boolean
  isSaved: boolean
}) {
  const [showFullLyrics, setShowFullLyrics] = useState(true)

  return (
    <Card className="bg-slate-900 border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music className="w-5 h-5" />
              {song.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {song.emotional_tone && (
                <Badge className="bg-purple-900/50 text-purple-300 border-purple-700">
                  <Heart className="w-3 h-3 mr-1" />
                  {song.emotional_tone}
                </Badge>
              )}
              {song.estimated_bpm && (
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                  <Zap className="w-3 h-3 mr-1" />
                  {song.estimated_bpm} BPM
                </Badge>
              )}
              {song.suggested_key && (
                <Badge className="bg-green-900/50 text-green-300 border-green-700">
                  <Music className="w-3 h-3 mr-1" />
                  Key of {song.suggested_key}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              onClick={() => onCopy(song)}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600"
            >
              {isCopied ? (
                <>✓ Copied</>
              ) : (
                <><Copy className="w-4 h-4" /></>
              )}
            </Button>
            <Button
              onClick={() => onDownload(song)}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onSave(song)}
              variant="outline"
              size="sm"
              className={isSaved ? "bg-green-900/50 border-green-700" : "text-slate-300 border-slate-600"}
            >
              <Save className="w-4 h-4" />
            </Button>
            {onExportToMV && (
              <Button
                onClick={() => onExportToMV(song)}
                variant="outline"
                size="sm"
                className="text-amber-400 border-amber-600 hover:bg-amber-900/50"
              >
                <Video className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lyrics */}
      <div className="p-4">
        <div className="space-y-4">
          {song.structure && song.structure.length > 0 ? (
            song.structure.map((section, index) => (
              <div key={index}>
                <div className="text-amber-500 text-sm font-medium mb-2">
                  [{section.section}]
                </div>
                <div className="text-white whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {(section.lines || []).join("\n")}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {song.lyrics}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Theme: {song.theme}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-slate-300 border-slate-600"
            >
              <Play className="w-3 h-3 mr-1" />
              Preview (Coming Soon)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-slate-300 border-slate-600"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}