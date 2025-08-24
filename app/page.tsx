'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Float, MeshDistortMaterial, OrbitControls, Stars, Sphere, Box, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, Play, Zap, Rocket, Sparkles, Crown } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginModal } from '@/components/auth/LoginModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Dynamic creative visualization scene
function CreativeVisualization() {
  const storyElementsRef = useRef<any>()
  const characterOrbitRef = useRef<any>()
  const formatShapesRef = useRef<any>()
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Story elements flowing and transforming
    if (storyElementsRef.current) {
      storyElementsRef.current.rotation.y = time * 0.1
      storyElementsRef.current.position.y = Math.sin(time * 0.5) * 0.5
    }

    // Character consistency orbiting system
    if (characterOrbitRef.current) {
      characterOrbitRef.current.rotation.z = time * 0.15
      characterOrbitRef.current.children.forEach((child: any, i: number) => {
        child.position.x = Math.cos(time * 0.3 + i * Math.PI * 2 / 3) * 3
        child.position.y = Math.sin(time * 0.3 + i * Math.PI * 2 / 3) * 1.5
        child.rotation.y = time * 0.5
      })
    }

    // Format shapes morphing
    if (formatShapesRef.current) {
      formatShapesRef.current.children.forEach((child: any, i: number) => {
        child.rotation.x = time * 0.2 + i * 0.5
        child.rotation.y = time * 0.15 + i * 0.3
        child.scale.setScalar(1 + Math.sin(time * 0.4 + i) * 0.2)
      })
    }
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY / window.innerHeight)
    }
    
    const handleHeroHover = (e: any) => {
      setIsHeroHovered(e.detail.active)
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('hero-button-hover', handleHeroHover)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hero-button-hover', handleHeroHover)
    }
  }, [])

  return (
    <>
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
      
      {/* Dynamic lighting that responds to scroll and interaction */}
      <ambientLight intensity={0.4 + scrollOffset * 0.2 + (isHeroHovered ? 0.3 : 0)} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8 + (isHeroHovered ? 0.5 : 0)} 
        color={new THREE.Color(isHeroHovered ? "#f59e0b" : "#64748b")}
      />
      <pointLight 
        position={[-5, 5, 5]} 
        intensity={0.6 + (isHeroHovered ? 0.4 : 0)} 
        color={new THREE.Color("#3b82f6")}
      />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        intensity={1 + (isHeroHovered ? 1 : 0)}
        color={new THREE.Color(isHeroHovered ? "#f59e0b" : "#10b981")}
        castShadow
      />

      {/* Story elements flowing through space */}
      <group ref={storyElementsRef} position={[0, 0, -5]}>
        {/* Text fragments representing stories */}
        <Float speed={2} rotationIntensity={0.5}>
          <Text
            position={[-4, 2, 0]}
            fontSize={0.5}
            color="#f1f5f9"
            fontWeight="bold"
          >
            @character
          </Text>
        </Float>
        <Float speed={1.5} rotationIntensity={0.3}>
          <Text
            position={[4, -1, 0]}
            fontSize={0.4}
            color="#f59e0b"
            fontWeight="bold"
          >
            @location
          </Text>
        </Float>
        <Float speed={1.8} rotationIntensity={0.4}>
          <Text
            position={[0, 3, -2]}
            fontSize={0.3}
            color="#3b82f6"
            fontWeight="bold"
          >
            @prop
          </Text>
        </Float>
      </group>

      {/* Character consistency visualization */}
      <group ref={characterOrbitRef} position={[6, -2, -3]}>
        {[0, 1, 2].map((i) => (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.8}>
            <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color={i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#f59e0b"}
                emissive={i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#f59e0b"}
                emissiveIntensity={0.1}
                transparent
                opacity={0.8}
              />
            </Sphere>
          </Float>
        ))}
      </group>

      {/* Creative format shapes */}
      <group ref={formatShapesRef} position={[-6, 1, -4]}>
        {/* Story format - Book shape */}
        <Float speed={1.2} rotationIntensity={0.3}>
          <Box args={[1, 1.4, 0.1]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#64748b" transparent opacity={0.7} />
          </Box>
        </Float>
        
        {/* Music format - Note shape */}
        <Float speed={1.5} rotationIntensity={0.4}>
          <Sphere args={[0.4, 16, 16]} position={[0, -1, 0]}>
            <meshStandardMaterial color="#8b5cf6" transparent opacity={0.7} />
          </Sphere>
        </Float>
        
        {/* Commercial format - Cube */}
        <Float speed={1.3} rotationIntensity={0.5}>
          <Box args={[0.6, 0.6, 0.6]} position={[1.5, 0, 0]}>
            <meshStandardMaterial color="#10b981" transparent opacity={0.7} />
          </Box>
        </Float>
        
        {/* Children's book format - Heart shape */}
        <Float speed={1.4} rotationIntensity={0.3}>
          <Sphere args={[0.3, 8, 8]} position={[-1.5, 0, 0]}>
            <meshStandardMaterial color="#f59e0b" transparent opacity={0.7} />
          </Sphere>
        </Float>
      </group>

      {/* Particle system representing AI models */}
      <group>
        {[...Array(100)].map((_, i) => (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={0.2}>
            <mesh position={[
              (Math.random() - 0.5) * 40,
              (Math.random() - 0.5) * 40,
              (Math.random() - 0.5) * 20
            ]}>
              <sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} />
              <meshStandardMaterial
                color={
                  i % 6 === 0 ? "#10b981" : // FREE models - green
                  i % 6 === 1 ? "#3b82f6" : // Premium - blue  
                  i % 6 === 2 ? "#f59e0b" : // Creative - amber
                  i % 6 === 3 ? "#64748b" : // Standard - slate
                  i % 6 === 4 ? "#8b5cf6" : // Advanced - purple
                  "#f1f5f9"                 // Pro - white
                }
                transparent
                opacity={0.6 + Math.random() * 0.4}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Background depth layers */}
      <mesh position={[0, 0, -15]} rotation={[0, 0, 0]}>
        <planeGeometry args={[50, 50, 64, 64]} />
        <MeshDistortMaterial
          color="#1e293b"
          distort={0.05}
          speed={1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  )
}

// Professional navigation header for landing page
function LandingHeader() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

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
      
      {/* Enhanced Three.js Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 45 }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <CreativeVisualization />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.2}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900/95">
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-6 mb-8">
                <img 
                  src="/mkl-logo.png" 
                  alt="Machine King Labs" 
                  className="w-20 h-20 md:w-28 md:h-28 rounded-2xl shadow-2xl ring-2 ring-amber-400/20"
                />
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  Director's{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">
                    Palette
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Transform stories into professional visual content across{' '}
                  <span className="text-amber-400 font-semibold">multiple formats</span> with{' '}
                  <span className="text-blue-400 font-semibold">AI-powered character consistency</span>
                </p>
              </div>

              {/* Value Props */}
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-green-900/30 text-green-400 border-green-400/30 px-6 py-3 text-base">
                  6 FREE AI Models
                </Badge>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30 px-6 py-3 text-base">
                  Character Consistency
                </Badge>
                <Badge className="bg-amber-900/30 text-amber-400 border-amber-400/30 px-6 py-3 text-base">
                  4 Creative Formats
                </Badge>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-lg">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <span className="text-white">Welcome back, {user?.name || user?.email}!</span>
                  </div>
                  <Link href="/create">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-8 py-4 text-lg rounded-xl shadow-xl"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Continue Creating
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <LoginModal onLoginSuccess={() => router.push('/create')}>
                    <Button 
                      size="lg" 
                      className="group bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-xl rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-amber-500/25"
                      onMouseEnter={() => {
                        // Trigger Three.js animation enhancement on hover
                        window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: true } }))
                      }}
                      onMouseLeave={() => {
                        window.dispatchEvent(new CustomEvent('hero-button-hover', { detail: { active: false } }))
                      }}
                    >
                      <Sparkles className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      Start Creating Free
                    </Button>
                  </LoginModal>
                  <p className="text-slate-400 text-sm">
                    No credit card required • Start with unlimited FREE models
                  </p>
                </div>
              )}
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-slate-800/50">
              <p className="text-slate-500 text-sm mb-4">Trusted by creators worldwide</p>
              <div className="flex items-center justify-center gap-8 opacity-60">
                <div className="text-slate-600 text-xs">CREATORS</div>
                <div className="text-slate-600 text-xs">AGENCIES</div>
                <div className="text-slate-600 text-xs">STUDIOS</div>
                <div className="text-slate-600 text-xs">EDUCATORS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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