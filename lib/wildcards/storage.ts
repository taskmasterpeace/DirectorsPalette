// Wild Card Storage Service (localStorage implementation)
// TODO: Migrate to Supabase database when tables are ready

import type { WildCard, WildCardCategory } from './types'
import { DEFAULT_CATEGORIES } from './types'

const STORAGE_KEY = 'directors-palette:wildcards:v1'
const CATEGORIES_KEY = 'directors-palette:wildcard-categories:v1'

/**
 * Wild Card Storage Service
 */
export class WildCardStorage {
  private static instance: WildCardStorage
  
  static getInstance(): WildCardStorage {
    if (!WildCardStorage.instance) {
      WildCardStorage.instance = new WildCardStorage()
    }
    return WildCardStorage.instance
  }

  /**
   * Get all wild cards for current user
   */
  getUserWildCards(userId: string): WildCard[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const allWildCards: WildCard[] = JSON.parse(stored)
      return allWildCards.filter(wc => wc.user_id === userId)
    } catch (error) {
      console.error('Error loading wild cards:', error)
      return []
    }
  }

  /**
   * Save wild card
   */
  saveWildCard(wildCard: Omit<WildCard, 'id' | 'created_at' | 'updated_at'>): WildCard {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allWildCards: WildCard[] = stored ? JSON.parse(stored) : []
      
      const newWildCard: WildCard = {
        ...wildCard,
        id: `wc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      allWildCards.push(newWildCard)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allWildCards))
      
      return newWildCard
    } catch (error) {
      console.error('Error saving wild card:', error)
      throw new Error('Failed to save wild card')
    }
  }

  /**
   * Update wild card
   */
  updateWildCard(id: string, updates: Partial<WildCard>): WildCard | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const allWildCards: WildCard[] = JSON.parse(stored)
      const index = allWildCards.findIndex(wc => wc.id === id)
      
      if (index === -1) return null
      
      allWildCards[index] = {
        ...allWildCards[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allWildCards))
      return allWildCards[index]
    } catch (error) {
      console.error('Error updating wild card:', error)
      return null
    }
  }

  /**
   * Delete wild card
   */
  deleteWildCard(id: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false
      
      const allWildCards: WildCard[] = JSON.parse(stored)
      const filteredWildCards = allWildCards.filter(wc => 
        !(wc.id === id && wc.user_id === userId)
      )
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWildCards))
      return true
    } catch (error) {
      console.error('Error deleting wild card:', error)
      return false
    }
  }

  /**
   * Get wild card by name
   */
  getWildCardByName(name: string, userId: string): WildCard | null {
    const wildCards = this.getUserWildCards(userId)
    return wildCards.find(wc => wc.name === name) || null
  }

  /**
   * Get categories
   */
  getCategories(): WildCardCategory[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY)
      if (!stored) {
        // Initialize with default categories
        const defaultCategories: WildCardCategory[] = DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `cat_${index}_${cat.name}`
        }))
        
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories))
        return defaultCategories
      }
      
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error loading categories:', error)
      return []
    }
  }

  /**
   * Import wild card from text content
   */
  importFromText(content: string, userId: string): WildCard[] {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const imported: WildCard[] = []
    
    // Simple import: treat each line as a separate wild card entry
    // or parse structured format if provided
    
    if (lines.length > 0) {
      const wildCard = this.saveWildCard({
        user_id: userId,
        name: `imported_${Date.now()}`,
        category: 'general',
        content: lines.join('\n'),
        description: `Imported from text file (${lines.length} entries)`,
        is_shared: false
      })
      
      imported.push(wildCard)
    }
    
    return imported
  }

  /**
   * Export wild card to text format
   */
  exportToText(wildCard: WildCard): string {
    const header = [
      `# ${wildCard.name}`,
      `# Category: ${wildCard.category}`,
      wildCard.description ? `# Description: ${wildCard.description}` : '',
      '',
    ].filter(line => line.length > 0).join('\n')
    
    return header + wildCard.content
  }

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CATEGORIES_KEY)
  }
}