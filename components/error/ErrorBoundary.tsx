/**
 * Error Boundary Component
 * Catches JavaScript errors in React component tree and displays fallback UI
 */

'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Track error in production (could integrate with error tracking service)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // trackError(error, errorInfo)
    }
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">
                Something went wrong
              </AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                An unexpected error occurred while rendering this component. 
                Our team has been notified and is working on a fix.
              </AlertDescription>
            </Alert>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details
                </h3>
                <div className="text-xs font-mono text-slate-300 space-y-2">
                  <div>
                    <span className="text-red-400">Error:</span> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <span className="text-red-400">Component Stack:</span>
                      <pre className="mt-1 text-slate-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleRefresh}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-slate-400">
              If this problem persists, please{' '}
              <a 
                href="https://github.com/taskmasterpeace/DirectorsPalette/issues" 
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                report an issue
              </a>{' '}
              on GitHub.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook version for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Simplified Error Boundary for specific use cases
 */
export function SimpleErrorBoundary({ 
  children, 
  message = "Something went wrong" 
}: { 
  children: ReactNode
  message?: string 
}) {
  const fallback = (
    <Alert className="border-red-200 bg-red-50 m-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-700">
        {message}
      </AlertDescription>
    </Alert>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

/**
 * Async Error Boundary for handling async errors
 */
export function AsyncErrorBoundary({ 
  children,
  isLoading = false,
  error = null,
  retry
}: {
  children: ReactNode
  isLoading?: boolean
  error?: Error | string | null
  retry?: () => void
}) {
  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 m-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">
          Error Loading Data
        </AlertTitle>
        <AlertDescription className="text-red-700 mt-2">
          {typeof error === 'string' ? error : error.message}
          {retry && (
            <Button 
              onClick={retry}
              variant="outline"
              size="sm"
              className="mt-3 ml-0"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}