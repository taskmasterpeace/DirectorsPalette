'use client'

import { useState, useEffect } from 'react'
import { LayoutAnnotationTab } from './LayoutAnnotationTab'

interface LayoutAnnotationWrapperProps {
  className?: string
}

export function LayoutAnnotationWrapper({ className }: LayoutAnnotationWrapperProps) {
  const [initialImage, setInitialImage] = useState<string | null>(null)

  // Check localStorage for incoming images on mount and tab switch
  useEffect(() => {
    const checkForIncomingImage = () => {
      const storedImage = localStorage.getItem('directors-palette-layout-input')
      if (storedImage) {
        setInitialImage(storedImage)
        // Clear the localStorage after loading
        localStorage.removeItem('directors-palette-layout-input')
      }
    }

    // Check immediately
    checkForIncomingImage()

    // Also listen for storage events (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'directors-palette-layout-input' && e.newValue) {
        setInitialImage(e.newValue)
        localStorage.removeItem('directors-palette-layout-input')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also set up an interval to check periodically (fallback)
    const interval = setInterval(checkForIncomingImage, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className={`h-full ${className}`}>
      <LayoutAnnotationTab 
        initialImage={initialImage || undefined}
        className="h-full"
      />
    </div>
  )
}