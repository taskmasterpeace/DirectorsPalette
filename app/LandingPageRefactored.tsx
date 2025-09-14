'use client'

// Ultra-thin landing page orchestrator
import { useAuth } from '@/components/auth/AuthProvider'
import { SimpleSocialProof } from '@/components/landing/SimpleSocialProof'
import { useLandingPage } from '@/components/landing/LandingHooks'

// Extracted ultra-focused components
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase'
import { BoostPacksSection } from '@/components/landing/BoostPacksSection'
import { CompetitiveAdvantage } from '@/components/landing/CompetitiveAdvantage'
import { FinalCallToAction } from '@/components/landing/FinalCallToAction'
import { AuthenticatedFeatures } from '@/components/landing/AuthenticatedFeatures'

// Placeholder for 3D visualization - temporarily disabled to fix React compatibility
function PlaceholderVisualization() {
  return null
}

// Professional navigation header for landing page
function LandingHeader() {
  const { isAuthenticated, user } = useAuth()
  
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
              </div>
            ) : (
              <div className="text-sm text-slate-300">Sign in to get started</div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function LandingPageRefactored() {
  const { isAuthenticated, user } = useAuth()
  const { userCredits, handleBoostPurchase } = useLandingPage()

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

      {/* Ultra-focused component sections */}
      <HeroSection isAuthenticated={isAuthenticated} user={user} />
      <FeaturesShowcase />
      <BoostPacksSection onPurchase={handleBoostPurchase} />
      <CompetitiveAdvantage />
      <SimpleSocialProof />
      <FinalCallToAction isAuthenticated={isAuthenticated} user={user} />
      <AuthenticatedFeatures 
        isAuthenticated={isAuthenticated} 
        user={user}
        userCredits={userCredits}
        onBoostPurchase={handleBoostPurchase}
      />
    </div>
  )
}