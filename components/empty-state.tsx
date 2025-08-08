"use client"

import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  className,
}: {
  title: string
  description: string
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean }
  secondaryAction?: { label: string; onClick: () => void }
  icon?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-slate-700/60 bg-slate-900/40", className)}>
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 h-16 w-16 text-slate-400 flex items-center justify-center">{icon ?? null}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-slate-400 max-w-xl mx-auto">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {primaryAction && (
            <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled} className="bg-amber-600 hover:bg-amber-700 text-white">
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} className="border-slate-700 text-slate-200 hover:bg-slate-800">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
