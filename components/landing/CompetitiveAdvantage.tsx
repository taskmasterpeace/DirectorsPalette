'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Sparkles, Rocket } from 'lucide-react'
import type { CompetitorData } from './LandingTypes'

const competitorData: CompetitorData[] = [
  { name: 'Midjourney', price: '$60/month', features: 'Images only', color: 'text-red-400' },
  { name: 'RunwayML', price: '$95/month', features: 'Video only', color: 'text-red-400' },
  { name: 'LTX Studio', price: '$125/month', features: 'Video production', color: 'text-red-400' },
  { name: "Director's Palette", price: '$20/month', features: 'Complete workflow', color: 'text-green-400' }
]

// Scroll section component for consistency
function ScrollSection({ 
  children, 
  className = "",
  background = "bg-slate-900/95"
}: { 
  children: React.ReactNode
  className?: string
  background?: string
}) {
  return (
    <section className={`min-h-screen relative ${background} ${className}`}>
      <div className="container mx-auto px-4 py-16">
        {children}
      </div>
    </section>
  )
}

export function CompetitiveAdvantage() {
  return (
    <ScrollSection background="bg-slate-800/95">
      <div className="text-center space-y-12">
        <h2 className="text-4xl font-bold text-white">
          Why Director's Palette?
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="bg-green-900/20 border-green-500/30">
            <CardHeader className="text-center">
              <Crown className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-white">6 FREE Models</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-300">
                Unlimited text generation with professional-quality models. 
                No competitor offers this.
              </p>
              <div className="mt-4 text-2xl font-bold text-green-400">$0 Cost</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader className="text-center">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-white">Character Consistency</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-300">
                Proprietary @character_name system maintains visual consistency 
                across unlimited projects.
              </p>
              <div className="mt-4 text-lg font-bold text-blue-400">Proprietary Tech</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardHeader className="text-center">
              <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Complete Workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-300">
                Story + Music Video + Commercial + Children's Books 
                in one platform.
              </p>
              <div className="mt-4 text-lg font-bold text-purple-400">4-in-1 Platform</div>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Comparison */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-6">vs The Competition</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            {competitorData.map((comp, index) => (
              <div key={index} className="text-center">
                <div className="font-medium text-white">{comp.name}</div>
                <div className={`text-lg font-bold ${comp.color}`}>{comp.price}</div>
                <div className="text-slate-400 text-xs">{comp.features}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}