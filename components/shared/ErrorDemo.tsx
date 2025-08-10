"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bomb } from "lucide-react"

export function ErrorDemo() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error("This is a demo error to test the ErrorBoundary component")
  }

  return (
    <Button
      onClick={() => setShouldThrow(true)}
      variant="destructive"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
    >
      <Bomb className="h-4 w-4 mr-2" />
      Test Error
    </Button>
  )
}