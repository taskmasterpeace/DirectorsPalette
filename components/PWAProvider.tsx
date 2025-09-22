'use client'

import { useEffect, useState } from 'react'
import { useMobileDetection, triggerPWAInstall } from '@/hooks/useMobileDetection'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet, isPWA, canInstall } = useMobileDetection()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Only initialize PWA features for mobile devices
    if (isMobile || isTablet) {
      // Import mobile-specific styles
      import('@/app/pwa-mobile.css')

      // Register service worker for mobile only
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered for mobile:', registration)
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error)
          })
      }

      // Add manifest link for mobile only
      const manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      manifestLink.href = '/manifest.json'
      document.head.appendChild(manifestLink)

      // Add mobile-specific meta tags
      const metaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: "Director's Palette" },
        { name: 'format-detection', content: 'telephone=no' }
      ]

      metaTags.forEach(tag => {
        const meta = document.createElement('meta')
        meta.name = tag.name
        meta.content = tag.content
        document.head.appendChild(meta)
      })

      // Add viewport meta for mobile
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
      }

      // Show install prompt after 30 seconds if not already PWA
      if (!isPWA && canInstall) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 30000)
      }

      // Cleanup function
      return () => {
        // Remove manifest link if component unmounts
        const link = document.querySelector('link[rel="manifest"]')
        if (link) {
          link.remove()
        }
      }
    }
  }, [isMobile, isTablet, isPWA, canInstall])

  const handleInstall = () => {
    triggerPWAInstall()
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for 7 days
    localStorage.setItem('pwaInstallDismissed', Date.now().toString())
  }

  // Check if install was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwaInstallDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < sevenDays) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  return (
    <>
      {children}

      {/* PWA Install Prompt - Only for mobile */}
      {showInstallPrompt && canInstall && (isMobile || isTablet) && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-3">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Install Director's Palette
                </h3>
                <p className="text-white/90 text-sm">
                  Add to your home screen for the best experience
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-1"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleInstall}
              className="mt-3 w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors"
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Only for mobile PWA */}
      {(isMobile || isTablet) && isPWA && (
        <nav className="mobile-bottom-nav">
          <button className="active">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </button>
          <button>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Projects</span>
          </button>
          <button>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile</span>
          </button>
        </nav>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}