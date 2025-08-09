"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { artistDB } from "@/lib/artist-db"
import type { ArtistProfile } from "@/lib/artist-types"
import ArtistProfileForm from "@/components/artist-profile-form"
import { ArtistCard } from "@/components/artist-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
    setEditing({
      artist_name: "",
      artist_identity: { gender: "", race_ethnicity: "", accent: "" } as any,
      genres: [],
      sub_genres: [],
      micro_genres: [],
    })
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
          <h1 className="text-white text-xl font-semibold">Artist Bank</h1>
          <Button onClick={startNew} className="bg-amber-600 hover:bg-amber-700 text-white">
            New Artist
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-4 self-start space-y-3 z-0">
            <div className="p-3 rounded border border-slate-700 bg-slate-900 shadow-sm">
              <div className="text-slate-300 text-sm mb-2">Search</div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
                placeholder="Search by name or genre..."
              />
            </div>

            <Collapsible open={activeArtistOpen} onOpenChange={setActiveArtistOpen}>
              <div className="rounded border border-slate-700 bg-slate-900 shadow-sm">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-slate-800/50">
                  <div className="text-slate-300 text-sm">Active Artist</div>
                  {activeArtistOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  {activeArtist ? (
                    <ArtistCard artist={activeArtist} active onClick={() => selectForEdit(activeArtist)} />
                  ) : (
                    <div className="text-slate-500 text-sm">None selected</div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible open={allArtistsOpen} onOpenChange={setAllArtistsOpen}>
              <div className="rounded border border-slate-700 bg-slate-900 shadow-sm">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-slate-800/50">
                  <div className="text-slate-300 text-sm">All Artists ({filtered.length})</div>
                  {allArtistsOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                    {filtered.map((a) => (
                      <div key={a.artist_id} onClick={() => selectForEdit(a)}>
                        <ArtistCard artist={a} active={activeArtist?.artist_id === a.artist_id} />
                      </div>
                    ))}
                    {filtered.length === 0 && <div className="text-slate-500 text-sm">No artists found.</div>}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </aside>

          {/* Editor */}
          <section ref={formRef} className="space-y-3">
            <ArtistProfileForm
              initial={editing || activeArtist || {}}
              onSaved={(saved) => {
                load().then(() => {
                  setActiveArtist(saved)
                  setEditing(saved)
                })
              }}
            />
            {editing && (editing as any).artist_id ? (
              <div className="flex gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setActiveArtist(editing as ArtistProfile)}
                >
                  Set Active
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/40 text-red-300 hover:bg-red-500/10 bg-transparent"
                  onClick={async () => {
                    const id = (editing as any).artist_id as string
                    if (id) {
                      await artistDB.remove(id)
                      if (activeArtist?.artist_id === id) setActiveArtist(null)
                      setEditing(null)
                      load()
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}
