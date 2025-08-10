"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare, Sparkles, Music } from "lucide-react"
import type { MusicVideoDirector } from "@/lib/director-types"
import type { ArtistProfile } from "@/lib/artist-types"

export interface DirectorMVQuestion {
  id: string
  question: string
  options: {
    value: string
    label: string
    description?: string
  }[]
  selectedValue?: string
}

interface DirectorMVQuestionCardsProps {
  isOpen: boolean
  onClose: () => void
  director: MusicVideoDirector
  artist: ArtistProfile
  songTitle: string
  lyrics: string
  onQuestionsAnswered: (answers: DirectorMVQuestion[]) => void
}

export function DirectorMVQuestionCards({
  isOpen,
  onClose,
  director,
  artist,
  songTitle,
  lyrics,
  onQuestionsAnswered
}: DirectorMVQuestionCardsProps) {
  const [questions, setQuestions] = useState<DirectorMVQuestion[]>(() => 
    generateDirectorMVQuestions(director, artist, songTitle, lyrics)
  )

  const handleOptionSelect = (questionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].selectedValue = value
    setQuestions(newQuestions)
  }

  const allQuestionsAnswered = questions.every(q => q.selectedValue)

  const handleProceed = () => {
    onQuestionsAnswered(questions)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-slate-900 rounded-lg border border-slate-700 p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {director.name} Has Some Creative Questions
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            I've been listening to "{songTitle}" and studying {artist.artist_name}'s style. 
            Let's talk through the creative direction together.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1 bg-purple-600" variant="default">
                  {qIndex + 1}
                </Badge>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {question.question}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {question.options.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      question.selectedValue === option.value
                        ? 'border-purple-500 bg-purple-900/20 ring-1 ring-purple-500'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                    onClick={() => handleOptionSelect(qIndex, option.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {question.selectedValue === option.value && (
                          <Check className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-xs text-slate-400 mt-1">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400"
          >
            Skip Director Input
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allQuestionsAnswered}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create the Vision
          </Button>
        </div>
      </div>
    </div>
  )
}

function generateDirectorMVQuestions(
  director: MusicVideoDirector,
  artist: ArtistProfile,
  songTitle: string,
  lyrics: string
): DirectorMVQuestion[] {
  const questions: DirectorMVQuestion[] = []
  
  // Analyze song mood and themes
  const isEmotional = lyrics.toLowerCase().includes('love') || 
                       lyrics.toLowerCase().includes('heart') || 
                       lyrics.toLowerCase().includes('feel')
  const isEnergetic = lyrics.toLowerCase().includes('dance') || 
                      lyrics.toLowerCase().includes('party') || 
                      lyrics.toLowerCase().includes('wild')
  const hasStoryElements = lyrics.toLowerCase().includes('remember') || 
                           lyrics.toLowerCase().includes('story') || 
                           lyrics.toLowerCase().includes('once')

  // Generate director-specific conversational questions

  // Question 1: Song interpretation based on director's style
  if (director.name.includes("Spike Jonze") || director.narrativeStyle?.includes("surreal")) {
    questions.push({
      id: 'interpretation',
      question: `I'm hearing layers in "${songTitle}" that could go several ways. What's the core emotion we're chasing here?`,
      options: [
        { value: 'raw_authentic', label: 'Raw authenticity', description: 'Strip it down, show the real person' },
        { value: 'dreamlike', label: 'Dreamlike journey', description: 'Blur the lines between reality and fantasy' },
        { value: 'unexpected_moments', label: 'Unexpected moments', description: 'Find the surprises hidden in ordinary scenes' },
        { value: 'emotional_honesty', label: 'Emotional honesty', description: 'Vulnerable, unguarded moments' }
      ]
    })
  } else if (director.name.includes("Hype Williams") || director.visualHallmarks?.includes("abstract")) {
    questions.push({
      id: 'interpretation',
      question: `"${songTitle}" has this energy that could be pure visual abstraction or grounded performance. Where do you see ${artist.artist_name} in this space?`,
      options: [
        { value: 'abstract_performance', label: 'Abstract performance', description: 'Fragmented, artistic interpretation' },
        { value: 'color_emotion', label: 'Color as emotion', description: 'Let color and light tell the story' },
        { value: 'geometric_world', label: 'Geometric world', description: 'Sharp angles, architectural environments' },
        { value: 'fluid_dreamscape', label: 'Fluid dreamscape', description: 'Liquid, morphing visual poetry' }
      ]
    })
  } else {
    questions.push({
      id: 'interpretation',
      question: `When I listen to "${songTitle}", I hear ${artist.artist_name}'s personality coming through. How should we amplify that?`,
      options: [
        { value: 'confident_energy', label: 'Confident energy', description: 'Bold, commanding presence' },
        { value: 'intimate_storytelling', label: 'Intimate storytelling', description: 'Close, personal narrative' },
        { value: 'artistic_expression', label: 'Artistic expression', description: 'Creative, experimental approach' },
        { value: 'authentic_moment', label: 'Authentic moment', description: 'Natural, unforced performance' }
      ]
    })
  }

  // Question 2: Visual approach based on artist's style
  const artistGenres = artist.genres || []
  const isHipHop = artistGenres.some(g => g.toLowerCase().includes('hip') || g.toLowerCase().includes('rap'))
  const isPop = artistGenres.some(g => g.toLowerCase().includes('pop'))
  
  if (isHipHop) {
    questions.push({
      id: 'visual_approach',
      question: `${artist.artist_name}'s got that authentic hip-hop presence. How do we showcase that power without falling into clichés?`,
      options: [
        { value: 'street_cinematic', label: 'Street cinematic', description: 'Urban environments with film quality' },
        { value: 'intimate_performance', label: 'Intimate performance', description: 'Close-up focus on lyrical delivery' },
        { value: 'community_celebration', label: 'Community celebration', description: 'Surrounded by their people and culture' },
        { value: 'artistic_metaphor', label: 'Artistic metaphor', description: 'Abstract representation of the message' }
      ]
    })
  } else if (isPop) {
    questions.push({
      id: 'visual_approach',
      question: `For a pop artist like ${artist.artist_name}, we could go big and glossy or find something more unexpected. What feels right?`,
      options: [
        { value: 'pop_spectacle', label: 'Pop spectacle', description: 'High production, multiple looks' },
        { value: 'intimate_connection', label: 'Intimate connection', description: 'Direct audience connection' },
        { value: 'artistic_evolution', label: 'Artistic evolution', description: 'Show their growth as an artist' },
        { value: 'genre_blend', label: 'Genre blend', description: 'Mix pop with unexpected elements' }
      ]
    })
  } else {
    questions.push({
      id: 'visual_approach',
      question: `What aspect of ${artist.artist_name}'s artistry should we spotlight in this video?`,
      options: [
        { value: 'vocal_performance', label: 'Vocal performance', description: 'Emphasize their singing ability' },
        { value: 'personality', label: 'Personality', description: 'Show who they are as a person' },
        { value: 'artistic_vision', label: 'Artistic vision', description: 'Their creative perspective' },
        { value: 'emotional_range', label: 'Emotional range', description: 'Different sides of their expression' }
      ]
    })
  }

  // Question 3: Environment and setting
  questions.push({
    id: 'environment',
    question: `I'm picturing ${artist.artist_name} in different environments for this song. Which setting would create the most powerful visual story?`,
    options: [
      { value: 'studio_intimate', label: 'Studio intimate', description: 'Professional but personal recording space' },
      { value: 'urban_authentic', label: 'Urban authentic', description: 'Real city locations, street level' },
      { value: 'abstract_space', label: 'Abstract space', description: 'Designed environments, artistic sets' },
      { value: 'natural_elements', label: 'Natural elements', description: 'Outdoor locations, organic feel' }
    ]
  })

  // Question 4: Performance style based on lyrics content
  if (isEmotional) {
    questions.push({
      id: 'performance_style',
      question: `The emotional weight in these lyrics is real. How should ${artist.artist_name} deliver this to feel authentic?`,
      options: [
        { value: 'vulnerable_closeups', label: 'Vulnerable close-ups', description: 'Let the emotion show in their face' },
        { value: 'movement_expression', label: 'Movement expression', description: 'Use body language and gesture' },
        { value: 'subtle_restraint', label: 'Subtle restraint', description: 'Hold back, let viewers feel it' },
        { value: 'raw_performance', label: 'Raw performance', description: 'Unpolished, authentic delivery' }
      ]
    })
  } else if (isEnergetic) {
    questions.push({
      id: 'performance_style',
      question: `This track has serious energy. How do we capture ${artist.artist_name}'s performance power?`,
      options: [
        { value: 'dynamic_movement', label: 'Dynamic movement', description: 'Active camera, kinetic energy' },
        { value: 'controlled_power', label: 'Controlled power', description: 'Contained but intense performance' },
        { value: 'explosive_moments', label: 'Explosive moments', description: 'Build to big energy releases' },
        { value: 'crowd_energy', label: 'Crowd energy', description: 'Feed off audience reaction' }
      ]
    })
  } else {
    questions.push({
      id: 'performance_style',
      question: `What kind of performance energy fits ${artist.artist_name} best for this track?`,
      options: [
        { value: 'conversational', label: 'Conversational', description: 'Like talking directly to a friend' },
        { value: 'confident_delivery', label: 'Confident delivery', description: 'Strong, assured performance' },
        { value: 'artistic_interpretation', label: 'Artistic interpretation', description: 'Creative expression over literal' },
        { value: 'emotional_journey', label: 'Emotional journey', description: 'Take viewers through feelings' }
      ]
    })
  }

  return questions
}