'use client'

import { useEffect, useRef, useState } from 'react'
// Temporarily removing Three.js imports to fix React compatibility issue
// import { Canvas, useFrame, useThree } from '@react-three/fiber'
// import { Text, Float, MeshDistortMaterial, OrbitControls, Stars, Sphere, Box, useScroll } from '@react-three/drei'
// import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, Play, Zap, Rocket, Sparkles, Crown } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginModal } from '@/components/auth/LoginModal'
import { AnimatedSocialProof } from '@/components/landing/AnimatedSocialProof'
// import { Enhanced3DModels } from '@/components/landing/Enhanced3DModels'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Placeholder for 3D visualization - temporarily disabled to fix React compatibility
function PlaceholderVisualization() {
  return null
}

// Professional navigation header for landing page
function LandingHeader() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Auto-redirect authenticated users to the workspace
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/post-production')
    }
  }, [isAuthenticated, user, router])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="/mkl-logo.png" 
              alt="Machine King Labs" 
              className="w-8 h-8 rounded-md"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">Director's Palette</h1>
              <div className="text-xs text-amber-400">Machine King Labs</div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">Welcome, {user?.name || user?.email}</span>
                <Button 
                  onClick={() => router.push('/create')}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
                >
                  Open App
                </Button>
              </div>
            ) : (
              <LoginModal onLoginSuccess={() => router.push('/create')}>
                <Button className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500">
                  Sign In
                </Button>
              </LoginModal>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Scroll-triggered sections component
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

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [userCredits, setUserCredits] = useState(2500)

  const handleBoostPurchase = async (boostPackId: string) => {
    // Simulate boost pack purchase
    console.log('Purchasing boost pack:', boostPackId)
    // In real implementation, integrate with Stripe/payment processor
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Professional Navigation */}
      <LandingHeader />
      
      {/* Enhanced Three.js Background - Temporarily disabled for testing */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Fallback gradient background while 3D is being fixed */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-950/60"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-blue-900/10 animate-spin" style={{animationDuration: '60s'}}></div>
      </div>

      {/* Hero Section - Enhanced Mobile/Desktop Layout */}
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
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">1000+</div>
                  <div className="text-slate-400 text-xs">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">500+</div>
                  <div className="text-slate-400 text-xs">Agencies</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">200+</div>
                  <div className="text-slate-400 text-xs">Studios</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase - Hero Image Background */}
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
                  {[
                    { icon: '📖', name: 'Stories', desc: 'Cinematic breakdowns', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                    { icon: '🎵', name: 'Music Videos', desc: 'Lyric-to-visual', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
                    { icon: '💼', name: 'Commercials', desc: 'Campaign concepts', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                    { icon: '📚', name: "Children's Books", desc: 'Age-appropriate illustrations', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30' }
                  ].map((format, index) => (
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
                      <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-green-400"></div>
                          <div className="text-green-400 text-base lg:text-lg font-medium">@main_character</div>
                        </div>
                        <div className="text-white text-sm lg:text-base pl-8 lg:pl-9 leading-relaxed">
                          A young detective with piercing blue eyes and weathered coat
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-blue-400"></div>
                          <div className="text-blue-400 text-base lg:text-lg font-medium">@warehouse_location</div>
                        </div>
                        <div className="text-white text-sm lg:text-base pl-8 lg:pl-9 leading-relaxed">
                          Abandoned warehouse with dim lighting and concrete floors
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-amber-400"></div>
                          <div className="text-amber-400 text-base lg:text-lg font-medium">@mysterious_briefcase</div>
                        </div>
                        <div className="text-white text-sm lg:text-base pl-8 lg:pl-9 leading-relaxed">
                          Leather briefcase with strange markings and brass locks
                        </div>
                      </div>
                      
                      <div className="mt-8 lg:mt-10 p-4 lg:p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl">
                        <div className="text-amber-400 font-semibold text-sm lg:text-base mb-2">
                          ✨ Consistency Across All Formats
                        </div>
                        <div className="text-slate-300 text-xs lg:text-sm leading-relaxed">
                          Use the same character, location, and prop definitions across stories, music videos, commercials, and children's books.
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

      {/* Pricing Section - Hero Image Background */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-slate-950/95">
        {/* Hero Image Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/images/heroes/professional-creative-power-hero.jpg" 
            alt="Professional Creative Power" 
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section Header with Text Overlay */}
            <div className="text-center mb-12 sm:mb-16 py-8 lg:py-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl">
                Professional Creative Power
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                Get unlimited access to 6 FREE models plus 2,500 points monthly for premium features. 
                Need more? Boost packs give you instant credits when inspiration strikes.
              </p>
            </div>

            {/* Main Subscription Card - Mobile Responsive */}
            <div className="max-w-md sm:max-w-lg mx-auto mb-12 sm:mb-16">
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-600/50 shadow-2xl ring-2 ring-amber-400/20">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl sm:text-3xl text-white mb-2">Creator Pro</CardTitle>
                  <div className="text-4xl sm:text-5xl font-bold text-white">
                    $20<span className="text-lg sm:text-xl text-slate-400 font-normal">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-base">Unlimited FREE models (6 models)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-base">2,500 points for premium features</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-base">All creative formats included</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-600 hover:to-orange-600 py-3 sm:py-4 text-base sm:text-lg rounded-xl">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Boost Packs Section - Clean Layout */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Need More Points?</h3>
              <p className="text-lg text-slate-400">Get instant boosts when you're in creative flow</p>
            </div>

            {/* Boost Packs Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
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
              ].map((pack, index) => (
                <Card key={index} className={`bg-slate-800/50 border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 transform hover:scale-105 ${pack.popular ? `${pack.ring} ring-2` : ''}`}>
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
                    
                    <Button className={`w-full bg-gradient-to-r ${pack.gradient} hover:opacity-90 py-3 text-lg rounded-xl shadow-lg`}>
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

      {/* Competitive Advantage */}
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
              {[
                { name: 'Midjourney', price: '$60/month', features: 'Images only', color: 'text-red-400' },
                { name: 'RunwayML', price: '$95/month', features: 'Video only', color: 'text-red-400' },
                { name: 'LTX Studio', price: '$125/month', features: 'Video production', color: 'text-red-400' },
                { name: "Director's Palette", price: '$20/month', features: 'Complete workflow', color: 'text-green-400' }
              ].map((comp, index) => (
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

      {/* Animated Social Proof */}
      <AnimatedSocialProof />

      {/* Final Call to Action */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950/95 to-slate-900/95">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Ready to Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Creative Process?
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Join thousands of creators using Director's Palette to bring their stories to life 
                with professional-quality results at a fraction of the cost.
              </p>
            </div>
            
            <div className="space-y-8">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 text-xl">
                    <Crown className="w-7 h-7 text-amber-400" />
                    <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                  </div>
                  <Link href="/create">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-xl rounded-xl shadow-2xl transform hover:scale-105 transition-all"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Start Creating Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <LoginModal onLoginSuccess={() => router.push('/create')}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-600 hover:to-orange-600 text-white px-16 py-8 text-2xl rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Sparkles className="w-7 h-7 mr-4" />
                      Start Creating Free
                    </Button>
                  </LoginModal>
                  
                  <div className="space-y-2">
                    <p className="text-slate-400">
                      No credit card required • Start with unlimited FREE models
                    </p>
                    <p className="text-slate-500 text-sm">
                      Upgrade anytime • Cancel anytime • 30-day money-back guarantee
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Authenticated Users */}
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            className="rounded-full w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg"
            onClick={() => document.querySelector('#boost-packs')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Zap className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Boost Packs Section for Authenticated Users */}
      {isAuthenticated && (
        <ScrollSection background="bg-slate-900/95" className="scroll-mt-20" id="boost-packs">
          <BoostPacks 
            currentCredits={userCredits}
            onPurchase={handleBoostPurchase}
          />
        </ScrollSection>
      )}
    </div>
  )
}