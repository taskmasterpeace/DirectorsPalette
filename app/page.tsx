'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, Play, Zap, Rocket, Sparkles, Crown } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginModal } from '@/components/auth/LoginModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Three.js animated background component
function AnimatedBackground() {
  const meshRef = useRef<any>()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh ref={meshRef} scale={[4, 4, 4]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
        />
      </mesh>
    </>
  )
}

// Floating particles component
function CreativeParticles() {
  const particlesRef = useRef<any>()
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={particlesRef}>
      {[...Array(50)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20, 
            (Math.random() - 0.5) * 20
          ]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </Float>
      ))}
    </group>
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
    <div className="relative">
      {/* Three.js Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <AnimatedBackground />
          <CreativeParticles />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Hero Section */}
      <ScrollSection className="flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold text-white">
              Director's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Palette</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
              Create stories, music videos, commercials, and children's books with AI-powered character consistency
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="text-green-400 border-green-400 px-4 py-2">
              6 FREE Models
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400 px-4 py-2">
              Character Consistency
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400 px-4 py-2">
              4 Creative Formats
            </Badge>
          </div>

          <div className="space-y-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                </div>
                <Link href="/create">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                    <Play className="w-5 h-5 mr-2" />
                    Continue Creating
                  </Button>
                </Link>
              </div>
            ) : (
              <LoginModal onLoginSuccess={() => router.push('/create')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                  Start Creating Free
                  <ArrowDown className="w-5 h-5 ml-2" />
                </Button>
              </LoginModal>
            )}
          </div>
        </div>
      </ScrollSection>

      {/* Features Showcase */}
      <ScrollSection background="bg-slate-800/95">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              One Story, Every Medium
            </h2>
            <p className="text-xl text-slate-300">
              Transform your stories into professional shot lists for films, music videos, 
              commercials, and children's books - all with consistent characters.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📖', name: 'Stories', desc: 'Cinematic breakdowns' },
                { icon: '🎵', name: 'Music Videos', desc: 'Lyric-to-visual' },
                { icon: '💼', name: 'Commercials', desc: 'Campaign concepts' },
                { icon: '📚', name: "Children's Books", desc: 'Age-appropriate illustrations' }
              ].map((format, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-600">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{format.icon}</div>
                    <div className="text-white font-medium">{format.name}</div>
                    <div className="text-slate-400 text-xs">{format.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="text-green-400 text-sm font-medium">@main_character</div>
                  <div className="text-white">A young detective with piercing blue eyes...</div>
                  <div className="text-purple-400 text-sm font-medium">@warehouse_location</div>
                  <div className="text-white">Abandoned warehouse, dim lighting...</div>
                  <div className="text-orange-400 text-sm font-medium">@mysterious_briefcase</div>
                  <div className="text-white">Leather briefcase with strange markings...</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollSection>

      {/* Pricing Section */}
      <ScrollSection background="bg-slate-900/95">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Professional Creative Power
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get unlimited access to 6 FREE models plus 2,500 points monthly for premium features. 
              Need more? Boost packs give you instant credits when inspiration strikes.
            </p>
          </div>

          {/* Main Subscription */}
          <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 ring-2 ring-blue-500/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Creator Pro</CardTitle>
              <div className="text-4xl font-bold text-white">$20<span className="text-lg text-slate-400">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-white">Unlimited FREE models (6 models)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-white">2,500 points for premium features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-white">All creative formats included</span>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Boost Packs Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Need More Points?</h3>
              <p className="text-slate-400">Get instant boosts when you're in creative flow</p>
            </div>

            {isAuthenticated ? (
              <BoostPacks 
                currentCredits={userCredits}
                onPurchase={handleBoostPurchase}
              />
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Quick Boost', points: 500, price: 4, icon: Zap, color: 'blue' },
                  { name: 'Power Boost', points: 1500, price: 10, icon: Rocket, color: 'purple', popular: true },
                  { name: 'Mega Boost', points: 5000, price: 30, icon: Sparkles, color: 'orange' }
                ].map((pack, index) => (
                  <Card key={index} className={`bg-slate-800 border-slate-700 ${pack.popular ? 'ring-2 ring-purple-500/50' : ''}`}>
                    <CardHeader className="text-center">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r from-${pack.color}-500 to-${pack.color}-600 mb-2`}>
                        <pack.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-white">{pack.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <div className="text-2xl font-bold text-white">+{pack.points.toLocaleString()}</div>
                      <div className="text-slate-400 text-sm">points</div>
                      <div className="text-2xl font-bold text-white">${pack.price}</div>
                      <Button className={`w-full bg-gradient-to-r from-${pack.color}-500 to-${pack.color}-600`}>
                        Get Boost
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollSection>

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

      {/* Call to Action */}
      <ScrollSection background="bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            Ready to Transform Your Creative Process?
          </h2>
          <p className="text-xl text-slate-300">
            Join thousands of creators using Director's Palette to bring their stories to life
          </p>
          
          <div className="space-y-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-green-400">
                  ✅ You're already signed in! 
                </div>
                <Link href="/create">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90">
                    <Play className="w-5 h-5 mr-2" />
                    Start Creating Now
                  </Button>
                </Link>
              </div>
            ) : (
              <LoginModal onLoginSuccess={() => router.push('/create')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free - No Credit Card Required
                </Button>
              </LoginModal>
            )}
          </div>

          <div className="text-slate-400 text-sm">
            Start with unlimited FREE models • Upgrade anytime • Cancel anytime
          </div>
        </div>
      </ScrollSection>

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