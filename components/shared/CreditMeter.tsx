'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Zap, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react'
import { BoostPacks } from '@/components/billing/BoostPacks'

interface CreditMeterProps {
  currentCredits: number
  monthlyAllocation: number
  tier: 'free' | 'pro' | 'studio' | 'enterprise'
  onBoostPurchase?: (boostPackId: string) => Promise<void>
  className?: string
}

export function CreditMeter({ 
  currentCredits, 
  monthlyAllocation, 
  tier,
  onBoostPurchase,
  className = "" 
}: CreditMeterProps) {
  const [showBoostPacks, setShowBoostPacks] = useState(false)
  
  const usagePercentage = (monthlyAllocation - currentCredits) / monthlyAllocation * 100
  const isLowCredits = currentCredits < monthlyAllocation * 0.2 // Less than 20% remaining
  const isCriticalCredits = currentCredits < monthlyAllocation * 0.05 // Less than 5% remaining

  const getStatusColor = () => {
    if (isCriticalCredits) return 'text-red-400'
    if (isLowCredits) return 'text-orange-400'
    return 'text-green-400'
  }

  const getProgressColor = () => {
    if (isCriticalCredits) return 'bg-red-500'
    if (isLowCredits) return 'bg-orange-500'
    return 'bg-green-500'
  }

  return (
    <div className={className}>
      {/* Mobile Credit Display */}
      <div className="block sm:hidden">
        <Sheet open={showBoostPacks} onOpenChange={setShowBoostPacks}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`border-slate-600 ${getStatusColor()}`}
            >
              <Zap className="w-4 h-4 mr-1" />
              {currentCredits.toLocaleString()}
              {isLowCredits && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="text-center">Credit Management</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Credit Status */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-white">
                      {currentCredits.toLocaleString()} / {monthlyAllocation.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-sm">credits remaining this month</div>
                    <Progress 
                      value={usagePercentage} 
                      className="h-2"
                      style={{ 
                        backgroundColor: '#374151',
                        ['--progress-background' as any]: getProgressColor()
                      }}
                    />
                    <div className={`text-sm font-medium ${getStatusColor()}`}>
                      {isCriticalCredits ? '🚨 Critical - Almost out!' :
                       isLowCredits ? '⚠️ Low credits remaining' :
                       '✅ Credits looking good'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Boost Packs */}
              {onBoostPurchase && (
                <BoostPacks 
                  currentCredits={currentCredits}
                  onPurchase={onBoostPurchase}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Credit Display */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${getStatusColor()}`} />
          <span className="text-white font-medium">
            {currentCredits.toLocaleString()}
          </span>
          <span className="text-slate-400 text-sm">credits</span>
        </div>
        
        {isLowCredits && onBoostPurchase && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBoostPacks(true)}
            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Boost
          </Button>
        )}

        {/* Desktop Boost Packs Modal */}
        <Sheet open={showBoostPacks} onOpenChange={setShowBoostPacks}>
          <SheetContent className="w-full max-w-4xl">
            <SheetHeader>
              <SheetTitle>Boost Your Credits</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {onBoostPurchase && (
                <BoostPacks 
                  currentCredits={currentCredits}
                  onPurchase={onBoostPurchase}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

// Quick boost button for creative flow moments
export function QuickBoostButton({ 
  onBoostPurchase,
  className = ""
}: {
  onBoostPurchase: (boostPackId: string) => Promise<void>
  className?: string
}) {
  return (
    <Button
      onClick={() => onBoostPurchase('power-boost')}
      className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 ${className}`}
      size="sm"
    >
      <Rocket className="w-4 h-4 mr-2" />
      Quick Boost (+1,500 points) - $10
    </Button>
  )
}

// Credit warning component
export function CreditWarning({ 
  creditsRemaining, 
  operationCost,
  onBoostPurchase 
}: {
  creditsRemaining: number
  operationCost: number
  onBoostPurchase: (boostPackId: string) => Promise<void>
}) {
  if (creditsRemaining >= operationCost) return null

  const shortfall = operationCost - creditsRemaining
  const suggestedBoost = shortfall <= 500 ? 'quick-boost' : 
                        shortfall <= 1500 ? 'power-boost' : 'mega-boost'

  return (
    <Card className="bg-orange-900/20 border-orange-500/30">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <div className="flex-1">
            <div className="text-orange-300 font-medium">Not enough credits</div>
            <div className="text-orange-200 text-sm">
              Need {shortfall} more points for this operation
            </div>
          </div>
          <Button
            onClick={() => onBoostPurchase(suggestedBoost)}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600"
          >
            Get Boost
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}