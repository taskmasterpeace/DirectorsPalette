'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Sparkles, Crown } from 'lucide-react'
import { LoginModal } from '@/components/auth/LoginModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LandingPageProps, SocialProofStat } from './LandingTypes'

const socialProofStats: SocialProofStat[] = [
  { value: '1000+', label: 'Creators' },
  { value: '500+', label: 'Agencies' },
  { value: '200+', label: 'Studios' }
]

export function HeroSection({ isAuthenticated, user }: LandingPageProps) {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900/95">
      {/* Main Hero Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/heroes/main-hero-workspace.jpg" 
          alt="Creative AI Workspace" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6 mb-6 sm:mb-8">
              <img 
                src="/mkl-logo.png" 
                alt="Machine King Labs" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl shadow-2xl ring-2 ring-amber-400/20"
              />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
                Director's{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">
                  Palette
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Transform stories into professional visual content across{' '}
                <span className="text-amber-400 font-semibold">multiple formats</span> with{' '}
                <span className="text-blue-400 font-semibold">AI-powered character consistency</span>
              </p>
            </div>

            {/* Value Props - Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Badge className="bg-green-900/30 text-green-400 border-green-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                6 FREE AI Models
              </Badge>
              <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                Character Consistency
              </Badge>
              <Badge className="bg-amber-900/30 text-amber-400 border-amber-400/30 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                4 Creative Formats
              </Badge>
            </div>
          </div>

          {/* CTA Section - Enhanced Mobile */}
          <div className="space-y-4 sm:space-y-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-base sm:text-lg">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                </div>
                <Link href="/create">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-xl w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Continue Creating
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <LoginModal onLoginSuccess={() => router.push('/create')}>
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-600 hover:to-orange-600 text-white px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-amber-500/25 w-full sm:w-auto"
                    onMouseEnter={() => {
                      // Trigger Three.js animation enhancement on hover
                      window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: true } }))
                    }}
                    onMouseLeave={() => {
                      window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: false } }))
                    }}
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-pulse" />
                    Start Creating Free
                  </Button>
                </LoginModal>
                <p className="text-slate-400 text-xs sm:text-sm">
                  No credit card required • Start with unlimited FREE models
                </p>
              </div>
            )}
          </div>

          {/* Quick Social Proof - Mobile Optimized */}
          <div className="pt-8 sm:pt-12 border-t border-slate-800/50">
            <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">Join thousands of creators worldwide</p>
            <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 opacity-70">
              {socialProofStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}