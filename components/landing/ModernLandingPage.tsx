'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

// Import our new premium components
import { EnhancedHeroSection } from '@/components/landing/EnhancedHeroSection'
import { PremiumFeaturesSection } from '@/components/landing/PremiumFeaturesSection'
import { PremiumPricingSection } from '@/components/landing/PremiumPricingSection'
import { PremiumCard } from '@/components/ui/premium-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Floating, Magnetic, Glow } from '@/components/ui/animation-components'

// Keep existing imports
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, Rocket } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'
import { AnimatedSocialProof } from '@/components/landing/AnimatedSocialProof'

// Professional navigation header for landing page
function ModernLandingHeader() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Magnetic>
            <div className="flex items-center gap-3 cursor-pointer hover-lift">
              <div className="relative">
                <Glow color="amber" intensity="low" />
                <img 
                  src="/mkl-logo.png" 
                  alt="Machine King Labs" 
                  className="w-8 h-8 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white">Director's Palette</h1>
                <div className="text-xs text-amber-400">Machine King Labs</div>
              </div>
            </div>
          </Magnetic>
          
          {/* Navigation */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">Welcome, {user?.name || user?.email}</span>
                <EnhancedButton 
                  variant="sleek"
                  onClick={() => router.push('/create')}
                >
                  Open App
                </EnhancedButton>
              </div>
            ) : (
              <EnhancedButton variant="glass">
                Sign In
              </EnhancedButton>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Enhanced competitive advantage section
function ModernCompetitiveSection() {
  const advantages = [
    {
      icon: Crown,
      title: "6 FREE Models",
      description: "Unlimited text generation with professional-quality models. No competitor offers this.",
      value: "$0 Cost",
      color: "green" as const
    },
    {
      icon: Sparkles,
      title: "Character Consistency",
      description: "Proprietary @character_name system maintains visual consistency across unlimited projects.",
      value: "Proprietary Tech",
      color: "blue" as const
    },
    {
      icon: Rocket,
      title: "Complete Workflow",
      description: "Story + Music Video + Commercial + Children's Books in one platform.",
      value: "4-in-1 Platform",
      color: "purple" as const
    }
  ]

  return (
    <section className="relative py-24 bg-slate-800/95">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-12">
            <h2 className="text-4xl font-bold text-white animate-text-reveal-1">
              Why Director's Palette?
            </h2>

            <div className="grid lg:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <Floating key={index} delay={index * 0.3} duration={4 + index * 0.5} distance={15}>
                  <Magnetic>
                    <PremiumCard variant="floating" className="text-center group cursor-pointer h-full">
                      <div className="p-8">
                        <div className="relative mb-6">
                          <Glow color={advantage.color} intensity="medium" pulse />
                          <advantage.icon className={`w-12 h-12 text-${advantage.color}-400 mx-auto group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        <h3 className="text-white text-xl font-semibold mb-4 group-hover:neon-blue transition-all duration-300">
                          {advantage.title}
                        </h3>
                        <p className={`text-${advantage.color}-300 mb-4 group-hover:text-slate-200 transition-colors`}>
                          {advantage.description}
                        </p>
                        <div className={`text-lg font-bold text-${advantage.color}-400 group-hover:neon-${advantage.color} transition-all duration-300`}>
                          {advantage.value}
                        </div>
                      </div>
                    </PremiumCard>
                  </Magnetic>
                </Floating>
              ))}
            </div>

            {/* Competitor Comparison */}
            <Floating delay={1} duration={5} distance={10}>
              <PremiumCard variant="glass" className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">vs The Competition</h3>
                <div className="grid md:grid-cols-4 gap-6 text-sm">
                  {[
                    { name: 'Midjourney', price: '$60/month', features: 'Images only', color: 'text-red-400' },
                    { name: 'RunwayML', price: '$95/month', features: 'Video only', color: 'text-red-400' },
                    { name: 'LTX Studio', price: '$125/month', features: 'Video production', color: 'text-red-400' },
                    { name: "Director's Palette", price: '$20/month', features: 'Complete workflow', color: 'text-green-400' }
                  ].map((comp, index) => (
                    <div key={index} className="text-center p-4 rounded-lg glass hover:glass-strong transition-all duration-300 hover-lift">
                      <div className="font-medium text-white mb-2">{comp.name}</div>
                      <div className={`text-2xl font-bold ${comp.color} mb-2`}>{comp.price}</div>
                      <div className="text-slate-400 text-xs">{comp.features}</div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </Floating>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ModernLandingPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [userCredits, setUserCredits] = useState(2500)

  const handleBoostPurchase = async (boostPackId: string) => {
    console.log('Purchasing boost pack:', boostPackId)
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Modern Navigation */}
      <ModernLandingHeader />
      
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-950/60" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-blue-900/10 animate-spin-slower" />
      </div>

      {/* Premium Hero Section */}
      <EnhancedHeroSection />

      {/* Premium Features Section */}
      <PremiumFeaturesSection />

      {/* Premium Pricing Section */}
      <PremiumPricingSection />

      {/* Modern Competitive Advantage */}
      <ModernCompetitiveSection />

      {/* Keep existing AnimatedSocialProof */}
      <AnimatedSocialProof />

      {/* Enhanced Final CTA */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950/95 to-slate-900/95">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <Floating delay={0.2} duration={4} distance={12}>
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight animate-text-reveal-1">
                  Ready to Transform Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 neon-amber">
                    Creative Process?
                  </span>
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto animate-text-reveal-2">
                  Join thousands of creators using Director's Palette to bring their stories to life 
                  with professional-quality results at a fraction of the cost.
                </p>
              </div>
            </Floating>
            
            <div className="space-y-8">
              {isAuthenticated ? (
                <Magnetic>
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 text-xl">
                      <Crown className="w-7 h-7 text-amber-400 animate-bounce-slow" />
                      <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                    </div>
                    <EnhancedButton 
                      variant="premium"
                      size="xl"
                      className="relative overflow-hidden hover-lift"
                      onClick={() => router.push('/create')}
                    >
                      <Glow color="amber" intensity="high" />
                      <Sparkles className="w-6 h-6 mr-3 animate-spin-slow" />
                      Start Creating Now
                    </EnhancedButton>
                  </div>
                </Magnetic>
              ) : (
                <Magnetic>
                  <div className="space-y-6">
                    <EnhancedButton 
                      variant="premium"
                      size="xl"
                      className="relative overflow-hidden hover-lift group"
                      onClick={() => router.push('/create')}
                    >
                      <Glow color="amber" intensity="high" pulse />
                      <Sparkles className="w-7 h-7 mr-4 group-hover:animate-spin transition-all duration-300" />
                      Start Creating Free
                    </EnhancedButton>
                    
                    <div className="space-y-2">
                      <p className="text-slate-400 animate-text-reveal-3">
                        No credit card required • Start with unlimited FREE models
                      </p>
                      <p className="text-slate-500 text-sm">
                        Upgrade anytime • Cancel anytime • 30-day money-back guarantee
                      </p>
                    </div>
                  </div>
                </Magnetic>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Keep existing BoostPacks for authenticated users */}
      {isAuthenticated && (
        <div className="relative py-24 bg-slate-900/95">
          <div className="container mx-auto px-6">
            <BoostPacks 
              currentCredits={userCredits}
              onPurchase={handleBoostPurchase}
            />
          </div>
        </div>
      )}
    </div>
  )
}