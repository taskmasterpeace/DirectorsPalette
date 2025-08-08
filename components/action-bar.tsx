"use client"

import { Button } from "@/components/ui/button"
import * as React from "react"
import { cn } from "@/lib/utils"

type ActionDef = {
  label: string
  onClick: () => void
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

type ActionBarProps = {
  primary: ActionDef
  secondary?: ActionDef
  destructive?: ActionDef
  // When inside a long form, add spacing to avoid overlap with fixed bar on mobile
  withSpacer?: boolean
  className?: string
}

export function ActionBar({ primary, secondary, destructive, withSpacer = true, className }: ActionBarProps) {
  return (
    <>
      {withSpacer && (
        <div className="h-16 sm:hidden" aria-hidden="true" />
      )}
      <div
        className={cn(
          // fixed footer on mobile, static row on desktop
          "fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 px-3 py-2 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0",
          "pb-[max(env(safe-area-inset-bottom),0.5rem)]",
          className
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-2 sm:justify-end">
          {secondary && (
            <Button
              type="button"
              variant="outline"
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className={cn("border-slate-600 text-slate-200 hover:bg-slate-800", secondary.className)}
            >
              {secondary.icon} {secondary.label}
            </Button>
          )}
          {destructive && (
            <Button
              type="button"
              variant="destructive"
              onClick={destructive.onClick}
              disabled={destructive.disabled}
              className={cn("bg-red-600 hover:bg-red-700", destructive.className)}
            >
              {destructive.icon} {destructive.label}
            </Button>
          )}
          <Button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled}
            className={cn("bg-purple-600 hover:bg-purple-700 text-white", primary.className)}
          >
            {primary.icon} {primary.label}
          </Button>
        </div>
      </div>
    </>
  )
}
