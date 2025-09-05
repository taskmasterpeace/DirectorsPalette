"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { artistDB } from "@/lib/artist-db"
import type { ArtistProfile } from "@/lib/artist-types"
import ArtistProfileFormTabbed from "@/components/artist-profile-form-tabbed"
import { ArtistCard } from "@/components/artist-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useArtistStore } from "@/lib/artist-store"

export default function ArtistBankPage() {
  const [list, setList] = useState<ArtistProfile[]>([])
  const [query, setQuery] = useState("")
  const { activeArtist, setActiveArtist } = useArtistStore()
  const [editing, setEditing] = useState<Partial<ArtistProfile> | null>(null)
  const [activeArtistOpen, setActiveArtistOpen] = useState(true)
  const [allArtistsOpen, setAllArtistsOpen] = useState(true)
  const formRef = useRef<HTMLDivElement | null>(null)

  async function load() {
    const all = await artistDB.all()
    all.sort((a, b) => (a.artist_name || "").localeCompare(b.artist_name || ""))
    setList(all)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter(
      (a) =>
        (a.artist_name || "").toLowerCase().includes(q) ||
        (a.real_name || "").toLowerCase().includes(q) ||
        (a.genres || []).some((g: string) => g.toLowerCase().includes(q)),
    )
  }, [list, query])

  function startNew() {
    // Create a completely new artist with a fresh ID
    const newArtist = {
      artist_id: `art_${Math.random().toString(36).slice(2, 10)}`,
      artist_name: "",
      artist_identity: { gender: "", race_ethnicity: "", accent: "" } as any,
      genres: [],
      sub_genres: [],
      micro_genres: [],
    }
    setEditing(newArtist)
    // Clear active artist when creating new
    setActiveArtist(null)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  function selectForEdit(a: ArtistProfile) {
    setActiveArtist(a)
    setEditing(a)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-0 sm:px-2 md:px-4 py-4 md:py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-xl font-semibold">Artist Bank</h1>
            <span className="text-sm text-slate-400">({list.length} artists)</span>
          </div>
          <Button onClick={startNew} className="bg-amber-600 hover:bg-amber-700 text-white">
            + New Artist
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <div className="text-slate-300 text-sm mb-3 font-medium">Search Artists</div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Search by name or genre..."
              />
            </div>

            {activeArtist && (
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                <div className="text-slate-300 text-sm mb-3 font-medium">Active Artist</div>
                <ArtistCard artist={activeArtist} active onClick={() => selectForEdit(activeArtist)} />
              </div>
            )}

            <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <div className="text-slate-300 text-sm mb-3 font-medium">All Artists ({filtered.length})</div>
              <div className="space-y-2 max-h-[60vh] overflow-auto">
                {filtered.map((a) => (
                  <div key={a.artist_id} onClick={() => selectForEdit(a)}>
                    <ArtistCard artist={a} active={activeArtist?.artist_id === a.artist_id} />
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-slate-500 text-sm">No artists found.</div>}
              </div>
            </div>
          </aside>

          {/* Editor */}
          <section ref={formRef} className="space-y-3">
            <ArtistProfileFormTabbed
              initial={editing || activeArtist || {}}
              onSaved={(saved) => {
                load().then(() => {
                  setActiveArtist(saved)
                  setEditing(saved)
                })
              }}
            />
            {/* Show delete button only for saved artists */}
            {editing && (editing as any).artist_id && list.some(a => a.artist_id === (editing as any).artist_id) ? (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  className="border-red-500/40 text-red-300 hover:bg-red-500/10 bg-transparent"
                  onClick={async () => {
                    const artistName = (editing as any).artist_name || "this artist"
                    if (confirm(`Are you sure you want to delete ${artistName}? This cannot be undone.`)) {
                      const id = (editing as any).artist_id as string
                      if (id) {
                        await artistDB.remove(id)
                        if (activeArtist?.artist_id === id) setActiveArtist(null)
                        setEditing(null)
                        startNew() // Start fresh after delete
                        load()
                      }
                    }
                  }}
                >
                  Delete Artist
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}