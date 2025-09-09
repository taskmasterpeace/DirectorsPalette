'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FormatCard } from './LandingTypes'

const formatCards: FormatCard[] = [
  { icon: '📖', name: 'Stories', desc: 'Cinematic breakdowns', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
  { icon: '🎵', name: 'Music Videos', desc: 'Lyric-to-visual', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
  { icon: '💼', name: 'Commercials', desc: 'Campaign concepts', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
  { icon: '📚', name: "Children's Books", desc: 'Age-appropriate illustrations', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30' }
]

export function FeaturesShowcase() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-slate-900/95">
      {/* Hero Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/heroes/one-story-every-medium-hero.jpg" 
          alt="One Story Every Medium" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section Header with Text Overlay */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 py-12 lg:py-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl">
              One Story, Every Medium
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-5xl mx-auto leading-relaxed drop-shadow-lg">
              Transform your stories into professional shot lists for films, music videos, 
              commercials, and children's books - all with consistent characters.
            </p>
          </div>

          {/* Features Grid - Balanced Desktop Layout */}
          <div className="grid lg:grid-cols-5 xl:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Left: Format Cards - Enhanced for Desktop */}
            <div className="lg:col-span-3 xl:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {formatCards.map((format, index) => (
                  <Card key={index} className={`bg-gradient-to-br ${format.color} border transform hover:scale-105 transition-all duration-300 h-full`}>
                    <CardContent className="p-6 sm:p-8 lg:p-10 text-center flex flex-col justify-center h-full min-h-[200px] lg:min-h-[240px]">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 lg:mb-6">{format.icon}</div>
                      <div className="text-white font-semibold text-lg sm:text-xl lg:text-2xl mb-3 lg:mb-4">{format.name}</div>
                      <div className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed">{format.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Character Consistency Demo - Desktop Balanced */}
            <div className="lg:col-span-2 xl:col-span-1 mt-8 lg:mt-0">
              <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-600/50 shadow-2xl h-full overflow-hidden">
                {/* Character Consistency Hero Background */}
                <div className="absolute inset-0">
                  <img 
                    src="/images/heroes/character-consistency-hero.jpg" 
                    alt="Character Consistency" 
                    className="w-full h-full object-cover opacity-15"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-800/90 via-slate-800/70 to-slate-800/95"></div>
                </div>
                
                <CardHeader className="relative z-10 pb-4 lg:pb-6">
                  <CardTitle className="text-white text-xl sm:text-2xl lg:text-3xl text-center drop-shadow-lg">Character Consistency System</CardTitle>
                  <p className="text-slate-300 text-sm sm:text-base lg:text-lg text-center mt-2 lg:mt-4 drop-shadow-md">
                    Maintain visual consistency across all your creative projects
                  </p>
                </CardHeader>
                <CardContent className="relative z-10 p-6 sm:p-8 lg:p-10">
                  <div className="space-y-6 lg:space-y-8">
                    {/* Character Reference System */}
                    <div className="space-y-4 lg:space-y-6">
                      <div className="bg-slate-900/50 rounded-lg p-4 lg:p-6 border border-slate-600/30">
                        <div className="text-amber-400 font-mono text-sm lg:text-base mb-2 lg:mb-3">@hero_character</div>
                        <div className="text-slate-200 text-xs lg:text-sm leading-relaxed">
                          Automatically maintains character appearance across stories, music videos, and books
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-lg p-4 lg:p-6 border border-slate-600/30">
                        <div className="text-blue-400 font-mono text-sm lg:text-base mb-2 lg:mb-3">@supporting_cast</div>
                        <div className="text-slate-200 text-xs lg:text-sm leading-relaxed">
                          Keep secondary characters consistent throughout your creative projects
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-lg p-4 lg:p-6 border border-slate-600/30">
                        <div className="text-green-400 font-mono text-sm lg:text-base mb-2 lg:mb-3">@brand_elements</div>
                        <div className="text-slate-200 text-xs lg:text-sm leading-relaxed">
                          Maintain visual brand consistency for commercial projects
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}