'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import { Card, CardContent } from '@/components/ui/card'

// Fictional company logos/names for social proof
const FICTIONAL_COMPANIES = [
  { name: 'Creative Studios Inc.', type: 'AGENCY', color: '#3b82f6' },
  { name: 'StoryForge Media', type: 'PRODUCTION', color: '#10b981' },
  { name: 'Pixel Dreams Co.', type: 'CREATIVE', color: '#f59e0b' },
  { name: 'Narrative Labs', type: 'STUDIO', color: '#8b5cf6' },
  { name: 'Visual Craft Agency', type: 'AGENCY', color: '#ef4444' },
  { name: 'Motion Pictures Pro', type: 'PRODUCTION', color: '#06b6d4' }
]

function FloatingCompanyLogos() {
  const groupRef = useRef<any>()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {FICTIONAL_COMPANIES.map((company, index) => (
        <Float key={index} speed={1 + index * 0.1} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[
            Math.cos((index / FICTIONAL_COMPANIES.length) * Math.PI * 2) * 8,
            Math.sin((index / FICTIONAL_COMPANIES.length) * Math.PI * 2) * 3,
            -5 + (index % 2) * 2
          ]}>
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial
              color={company.color}
              transparent
              opacity={0.7}
              emissive={company.color}
              emissiveIntensity={0.1}
            />
          </mesh>
          <Text
            position={[
              Math.cos((index / FICTIONAL_COMPANIES.length) * Math.PI * 2) * 8,
              Math.sin((index / FICTIONAL_COMPANIES.length) * Math.PI * 2) * 3,
              -4.9 + (index % 2) * 2
            ]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {company.name}
          </Text>
        </Float>
      ))}
    </group>
  )
}

export function AnimatedSocialProof() {
  return (
    <section className="relative py-24 bg-slate-900/95 overflow-hidden">
      {/* Three.js Background */}
      <div className="absolute inset-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.6} color="#f59e0b" />
          <FloatingCompanyLogos />
        </Canvas>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Creators Worldwide
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            From independent creators to professional studios, 
            Director's Palette powers creative workflows across the industry
          </p>

          {/* Company Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🎨', category: 'Creative Agencies', count: '500+' },
              { icon: '🎬', category: 'Production Studios', count: '200+' },
              { icon: '📚', category: 'Publishers', count: '150+' },
              { icon: '🎓', category: 'Educators', count: '1000+' }
            ].map((stat, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-600/50 hover:border-slate-500/70 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-slate-400 text-sm">{stat.category}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonial Quotes */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "The character consistency system saves us hours of revision work.",
                author: "Creative Director, StoryForge Media",
                color: "border-blue-500/30"
              },
              {
                quote: "Six FREE models means we can experiment without budget constraints.",
                author: "Freelance Creator, Pixel Dreams Co.",
                color: "border-amber-500/30"
              }
            ].map((testimonial, index) => (
              <Card key={index} className={`bg-slate-800/30 ${testimonial.color} border`}>
                <CardContent className="p-6">
                  <blockquote className="text-white text-lg italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <cite className="text-slate-400 text-sm">— {testimonial.author}</cite>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}