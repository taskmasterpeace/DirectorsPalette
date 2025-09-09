'use client'

import { useState, useRef } from 'react'
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from '@/components/ui/premium-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { cn } from '@/lib/utils'
import { Upload, Wand2, Music, User, FileText, Mic, Sparkles, Play, Pause } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { DirectorSelector } from './DirectorSelector'
import type { MusicVideoDirector } from '@/lib/director-types'

interface CompactMusicVideoInputProps {
  songTitle: string
  setSongTitle: (title: string) => void
  artistName: string
  setArtistName: (name: string) => void
  lyrics: string
  setLyrics: (lyrics: string) => void
  musicVideoConcept: string
  setMusicVideoConcept: (concept: string) => void
  visualDescription: string
  setVisualDescription: (description: string) => void
  selectedArtistProfile?: any
  onArtistProfileSelect: (profile: any) => void
  directors: MusicVideoDirector[]
  selectedDirectorId: string
  onDirectorSelect: (directorId: string) => void
  onExtractLyrics: (audioFile: File) => void
  onExtractReferences: () => void
  onAutoFillConcept: () => void
  onAutoFillVisual: () => void
  isLoading?: boolean
}

export function CompactMusicVideoInput({
  songTitle,
  setSongTitle,
  artistName,
  setArtistName,
  lyrics,
  setLyrics,
  musicVideoConcept,
  setMusicVideoConcept,
  visualDescription,
  setVisualDescription,
  selectedArtistProfile,
  onArtistProfileSelect,
  directors,
  selectedDirectorId,
  onDirectorSelect,
  onExtractLyrics,
  onExtractReferences,
  onAutoFillConcept,
  onAutoFillVisual,
  isLoading = false
}: CompactMusicVideoInputProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      onExtractLyrics(file)
    }
  }

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="space-y-4">
      {/* Song Details - Compact Header */}
      <PremiumCard variant="glass" className="h-16">
        <PremiumCardContent className="h-full flex items-center gap-4 p-4">
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Song title..."
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="h-8 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            />
            
            <div className="flex gap-2">
              <Input
                placeholder="Artist name..."
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="h-8 bg-white/5 border-white/10 text-white placeholder:text-slate-400 flex-1"
              />
              {selectedArtistProfile && (
                <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  Profile
                </div>
              )}
            </div>
          </div>
        </PremiumCardContent>
      </PremiumCard>

      {/* Lyrics Section */}
      <PremiumCard variant="glass">
        <PremiumCardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <PremiumCardTitle className="text-lg text-white">Lyrics</PremiumCardTitle>
            </div>
            
            {/* Compact Audio Upload */}
            <div className="flex items-center gap-2">
              {audioFile && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400">
                  <Mic className="w-3 h-3" />
                  {audioFile.name.slice(0, 15)}...
                  <button onClick={toggleAudioPlayback}>
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
              )}
              
              <EnhancedButton
                variant="sleek"
                colorScheme="purple"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-3 text-xs"
              >
                <Upload className="w-3 h-3" />
                Audio
              </EnhancedButton>
            </div>
          </div>
        </PremiumCardHeader>
        
        <PremiumCardContent className="pt-0">
          <Textarea
            placeholder="Paste your lyrics here or upload an audio file to extract them automatically..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="min-h-32 bg-white/5 border-white/10 text-white placeholder:text-slate-400 resize-none"
          />
        </PremiumCardContent>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
        />
        
        {audioFile && (
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioFile)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </PremiumCard>

      {/* Concept & Visual - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Music Video Concept */}
        <PremiumCard variant="glass">
          <PremiumCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <PremiumCardTitle className="text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Concept
              </PremiumCardTitle>
              <EnhancedButton
                variant="glass"
                size="sm"
                onClick={onAutoFillConcept}
                disabled={!lyrics.trim() || isLoading}
                className="h-7 px-2 disabled:opacity-50"
                title="Generate concept from lyrics"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
              </EnhancedButton>
            </div>
          </PremiumCardHeader>
          
          <PremiumCardContent className="pt-0">
            <Textarea
              placeholder="Describe the overall concept and theme for your music video..."
              value={musicVideoConcept}
              onChange={(e) => setMusicVideoConcept(e.target.value)}
              className="h-24 bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-sm resize-none"
            />
          </PremiumCardContent>
        </PremiumCard>

        {/* Visual Description */}
        <PremiumCard variant="glass">
          <PremiumCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <PremiumCardTitle className="text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Visual Style
              </PremiumCardTitle>
              <EnhancedButton
                variant="glass"
                size="sm"
                onClick={onAutoFillVisual}
                disabled={!lyrics.trim() || isLoading}
                className="h-7 px-2 disabled:opacity-50"
                title="Generate visual style from lyrics"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
              </EnhancedButton>
            </div>
          </PremiumCardHeader>
          
          <PremiumCardContent className="pt-0">
            <Textarea
              placeholder="Describe the visual style, colors, mood, and artistic direction..."
              value={visualDescription}
              onChange={(e) => setVisualDescription(e.target.value)}
              className="h-24 bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-sm resize-none"
            />
          </PremiumCardContent>
        </PremiumCard>
      </div>

      {/* Director Selection */}
      <DirectorSelector
        directors={directors}
        selectedDirectorId={selectedDirectorId}
        onDirectorSelect={onDirectorSelect}
        className="max-w-md"
      />

      {/* Magic Wand Helper */}
      {lyrics.trim() && !musicVideoConcept.trim() && !visualDescription.trim() && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-400 text-sm">
            <Wand2 className="w-4 h-4 animate-pulse" />
            Use the magic wand to auto-generate concept and visual style based on your lyrics
          </div>
        </div>
      )}

      {/* Reference Extraction Button */}
      {songTitle.trim() && lyrics.trim() && (
        <div className="text-center">
          <EnhancedButton
            variant="premium" 
            size="lg"
            onClick={onExtractReferences}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Extract References & Continue
              </>
            )}
          </EnhancedButton>
        </div>
      )}
    </div>
  )
}