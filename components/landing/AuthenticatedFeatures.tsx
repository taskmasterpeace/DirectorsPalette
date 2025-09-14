'use client'

import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'
import type { AuthenticatedFeaturesProps } from './LandingTypes'

// Scroll section component for consistency
function ScrollSection({ 
  children, 
  className = "",
  background = "bg-slate-900/95",
  id
}: { 
  children: React.ReactNode
  className?: string
  background?: string
  id?: string
}) {
  return (
    <section className={`min-h-screen relative ${background} ${className}`} id={id}>
      <div className="container mx-auto px-4 py-16">
        {children}
      </div>
    </section>
  )
}

export function AuthenticatedFeatures({ 
  isAuthenticated, 
  userCredits, 
  onBoostPurchase 
}: AuthenticatedFeaturesProps) {
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Floating Action Button for Authenticated Users */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          className="rounded-full w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg"
          onClick={() => document.querySelector('#boost-packs')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Zap className="w-6 h-6" />
        </Button>
      </div>

      {/* Boost Packs Section for Authenticated Users */}
      <ScrollSection background="bg-slate-900/95" className="scroll-mt-20" id="boost-packs">
        <BoostPacks 
          currentCredits={userCredits}
          onPurchase={onBoostPurchase}
        />
      </ScrollSection>
    </>
  )
}