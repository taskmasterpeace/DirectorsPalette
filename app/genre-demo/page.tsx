"use client"

import { useState } from "react"
import { GenreCommandMulti } from "@/components/shared/GenreCommandMulti"

export default function GenreDemoPage() {
  const [primaryGenres, setPrimaryGenres] = useState<string[]>([])
  const [subGenres, setSubGenres] = useState<string[]>([])
  const [microGenres, setMicroGenres] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Genre Selection Test</h1>
        
        <GenreCommandMulti
          primaryGenres={primaryGenres}
          subGenres={subGenres}
          microGenres={microGenres}
          onPrimaryGenresChange={setPrimaryGenres}
          onSubGenresChange={setSubGenres}
          onMicroGenresChange={setMicroGenres}
        />

        <div className="mt-8 p-4 bg-slate-900 rounded-lg">
          <h2 className="text-white font-semibold mb-4">Selected Genres Debug:</h2>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-green-400">Primary ({primaryGenres.length}):</span>
              <span className="text-white ml-2">{JSON.stringify(primaryGenres)}</span>
            </div>
            
            <div>
              <span className="text-blue-400">Subgenres ({subGenres.length}):</span>
              <span className="text-white ml-2">{JSON.stringify(subGenres)}</span>
            </div>
            
            <div>
              <span className="text-purple-400">Microgenres ({microGenres.length}):</span>
              <span className="text-white ml-2">{JSON.stringify(microGenres)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-white font-semibold mb-4">Testing Instructions:</h2>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• Try searching for "phonk" - should show both Trap and Memphis Rap versions without React key errors</li>
            <li>• Browse Hip-Hop/Rap subgenres - should see 10+ options (Trap, Conscious Rap, Boom Bap, etc.)</li>
            <li>• Browse Trap microgenres - should see 15+ options including all drill variants</li>
            <li>• Search for "drill" - should find UK Drill, Brooklyn Drill, Chicago Drill, etc.</li>
            <li>• Check console for any React key warnings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}