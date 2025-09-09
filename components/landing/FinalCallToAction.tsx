'use client'

import { Button } from '@/components/ui/button'
import { Crown, Play, Sparkles } from 'lucide-react'
import { LoginModal } from '@/components/auth/LoginModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LandingPageProps } from './LandingTypes'

export function FinalCallToAction({ isAuthenticated, user }: LandingPageProps) {
  const router = useRouter()

  return (
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
  )
}