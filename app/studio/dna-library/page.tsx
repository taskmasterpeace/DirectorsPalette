"use client"

import { useState } from "react"
import { DNALibrary } from "@/components/song-dna/DNALibrary"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import type { SongDNA } from "@/lib/song-dna-types"

export default function DNALibraryPage() {
  const router = useRouter()
  const [selectedDNA, setSelectedDNA] = useState<SongDNA | null>(null)

  const handleSelectDNA = (dna: SongDNA) => {
    setSelectedDNA(dna)
    // Store in sessionStorage to pass to the studio page
    sessionStorage.setItem('selectedDNA', JSON.stringify(dna))
    router.push('/studio/song-dna')
  }

  const handleGenerateFromDNA = (dna: SongDNA) => {
    // Store DNA and navigate to generation page
    sessionStorage.setItem('generateFromDNA', JSON.stringify(dna))
    router.push('/studio/song-dna')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Song DNA Library</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and manage your collection of analyzed Song DNA patterns. 
          Use them as templates for generating new lyrics.
        </p>
      </div>

      <DNALibrary 
        onSelectDNA={handleSelectDNA}
        onGenerateFromDNA={handleGenerateFromDNA}
      />
    </div>
  )
}