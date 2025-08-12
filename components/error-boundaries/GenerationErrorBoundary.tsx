'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class GenerationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Generation Error Boundary caught error:', error, errorInfo)
    
    // Check if it's an API error
    if (error.message.includes('API') || error.message.includes('generation')) {
      // Log specific generation errors
      console.error('Generation API Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }))
    
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      const isAPIError = this.state.error?.message.includes('API') || 
                         this.state.error?.message.includes('generation')
      
      return (
        <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold">Generation Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAPIError 
                    ? "There was an issue with the AI generation service. Please try again."
                    : "An unexpected error occurred during generation."}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded text-xs font-mono">
                  {this.state.error.message}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={this.handleRetry}
                  disabled={this.state.retryCount >= 3}
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  {this.state.retryCount > 0 
                    ? `Retry (${this.state.retryCount}/3)`
                    : 'Retry Generation'}
                </Button>
                
                {this.state.retryCount >= 3 && (
                  <p className="text-sm text-destructive">
                    Maximum retry attempts reached. Please refresh the page.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}