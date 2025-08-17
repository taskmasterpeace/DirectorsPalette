"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileText, Upload } from "lucide-react"

interface LyricsInputProps {
  lyrics: string
  title: string
  artist: string
  onLyricsChange: (lyrics: string) => void
  onTitleChange: (title: string) => void
  onArtistChange: (artist: string) => void
}

export function LyricsInput({
  lyrics,
  title,
  artist,
  onLyricsChange,
  onTitleChange,
  onArtistChange,
}: LyricsInputProps) {
  
  // Sample lyrics for demo
  const loadSampleLyrics = () => {
    const sample = `[Verse 1]
I've been walking down this lonely road
Carrying dreams that feel so heavy to hold
Every step I take, I'm getting closer to the light
But the shadows of my past keep chasing through the night

[Chorus]
Rise up, rise up, we're breaking through the chains
No more holding back, we're dancing in the rain
This is our moment, this is our time to shine
Leave the past behind, everything's gonna be fine

[Verse 2]
They said I couldn't make it on my own
But I built my castle from a broken stone
Every scar I wear tells a story of my fight
Now I'm standing tall, ready to ignite

[Chorus]
Rise up, rise up, we're breaking through the chains
No more holding back, we're dancing in the rain
This is our moment, this is our time to shine
Leave the past behind, everything's gonna be fine

[Bridge]
When the world gets heavy
And you feel like letting go
Remember you're stronger
Than you'll ever know

[Chorus]
Rise up, rise up, we're breaking through the chains
No more holding back, we're dancing in the rain
This is our moment, this is our time to shine
Leave the past behind, everything's gonna be fine`
    
    onLyricsChange(sample)
    onTitleChange("Rise Up")
    onArtistChange("Sample Artist")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        onLyricsChange(text)
      }
      reader.readAsText(file)
    }
  }

  const lineCount = lyrics.split('\n').filter(line => line.trim()).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Reference Song Input</h3>
        <div className="flex gap-2">
          <Button
            onClick={loadSampleLyrics}
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            Load Sample
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload .txt
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-300 text-sm">Song Title (Optional)</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter song title"
            className="bg-slate-950 border-slate-700 text-white"
          />
        </div>
        <div>
          <Label className="text-slate-300 text-sm">Original Artist (Optional)</Label>
          <Input
            value={artist}
            onChange={(e) => onArtistChange(e.target.value)}
            placeholder="Enter artist name"
            className="bg-slate-950 border-slate-700 text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-slate-300 text-sm">Song Lyrics *</Label>
          <span className="text-xs text-slate-400">
            {lineCount} lines • {lyrics.length} characters
          </span>
        </div>
        <Textarea
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="Paste the complete song lyrics here...

Include section markers like [Verse], [Chorus], [Bridge] if you know them.
The more complete the lyrics, the better the analysis."
          className="bg-slate-950 border-slate-700 text-white font-mono text-sm"
          rows={20}
        />
        <div className="mt-2 text-xs text-slate-400">
          Tip: Include the full song structure for best DNA replication results
        </div>
      </div>
    </div>
  )
}