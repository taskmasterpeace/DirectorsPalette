"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, PlayCircle, Trash2, Download, Search, Plus, Calendar, Clock, Film, Music } from "lucide-react"
import type { SavedProject } from "@/lib/indexeddb"
import { useArtistStore } from "@/lib/artist-store"

interface ProjectManagerProps {
  currentProject: any
  onLoadProject: (project: SavedProject) => void
  onNewProject: () => void
  currentProjectId: string
  onProjectSaved: (projectId: string) => void
}

export function ProjectManager({
  currentProject = {} as any,
  onLoadProject = () => {},
  onNewProject = () => {},
  currentProjectId = "",
  onProjectSaved = () => {},
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { activeArtist } = useArtistStore()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { projectDB } = await import("@/lib/indexeddb")
      const allProjects = await projectDB.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error("Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProject = async () => {
    if (!currentProject?.story?.trim() && !currentProject?.musicVideoData?.lyrics?.trim()) {
      return
    }

    setIsSaving(true)
    try {
      let projectId = currentProjectId

      // Include active artist in project data
      const projectData = {
        ...currentProject,
        activeArtist: activeArtist || undefined,
      }

      const { projectDB } = await import("@/lib/indexeddb")
      
      if (currentProjectId) {
        // Update existing project
        await projectDB.updateProject(currentProjectId, projectData)
      } else {
        // Create new project
        projectId = await projectDB.saveProject({
          name:
            currentProject?.name ||
            `${currentProject?.isMusicVideoMode ? "Music Video" : "Story"} Project ${new Date().toLocaleDateString()}`,
          ...projectData,
        })
        onProjectSaved(projectId)
      }

      await loadProjects()
    } catch (error) {
      console.error("Failed to save project:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const { projectDB } = await import("@/lib/indexeddb")
        await projectDB.deleteProject(projectId)
        await loadProjects()
      } catch (error) {
        console.error("Failed to delete project:", error)
      }
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.story && project.story.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.musicVideoData?.songTitle &&
        project.musicVideoData.songTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.musicVideoData?.artist &&
        project.musicVideoData.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.activeArtist?.artist_name &&
        project.activeArtist.artist_name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getProjectStats = (project: SavedProject) => {
    if (project.isMusicVideoMode) {
      const sections = project.musicVideoBreakdown?.musicVideoStructure?.totalSections || 0
      const shots =
        project.musicVideoBreakdown?.sectionBreakdowns?.reduce(
          (sum: number, section: any) => sum + (section.shots?.length || 0),
          0,
        ) || 0
      return { sections, shots, type: "music-video" }
    } else {
      const chapters = project.breakdown?.storyStructure?.totalChapters || 0
      const shots =
        project.breakdown?.chapterBreakdowns?.reduce(
          (sum: number, chapter: any) => sum + (chapter.shots?.length || 0),
          0,
        ) || 0
      const additionalShots = Object.values(project.additionalShots || {}).reduce(
        (sum: number, shots: any) => sum + (shots?.length || 0),
        0,
      )
      return { chapters, shots: shots + additionalShots, type: "story" }
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-purple-400" />
              Project Manager
            </CardTitle>
            <CardDescription className="text-slate-300">
              Save, load, and manage your story and music video projects
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveProject}
              disabled={isSaving || (!currentProject?.story?.trim() && !currentProject?.musicVideoData?.lyrics?.trim())}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {currentProjectId ? "Update Project" : "Save Project"}
                </>
              )}
            </Button>
            <Button
              onClick={onNewProject}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* Current Project Status */}
        {(currentProject?.story?.trim() || currentProject?.musicVideoData?.lyrics?.trim()) && (
          <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400 font-semibold text-sm">Current Project</span>
              {currentProject?.isMusicVideoMode ? (
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-700/30 text-xs">Music Video</Badge>
              ) : (
                <Badge className="bg-amber-600/20 text-amber-300 border-amber-700/30 text-xs">Story</Badge>
              )}
              {activeArtist && (
                <Badge className="bg-green-600/20 text-green-300 border-green-700/30 text-xs">
                  🎤 {activeArtist.artist_name}
                </Badge>
              )}
            </div>
            <div className="text-slate-300 text-sm">
              {currentProject?.isMusicVideoMode ? (
                <>
                  {currentProject?.musicVideoData?.songTitle && (
                    <div>
                      <strong>Song:</strong> {currentProject?.musicVideoData?.songTitle}
                    </div>
                  )}
                  {currentProject?.musicVideoData?.artist && (
                    <div>
                      <strong>Artist:</strong> {currentProject?.musicVideoData?.artist}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {currentProject?.musicVideoBreakdown ? "Generated" : "Draft"}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>Length:</strong> {currentProject?.story?.length || 0} characters
                  </div>
                  <div>
                    <strong>Status:</strong> {currentProject?.breakdown ? "Generated" : "Draft"}
                  </div>
                </>
              )}
              <div>
                <strong>Saved:</strong> {currentProjectId ? "Yes" : "No"}
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Projects List */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Saved Projects ({filteredProjects.length})
          </h4>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2" />
              <p className="text-slate-400">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">
                {searchQuery ? "No projects match your search." : "No saved projects yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProjects.map((project) => {
                const stats = getProjectStats(project)
                const isCurrentProject = project.id === currentProjectId

                return (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isCurrentProject
                        ? "bg-purple-900/20 border-purple-500/50"
                        : "bg-slate-900/30 border-slate-600 hover:bg-slate-900/50"
                    }`}
                    onClick={() => onLoadProject(project)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {project.isMusicVideoMode ? (
                          <PlayCircle className="h-4 w-4 text-purple-400" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-amber-400" />
                        )}
                        <h5 className="text-white font-medium text-sm">{project.name}</h5>
                        {isCurrentProject && (
                          <Badge className="bg-green-600/20 text-green-300 border-green-700/30 text-xs">Current</Badge>
                        )}
                        {project.activeArtist && (
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-700/30 text-xs">
                            🎤 {project.activeArtist.artist_name}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.updatedAt)}
                        </div>
                        {project.isMusicVideoMode ? (
                          <>
                            <div>{stats.sections} sections</div>
                            <div>{stats.shots} shots</div>
                            {project.musicVideoData?.genre && (
                              <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                                {project.musicVideoData.genre}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <div>{stats.chapters} chapters</div>
                            <div>{stats.shots} shots</div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {project.isMusicVideoMode ? (
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-700/30 text-xs">
                            <Music className="h-3 w-3 mr-1" />
                            Music Video
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-600/20 text-amber-300 border-amber-700/30 text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Story
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Project Preview */}
                    <div className="mt-2 text-xs text-slate-500">
                      {project.isMusicVideoMode ? (
                        <>
                          {project.musicVideoData?.songTitle && project.musicVideoData?.artist && (
                            <div>
                              &quot;{project.musicVideoData.songTitle}&quot; by {project.musicVideoData.artist}
                            </div>
                          )}
                          {project.musicVideoData?.lyrics && (
                            <div className="truncate mt-1">{project.musicVideoData.lyrics.substring(0, 100)}...</div>
                          )}
                        </>
                      ) : (
                        project.story && <div className="truncate">{project.story.substring(0, 100)}...</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
