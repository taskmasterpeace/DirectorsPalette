'use client'

import React from 'react'
import { getModeBackground, getModeCSS, ModeBackground as ModeBackgroundType } from '@/lib/mode-backgrounds'

interface ModeBackgroundProps {
  mode: 'story' | 'music-video' | 'commercial' | 'children-book' | 'post-production'
  children: React.ReactNode
  className?: string
}

export function ModeBackground({ mode, children, className = '' }: ModeBackgroundProps) {
  const background = getModeBackground(mode)
  const cssVars = getModeCSS(mode)

  return (
    <div 
      className={`relative min-h-screen ${className}`}
      style={cssVars}
    >
      {/* Background Image - Small banner showing only portion */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: `url('${background.imagePath}')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center 20%',
          filter: 'brightness(0.7) contrast(1.1)'
        }}
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: background.overlayColor,
          opacity: background.overlayOpacity
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Individual mode background components for specific styling
export function StoryModeBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Mysterious forest creature background - Banner style */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/images/mode-backgrounds/story-mode.png')",
          backgroundSize: '120% auto',
          backgroundPosition: 'center 25%',
          filter: 'brightness(0.3) contrast(1.2) saturate(0.8)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-800/90" />
      <div className="relative z-10 text-slate-100">
        {children}
      </div>
    </div>
  )
}

export function MusicVideoModeBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Professional artist on film set - Banner style */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/images/mode-backgrounds/music-video-mode.png')",
          backgroundSize: '120% auto',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.6) contrast(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-orange-900/75 to-amber-800/85" />
      <div className="relative z-10 text-amber-50">
        {children}
      </div>
    </div>
  )
}

export function CommercialModeBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Professional business success - Banner style */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/images/mode-backgrounds/commercial-mode.png')",
          backgroundSize: '120% auto',
          backgroundPosition: 'center 20%',
          filter: 'brightness(0.7) contrast(1.1) saturate(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/80 via-amber-900/70 to-orange-900/80" />
      <div className="relative z-10 text-yellow-50">
        {children}
      </div>
    </div>
  )
}

export function ChildrenBookModeBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Creative girl with robot friend - Banner style */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/images/mode-backgrounds/children-book-mode.png')",
          backgroundSize: '120% auto',
          backgroundPosition: 'center 25%',
          filter: 'brightness(0.8) contrast(1.0) saturate(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 via-pink-50/85 to-orange-50/90" />
      <div className="relative z-10 text-red-900">
        {children}
      </div>
    </div>
  )
}