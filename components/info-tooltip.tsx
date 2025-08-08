"use client"

import { Info } from 'lucide-react'
import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type InfoTooltipProps = {
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
}

export function InfoTooltip({ children, side = "top", align = "center", className }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Field help"
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-600/70 text-slate-300/80 hover:text-white hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${className ?? ""}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700"
        >
          <div className="text-xs leading-relaxed">{children}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
