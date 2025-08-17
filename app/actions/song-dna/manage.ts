"use server"

import { songDNADB, type StoredSongDNA } from "@/lib/song-dna-db"
import type { SongDNA } from "@/lib/song-dna-types"

export async function saveSongDNA(
  dna: SongDNA,
  metadata?: {
    title?: string
    artist?: string
    tags?: string[]
    notes?: string
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await songDNADB.save(dna, metadata)
    return { success: true, id }
  } catch (error) {
    console.error("Error saving Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save DNA"
    }
  }
}

export async function getSavedDNA(
  id: string
): Promise<{ success: boolean; data?: StoredSongDNA; error?: string }> {
  try {
    const data = await songDNADB.get(id)
    if (!data) {
      return { success: false, error: "DNA not found" }
    }
    return { success: true, data }
  } catch (error) {
    console.error("Error retrieving Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve DNA"
    }
  }
}

export async function getAllSavedDNA(): Promise<{
  success: boolean
  data?: StoredSongDNA[]
  error?: string
}> {
  try {
    const data = await songDNADB.getAll()
    return { success: true, data }
  } catch (error) {
    console.error("Error retrieving all Song DNAs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve DNAs"
    }
  }
}

export async function searchDNAByArtist(
  artist: string
): Promise<{ success: boolean; data?: StoredSongDNA[]; error?: string }> {
  try {
    const data = await songDNADB.searchByArtist(artist)
    return { success: true, data }
  } catch (error) {
    console.error("Error searching by artist:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search"
    }
  }
}

export async function updateSongDNA(
  id: string,
  updates: Partial<StoredSongDNA>
): Promise<{ success: boolean; error?: string }> {
  try {
    await songDNADB.update(id, updates)
    return { success: true }
  } catch (error) {
    console.error("Error updating Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update DNA"
    }
  }
}

export async function deleteSongDNA(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await songDNADB.delete(id)
    return { success: true }
  } catch (error) {
    console.error("Error deleting Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete DNA"
    }
  }
}

export async function exportDNAToJSON(
  id: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const jsonData = await songDNADB.exportDNA(id)
    return { success: true, data: jsonData }
  } catch (error) {
    console.error("Error exporting Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export DNA"
    }
  }
}

export async function importDNAFromJSON(
  jsonData: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await songDNADB.importDNA(jsonData)
    return { success: true, id }
  } catch (error) {
    console.error("Error importing Song DNA:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import DNA"
    }
  }
}

export async function exportAllDNA(): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const jsonData = await songDNADB.exportAll()
    return { success: true, data: jsonData }
  } catch (error) {
    console.error("Error exporting all DNAs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export collection"
    }
  }
}