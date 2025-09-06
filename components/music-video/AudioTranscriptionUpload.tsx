"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Mic, Loader2, CheckCircle, AlertCircle, Music } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AudioTranscriptionUploadProps {
  onLyricsExtracted: (lyrics: string) => void
  className?: string
}

const WHISPER_MODELS = {
  'simple': {
    name: 'Simple Whisper (Test)',
    description: 'Basic working transcription',
    cost: '$0.05/min',
    endpoint: '/api/transcribe/simple-whisper',
    recommended: true
  },
  'fast': {
    name: 'Incredibly Fast Whisper',
    description: '10x faster, good quality',
    cost: '$0.06/min',
    endpoint: '/api/transcribe/fast-whisper',
    recommended: false
  },
  'standard': {
    name: 'OpenAI Whisper',
    description: 'Official OpenAI model',
    cost: '$0.10/min', 
    endpoint: '/api/transcribe/openai-whisper',
    recommended: false
  },
  'premium': {
    name: 'WhisperX (Timestamps)',
    description: 'Precise word-level timing',
    cost: '$0.15/min',
    endpoint: '/api/transcribe/whisperx',
    recommended: false
  }
}

export function AudioTranscriptionUpload({ onLyricsExtracted, className = "" }: AudioTranscriptionUploadProps) {
  const [selectedModel, setSelectedModel] = useState<keyof typeof WHISPER_MODELS>('simple')
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [language, setLanguage] = useState('en')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg']
    const isValidType = allowedTypes.some(type => 
      file.type === type || file.name.toLowerCase().includes(type.split('/')[1])
    )

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload MP3, WAV, M4A, or OGG files",
        variant: "destructive"
      })
      return
    }

    // File size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File Too Large", 
        description: "Audio files must be under 25MB",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    setTranscriptionResult(null)
    toast({
      title: "Audio File Selected",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) ready for transcription`
    })
  }

  const startTranscription = async () => {
    if (!uploadedFile) return

    setIsTranscribing(true)
    setProgress(0)
    
    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90))
    }, 200)

    try {
      const formData = new FormData()
      formData.append('audio', uploadedFile)
      formData.append('language', language)

      const model = WHISPER_MODELS[selectedModel]
      console.log(`🎵 Starting ${model.name} transcription...`)

      const response = await fetch(model.endpoint, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const result = await response.json()
      setTranscriptionResult(result)

      // Extract the best lyrics format
      let extractedLyrics = ''
      if (result.transcription.word_level_lyrics) {
        extractedLyrics = result.transcription.word_level_lyrics // WhisperX precision
      } else if (result.transcription.lyrics_with_timestamps) {
        extractedLyrics = result.transcription.lyrics_with_timestamps // Segment timestamps
      } else {
        extractedLyrics = result.transcription.lyrics_formatted || result.transcription.text
      }

      onLyricsExtracted(extractedLyrics)

      toast({
        title: "Lyrics Extracted Successfully!",
        description: `Using ${model.name} • ${result.cost_estimate}`,
      })

    } catch (error) {
      clearInterval(progressInterval)
      console.error('Transcription failed:', error)
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "Could not extract lyrics",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false)
      setProgress(0)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setTranscriptionResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      
      {/* Compact Settings - Hidden by default, configurable in settings */}
      <div className="mb-2">
        <div className="text-xs text-slate-400">
          Audio Transcription: Simple Whisper (English) • $0.05/min
        </div>
      </div>

      {/* File Upload */}
      {!uploadedFile ? (
        <div 
          className="border-2 border-dashed border-slate-600 rounded-lg p-3 text-center cursor-pointer hover:border-slate-500 hover:bg-slate-800/20 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <Music className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <div className="text-sm text-white font-medium mb-1">Upload Audio File</div>
          <div className="text-xs text-slate-400 mb-2">
            MP3, WAV, M4A, or OGG • Max 25MB
          </div>
          <Button size="sm" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">{uploadedFile.name}</div>
                  <div className="text-xs text-slate-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB • 
                    Est. cost: {((uploadedFile.size / 1024 / 1024) * parseFloat(WHISPER_MODELS[selectedModel].cost.replace('$', '').replace('/min', ''))).toFixed(3)} USD
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={startTranscription}
                  disabled={isTranscribing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Extract Lyrics
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetUpload}
                  disabled={isTranscribing}
                >
                  Change File
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isTranscribing && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Processing with {WHISPER_MODELS[selectedModel].name}...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Result Summary */}
            {transcriptionResult && (
              <div className="mt-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Lyrics Extracted Successfully</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Model: {transcriptionResult.model}</div>
                  <div>Language: {transcriptionResult.transcription.language}</div>
                  <div>Processing Time: {transcriptionResult.processing_time}</div>
                  <div>Cost: {transcriptionResult.cost_estimate}</div>
                  {transcriptionResult.transcription.segments && (
                    <div>Segments: {transcriptionResult.transcription.segments.length}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}