"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { projectDB, type SavedProject } from "@/lib/indexeddb"
import { FolderOpen, Plus, Save, Trash2, Download, Upload } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void

  // The currently "in-memory" project context in the editor
  currentProject: Partial<SavedProject> & { name?: string }

  // Callbacks
  onLoadProject: (project: SavedProject) => void
  onNewProject: () => void
  onProjectSaved?: (projectId: string) => void

  // If set, Save will update this project; otherwise Save will create
  currentProjectId?: string
}

type ProjectExportV1 = {
  schema: "director-project"
  version: 1
  exportedAt: string
  project: SavedProject
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

function reviveProjectDates(p: SavedProject): SavedProject {
  const updatedAt = typeof (p as any).updatedAt === "string" ? new Date((p as any).updatedAt) : p.updatedAt
  return { ...p, updatedAt }
}

export function ProjectManagerModal({
  open,
  onOpenChange,
  currentProject,
  onLoadProject,
  onNewProject,
  onProjectSaved,
  currentProjectId,
}: Props) {
  const { toast } = useToast()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [name, setName] = useState(currentProject?.name || "")
  const importInputRef = useRef<HTMLInputElement>(null)

  const canSave = useMemo(() => Boolean(name.trim()), [name])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const list = await projectDB.getAllProjects()
      setProjects(list)
    } catch (e) {
      console.error("Failed to fetch projects:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadProjects()
      setName(currentProject?.name || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const base: Omit<SavedProject, "id" | "updatedAt"> = {
        name: name.trim(),
        isMusicVideoMode: Boolean(currentProject?.isMusicVideoMode),

        // Story mode
        story: currentProject?.story || "",
        selectedDirector: (currentProject as any)?.selectedDirector || undefined,
        breakdown: currentProject?.breakdown || null,
        additionalShots: (currentProject as any)?.additionalShots || {},

        // Music video mode
        musicVideoData: currentProject?.musicVideoData || undefined,
        musicVideoBreakdown: currentProject?.musicVideoBreakdown || null,
        selectedTreatment: (currentProject as any)?.selectedTreatment || undefined,
        selectedMusicVideoSection: (currentProject as any)?.selectedMusicVideoSection || "",
        musicVideoConfig: (currentProject as any)?.musicVideoConfig || undefined,
        additionalMusicVideoShots: (currentProject as any)?.additionalMusicVideoShots || {},
        selectedMusicVideoDirector: (currentProject as any)?.selectedMusicVideoDirector || undefined,
        customMusicVideoDirectors: (currentProject as any)?.customMusicVideoDirectors || [],

        // Shared
        customDirectors: (currentProject as any)?.customDirectors || [],
        promptOptions: (currentProject as any)?.promptOptions || undefined,
        titleCardOptions: (currentProject as any)?.titleCardOptions || undefined,
        titleCardApproaches: (currentProject as any)?.titleCardApproaches || undefined,
        selectedChapter: (currentProject as any)?.selectedChapter || "",
        expandedChapters: (currentProject as any)?.expandedChapters || {},
        expandedSections: (currentProject as any)?.expandedSections || {},
      }

      if (currentProjectId) {
        await projectDB.updateProject(currentProjectId, base as Partial<SavedProject>)
        onProjectSaved?.(currentProjectId)
      } else {
        const id = await projectDB.saveProject(base)
        onProjectSaved?.(id)
      }
      await loadProjects()
      toast({ title: "Saved", description: "Project saved successfully." })
    } catch (e) {
      console.error("Failed to save project:", e)
      toast({ variant: "destructive", title: "Save failed", description: "Unable to save this project." })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await projectDB.deleteProject(id)
      await loadProjects()
      toast({ title: "Deleted", description: "Project removed." })
    } catch (e) {
      console.error("Delete failed:", e)
      toast({ variant: "destructive", title: "Delete failed", description: "Unable to delete this project." })
    } finally {
      setDeleting(null)
    }
  }

  // Export current (either persisted copy or current in-memory state)
  const exportCurrent = async () => {
    try {
      let projectToExport: SavedProject | null = null
      if (currentProjectId) {
        const persisted = await projectDB.getProject(currentProjectId)
        if (persisted) projectToExport = persisted
      }
      if (!projectToExport) {
        const now = new Date()
        projectToExport = reviveProjectDates({
          id: currentProjectId || `unsaved-${Date.now()}`,
          name: (currentProject?.name || "Untitled Project") as string,
          updatedAt: now,
          isMusicVideoMode: Boolean(currentProject?.isMusicVideoMode),
          story: currentProject?.story,
          selectedDirector: (currentProject as any)?.selectedDirector,
          breakdown: currentProject?.breakdown,
          additionalShots: (currentProject as any)?.additionalShots,
          musicVideoData: (currentProject as any)?.musicVideoData,
          musicVideoBreakdown: currentProject?.musicVideoBreakdown,
          selectedTreatment: (currentProject as any)?.selectedTreatment,
          selectedMusicVideoSection: (currentProject as any)?.selectedMusicVideoSection,
          musicVideoConfig: (currentProject as any)?.musicVideoConfig,
          additionalMusicVideoShots: (currentProject as any)?.additionalMusicVideoShots,
          selectedMusicVideoDirector: (currentProject as any)?.selectedMusicVideoDirector,
          customMusicVideoDirectors: (currentProject as any)?.customMusicVideoDirectors,
          customDirectors: (currentProject as any)?.customDirectors,
          promptOptions: (currentProject as any)?.promptOptions,
          titleCardOptions: (currentProject as any)?.titleCardOptions,
          titleCardApproaches: (currentProject as any)?.titleCardApproaches,
          selectedChapter: (currentProject as any)?.selectedChapter,
          expandedChapters: (currentProject as any)?.expandedChapters,
          expandedSections: (currentProject as any)?.expandedSections,
        } as SavedProject)
      }

      const payload: ProjectExportV1 = {
        schema: "director-project",
        version: 1,
        exportedAt: new Date().toISOString(),
        project: projectToExport,
      }
      const safeName = projectToExport.name?.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-") || "project"
      downloadJSON(`${safeName}.project.json`, payload)
      toast({ title: "Exported", description: "Project JSON downloaded." })
    } catch (e) {
      console.error("Export failed:", e)
      toast({ variant: "destructive", title: "Export failed", description: "Unable to export project." })
    }
  }

  const exportById = (p: SavedProject) => {
    try {
      const payload: ProjectExportV1 = {
        schema: "director-project",
        version: 1,
        exportedAt: new Date().toISOString(),
        project: p,
      }
      const safeName = p.name?.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-") || "project"
      downloadJSON(`${safeName}.project.json`, payload)
      toast({ title: "Exported", description: `Exported "${p.name}".` })
    } catch (e) {
      console.error("Export failed:", e)
      toast({ variant: "destructive", title: "Export failed", description: "Unable to export project." })
    }
  }

  const importInputClick = () => importInputRef.current?.click()

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const obj = JSON.parse(text)
      let project: SavedProject | undefined

      if (obj?.schema === "director-project" && typeof obj?.version === "number" && obj?.project) {
        project = obj.project as SavedProject
      } else if (obj && obj.name && (obj.isMusicVideoMode === true || obj.isMusicVideoMode === false)) {
        project = obj as SavedProject
      }

      if (!project) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "Unrecognized project file format.",
        })
        return
      }

      const revived = reviveProjectDates(project)
      const { id: _ignore, updatedAt: _ignore2, ...rest } = revived as any
      const newId = await projectDB.saveProject(rest)
      await loadProjects()
      toast({ title: "Imported", description: `Project imported as new. ID: ${newId}` })
    } catch (e) {
      console.error("Import failed:", e)
      toast({ variant: "destructive", title: "Import failed", description: "Unable to import project." })
    } finally {
      if (importInputRef.current) importInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Full-screen on mobile, rounded panel on desktop. Solid background, no transparency. */}
      <DialogContent className="z-50 flex h-screen w-screen flex-col bg-slate-950 border border-slate-800 p-0 sm:h-[85vh] sm:w-[92vw] sm:max-w-5xl sm:rounded-xl">
        {/* Sticky header for clarity and mobile ergonomics */}
        <DialogHeader className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
          <DialogTitle className="text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-emerald-400" />
            Projects
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create, save, load, export, import, and manage your projects.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4">
          {/* Primary actions */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-center">
              <Input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={handleSave} disabled={!canSave || saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {currentProjectId ? "Save Changes" : "Save Project"}
              </Button>
              <Button onClick={exportCurrent} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Current
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImportFile(file)
                  }}
                />
                <Button onClick={onNewProject} variant="outline" className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
                <Button onClick={importInputClick} variant="outline" className="flex-1 sm:flex-none">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Project
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Projects List */}
          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              {loading ? "Loading projects..." : `${projects.length} saved project${projects.length === 1 ? "" : "s"}`}
            </div>

            {projects.length === 0 ? (
              <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-center text-slate-400 shadow-sm">
                No saved projects yet. Name your current work and click “Save Project”.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs text-slate-400">
                          Updated {format(new Date(p.updatedAt), "PP p")}
                        </div>
                      </div>
                      <Badge
                        className={`text-xs ${
                          p.isMusicVideoMode
                            ? "bg-purple-700/40 border-purple-700/40 text-purple-200"
                            : "bg-amber-700/40 border-amber-700/40 text-amber-200"
                        }`}
                      >
                        {p.isMusicVideoMode ? "Music Video" : "Story"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => onLoadProject(p)}>
                        Load
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportById(p)}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting === p.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
