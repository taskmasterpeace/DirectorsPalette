"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppStore } from "@/stores/app-store"
import { useAuth } from "@/components/auth/AuthProvider"
import { UserMenu } from "@/components/auth/UserMenu"
import { Button } from "@/components/ui/button"
import { CreditMeter } from "@/components/shared/CreditMeter"
import { LogIn } from "lucide-react"

export function LayoutHeader() {
  const { setShowProjectManager } = useAppStore()
  const { user, isAuthenticated, isAdmin } = useAuth()

  const handleBoostPurchase = async (boostPackId: string) => {
    console.log('Purchasing boost pack:', boostPackId)
    // TODO: Integrate with payment processor
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 px-4 shadow-lg">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 hover:bg-slate-700/50 transition-colors" />
        <div className="flex items-center gap-3">
          <img 
            src="/mkl-logo.png" 
            alt="Machine King Labs" 
            className="w-10 h-10 rounded-md shadow-sm cursor-pointer hover:shadow-lg transition-all"
            onClick={(e) => {
              // Triple click detection for admin access
              if (e.detail === 3) {
                window.location.href = '/admin'
              }
            }}
            title="Triple-click for admin access"
          />
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-white">Director's Palette</h1>
            <div className="text-xs text-amber-400 hidden sm:block">Machine King Labs</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a 
          href="/help" 
          className="text-slate-300 hover:text-white text-sm flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-slate-700/70 transition-all duration-200 border border-transparent hover:border-slate-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <span className="hidden sm:inline">Help</span>
        </a>
        
        {isAuthenticated && (
          <button 
            onClick={() => setShowProjectManager(true)}
            className="text-slate-300 hover:text-white text-sm flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-amber-600/20 hover:border-amber-500/50 transition-all duration-200 border border-transparent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"/>
            </svg>
            <span className="hidden sm:inline">Projects</span>
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Credit Meter */}
            <CreditMeter
              currentCredits={2500} // TODO: Get from user data
              monthlyAllocation={2500}
              tier="pro"
              onBoostPurchase={handleBoostPurchase}
            />
            
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="text-white font-medium">
                {user?.name || user?.email.split('@')[0]}
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                {isAdmin && <span className="text-blue-400">👑</span>}
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <UserMenu />
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white"
            onClick={() => window.location.reload()}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  )
}