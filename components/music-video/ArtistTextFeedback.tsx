"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Star, ThumbsUp, ThumbsDown } from "lucide-react"
import type { ArtistProfile } from "@/lib/artist-types"

interface ArtistFeedbackMessage {
  optionId: string
  message: string
  rating: number
  emoji: string
}

interface ArtistTextFeedbackProps {
  isOpen: boolean
  onClose: () => void
  artist: ArtistProfile
  treatmentOptions: Array<{
    id: string
    name: string
    concept: string
    visualTheme: string
  }>
  onFeedbackComplete: (feedback: ArtistFeedbackMessage[]) => void
}

export function ArtistTextFeedback({
  isOpen,
  onClose,
  artist,
  treatmentOptions,
  onFeedbackComplete
}: ArtistTextFeedbackProps) {
  const [messages, setMessages] = useState<ArtistFeedbackMessage[]>([])
  const [currentOption, setCurrentOption] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && treatmentOptions.length > 0) {
      generateArtistFeedback()
    }
  }, [isOpen, treatmentOptions])

  const generateArtistFeedback = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call to generate artist personality-driven feedback
      // In real implementation, this would call the enhanced prompt
      const mockFeedback: ArtistFeedbackMessage[] = treatmentOptions.map((option, index) => ({
        optionId: option.id,
        message: generateMockMessage(artist, option, index),
        rating: Math.floor(Math.random() * 4) + 7, // 7-10 range for demo
        emoji: getRandomEmoji()
      }))
      
      setMessages(mockFeedback)
    } catch (error) {
      console.error('Failed to generate artist feedback:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockMessage = (artist: ArtistProfile, option: any, index: number): string => {
    const artistName = artist.artist_name || "Artist"
    const tone = artist.chat_voice?.tone || "casual"
    
    const responses = [
      `Yo this treatment is fire 🔥 Really feeling the ${option.visualTheme.toLowerCase()} vibes. This matches my energy perfectly`,
      `I'm torn on this one... The concept is cool but feels like it might be too much? What do you think?`,
      `LOVE this direction! The ${option.concept.slice(0, 30)}... part really speaks to what the song is about. Let's do it!`,
      `Not really feeling this approach tbh. Doesn't feel authentic to who I am as an artist. Can we explore something else?`
    ]
    
    return responses[index] || `Interesting take on the video. The ${option.visualTheme} approach could work.`
  }

  const getRandomEmoji = () => {
    const emojis = ["🔥", "💯", "✨", "🎯", "🤔", "😍", "👏", "🎵"]
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "text-green-400"
    if (rating >= 7) return "text-yellow-400" 
    if (rating >= 5) return "text-orange-400"
    return "text-red-400"
  }

  const handleComplete = () => {
    onFeedbackComplete(messages)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-slate-900 rounded-lg border border-slate-700 p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {artist.artist_name} is reviewing the treatments
          </h2>
          <p className="text-slate-400">
            See what they think about each creative direction
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Getting {artist.artist_name}'s feedback...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {treatmentOptions.map((option, index) => {
              const feedback = messages.find(m => m.optionId === option.id)
              
              return (
                <Card key={option.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Treatment Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {option.name}
                        </h3>
                        <p className="text-slate-300 text-sm mb-3">
                          {option.concept}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {option.visualTheme}
                        </Badge>
                      </div>

                      {/* Artist Text Message */}
                      {feedback && (
                        <div className="flex-1">
                          <div className="bg-blue-600 rounded-2xl rounded-br-sm p-4 max-w-sm ml-auto relative">
                            <div className="absolute -bottom-1 -right-1 w-0 h-0 border-l-[10px] border-l-blue-600 border-b-[10px] border-b-transparent" />
                            
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                                {artist.artist_name?.[0] || "A"}
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">
                                  {artist.artist_name}
                                </p>
                                <p className="text-blue-100 text-xs opacity-75">
                                  now
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-white text-sm leading-relaxed mb-3">
                              {feedback.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(feedback.rating / 2)
                                        ? "text-yellow-400 fill-current"
                                        : "text-slate-400"
                                    }`}
                                  />
                                ))}
                                <span className={`text-xs ml-1 font-bold ${getRatingColor(feedback.rating)}`}>
                                  {feedback.rating}/10
                                </span>
                              </div>
                              <span className="text-lg">{feedback.emoji}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400"
              >
                Skip Artist Input
              </Button>
              <Button
                onClick={handleComplete}
                disabled={messages.length === 0}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Continue with {artist.artist_name}'s Choices
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}