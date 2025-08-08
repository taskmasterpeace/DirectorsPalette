import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Unified, high-contrast button system:
// - default: primary emerald
// - destructive: strong red
// - outline: high-contrast slate outline with hover fill
// - secondary: subtle slate fill
// - ghost: minimal, high-contrast on hover
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60",
  {
    variants: {
      variant: {
        default:
          // Primary emerald
          "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700",
        destructive:
          // Strong red for destructive actions
          "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/40 focus-visible:border-red-500/60",
        outline:
          // High-contrast outline on dark background
          "border border-slate-500/70 bg-transparent text-slate-100 shadow-xs hover:bg-slate-800/60",
        secondary:
          // Subtle slate, good for secondary actions
          "bg-slate-700/70 text-slate-100 shadow-xs hover:bg-slate-700",
        ghost:
          "text-slate-200 hover:bg-slate-800/60",
        link:
          "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
