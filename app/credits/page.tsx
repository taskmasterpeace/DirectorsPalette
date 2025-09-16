/**
 * Credits Purchase Page
 * Dedicated page for purchasing credits with seamless UX
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CreditCard, Zap, CheckCircle, Star, Gift, Code } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'

interface CreditPackage {
  id: string
  credits: number
  price: number
  popular?: boolean
  bonus?: number
  value?: string
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    credits: 500,
    price: 5.00,
    value: 'Good for 4-6 videos'
  },
  {
    id: 'popular',
    credits: 1000,
    price: 9.00,
    popular: true,
    bonus: 100,
    value: 'Most popular choice'
  },
  {
    id: 'pro',
    credits: 2500,
    price: 20.00,
    bonus: 300,
    value: 'Great for creators'
  },
  {
    id: 'studio',
    credits: 5000,
    price: 35.00,
    bonus: 750,
    value: 'Best value for studios'
  }
]

export default function CreditsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [selectedPackage, setSelectedPackage] = useState<string>('popular')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false)

  // Get return URL and required credits from query params
  const returnUrl = searchParams.get('return') || '/post-production'
  const requiredCredits = parseInt(searchParams.get('required') || '0')
  const operation = searchParams.get('operation') || 'Continue creating'

  // Fetch current credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/user/credits', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentCredits(data.credits || 0)
        } else {
          setCurrentCredits(0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
        setCurrentCredits(0)
      }
    }

    fetchCredits()
  }, [user])

  // Handle promo code redemption
  const handlePromoRedeem = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Promo Code Required",
        description: "Please enter a promo code",
        variant: "destructive"
      })
      return
    }

    setIsRedeemingPromo(true)

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          promoCode: promoCode.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Promo Code Redeemed!",
          description: `${result.creditsAdded} credits added to your account`,
          variant: "default"
        })

        // Refresh credits display
        setCurrentCredits(prev => (prev || 0) + result.creditsAdded)
        setPromoCode('')

        // Auto-redirect after a moment
        setTimeout(() => {
          router.push(returnUrl)
        }, 2000)
      } else {
        toast({
          title: "Invalid Promo Code",
          description: result.error || "Please check your code and try again",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      })
    } finally {
      setIsRedeemingPromo(false)
    }
  }

  // Handle purchase
  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true)

    try {
      // TODO: Implement Stripe integration
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate payment

      toast({
        title: "Credits Purchased Successfully!",
        description: `You now have additional credits for ${operation.toLowerCase()}`,
        variant: "default"
      })

      // Redirect back to original page
      router.push(returnUrl)

    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(returnUrl)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Purchase Credits</h1>
            <p className="text-slate-300">
              {requiredCredits > 0
                ? `You need ${requiredCredits} credits to ${operation.toLowerCase()}`
                : 'Choose a credit package to continue creating'
              }
            </p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-2">Current Balance</h3>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-white">
                    {currentCredits !== null ? currentCredits.toLocaleString() : '...'}
                  </span>
                  <span className="text-slate-400">credits</span>
                </div>
              </div>
              {requiredCredits > 0 && (
                <div className="text-right">
                  <div className="text-slate-400">Need additional:</div>
                  <div className="text-2xl font-bold text-amber-400">
                    {Math.max(0, requiredCredits - (currentCredits || 0))} credits
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Primary Access Method - Promo Codes */}
        <Card className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-400" />
              Get Credits with Access Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-300">
                Directors Palette is currently in <strong>private beta</strong>.
                Enter your 5-letter access code to get credits and start creating.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="promo-code" className="text-slate-300">
                    5-Letter Access Code
                  </Label>
                  <Input
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="BETA1"
                    className="bg-slate-800 border-slate-600 text-white text-center text-lg tracking-widest"
                    disabled={isRedeemingPromo}
                    maxLength={5}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handlePromoRedeem}
                    disabled={isRedeemingPromo || promoCode.length !== 5}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isRedeemingPromo ? (
                      <>
                        <Code className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Activate Access
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                <div className="font-semibold text-purple-300 mb-2">📝 How to Get an Access Code:</div>
                <ul className="space-y-1">
                  <li>• Contact <strong>@machinekinglabs</strong> for beta access</li>
                  <li>• Join our Discord community for early access codes</li>
                  <li>• Follow us on social media for public beta announcements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages - Hidden for Beta */}
        <div className="hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg) => {
            const totalCredits = pkg.credits + (pkg.bonus || 0)
            const costPerCredit = pkg.price / totalCredits
            const isSelected = selectedPackage === pkg.id
            const meetsRequirement = requiredCredits === 0 || totalCredits >= requiredCredits

            return (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/50 shadow-lg'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                } ${pkg.popular ? 'ring-2 ring-amber-500/50' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      {pkg.credits.toLocaleString()}
                      {pkg.bonus && (
                        <Badge variant="secondary" className="text-xs">
                          +{pkg.bonus}
                        </Badge>
                      )}
                    </CardTitle>
                    {pkg.popular && (
                      <Badge className="bg-amber-500 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${pkg.price}</div>
                    <div className="text-xs text-slate-400">
                      {(costPerCredit * 100).toFixed(1)}¢ per credit
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-slate-300">{pkg.value}</div>
                    {meetsRequirement && requiredCredits > 0 && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Covers your needs</span>
                      </div>
                    )}
                    <Button
                      className={`w-full ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePurchase(pkg.id)
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPackage === pkg.id ? (
                        'Processing...'
                      ) : (
                        `Purchase ${totalCredits.toLocaleString()} Credits`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Why Credits Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Why Credits?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Fair Usage</h3>
                <p className="text-slate-400 text-sm">
                  Credits ensure fair access to AI generation resources for all users
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Predictable Costs</h3>
                <p className="text-slate-400 text-sm">
                  Know exactly what each generation costs before you create
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-slate-400 text-sm">
                  Credits support the latest AI models and fastest generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}