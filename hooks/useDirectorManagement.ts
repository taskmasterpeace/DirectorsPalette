import { useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAppStore } from '@/stores/app-store'
import { useDirectorStore } from '@/stores/director-store'
import { useStoryStore } from '@/stores/story-store'
import { useMusicVideoStore } from '@/stores/music-video-store'
import { DirectorService } from '@/services'
import { directorDB } from '@/lib/director-db'
import type { FilmDirector, MusicVideoDirector } from '@/lib/director-types'

interface CustomDirector {
  id: string
  name: string
  description: string
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  category?: string
  tags?: string[]
  disciplines?: string[]
}

interface CustomMusicVideoDirector {
  id: string
  name: string
  description: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  category?: string
  tags?: string[]
  disciplines?: string[]
}

export function useDirectorManagement() {
  const { toast } = useToast()
  const {
    mode,
    showCustomDirectorForm,
    setShowCustomDirectorForm,
    customDirectorName,
    setCustomDirectorName,
    customDirectorDescription,
    setCustomDirectorDescription,
    isGeneratingDirectorStyle,
    setIsGeneratingDirectorStyle
  } = useAppStore()
  
  const {
    customDirectors,
    customMusicVideoDirectors,
    addCustomDirector,
    addCustomMusicVideoDirector,
    setCustomDirectors,
    setCustomMusicVideoDirectors,
    directorsLoaded,
    setDirectorsLoaded
  } = useDirectorStore()
  
  const { setSelectedDirector } = useStoryStore()
  const { setSelectedMusicVideoDirector } = useMusicVideoStore()

  // Load directors from IndexedDB on mount
  useEffect(() => {
    if (directorsLoaded) return
    
    const loadDirectors = async () => {
      try {
        await directorDB.ensureSeeded()
        const [filmDirectors, musicDirectors] = await Promise.all([
          directorDB.getAllFilm(),
          directorDB.getAllMusic()
        ])

        const customFilm = filmDirectors.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          visualLanguage: d.visualLanguage,
          visualStyle: d.visualStyle,
          cameraStyle: d.cameraStyle,
          colorPalette: d.colorPalette,
          narrativeFocus: d.narrativeFocus,
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines
        }))

        const customMusic = musicDirectors.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          visualHallmarks: d.visualHallmarks,
          narrativeStyle: d.narrativeStyle,
          pacingAndEnergy: d.pacingAndEnergy,
          genres: d.genres,
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines
        }))

        setCustomDirectors(customFilm)
        setCustomMusicVideoDirectors(customMusic)
        setDirectorsLoaded(true)
      } catch (error) {
        console.error("Failed to load directors:", error)
        toast({
          title: "Error Loading Directors",
          description: "Failed to load custom directors from database",
          variant: "destructive"
        })
      }
    }

    loadDirectors()
  }, [directorsLoaded, setCustomDirectors, setCustomMusicVideoDirectors, setDirectorsLoaded, toast])

  const handleCreateCustomDirector = useCallback(async () => {
    if (!customDirectorName.trim() || !customDirectorDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and description for the custom director.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingDirectorStyle(true)
    try {
      const styleResult = await DirectorService.generateStyleDetails(
        customDirectorName,
        customDirectorDescription,
        mode === "music-video" ? "music-video" : "film"
      )

      if (!styleResult.success || !styleResult.data) {
        throw new Error(styleResult.error || "Failed to generate director style")
      }

      const directorId = `custom-${Date.now()}`

      if (mode === "music-video") {
        const newDirector: CustomMusicVideoDirector = {
          id: directorId,
          name: customDirectorName,
          description: customDirectorDescription,
          visualHallmarks: styleResult.data.visualHallmarks || styleResult.data.visualLanguage,
          narrativeStyle: styleResult.data.narrativeStyle || styleResult.data.narrativeFocus,
          pacingAndEnergy: styleResult.data.pacingAndEnergy,
          genres: styleResult.data.genres || [],
          category: "custom",
          tags: ["custom"],
          disciplines: styleResult.data.disciplines || []
        }

        const musicDirector: MusicVideoDirector = {
          id: directorId,
          name: customDirectorName,
          description: customDirectorDescription,
          visualHallmarks: newDirector.visualHallmarks,
          narrativeStyle: newDirector.narrativeStyle,
          pacingAndEnergy: newDirector.pacingAndEnergy,
          genres: newDirector.genres,
          category: "custom",
          tags: ["custom"],
          disciplines: newDirector.disciplines || []
        }

        await directorDB.addMusic(musicDirector)
        addCustomMusicVideoDirector(newDirector)
        setSelectedMusicVideoDirector(newDirector)

        toast({
          title: "Music Video Director Created",
          description: `Successfully created custom director: ${customDirectorName}`
        })
      } else {
        const newDirector: CustomDirector = {
          id: directorId,
          name: customDirectorName,
          description: customDirectorDescription,
          visualLanguage: styleResult.data.visualLanguage,
          visualStyle: styleResult.data.visualStyle,
          cameraStyle: styleResult.data.cameraStyle,
          colorPalette: styleResult.data.colorPalette,
          narrativeFocus: styleResult.data.narrativeFocus,
          category: "custom",
          tags: ["custom"],
          disciplines: styleResult.data.disciplines || []
        }

        const filmDirector: FilmDirector = {
          id: directorId,
          name: customDirectorName,
          description: customDirectorDescription,
          visualLanguage: newDirector.visualLanguage,
          visualStyle: newDirector.visualStyle,
          cameraStyle: newDirector.cameraStyle,
          colorPalette: newDirector.colorPalette,
          narrativeFocus: newDirector.narrativeFocus,
          category: "custom",
          tags: ["custom"],
          disciplines: newDirector.disciplines || []
        }

        await directorDB.addFilm(filmDirector)
        addCustomDirector(newDirector)
        setSelectedDirector(newDirector)

        toast({
          title: "Film Director Created",
          description: `Successfully created custom director: ${customDirectorName}`
        })
      }

      // Clear form
      setCustomDirectorName("")
      setCustomDirectorDescription("")
      setShowCustomDirectorForm(false)
    } catch (error) {
      console.error("Error creating custom director:", error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create custom director",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingDirectorStyle(false)
    }
  }, [
    customDirectorName,
    customDirectorDescription,
    mode,
    setIsGeneratingDirectorStyle,
    setCustomDirectorName,
    setCustomDirectorDescription,
    setShowCustomDirectorForm,
    addCustomDirector,
    addCustomMusicVideoDirector,
    setSelectedDirector,
    setSelectedMusicVideoDirector,
    toast
  ])

  return {
    // State
    customDirectors,
    customMusicVideoDirectors,
    showCustomDirectorForm,
    customDirectorName,
    customDirectorDescription,
    isGeneratingDirectorStyle,
    
    // Actions
    handleCreateCustomDirector,
    setShowCustomDirectorForm,
    setCustomDirectorName,
    setCustomDirectorDescription
  }
}