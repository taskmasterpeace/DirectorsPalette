"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare, Sparkles } from "lucide-react"
import type { FilmDirector } from "@/lib/director-types"
import type { StoryEntities } from "./story-entities-config"

export interface DirectorQuestion {
  id: string
  question: string
  options: {
    value: string
    label: string
    description?: string
  }[]
  selectedValue?: string
}

interface DirectorQuestionCardsProps {
  isOpen: boolean
  onClose: () => void
  director: FilmDirector
  storyContext: string
  entities: StoryEntities
  onQuestionsAnswered: (answers: DirectorQuestion[]) => void
}

export function DirectorQuestionCards({
  isOpen,
  onClose,
  director,
  storyContext,
  entities,
  onQuestionsAnswered
}: DirectorQuestionCardsProps) {
  const [questions, setQuestions] = useState<DirectorQuestion[]>(() => 
    generateDirectorQuestions(director, storyContext, entities)
  )
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  const handleOptionSelect = (questionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].selectedValue = value
    setQuestions(newQuestions)
    setSelectedCard(null)
  }

  const allQuestionsAnswered = questions.every(q => q.selectedValue)

  const handleProceed = () => {
    onQuestionsAnswered(questions)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-6xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {director.name} Has Some Questions
          </h2>
          <p className="text-slate-400">
            I've analyzed your story. Help me understand your vision better.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1" variant="outline">
                  {qIndex + 1}
                </Badge>
                <p className="text-sm text-white font-medium">
                  {question.question}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {question.options.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      question.selectedValue === option.value
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                    onClick={() => handleOptionSelect(qIndex, option.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {question.selectedValue === option.value && (
                          <Check className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
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
            Skip Questions
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allQuestionsAnswered}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with My Vision
          </Button>
        </div>
      </div>
    </div>
  )
}

function generateDirectorQuestions(
  director: FilmDirector,
  story: string,
  entities: StoryEntities
): DirectorQuestion[] {
  // Generate story-specific questions based on the director's style and the story content
  // This would ideally use AI to generate contextual questions, but for now we'll use templates
  
  const questions: DirectorQuestion[] = []
  
  // Analyze story for key moments and entities
  const hasMultipleCharacters = entities.characters.length > 1
  const hasConflict = story.toLowerCase().includes('fight') || 
                      story.toLowerCase().includes('conflict') || 
                      story.toLowerCase().includes('confront')
  const hasEmotionalMoments = story.toLowerCase().includes('cry') || 
                               story.toLowerCase().includes('love') || 
                               story.toLowerCase().includes('death')
  
  // Question 1: Visual tone based on story mood
  if (hasEmotionalMoments) {
    questions.push({
      id: 'emotional_treatment',
      question: `How should I handle the emotional moments with ${entities.characters[0]?.name || 'the protagonist'}?`,
      options: [
        { value: 'intimate', label: 'Intimate close-ups', description: 'Focus on facial expressions' },
        { value: 'distant', label: 'Observational distance', description: 'Let the audience feel the space' },
        { value: 'symbolic', label: 'Visual metaphors', description: 'Use environment to reflect emotion' },
        { value: 'raw', label: 'Raw handheld', description: 'Documentary-style immediacy' }
      ]
    })
  } else {
    questions.push({
      id: 'visual_approach',
      question: 'What visual energy should drive the narrative?',
      options: [
        { value: 'kinetic', label: 'Dynamic movement', description: 'Active camera, quick cuts' },
        { value: 'composed', label: 'Carefully composed', description: 'Static frames, deliberate pacing' },
        { value: 'fluid', label: 'Fluid transitions', description: 'Smooth camera movements' },
        { value: 'contrast', label: 'Contrasting styles', description: 'Mix techniques for emphasis' }
      ]
    })
  }

  // Question 2: Character focus
  if (hasMultipleCharacters) {
    const char1 = entities.characters[0]?.referenceTag || '@character1'
    const char2 = entities.characters[1]?.referenceTag || '@character2'
    questions.push({
      id: 'character_dynamics',
      question: `How should I frame the relationship between ${char1} and ${char2}?`,
      options: [
        { value: 'tension', label: 'Emphasize tension', description: 'Separate frames, over-shoulder shots' },
        { value: 'connection', label: 'Show connection', description: 'Shared frames, matching shots' },
        { value: 'power', label: 'Power dynamics', description: 'Height differences, dominant framing' },
        { value: 'evolving', label: 'Evolving relationship', description: 'Progressive framing changes' }
      ]
    })
  } else {
    questions.push({
      id: 'protagonist_journey',
      question: `How should I track ${entities.characters[0]?.name || 'the protagonist'}'s journey?`,
      options: [
        { value: 'subjective', label: 'Subjective POV', description: 'See through their eyes' },
        { value: 'objective', label: 'Objective observer', description: 'Watch from outside' },
        { value: 'mixed', label: 'Mixed perspective', description: 'Blend internal and external' },
        { value: 'evolving', label: 'Evolving perspective', description: 'Change approach as story develops' }
      ]
    })
  }

  // Question 3: Location treatment
  if (entities.locations.length > 0) {
    const mainLocation = entities.locations[0]
    questions.push({
      id: 'location_treatment',
      question: `${mainLocation.referenceTag} is key to your story. How should I use it?`,
      options: [
        { value: 'character', label: 'As a character', description: 'Give the location personality' },
        { value: 'backdrop', label: 'As atmosphere', description: 'Subtle environmental storytelling' },
        { value: 'symbolic', label: 'As symbolism', description: 'Reflect themes and emotions' },
        { value: 'realistic', label: 'As reality', description: 'Authentic, grounded treatment' }
      ]
    })
  } else {
    questions.push({
      id: 'world_building',
      question: 'How grounded should the world feel?',
      options: [
        { value: 'realistic', label: 'Hyper-realistic', description: 'Documentary authenticity' },
        { value: 'stylized', label: 'Stylized reality', description: 'Heightened but believable' },
        { value: 'dreamlike', label: 'Dreamlike quality', description: 'Surreal touches' },
        { value: 'gritty', label: 'Gritty texture', description: 'Raw, unpolished feel' }
      ]
    })
  }

  // Question 4: Specific story moment
  if (hasConflict) {
    questions.push({
      id: 'conflict_style',
      question: 'The confrontation scene needs special attention. How should I shoot it?',
      options: [
        { value: 'visceral', label: 'Visceral impact', description: 'Handheld, close combat' },
        { value: 'choreographed', label: 'Choreographed precision', description: 'Wide shots, clear geography' },
        { value: 'psychological', label: 'Psychological focus', description: 'Faces over action' },
        { value: 'fragmented', label: 'Fragmented chaos', description: 'Quick cuts, disorientation' }
      ]
    })
  } else {
    questions.push({
      id: 'climax_approach',
      question: 'How should the climactic moments feel?',
      options: [
        { value: 'building', label: 'Slow build', description: 'Gradual tension increase' },
        { value: 'explosive', label: 'Sudden impact', description: 'Unexpected visual shift' },
        { value: 'quiet', label: 'Quiet intensity', description: 'Understated power' },
        { value: 'overwhelming', label: 'Overwhelming scale', description: 'Epic, expansive treatment' }
      ]
    })
  }

  return questions
}