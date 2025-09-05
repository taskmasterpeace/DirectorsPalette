"use client"

import { useEffect, useState } from "react"
import { SongDNAReplicator } from "@/components/song-dna/SongDNAReplicator"
import { Button } from "@/components/ui/button"
import { Library } from "lucide-react"
import Link from "next/link"
import type { SongDNA } from "@/lib/song-dna-types"

export default function SongDNAPage() {
  const [selectedDNA, setSelectedDNA] = useState<SongDNA | null>(null)
  const [generateFromDNA, setGenerateFromDNA] = useState<SongDNA | null>(null)

  useEffect(() => {
    // Check if DNA was selected from library
    const storedDNA = sessionStorage.getItem('selectedDNA')
    if (storedDNA) {
      setSelectedDNA(JSON.parse(storedDNA))
      sessionStorage.removeItem('selectedDNA')
    }

    // Check if should generate from DNA
    const generateDNA = sessionStorage.getItem('generateFromDNA')
    if (generateDNA) {
      setGenerateFromDNA(JSON.parse(generateDNA))
      sessionStorage.removeItem('generateFromDNA')
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Song DNA Replicator</h1>
            <Link href="/studio/dna-library">
              <Button variant="outline" size="sm">
                <Library className="h-4 w-4 mr-2" />
                DNA Library
              </Button>
            </Link>
          </div>
          <p className="text-slate-400">
            Analyze reference songs to extract their DNA and generate new songs with similar patterns
          </p>
        </div>
        
        <SongDNAReplicator 
          initialDNA={selectedDNA}
          autoGenerateFromDNA={generateFromDNA}
        />
      </div>
    </div>
  )
}