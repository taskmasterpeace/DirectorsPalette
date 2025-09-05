"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare, Sparkles, Briefcase } from "lucide-react"
import type { EnhancedCommercialDirector } from "@/lib/commercial-directors"

export interface CommercialDirectorQuestion {
  id: string
  question: string
  options: {
    value: string
    label: string
    description?: string
  }[]
  selectedValue?: string
}

interface CommercialQuestionCardsProps {
  isOpen: boolean
  onClose: () => void
  director: EnhancedCommercialDirector
  brandContext: {
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  }
  onQuestionsAnswered: (answers: CommercialDirectorQuestion[]) => void
}

export function CommercialQuestionCards({
  isOpen,
  onClose,
  director,
  brandContext,
  onQuestionsAnswered
}: CommercialQuestionCardsProps) {
  const [questions, setQuestions] = useState<CommercialDirectorQuestion[]>(() => 
    generateCommercialDirectorQuestions(director, brandContext)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-4">
      <div className="w-full max-w-7xl max-h-[95vh] overflow-auto bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-6">
        {/* Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {director.name} Has Creative Questions
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            I've been studying your brand and campaign goals. Let's collaborate on the creative direction to make this commercial truly effective.
          </p>
        </div>

        {/* Questions Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-3">
              {/* Question Header */}
              <div className="flex items-start gap-2 sm:gap-3">
                <Badge className="mt-0.5 bg-orange-600 flex-shrink-0" variant="default" size="sm">
                  {qIndex + 1}
                </Badge>
                <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                  {question.question}
                </p>
              </div>
              
              {/* Options - Mobile Optimized */}
              <div className="space-y-2">
                {question.options.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      question.selectedValue === option.value
                        ? "border-orange-500 bg-orange-900/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600 active:bg-slate-700/50"
                    }`}
                    onClick={() => {
                      handleOptionSelect(qIndex, option.value)
                      setSelectedCard(qIndex)
                    }}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        {/* Radio Button */}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          question.selectedValue === option.value
                            ? "border-orange-500 bg-orange-500"
                            : "border-slate-500"
                        }`}>
                          {question.selectedValue === option.value && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        
                        {/* Option Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white leading-tight">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 order-2 sm:order-1"
            size="sm"
          >
            Skip Questions
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allQuestionsAnswered}
            className="bg-orange-600 hover:bg-orange-700 text-white order-1 sm:order-2"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Generate Commercial with My Vision</span>
            <span className="sm:hidden">Generate Commercial</span>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 text-center">
          <div className="flex justify-center gap-1">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  q.selectedValue ? 'bg-orange-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {questions.filter(q => q.selectedValue).length} of {questions.length} answered
          </p>
        </div>
      </div>
    </div>
  )
}

function generateCommercialDirectorQuestions(
  director: EnhancedCommercialDirector,
  brandContext: {
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  }
): CommercialDirectorQuestion[] {
  const questions: CommercialDirectorQuestion[] = []
  
  // Analyze brand context for question generation
  const isProductBased = brandContext.brandDescription.toLowerCase().includes('product') ||
                          brandContext.brandDescription.toLowerCase().includes('sneakers') ||
                          brandContext.brandDescription.toLowerCase().includes('device')
  const isLuxuryBrand = brandContext.brandDescription.toLowerCase().includes('luxury') ||
                        brandContext.brandDescription.toLowerCase().includes('premium') ||
                        brandContext.brandDescription.toLowerCase().includes('exclusive')
  const isViralGoal = brandContext.campaignGoals.toLowerCase().includes('viral') ||
                      brandContext.campaignGoals.toLowerCase().includes('social') ||
                      brandContext.campaignGoals.toLowerCase().includes('awareness')

  // Director-specific questions based on their style
  if (director.id === 'zach-king-commercial') {
    questions.push({
      id: 'transformation_moment',
      question: "What's the most surprising transformation I could show with your product?",
      options: [
        { value: 'instant_solution', label: 'Instant problem solving', description: 'Show immediate before/after transformation' },
        { value: 'impossible_reveal', label: 'Impossible product reveal', description: 'Product appears in magical, unexpected way' },
        { value: 'lifestyle_magic', label: 'Lifestyle transformation', description: 'Show how product magically improves daily life' },
        { value: 'competitive_magic', label: 'Competitive advantage', description: 'Show your product vs others in magical way' }
      ]
    })

    if (isProductBased) {
      questions.push({
        id: 'product_integration',
        question: "How should I make the product the star without breaking the magic?",
        options: [
          { value: 'hero_moment', label: 'Hero product moment', description: 'Dramatic reveal with perfect lighting' },
          { value: 'seamless_use', label: 'Seamless integration', description: 'Product naturally part of the magic' },
          { value: 'transformation_tool', label: 'Transformation catalyst', description: 'Product causes the magical change' },
          { value: 'surprise_element', label: 'Surprise element', description: 'Product appears when least expected' }
        ]
      })
    }
  }

  if (director.id === 'casey-neistat-commercial') {
    questions.push({
      id: 'authenticity_approach',
      question: "What authentic story should I tell about your brand?",
      options: [
        { value: 'founder_story', label: 'Founder\'s journey', description: 'Personal story behind the brand' },
        { value: 'customer_journey', label: 'Real customer experience', description: 'Follow an actual customer\'s story' },
        { value: 'behind_scenes', label: 'Behind the scenes', description: 'Show how product is made/delivered' },
        { value: 'problem_solution', label: 'Real problem solving', description: 'Address genuine customer pain points' }
      ]
    })

    questions.push({
      id: 'lifestyle_integration',
      question: "How does your product fit into real daily life?",
      options: [
        { value: 'morning_routine', label: 'Part of morning routine', description: 'Show natural integration in daily habits' },
        { value: 'work_enhancement', label: 'Work/productivity booster', description: 'Helps people achieve professional goals' },
        { value: 'social_connector', label: 'Social connector', description: 'Brings people together or enhances relationships' },
        { value: 'personal_growth', label: 'Personal development', description: 'Helps people become better versions of themselves' }
      ]
    })
  }

  if (director.id === 'david-droga-commercial') {
    questions.push({
      id: 'emotional_core',
      question: "What deeper human truth does your brand represent?",
      options: [
        { value: 'aspiration', label: 'Aspiration and dreams', description: 'Help people reach their potential' },
        { value: 'connection', label: 'Human connection', description: 'Bringing people together' },
        { value: 'achievement', label: 'Achievement and success', description: 'Celebrating accomplishments' },
        { value: 'transformation', label: 'Personal transformation', description: 'Becoming who you want to be' }
      ]
    })

    if (isLuxuryBrand) {
      questions.push({
        id: 'luxury_positioning',
        question: "How should I position your brand's luxury and exclusivity?",
        options: [
          { value: 'heritage_craft', label: 'Heritage and craftsmanship', description: 'Emphasize tradition and quality' },
          { value: 'exclusive_access', label: 'Exclusive access', description: 'Show what others can\'t have' },
          { value: 'sophisticated_taste', label: 'Sophisticated choice', description: 'For those who appreciate the finest' },
          { value: 'effortless_luxury', label: 'Effortless elegance', description: 'Luxury that feels natural and deserved' }
        ]
      })
    }
  }

  if (director.id === 'mr-beast-commercial') {
    questions.push({
      id: 'scale_approach',
      question: "What massive scale element should drive this commercial?",
      options: [
        { value: 'huge_giveaway', label: 'Massive giveaway', description: 'Give away thousands of your product' },
        { value: 'epic_challenge', label: 'Epic challenge', description: 'Create viral challenge around your product' },
        { value: 'record_breaking', label: 'Record-breaking stunt', description: 'Set a world record using your product' },
        { value: 'charitable_impact', label: 'Charitable impact', description: 'Use your product to help thousands of people' }
      ]
    })

    questions.push({
      id: 'viral_hook',
      question: "What's the hook that will make people stop scrolling and share?",
      options: [
        { value: 'money_angle', label: 'Money/value angle', description: 'Show massive savings or cash value' },
        { value: 'impossible_scale', label: 'Impossible scale', description: 'Do something at unprecedented scale' },
        { value: 'celebrity_surprise', label: 'Surprise celebrity', description: 'Unexpected famous person involvement' },
        { value: 'audience_participation', label: 'Audience participation', description: 'Viewers can join or benefit directly' }
      ]
    })
  }

  // Universal commercial questions that apply to all directors
  questions.push({
    id: 'call_to_action',
    question: "What action do you want viewers to take immediately?",
    options: [
      { value: 'visit_website', label: 'Visit website', description: 'Drive traffic to online presence' },
      { value: 'purchase_now', label: 'Purchase immediately', description: 'Direct conversion to sales' },
      { value: 'learn_more', label: 'Learn more/download', description: 'Gather leads for nurturing' },
      { value: 'visit_store', label: 'Visit physical location', description: 'Drive foot traffic to stores' },
      { value: 'follow_social', label: 'Follow on social', description: 'Build ongoing audience relationship' }
    ]
  })

  return questions
}

export { generateCommercialDirectorQuestions }