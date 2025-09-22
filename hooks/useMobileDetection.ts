import { useState, useEffect } from 'react'

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  canInstall: boolean
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    canInstall: false
  })

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const platform = navigator.platform?.toLowerCase() || ''

      // Check for mobile devices
      const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i
      const isMobileUA = mobileRegex.test(userAgent)

      // Check for tablets (including iPad which reports as Mac in newer versions)
      const tabletRegex = /ipad|tablet|playbook|silk/i
      const isTabletUA = tabletRegex.test(userAgent) ||
        (navigator.maxTouchPoints > 1 && /macintosh/.test(userAgent))

      // Check for specific platforms
      const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
        (platform.includes('mac') && navigator.maxTouchPoints > 1)
      const isAndroid = /android/.test(userAgent)

      // Additional mobile checks
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const smallScreen = window.innerWidth <= 768
      const isMobileScreen = window.innerWidth <= 480

      // Check if running as PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')

      // Determine if it's actually a mobile device (not just small desktop window)
      const isMobile = (isMobileUA || (hasTouch && isMobileScreen)) && !isTabletUA
      const isTablet = isTabletUA || (hasTouch && smallScreen && !isMobileScreen)

      setDetection({
        isMobile,
        isTablet,
        isIOS,
        isAndroid,
        isPWA,
        canInstall: false // Will be set by install prompt event
      })
    }

    checkDevice()

    // Re-check on resize (in case of device rotation)
    const handleResize = () => {
      checkDevice()
    }

    window.addEventListener('resize', handleResize)

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDetection(prev => ({ ...prev, canInstall: true }))
      // Store the event for later use
      ;(window as any).deferredPrompt = e
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return detection
}

// Utility function to trigger PWA install
export function triggerPWAInstall() {
  const deferredPrompt = (window as any).deferredPrompt
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed')
      }
      ;(window as any).deferredPrompt = null
    })
  }
}