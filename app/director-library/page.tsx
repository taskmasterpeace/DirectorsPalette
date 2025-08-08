"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { directorDB } from "@/lib/director-db"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { curatedFilmDirectors, curatedMusicVideoDirectors } from "@/lib/curated-directors"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download, Upload } from 'lucide-react'
import { DirectorCard } from "@/components/director-card"
import { DirectorFilmForm } from "@/components/director-film-form"
import { DirectorMusicForm } from "@/components/director-music-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { AppShellLeftNav } from "@/components/app-shell-left-nav"
import { ProjectManagerModal } from "@/components/project-manager-modal"
import { type SavedProject } from "@/lib/indexeddb"

type Source = "curated" | "library"
type FilmListItem = FilmDirector & { source: Source }
type MusicListItem = MusicVideoDirector & { source: Source }

type LibraryExportV1 = {
  schema: "director-library"
  version: 1
  exportedAt: string
  film: FilmDirector[]
  music: MusicVideoDirector[]
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function reviveDirectorDates<T extends { createdAt?: any; updatedAt?: any }>(arr: T[]): T[] {
  return (arr || []).map((d) => {
    const createdAt =
      d.createdAt && typeof d.createdAt === "string" ? new Date(d.createdAt) : d.createdAt
    const updatedAt =
      d.updatedAt && typeof d.updatedAt === "string" ? new Date(d.updatedAt) : d.updatedAt
    return { ...d, createdAt, updatedAt }
  })
}

export default function DirectorLibraryPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Data
  const [film, setFilm] = useState<FilmDirector[]>([])
  const [music, setMusic] = useState<MusicVideoDirector[]>([])
  const [tab, setTab] = useState<"film" | "music">("film")

  // Filters
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")

  // Dialog State
  const [editOpen, setEditOpen] = useState(false)
  const [editingFilm, setEditingFilm] = useState<FilmDirector | null>(null)
  const [editingMusic, setEditingMusic] = useState<MusicVideoDirector | null>(null)

  // Projects modal state
  const [showProjects, setShowProjects] = useState(false)

  // Import input
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      await directorDB.ensureSeeded()
      const [f, m] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])
      setFilm(f)
      setMusic(m)
    }
    load()
  }, [])

  const reload = async () => {
    const [f, m] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])
    setFilm(f)
    setMusic(m)
  }

  // Merge curated + library with full data preserved for library items
  const filmList: FilmListItem[] = useMemo(() => {
    const curated: FilmListItem[] = curatedFilmDirectors.map((c) => ({ ...c, source: "curated" }))
    const fromLibrary: FilmListItem[] = film.map((d) => ({ ...d, source: "library" }))
    const map = new Map<string, FilmListItem>()
    curated.forEach((c) => map.set(c.id, c))
    fromLibrary.forEach((d) => map.set(d.id, d))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [film])

  const musicList: MusicListItem[] = useMemo(() => {
    const curated: MusicListItem[] = curatedMusicVideoDirectors.map((c) => ({ ...c, source: "curated" }))
    const fromLibrary: MusicListItem[] = music.map((d) => ({ ...d, source: "library" }))
    const map = new Map<string, MusicListItem>()
    curated.forEach((c) => map.set(c.id, c))
    fromLibrary.forEach((d) => map.set(d.id, d))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [music])

  const active = tab === "film" ? filmList : musicList
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(active.map((i) => i.category).filter(Boolean)) as Set<string>)],
    [active],
  )

  const filtered = active.filter((i) => {
    const q = query.trim().toLowerCase()
    const matchQ =
      !q ||
      i.name.toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q) ||
      (tab === "film"
        ? ((i as FilmDirector).visualLanguage || "").toLowerCase().includes(q)
        : ((i as MusicVideoDirector).visualHallmarks || "").toLowerCase().includes(q))
    const matchC = category === "All" || i.category === category
    return matchQ && matchC
  })

  const onEdit = (id: string) => {
    if (tab === "film") {
      const d = film.find((x) => x.id === id)
      if (!d) return
      setEditingFilm(d)
      setEditingMusic(null)
      setEditOpen(true)
    } else {
      const d = music.find((x) => x.id === id)
      if (!d) return
      setEditingMusic(d)
      setEditingFilm(null)
      setEditOpen(true)
    }
  }

  const onDelete = async (id: string) => {
    try {
      if (tab === "film") {
        await directorDB.deleteFilm(id)
      } else {
        await directorDB.deleteMusic(id)
      }
      await reload()
      toast({ title: "Deleted", description: "Director removed from your library." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e?.message || "Unexpected error" })
    }
  }

  const addCuratedToLibrary = async (id: string) => {
    try {
      if (tab === "film") {
        const d = curatedFilmDirectors.find((c) => c.id === id)
        if (!d) return
        const now = new Date()
        const payload: FilmDirector = {
          ...d,
          createdAt: now,
          updatedAt: now,
          isCustom: d.isCustom ?? false,
          domain: "film",
        }
        await directorDB.upsertFilm(payload)
      } else {
        const d = curatedMusicVideoDirectors.find((c) => c.id === id)
        if (!d) return
        const now = new Date()
        const payload: MusicVideoDirector = {
          ...d,
          createdAt: now,
          updatedAt: now,
          isCustom: d.isCustom ?? false,
          domain: "music-video",
        }
        await directorDB.upsertMusic(payload)
      }
      await reload()
      toast({ title: "Added", description: "Curated director added to your library." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Add failed", description: e?.message || "Unexpected error" })
    }
  }

  const saveFilm = async (director: FilmDirector) => {
    try {
      await directorDB.upsertFilm(director)
      setEditOpen(false)
      setEditingFilm(null)
      await reload()
      toast({ title: "Saved", description: "Film director updated." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e?.message || "Unexpected error" })
    }
  }

  const saveMusic = async (director: MusicVideoDirector) => {
    try {
      await directorDB.upsertMusic(director)
      setEditOpen(false)
      setEditingMusic(null)
      await reload()
      toast({ title: "Saved", description: "Music video director updated." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e?.message || "Unexpected error" })
    }
  }

  // When selecting a project from the Library's Projects overlay, jump to Home and load it.
  const handleLoadProjectFromLibrary = (project: SavedProject) => {
    setShowProjects(false)
    router.push(`/?project=${project.id}`)
  }

  const exportLibrary = async () => {
    try {
      const { film, music } = await directorDB.exportData()
      const payload: LibraryExportV1 = {
        schema: "director-library",
        version: 1,
        exportedAt: new Date().toISOString(),
        film,
        music,
      }
      downloadJSON(`director-library.json`, payload)
      toast({ title: "Exported", description: "Director Library JSON downloaded." })
    } catch (e) {
      console.error("Export failed:", e)
      toast({ variant: "destructive", title: "Export failed", description: "Unable to export library." })
    }
  }

  const handleImportClick = () => importInputRef.current?.click()

  const importLibraryFromFile = async (file: File) => {
    try {
      const text = await file.text()
      const obj = JSON.parse(text)

      // Accept both wrapped and bare forms
      let filmArr: FilmDirector[] | undefined
      let musicArr: MusicVideoDirector[] | undefined

      if (obj?.schema === "director-library" && typeof obj?.version === "number") {
        filmArr = obj.film
        musicArr = obj.music
      } else if (obj && (obj.film || obj.music)) {
        filmArr = obj.film
        musicArr = obj.music
      }

      if (!filmArr && !musicArr) {
        toast({ variant: "destructive", title: "Import failed", description: "Unrecognized library file format." })
        return
      }

      const revivedFilm = filmArr ? reviveDirectorDates(filmArr) : []
      const revivedMusic = musicArr ? reviveDirectorDates(musicArr) : []

      await directorDB.importData({ film: revivedFilm, music: revivedMusic })
      await reload()
      toast({ title: "Imported", description: "Director Library imported and merged." })
    } catch (e) {
      console.error("Import failed:", e)
      toast({ variant: "destructive", title: "Import failed", description: "Unable to import library." })
    } finally {
      if (importInputRef.current) importInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AppShellLeftNav
        active="library"
        storyHref="/"
        libraryHref="/director-library"
        musicHref="/"
        projectsHref="/"
        onOpenProjects={() => setShowProjects(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        {/* Header actions: Tabs + Export/Import */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={tab === "film" ? "default" : "outline"}
              onClick={() => setTab("film")}
              size="sm"
            >
              Film Directors
              <Badge variant="secondary" className="ml-2 bg-slate-600/30 text-slate-200">
                {filmList.length}
              </Badge>
            </Button>
            <Button
              variant={tab === "music" ? "default" : "outline"}
              onClick={() => setTab("music")}
              size="sm"
            >
              Music Video Directors
              <Badge variant="secondary" className="ml-2 bg-slate-600/30 text-slate-200">
                {musicList.length}
              </Badge>
            </Button>
          </div>

          {/* Search + Category + Export/Import */}
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={tab === "film" ? "Search film directors..." : "Search music video directors..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                  className="h-8"
                >
                  {c}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportLibrary}>
                <Download className="h-4 w-4 mr-1" />
                Export Library
              </Button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importLibraryFromFile(file)
                }}
              />
              <Button size="sm" variant="outline" onClick={handleImportClick}>
                <Upload className="h-4 w-4 mr-1" />
                Import Library
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-slate-300">
            No directors match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => {
              if (tab === "film") {
                const item = d as FilmListItem
                const isLibrary = item.source === "library"
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DirectorCard
                      director={item}
                      onEdit={isLibrary ? onEdit : undefined}
                      onDelete={isLibrary ? onDelete : undefined}
                      compact={!isLibrary}
                    />
                    {!isLibrary && (
                      <Button
                        size="sm"
                        onClick={() => addCuratedToLibrary(item.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                )
              } else {
                const item = d as MusicListItem
                const isLibrary = item.source === "library"
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DirectorCard
                      director={item}
                      onEdit={isLibrary ? onEdit : undefined}
                      onDelete={isLibrary ? onDelete : undefined}
                      compact={!isLibrary}
                    />
                    {!isLibrary && (
                      <Button
                        size="sm"
                        onClick={() => addCuratedToLibrary(item.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                )
              }
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            // Mobile: full screen and scrollable; Desktop: contained window, scrollable
            className="z-50 flex h-screen w-screen flex-col bg-slate-950 border border-slate-800 p-0 sm:h-[85vh] sm:w-[92vw] sm:max-w-3xl sm:rounded-xl"
          >
            <DialogHeader className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
              <DialogTitle className="text-white">
                {editingFilm ? "Edit Film Director" : "Edit Music Video Director"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6">
              {editingFilm && (
                <DirectorFilmForm
                  initial={editingFilm}
                  onCancel={() => setEditOpen(false)}
                  onSave={saveFilm}
                />
              )}

              {editingMusic && (
                <DirectorMusicForm
                  initial={editingMusic}
                  onCancel={() => setEditOpen(false)}
                  onSave={saveMusic}
                />
              )}
            </div>

            <DialogFooter className="border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Projects Overlay (routing back to Home on load) */}
        <ProjectManagerModal
          open={showProjects}
          onOpenChange={setShowProjects}
          currentProject={{}} // No active editing context here
          onLoadProject={handleLoadProjectFromLibrary}
          onNewProject={() => {
            setShowProjects(false)
            router.push("/") // new project starts on Home
          }}
          currentProjectId={""}
          onProjectSaved={() => {}}
        />
      </main>
    </div>
  )
}
