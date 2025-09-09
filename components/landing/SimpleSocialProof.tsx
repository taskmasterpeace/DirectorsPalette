'use client'

import { Card, CardContent } from '@/components/ui/card'

// Fictional company logos/names for social proof
const FICTIONAL_COMPANIES = [
  { name: 'Creative Studios Inc.', type: 'AGENCY', color: 'text-blue-400' },
  { name: 'StoryForge Media', type: 'PRODUCTION', color: 'text-emerald-400' },
  { name: 'Pixel Dreams Co.', type: 'CREATIVE', color: 'text-amber-400' },
  { name: 'Narrative Labs', type: 'STUDIO', color: 'text-purple-400' },
  { name: 'Visual Craft Agency', type: 'AGENCY', color: 'text-red-400' },
  { name: 'Motion Pictures Pro', type: 'PRODUCTION', color: 'text-cyan-400' }
]

export function SimpleSocialProof() {
  return (
    <section className="relative py-20 bg-slate-900/95">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Trusted by Creative Professionals
            </h2>
            <p className="text-xl text-slate-300">
              From independent creators to professional studios worldwide
            </p>
          </div>
          
          {/* Company Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {FICTIONAL_COMPANIES.map((company, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className={`font-semibold ${company.color}`}>
                      {company.name}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      {company.type}
                    </div>
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