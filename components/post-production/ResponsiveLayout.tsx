'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden",
      // Mobile: stack vertically
      "lg:flex-row", 
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveColumnProps {
  children: ReactNode
  className?: string
  side: 'left' | 'right'
  mobileOrder?: number
}

export function ResponsiveColumn({ 
  children, 
  className, 
  side,
  mobileOrder = side === 'left' ? 1 : 2
}: ResponsiveColumnProps) {
  return (
    <div 
      className={cn(
        // Mobile: full width, stacked
        "w-full flex flex-col gap-3 min-h-0 p-3",
        // Desktop: half width side by side
        "lg:w-1/2",
        // Mobile ordering
        mobileOrder === 1 ? "order-1" : "order-2",
        "lg:order-none",
        className
      )}
      style={{ order: mobileOrder }}
    >
      {children}
    </div>
  )
}

interface CompactHeaderProps {
  icon: ReactNode
  title: string
  className?: string
}

export function CompactHeader({ icon, title, className }: CompactHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-700 flex-shrink-0",
      // Mobile: smaller padding
      "sm:py-3",
      className
    )}>
      {icon}
      <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
    </div>
  )
}

interface SpaceEfficientCardProps {
  children: ReactNode
  className?: string
  title?: string
  height?: 'auto' | 'fixed' | 'flex'
  fixedHeight?: string
}

export function SpaceEfficientCard({ 
  children, 
  className, 
  title,
  height = 'auto',
  fixedHeight 
}: SpaceEfficientCardProps) {
  const heightClasses = {
    auto: '',
    fixed: fixedHeight || 'h-80',
    flex: 'flex-1'
  }

  return (
    <div className={cn(
      "bg-slate-900/30 rounded-lg border border-slate-700/50",
      heightClasses[height],
      "min-h-0", // Prevent flex items from growing beyond container
      className
    )}>
      {title && (
        <div className="p-2 border-b border-slate-700/50 flex-shrink-0">
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
      )}
      <div className={cn(
        title ? "p-3" : "p-3",
        height === 'flex' || height === 'fixed' ? "h-full overflow-hidden" : ""
      )}>
        {children}
      </div>
    </div>
  )
}

// Utility for responsive grid
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4"
  }

  return (
    <div className={cn(
      "grid gap-2",
      gridCols[cols.mobile],
      `sm:${gridCols[cols.tablet]}`,
      `lg:${gridCols[cols.desktop]}`,
      className
    )}>
      {children}
    </div>
  )
}

// Responsive button group
interface ResponsiveButtonGroupProps {
  children: ReactNode
  className?: string
}

export function ResponsiveButtonGroup({ children, className }: ResponsiveButtonGroupProps) {
  return (
    <div className={cn(
      "flex flex-wrap gap-1",
      // Mobile: smaller buttons
      "sm:gap-2",
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-optimized modal/drawer for templates
interface MobileOptimizedDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function MobileOptimizedDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: MobileOptimizedDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}