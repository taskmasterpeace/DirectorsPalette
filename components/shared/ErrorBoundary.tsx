"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const DefaultErrorFallback = ({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) => (
  <Card className="mx-auto max-w-2xl mt-8 bg-red-50 border-red-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        Something went wrong
      </CardTitle>
      <CardDescription className="text-red-600">
        An unexpected error occurred while rendering this component.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="bg-red-100 border border-red-200 rounded-md p-3">
        <p className="text-sm text-red-700 font-mono">
          {error.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <Home className="h-4 w-4 mr-2" />
          Go home
        </Button>
      </div>
    </CardContent>
  </Card>
)

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service (Sentry, LogRocket, etc.)
    }

    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}