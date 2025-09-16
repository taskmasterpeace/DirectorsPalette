/**
 * Universal Credit Guard
 * Wraps any generation component to provide automatic credit validation
 * and redirect functionality
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { fetchUserCredits } from '@/lib/credits/credit-validation'

interface UniversalCreditGuardProps {
  children: React.ReactNode
  minCreditsRequired?: number // Minimum credits needed for any operation
  operation?: string
}

export function UniversalCreditGuard({
  children,
  minCreditsRequired = 45, // Cheapest video alternative
  operation = 'continue creating'
}: UniversalCreditGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const checkMinimumCredits = async () => {
      try {
        const credits = await fetchUserCredits()

        // If user doesn't have enough credits for any reasonable operation
        if (credits < minCreditsRequired) {
          console.log(`🔄 Auto-redirecting: ${credits} credits < ${minCreditsRequired} minimum`)

          const purchaseUrl = `/credits?required=${minCreditsRequired}&operation=${encodeURIComponent(operation)}&return=${encodeURIComponent(pathname)}`
          router.push(purchaseUrl)
        }
      } catch (error) {
        console.error('Error checking minimum credits:', error)
      }
    }

    // Check credits when component mounts
    checkMinimumCredits()
  }, [user, router, pathname, minCreditsRequired, operation])

  return <>{children}</>
}

/**
 * Higher-order component version for easy wrapping
 */
export function withCreditGuard<P extends object>(
  Component: React.ComponentType<P>,
  minCreditsRequired = 45,
  operation = 'continue creating'
) {
  return function GuardedComponent(props: P) {
    return (
      <UniversalCreditGuard
        minCreditsRequired={minCreditsRequired}
        operation={operation}
      >
        <Component {...props} />
      </UniversalCreditGuard>
    )
  }
}