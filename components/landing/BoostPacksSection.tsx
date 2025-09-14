'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Rocket, Sparkles } from 'lucide-react'
import type { BoostPack } from './LandingTypes'

const boostPacks: BoostPack[] = [
  { 
    name: 'Quick Boost', 
    points: 500, 
    price: 4, 
    icon: Zap, 
    gradient: 'from-blue-600 to-blue-700',
    ring: 'ring-blue-500/30',
    description: 'Perfect for finishing projects'
  },
  { 
    name: 'Power Boost', 
    points: 1500, 
    price: 10, 
    icon: Rocket, 
    gradient: 'from-amber-600 to-orange-600',
    ring: 'ring-amber-500/50',
    popular: true,
    description: 'Most popular choice'
  },
  { 
    name: 'Mega Boost', 
    points: 5000, 
    price: 30, 
    icon: Sparkles, 
    gradient: 'from-slate-600 to-slate-700',
    ring: 'ring-slate-500/30',
    description: 'For heavy creative work'
  }
]

interface BoostPacksSectionProps {
  onPurchase?: (packId: string) => void
}

export function BoostPacksSection({ onPurchase }: BoostPacksSectionProps) {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-slate-800/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Boost Packs Section - Clean Layout */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Need More Points?</h3>
            <p className="text-lg text-slate-400">Get instant boosts when you're in creative flow</p>
          </div>

          {/* Boost Packs Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {boostPacks.map((pack, index) => (
              <Card key={index} className={`relative bg-slate-800/50 border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 transform hover:scale-105 ${pack.popular ? `${pack.ring} ring-2` : ''}`}>
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white px-4 py-1 text-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${pack.gradient} mb-4 shadow-lg`}>
                    <pack.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{pack.name}</CardTitle>
                  <p className="text-slate-400 text-sm">{pack.description}</p>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-white">+{pack.points.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">points</div>
                  </div>
                  
                  <div className="text-4xl font-bold text-white">${pack.price}</div>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${pack.gradient} hover:opacity-90 py-3 text-lg rounded-xl shadow-lg`}
                    onClick={() => onPurchase?.(pack.name.toLowerCase().replace(' ', '-'))}
                  >
                    Get Boost
                  </Button>
                  
                  <div className="text-xs text-slate-500">
                    Instant delivery • Credits never expire
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}