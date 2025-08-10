"use client"

import React, { Suspense } from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AsyncBoundaryProps {
  children: React.ReactNode
  loadingFallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

const DefaultLoadingFallback = () => (
  <Card className="mx-auto max-w-2xl mt-8 bg-slate-50 border-slate-200">
    <CardContent className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </CardContent>
  </Card>
)

export function AsyncBoundary({ 
  children, 
  loadingFallback, 
  errorFallback,
  onError 
}: AsyncBoundaryProps) {
  const LoadingComponent = loadingFallback || <DefaultLoadingFallback />

  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={LoadingComponent}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}