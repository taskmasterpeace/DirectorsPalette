"use client"

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class CommercialErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error for debugging
    console.error('Commercial Module Error:', error)
    console.error('Error Info:', errorInfo)
    
    // Could send to error reporting service here
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('commercial-error-log', JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        }))
      } catch (e) {
        console.error('Failed to save error log:', e)
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Commercial Module Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-red-300">
                <p className="mb-2">Something went wrong with the commercial creation process.</p>
                <details className="text-xs text-red-400 bg-red-950/30 p-3 rounded border border-red-800">
                  <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error?.message}
                    </div>
                    {this.state.error?.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="text-xs mt-1 overflow-auto">
                          {this.state.error.stack.slice(0, 500)}...
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 border-red-700 text-red-400 hover:bg-red-900/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useCommercialErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Commercial Error:', error)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('commercial-error-log', JSON.stringify({
          error: error.message,
          stack: error.stack,
          errorInfo,
          timestamp: new Date().toISOString()
        }))
      } catch (e) {
        console.error('Failed to save error log:', e)
      }
    }
  }

  return { handleError }
}