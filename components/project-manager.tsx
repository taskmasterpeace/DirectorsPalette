"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, FolderOpen, Download, Upload, Trash2, Calendar, FileText, Film, Check, X, Plus, Clock, BookOpen } from 'lucide-react'
import { projectDB, SavedProject } from "@/lib/indexeddb"

interface ProjectManagerProps {
  currentProject: {
    name: string
    story: string
    selectedDirector: string
    breakdown: any
    additionalShots: { [chapterId: string]: string[] }
    titleCardOptions: { enabled: boolean, format: string }
    titleCardApproaches: string[]
    customDirectors: any[]
    promptOptions: { includeCameraStyle: boolean, includeColorPalette: boolean }
    selectedChapter: string
    expandedChapters: { [chapterId: string]: boolean }
  }
  onLoadProject: (project: SavedProject) => void
  onNewProject: () => void
  currentProjectId?: string
  onProjectSaved: (projectId: string) => void
}

export function ProjectManager({ 
  currentProject, 
  onLoadProject, 
  onNewProject, 
  currentProjectId,
  onProjectSaved 
}: ProjectManagerProps) {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState("")

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const projects = await projectDB.getAllProjects()
      setSavedProjects(projects)
    } catch (err) {
      setError("Failed to load projects")
      console.error(err)
    }
  }

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setError("Please enter a project name")
      return
    }

    if (!currentProject.story.trim()) {
      setError("Cannot save project without story content")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let projectId: string

      if (currentProjectId) {
        // Update existing project
        await projectDB.updateProject(currentProjectId, {
          name: projectName,
          ...currentProject
        })
        projectId = currentProjectId
      } else {
        // Save new project
        projectId = await projectDB.saveProject({
          name: projectName,
          ...currentProject
        })
      }

      await loadProjects()
      setShowSaveDialog(false)
      setProjectName("")
      onProjectSaved(projectId)
    } catch (err) {
      setError("Failed to save project")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadProject = async (project: SavedProject) => {
    setIsLoading(true)
    try {
      onLoadProject(project)
    } catch (err) {
      setError("Failed to load project")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      await projectDB.deleteProject(projectId)
      await loadProjects()
    } catch (err) {
      setError("Failed to delete project")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportProject = async (projectId: string) => {
    try {
      const jsonData = await projectDB.exportProject(projectId)
      const project = savedProjects.find(p => p.id === projectId)
      
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.name || 'project'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError("Failed to export project")
      console.error(err)
    }
  }

  const handleImportProject = async () => {
    if (!importData.trim()) {
      setError("Please paste project data")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const projectId = await projectDB.importProject(importData, projectName || undefined)
      await loadProjects()
      setShowImportDialog(false)
      setImportData("")
      setProjectName("")
      
      // Load the imported project
      const importedProject = await projectDB.getProject(projectId)
      if (importedProject) {
        onLoadProject(importedProject)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import project")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProjectStats = (project: SavedProject) => {
    const totalShots = project.breakdown?.chapterBreakdowns?.reduce((sum: number, chapter: any) => 
      sum + chapter.shots.length + (project.additionalShots[chapter.chapterId]?.length || 0), 0
    ) || 0
    
    const totalChapters = project.breakdown?.storyStructure?.totalChapters || 0
    
    return { totalShots, totalChapters }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setProjectName(currentProjectId ? 
              savedProjects.find(p => p.id === currentProjectId)?.name || "" : 
              `Project ${new Date().toLocaleDateString()}`
            )
            setShowSaveDialog(true)
          }}
          disabled={!currentProject.story.trim()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {currentProjectId ? 'Update Project' : 'Save Project'}
        </Button>

        <Button
          onClick={() => setShowImportDialog(true)}
          variant="outline"
          className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Project
        </Button>

        <Button
          onClick={onNewProject}
          variant="outline"
          className="border-amber-500/30 text-amber-300 hover:bg-amber-600/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className="bg-slate-800/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Save className="h-5 w-5 text-green-400" />
              {currentProjectId ? 'Update Project' : 'Save Project'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-600">
              <div className="text-sm text-slate-300 space-y-1">
                <div>Story Length: {currentProject.story.length} characters</div>
                <div>Director: {currentProject.selectedDirector}</div>
                {currentProject.breakdown?.storyStructure && (
                  <>
                    <div>Chapters: {currentProject.breakdown.storyStructure.totalChapters}</div>
                    <div>Total Shots: {
                      currentProject.breakdown.chapterBreakdowns?.reduce((sum: number, chapter: any) => 
                        sum + chapter.shots.length + (currentProject.additionalShots[chapter.chapterId]?.length || 0), 0
                      ) || 0
                    }</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveProject}
                disabled={isLoading || !projectName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {currentProjectId ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Import Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Project Name (Optional)</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Leave empty to use original name..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">Import Method</label>
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('file-import')?.click()}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Choose File
                </Button>
                <span className="text-slate-400 text-sm self-center">or paste JSON data below</span>
              </div>
              <input
                id="file-import"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">Project Data (JSON)</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported project JSON data here..."
                className="w-full h-32 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleImportProject}
                disabled={isLoading || !importData.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowImportDialog(false)
                  setImportData("")
                  setProjectName("")
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Projects */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-400" />
            Saved Projects
            <Badge variant="secondary" className="bg-amber-600/20 text-amber-300">
              {savedProjects.length}
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-300">
            Load, export, or delete your saved projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved projects yet</p>
              <p className="text-sm">Save your current work to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedProjects.map((project) => {
                const stats = getProjectStats(project)
                const isCurrentProject = currentProjectId === project.id
                
                return (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentProject 
                        ? 'bg-amber-900/20 border-amber-500/30' 
                        : 'bg-slate-900/30 border-slate-600 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{project.name}</h4>
                          {isCurrentProject && (
                            <Badge variant="secondary" className="bg-amber-600/20 text-amber-300 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.updatedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {project.story.length} chars
                          </div>
                          {stats.totalChapters > 0 && (
                            <>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {stats.totalChapters} chapters
                              </div>
                              <div className="flex items-center gap-1">
                                <Film className="h-3 w-3" />
                                {stats.totalShots} shots
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                            {project.selectedDirector}
                          </Badge>
                          {project.breakdown?.storyStructure?.detectionMethod && (
                            <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                              {project.breakdown.storyStructure.detectionMethod}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadProject(project)}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportProject(project.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="border-red-600/30 text-red-300 hover:bg-red-600/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}
