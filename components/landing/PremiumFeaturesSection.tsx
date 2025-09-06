'use client'

import * as React from "react"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "@/components/ui/premium-card"
import { Floating, Magnetic, Glow } from "@/components/ui/animation-components"
import { cn } from "@/lib/utils"

interface PremiumFeaturesSectionProps {
  className?: string
}

export function PremiumFeaturesSection({ className }: PremiumFeaturesSectionProps) {
  const formats = [
    { 
      icon: '📖', 
      name: 'Stories', 
      desc: 'Cinematic breakdowns with professional shot lists', 
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      glowColor: 'blue' as const,
      backgroundImage: '/images/format-previews/stories-preview.jpg'
    },
    { 
      icon: '🎵', 
      name: 'Music Videos', 
      desc: 'Transform lyrics into compelling visual narratives', 
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      glowColor: 'purple' as const,
      backgroundImage: '/images/format-previews/music-video-preview.jpg'
    },
    { 
      icon: '💼', 
      name: 'Commercials', 
      desc: 'Create persuasive campaign concepts that convert', 
      color: 'from-green-500/20 to-green-600/20 border-green-500/30',
      glowColor: 'green' as const,
      backgroundImage: '/images/format-previews/commercial-preview.jpg'
    },
    { 
      icon: '📚', 
      name: "Children's Books", 
      desc: 'Age-appropriate illustrations with consistent characters', 
      color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      glowColor: 'amber' as const,
      backgroundImage: '/images/format-previews/childrens-book-preview.jpg'
    }
  ]

  return (
    <section className={cn(
      "relative py-16 sm:py-20 lg:py-24 bg-slate-900/95",
      className
    )}>
      {/* Hero Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/heroes/one-story-every-medium-hero.jpg" 
          alt="One Story Every Medium" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 py-12 lg:py-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl animate-text-reveal-1">
              One Story, Every Medium
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-5xl mx-auto leading-relaxed drop-shadow-lg animate-text-reveal-2">
              Transform your stories into professional shot lists for films, music videos, 
              commercials, and children's books - all with consistent characters.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-5 xl:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Format Cards */}
            <div className="lg:col-span-3 xl:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {formats.map((format, index) => (
                  <Floating key={index} delay={index * 0.2} duration={3 + index * 0.5} distance={10}>
                    <Magnetic>
                      <PremiumCard 
                        variant="glass"
                        className={cn(
                          "group cursor-pointer hover-lift h-full min-h-[250px] lg:min-h-[280px]",
                          "relative overflow-hidden"
                        )}
                      >
                        {/* Background Image */}
                        {format.backgroundImage && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                            <img 
                              src={format.backgroundImage} 
                              alt={format.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Glow Effect */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Glow color={format.glowColor} intensity="medium" />
                        </div>
                        
                        <PremiumCardContent className="p-6 sm:p-8 lg:p-10 text-center flex flex-col justify-center h-full relative z-10">
                          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                            {format.icon}
                          </div>
                          <div className="text-white font-semibold text-lg sm:text-xl lg:text-2xl mb-3 lg:mb-4 group-hover:neon-amber transition-all duration-300">
                            {format.name}
                          </div>
                          <div className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                            {format.desc}
                          </div>
                          
                          {/* Hover reveal additional info */}
                          <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <div className="text-xs text-amber-400 font-medium">
                              Click to explore →
                            </div>
                          </div>
                        </PremiumCardContent>
                      </PremiumCard>
                    </Magnetic>
                  </Floating>
                ))}
              </div>
            </div>

            {/* Character Consistency Demo */}
            <div className="lg:col-span-2 xl:col-span-1 mt-8 lg:mt-0">
              <Floating delay={0.8} duration={4} distance={12}>
                <PremiumCard 
                  variant="elevated"
                  className="h-full hover-tilt group cursor-pointer"
                  backgroundImage="/images/heroes/character-consistency-hero.jpg"
                >
                  <PremiumCardHeader className="relative z-10 pb-4 lg:pb-6">
                    <PremiumCardTitle className="text-white text-xl sm:text-2xl lg:text-3xl text-center drop-shadow-lg group-hover:neon-blue transition-all duration-300">
                      Character Consistency System
                    </PremiumCardTitle>
                    <p className="text-slate-300 text-sm sm:text-base lg:text-lg text-center mt-2 lg:mt-4 drop-shadow-md group-hover:text-slate-200 transition-colors">
                      Maintain visual consistency across all your creative projects
                    </p>
                  </PremiumCardHeader>
                  
                  <PremiumCardContent className="relative z-10 p-6 sm:p-8 lg:p-10">
                    <div className="space-y-6 lg:space-y-8">
                      {[
                        { color: 'green', tag: '@main_character', desc: 'A young detective with piercing blue eyes and weathered coat' },
                        { color: 'blue', tag: '@warehouse_location', desc: 'Abandoned warehouse with dim lighting and concrete floors' },
                        { color: 'amber', tag: '@mysterious_briefcase', desc: 'Leather briefcase with strange markings and brass locks' }
                      ].map((item, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-xl p-4 lg:p-6 space-y-3 hover:bg-slate-800/70 transition-colors duration-300 group/item">
                          <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-${item.color}-400 group-hover/item:animate-pulse`} />
                            <div className={`text-${item.color}-400 text-base lg:text-lg font-medium group-hover/item:neon-${item.color} transition-all duration-300`}>
                              {item.tag}
                            </div>
                          </div>
                          <div className="text-white text-sm lg:text-base pl-8 lg:pl-9 leading-relaxed group-hover/item:text-slate-100 transition-colors">
                            {item.desc}
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-8 lg:mt-10 p-4 lg:p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl hover:border-amber-400/50 transition-colors duration-300 group/highlight">
                        <div className="text-amber-400 font-semibold text-sm lg:text-base mb-2 group-hover/highlight:neon-amber transition-all duration-300">
                          ✨ Consistency Across All Formats
                        </div>
                        <div className="text-slate-300 text-xs lg:text-sm leading-relaxed group-hover/highlight:text-slate-200 transition-colors">
                          Use the same character, location, and prop definitions across stories, music videos, commercials, and children's books.
                        </div>
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </Floating>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}