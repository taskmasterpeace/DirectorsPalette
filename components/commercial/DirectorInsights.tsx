"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Lightbulb, 
  Eye, 
  Target, 
  Sparkles,
  Quote
} from 'lucide-react'
import type { EnhancedCommercialDirector } from '@/lib/commercial-directors'

interface DirectorInsightsProps {
  director: EnhancedCommercialDirector
  brandContext: {
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  }
  onAskQuestion?: () => void
}

export function DirectorInsights({ director, brandContext, onAskQuestion }: DirectorInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    // Generate director-specific insights based on brand context
    const generatedInsights = generateDirectorInsights(director, brandContext)
    setInsights(generatedInsights)
    setCurrentInsight(0)
  }, [director, brandContext])

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length)
  }

  if (!insights.length) return null

  return (
    <Card className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border-orange-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {director.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <CardTitle className="text-white text-lg">{director.name}'s Perspective</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs text-orange-400">
                  {director.tags?.[0] || director.category}
                </Badge>
                <Badge variant="outline" className="text-xs text-slate-400">
                  Engagement: {director.commercialStats.engagement}/10
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {insights.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={nextInsight}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-900/30"
              >
                <Eye className="w-4 h-4 mr-1" />
                More Insights
              </Button>
            )}
            {onAskQuestion && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAskQuestion}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-900/30"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Ask Questions
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-slate-200 leading-relaxed">
                {insights[currentInsight]}
              </p>
            </div>
          </div>
        </div>

        {/* Director's Recommendation */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          <span className="text-yellow-400 font-medium">Recommendation:</span>
          <span className="text-slate-300">{getDirectorRecommendation(director, brandContext)}</span>
        </div>

        {/* Platform Strength Display */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-cyan-400" />
          <span className="text-cyan-400 font-medium">Best Platforms:</span>
          <div className="flex gap-1">
            {director.platformStrength.map(platform => (
              <Badge key={platform} variant="outline" className="text-xs text-cyan-300">
                {platform.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function generateDirectorInsights(
  director: EnhancedCommercialDirector,
  brandContext: {
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  }
): string[] {
  const insights: string[] = []

  // Base insight about their approach to this brand
  if (director.id === 'zach-king-commercial') {
    insights.push(`For your brand, I see incredible potential for viral transformation moments. The key is finding that "impossible" element that makes people wonder how we did it while showcasing your product naturally.`)
    
    if (brandContext.brandDescription.toLowerCase().includes('tech')) {
      insights.push(`Tech products are perfect for my style - I can make your device appear, transform, or solve problems in ways that seem impossible. The magic moment IS the product demo.`)
    }
    
    insights.push(`Remember, the goal isn't just to show your product - it's to create a moment so shareable that your brand becomes part of the viral conversation.`)
  }

  if (director.id === 'casey-neistat-commercial') {
    insights.push(`I believe the best commercials don't feel like commercials. Let me show your product as part of real life - authentic, unpolished, genuine. People trust recommendations from real experiences.`)
    
    if (brandContext.targetAudience.toLowerCase().includes('entrepreneur') || 
        brandContext.targetAudience.toLowerCase().includes('creator')) {
      insights.push(`Your audience values authenticity over polish. I'll show your product in real work scenarios, with real benefits, solving real problems that creators actually face.`)
    }
    
    insights.push(`The most powerful commercial is one where I genuinely believe in your product and share that belief like I'm talking to a friend, not selling to a customer.`)
  }

  if (director.id === 'david-droga-commercial') {
    insights.push(`Your brand isn't just selling a product - you're selling transformation, aspiration, a better version of life. I'll craft a narrative that makes people feel something deeper than just wanting to buy.`)
    
    if (brandContext.brandDescription.toLowerCase().includes('luxury') || 
        brandContext.brandDescription.toLowerCase().includes('premium')) {
      insights.push(`Luxury isn't about showing expensive things - it's about creating the feeling that this brand understands and elevates the customer's aspirations.`)
    }
    
    insights.push(`The best commercial creates an emotional truth that resonates beyond the 30 seconds. People should remember how your brand made them feel, not just what it does.`)
  }

  if (director.id === 'mr-beast-commercial') {
    insights.push(`Your commercial needs to be an EVENT, not just an ad. What if we gave away $100,000 worth of your product? What if we broke a world record? The scale has to be impossible to ignore.`)
    
    insights.push(`I don't make commercials that people tolerate - I make content that people actively seek out, share, and talk about. Your brand becomes part of a viral moment that everyone remembers.`)
    
    if (brandContext.campaignGoals.toLowerCase().includes('awareness')) {
      insights.push(`For awareness, we need MASSIVE reach. I'm talking millions of views, trending hashtags, people making reaction videos to your commercial. The scale makes the message.`)
    }
  }

  // Add brand-specific insights
  const brandName = extractBrandName(brandContext.brandDescription)
  if (brandName) {
    insights.push(`Based on what I know about brands like ${brandName}, the key is ${getBrandSpecificInsight(director, brandContext)}.`)
  }

  return insights
}

function getDirectorRecommendation(
  director: EnhancedCommercialDirector,
  brandContext: { brandDescription: string; campaignGoals: string; targetAudience: string }
): string {
  const recommendations = {
    'zach-king-commercial': 'Focus on the transformation moment - make it impossible and irresistible',
    'casey-neistat-commercial': 'Keep it real and personal - authenticity over production value',
    'david-droga-commercial': 'Lead with emotion and aspiration - sell the dream, not just the product',
    'mr-beast-commercial': 'Go massive or go home - create an event people can\'t ignore'
  }

  return recommendations[director.id as keyof typeof recommendations] || 'Let\'s create something memorable together'
}

function extractBrandName(brandDescription: string): string | null {
  // Simple brand name extraction - could be enhanced with NLP
  const words = brandDescription.split(' ')
  const capitalizedWords = words.filter(word => 
    word.length > 2 && 
    word[0] === word[0].toUpperCase() && 
    !['The', 'Our', 'This', 'We', 'They'].includes(word)
  )
  return capitalizedWords[0] || null
}

function getBrandSpecificInsight(
  director: EnhancedCommercialDirector,
  brandContext: { brandDescription: string }
): string {
  if (brandContext.brandDescription.toLowerCase().includes('tech')) {
    return director.id === 'zach-king-commercial' 
      ? 'making technology feel magical and accessible'
      : director.id === 'casey-neistat-commercial'
        ? 'showing how tech actually improves real people\'s lives'
        : 'positioning technology as an enabler of human potential'
  }
  
  if (brandContext.brandDescription.toLowerCase().includes('fashion')) {
    return director.id === 'zach-king-commercial'
      ? 'instant style transformations that showcase the fashion'
      : 'authentic style integration in real lifestyle contexts'
  }
  
  return 'understanding the authentic connection between brand and customer'
}

export default DirectorInsights