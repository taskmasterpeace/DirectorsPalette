'use client'

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Shimmer, Glow, Magnetic, Floating } from "@/components/ui/animation-components"
import { Play, Crown, Sparkles, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { LoginModal } from "@/components/auth/LoginModal"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface EnhancedHeroSectionProps {
  className?: string
}

export function EnhancedHeroSection({ className }: EnhancedHeroSectionProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <section className={cn(
      "relative min-h-screen flex items-center justify-center",
      "bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900/95",
      className
    )}>
      {/* Dynamic Background with Module Images */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Hero Background */}
        <div className="absolute inset-0">
          <img 
            src="/images/heroes/main-hero-workspace.jpg" 
            alt="Creative AI Workspace" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />
        </div>
        
        {/* Floating Module Previews */}
        <div className="absolute inset-0 pointer-events-none">
          <Floating delay={0} duration={4} distance={15}>
            <div className="absolute top-20 left-20 w-32 h-32 opacity-10">
              <img src="/images/heroes/one-story-every-medium-hero.jpg" alt="Stories" className="rounded-xl object-cover w-full h-full" />
            </div>
          </Floating>
          
          <Floating delay={1} duration={5} distance={20}>
            <div className="absolute top-40 right-20 w-28 h-28 opacity-10">
              <img src="/images/heroes/character-consistency-hero.jpg" alt="Characters" className="rounded-xl object-cover w-full h-full" />
            </div>
          </Floating>
          
          <Floating delay={2} duration={3.5} distance={12}>
            <div className="absolute bottom-40 left-40 w-36 h-36 opacity-10">
              <img src="/images/heroes/professional-creative-power-hero.jpg" alt="Professional" className="rounded-xl object-cover w-full h-full" />
            </div>
          </Floating>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-950/60" />
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-blue-900/10 animate-spin-slower" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* Logo Section with Enhanced Animation */}
          <Magnetic>
            <div className="flex items-center justify-center gap-6 mb-6 sm:mb-8">
              <div className="relative">
                <Glow color="amber" intensity="medium" pulse />
                <img 
                  src="/mkl-logo.png" 
                  alt="Machine King Labs" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl shadow-2xl ring-2 ring-amber-400/20 hover-lift"
                />
              </div>
            </div>
          </Magnetic>
          
          {/* Hero Title with Staggered Animation */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
              <span className="animate-text-reveal-1">Director's</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 animate-text-reveal-2 neon-amber">
                Palette
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed animate-text-reveal-3">
              Transform stories into professional visual content across{' '}
              <span className="text-amber-400 font-semibold neon-amber">multiple formats</span> with{' '}
              <span className="text-blue-400 font-semibold neon-blue">AI-powered character consistency</span>
            </p>
          </div>

          {/* Enhanced Value Props */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Badge className="bg-green-900/30 text-green-400 border-green-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base hover-lift">
              <span className="neon-green">6 FREE AI Models</span>
            </Badge>
            <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base hover-lift">
              <span className="neon-blue">Character Consistency</span>
            </Badge>
            <Badge className="bg-amber-900/30 text-amber-400 border-amber-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base hover-lift">
              <span className="neon-amber">4 Creative Formats</span>
            </Badge>
          </div>

          {/* Enhanced CTA Section */}
          <div className="space-y-4 sm:space-y-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-base sm:text-lg">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-bounce-slow" />
                  <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                </div>
                <Magnetic>
                  <Link href="/create">
                    <EnhancedButton 
                      variant="premium"
                      size="xl"
                      className="group relative overflow-hidden"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <Shimmer direction="right" duration="1.5s" />
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                      Continue Creating
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </EnhancedButton>
                  </Link>
                </Magnetic>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Magnetic>
                  <LoginModal onLoginSuccess={() => router.push('/create')}>
                    <EnhancedButton 
                      variant="premium"
                      size="xl"
                      className="group relative overflow-hidden hover-lift"
                      onMouseEnter={() => {
                        setIsHovered(true)
                        window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: true } }))
                      }}
                      onMouseLeave={() => {
                        setIsHovered(false)
                        window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: false } }))
                      }}
                    >
                      <Shimmer direction="right" duration="2s" />
                      {isHovered && <Glow color="amber" intensity="high" />}
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-spin transition-all duration-300" />
                      Start Creating Free
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </EnhancedButton>
                  </LoginModal>
                </Magnetic>
                <p className="text-slate-400 text-xs sm:text-sm animate-text-reveal-3">
                  No credit card required • Start with unlimited FREE models
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Social Proof */}
          <div className="pt-8 sm:pt-12 border-t border-slate-800/50">
            <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">Join thousands of creators worldwide</p>
            <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 opacity-70">
              {[
                { count: "1000+", label: "Creators" },
                { count: "500+", label: "Agencies" },
                { count: "200+", label: "Studios" }
              ].map((stat, index) => (
                <Floating key={index} delay={index * 0.5} duration={3 + index} distance={8}>
                  <div className="text-center hover-lift">
                    <div className="text-xl sm:text-2xl font-bold text-white animate-breathe">{stat.count}</div>
                    <div className="text-slate-400 text-xs">{stat.label}</div>
                  </div>
                </Floating>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}