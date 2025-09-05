'use client'

interface MKLLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'header' | 'footer' | 'loading' | 'watermark'
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base', 
  xl: 'text-lg'
}

export function MKLLogo({ 
  size = 'md', 
  variant = 'header', 
  showText = true, 
  className = '' 
}: MKLLogoProps) {
  const logoClass = sizeClasses[size]
  const textClass = textSizes[size]
  
  const variantStyles = {
    header: 'opacity-100',
    footer: 'opacity-80',
    loading: 'opacity-90 animate-pulse',
    watermark: 'opacity-40'
  }

  return (
    <div className={`flex items-center gap-2 ${variantStyles[variant]} ${className}`}>
      <img 
        src="/mkl-logo.png" 
        alt="Machine King Labs" 
        className={`${logoClass} flex-shrink-0`}
      />
      {showText && (
        <div className={`${textClass} leading-tight`}>
          <div className="font-bold text-slate-200">Machine King Labs</div>
          {size !== 'sm' && (
            <div className="text-slate-400 text-xs">AI Research Division</div>
          )}
        </div>
      )}
    </div>
  )
}