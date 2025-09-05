'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Rocket, Sparkles, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface BoostPack {
  id: string
  name: string
  points: number
  price: number
  icon: React.ReactNode
  color: string
  description: string
  popular?: boolean
  value: string
}

const BOOST_PACKS: BoostPack[] = [
  {
    id: 'quick-boost',
    name: 'Quick Boost',
    points: 500,
    price: 4,
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    description: 'Perfect for finishing that project',
    value: '500 images OR 125 videos'
  },
  {
    id: 'power-boost',
    name: 'Power Boost',
    points: 1500,
    price: 10,
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    description: 'Serious creative work',
    popular: true,
    value: '1,500 images OR 375 videos'
  },
  {
    id: 'mega-boost',
    name: 'Mega Boost',
    points: 5000,
    price: 30,
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    description: 'Maximum creative power',
    value: '5,000 images OR 1,250 videos'
  }
]

interface BoostPacksProps {
  currentCredits: number
  onPurchase: (boostPackId: string) => Promise<void>
  isLoading?: boolean
}

export function BoostPacks({ currentCredits, onPurchase, isLoading = false }: BoostPacksProps) {
  const { toast } = useToast()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handlePurchase = async (pack: BoostPack) => {
    setPurchasing(pack.id)
    try {
      await onPurchase(pack.id)
      toast({
        title: "Boost Pack Purchased!",
        description: `Added ${pack.points.toLocaleString()} points to your account`
      })
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to purchase boost pack",
        variant: "destructive"
      })
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          Boost Packs
        </h2>
        <p className="text-slate-400">
          Need more points? Get instant boosts when you're in creative flow
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="text-white font-medium">Current Credits:</div>
          <Badge variant="outline" className="text-orange-400 border-orange-400 text-lg px-3 py-1">
            {currentCredits.toLocaleString()} points
          </Badge>
        </div>
      </div>

      {/* Boost Pack Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {BOOST_PACKS.map((pack) => (
          <Card 
            key={pack.id}
            className={`relative bg-slate-800 border-slate-700 hover:border-slate-600 transition-all ${
              pack.popular ? 'ring-2 ring-purple-500/50' : ''
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${pack.color}`}>
                  {pack.icon}
                </div>
                {pack.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Points Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  +{pack.points.toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">points</div>
              </div>

              {/* Value Proposition */}
              <div className="text-center">
                <div className="text-slate-300 text-sm">{pack.description}</div>
                <div className="text-slate-400 text-xs mt-1">{pack.value}</div>
              </div>

              {/* Pricing */}
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${pack.price}
                </div>
                <div className="text-slate-400 text-xs">
                  {(pack.price / pack.points * 1000).toFixed(1)}¢ per 100 points
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchase(pack)}
                disabled={isLoading || purchasing === pack.id}
                className={`w-full bg-gradient-to-r ${pack.color} hover:opacity-90 text-white`}
                size="lg"
              >
                {purchasing === pack.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {pack.icon}
                    <span className="ml-2">Buy {pack.name}</span>
                  </>
                )}
              </Button>

              {/* Value Indicator */}
              <div className="text-center">
                <div className="text-xs text-slate-500">
                  Instant delivery • Credits never expire
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Examples */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">What Can You Create?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-400 font-medium">Quick Boost (500 points)</div>
              <div className="text-slate-300 mt-1">
                • 500 character images<br/>
                • 125 short videos<br/>
                • 33 premium stories<br/>
                • Perfect for project completion
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-purple-400 font-medium">Power Boost (1,500 points)</div>
              <div className="text-slate-300 mt-1">
                • 1,500 character images<br/>
                • 375 short videos<br/>
                • 100 premium stories<br/>
                • Great for creative campaigns
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-orange-400 font-medium">Mega Boost (5,000 points)</div>
              <div className="text-slate-300 mt-1">
                • 5,000 character images<br/>
                • 1,250 short videos<br/>
                • 333 premium stories<br/>
                • Professional production scale
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remember FREE Models */}
      <Card className="bg-green-900/20 border-green-600/30">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-green-400 font-medium mb-2">💡 Pro Tip: Save Your Points!</div>
            <div className="text-green-300 text-sm">
              Use our 6 FREE models for unlimited story generation, character extraction, and basic processing. 
              Save your points for images and videos when you need that extra quality!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}