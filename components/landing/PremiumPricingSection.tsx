'use client'

import * as React from "react"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "@/components/ui/premium-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Floating, Magnetic, Glow, Shimmer } from "@/components/ui/animation-components"
import { Crown, Zap, Sparkles, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumPricingSectionProps {
  className?: string
}

export function PremiumPricingSection({ className }: PremiumPricingSectionProps) {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null)

  const boostPacks = [
    { 
      id: 'quick',
      name: 'Quick Boost', 
      points: 500, 
      price: 4, 
      icon: Zap, 
      gradient: 'from-blue-600 to-blue-700',
      glowColor: 'blue' as const,
      description: 'Perfect for finishing projects',
      features: ['Instant delivery', '500 premium points', 'Perfect for small projects']
    },
    { 
      id: 'power',
      name: 'Power Boost', 
      points: 1500, 
      price: 10, 
      icon: Rocket, 
      gradient: 'from-amber-600 to-orange-600',
      glowColor: 'amber' as const,
      popular: true,
      description: 'Most popular choice',
      features: ['Best value', '1500 premium points', 'Popular with professionals', 'Covers multiple projects']
    },
    { 
      id: 'mega',
      name: 'Mega Boost', 
      points: 5000, 
      price: 30, 
      icon: Sparkles, 
      gradient: 'from-purple-600 to-pink-600',
      glowColor: 'purple' as const,
      description: 'For heavy creative work',
      features: ['Maximum value', '5000 premium points', 'Studio-grade capacity', 'Extended creative sessions']
    }
  ]

  return (
    <section className={cn(
      "relative py-16 sm:py-20 lg:py-24 bg-slate-950/95",
      className
    )}>
      {/* Hero Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/heroes/professional-creative-power-hero.jpg" 
          alt="Professional Creative Power" 
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 py-8 lg:py-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl animate-text-reveal-1">
              Professional Creative Power
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed drop-shadow-lg animate-text-reveal-2">
              Get unlimited access to 6 FREE models plus 2,500 points monthly for premium features. 
              Need more? Boost packs give you instant credits when inspiration strikes.
            </p>
          </div>

          {/* Main Subscription Card */}
          <Floating delay={0.2} duration={4} distance={8}>
            <div className="max-w-md sm:max-w-lg mx-auto mb-12 sm:mb-16">
              <Magnetic>
                <PremiumCard 
                  variant="glass" 
                  className="group hover-lift cursor-pointer relative overflow-hidden"
                  onMouseEnter={() => setHoveredCard('subscription')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {hoveredCard === 'subscription' && (
                    <>
                      <Shimmer direction="right" duration="2s" />
                      <Glow color="amber" intensity="medium" />
                    </>
                  )}
                  
                  <PremiumCardHeader className="text-center pb-4 relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="w-8 h-8 text-amber-400 group-hover:animate-bounce" />
                      <PremiumCardTitle className="text-2xl sm:text-3xl text-white group-hover:neon-amber transition-all duration-300">
                        Creator Pro
                      </PremiumCardTitle>
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold text-white group-hover:text-amber-100 transition-colors">
                      $20<span className="text-lg sm:text-xl text-slate-400 font-normal">/month</span>
                    </div>
                  </PremiumCardHeader>
                  
                  <PremiumCardContent className="space-y-4 sm:space-y-6 relative z-10">
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { icon: Crown, text: 'Unlimited FREE models (6 models)', color: 'text-amber-400' },
                        { icon: Zap, text: '2,500 points for premium features', color: 'text-blue-400' },
                        { icon: Sparkles, text: 'All creative formats included', color: 'text-orange-400' }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 glass-strong rounded-lg group/feature hover:bg-white/10 transition-all duration-300">
                          <feature.icon className={`w-5 h-5 ${feature.color} flex-shrink-0 group-hover/feature:scale-110 transition-transform`} />
                          <span className="text-white text-sm sm:text-base group-hover/feature:text-slate-100 transition-colors">
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <EnhancedButton 
                        variant="premium"
                        className="w-full relative overflow-hidden group/btn"
                        size="lg"
                      >
                        <Shimmer direction="right" duration="1.5s" />
                        <Sparkles className="w-5 h-5 mr-2 group-hover/btn:animate-spin transition-all duration-300" />
                        Start Free Trial
                      </EnhancedButton>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </Magnetic>
            </div>
          </Floating>

          {/* Boost Packs Section */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4 animate-text-reveal-2">Need More Points?</h3>
            <p className="text-lg text-slate-400 animate-text-reveal-3">Get instant boosts when you're in creative flow</p>
          </div>

          {/* Boost Packs Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {boostPacks.map((pack, index) => (
              <Floating key={pack.id} delay={index * 0.3} duration={3.5 + index * 0.5} distance={12}>
                <Magnetic>
                  <PremiumCard 
                    variant="neon"
                    className={cn(
                      "group cursor-pointer hover-lift transition-all duration-500 relative overflow-hidden h-full",
                      pack.popular && "scale-105 lg:scale-110"
                    )}
                    onMouseEnter={() => setHoveredCard(pack.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Popular badge */}
                    {pack.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm shadow-lg animate-bounce-slow">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    {/* Hover effects */}
                    {hoveredCard === pack.id && (
                      <>
                        <Shimmer direction="right" duration="1.8s" />
                        <Glow color={pack.glowColor} intensity="high" pulse />
                      </>
                    )}
                    
                    <PremiumCardHeader className="text-center pb-4 relative z-10">
                      <div className={cn(
                        "inline-flex p-4 rounded-xl bg-gradient-to-r shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300",
                        pack.gradient
                      )}>
                        <pack.icon className="w-8 h-8 text-white group-hover:animate-spin transition-all duration-300" />
                      </div>
                      <PremiumCardTitle className="text-2xl text-white group-hover:neon-blue transition-all duration-300">
                        {pack.name}
                      </PremiumCardTitle>
                      <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                        {pack.description}
                      </p>
                    </PremiumCardHeader>
                    
                    <PremiumCardContent className="text-center space-y-4 relative z-10">
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-white group-hover:text-amber-100 transition-colors">
                          +{pack.points.toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                          points
                        </div>
                      </div>
                      
                      <div className="text-4xl font-bold text-white group-hover:text-green-100 transition-colors">
                        ${pack.price}
                      </div>
                      
                      {/* Feature list */}
                      <div className="space-y-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {pack.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center justify-center gap-2">
                            <div className="w-1 h-1 bg-amber-400 rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <EnhancedButton 
                        variant="glass"
                        className={cn(
                          "w-full relative overflow-hidden group/btn",
                          `hover:bg-gradient-to-r hover:${pack.gradient}`
                        )}
                        size="lg"
                      >
                        <Shimmer direction="right" duration="1.2s" />
                        <Zap className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                        Get Boost
                      </EnhancedButton>
                      
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                        Instant delivery • Credits never expire
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>
                </Magnetic>
              </Floating>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}