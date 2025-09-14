'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WildCardStorage } from '@/lib/wildcards/storage'
import { validateWildCardName, parseWildCardContent } from '@/lib/wildcards/parser'
import type { WildCard, WildCardCategory } from '@/lib/wildcards/types'
import { DEFAULT_CATEGORIES } from '@/lib/wildcards/types'

interface WildCardManagerProps {
  userId: string
}

export function WildCardManager({ userId }: WildCardManagerProps) {
  const [wildCards, setWildCards] = useState<WildCard[]>([])
  const [categories, setCategories] = useState<WildCardCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingWildCard, setEditingWildCard] = useState<WildCard | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const storage = WildCardStorage.getInstance()

  // Load data on mount
  useEffect(() => {
    loadWildCards()
    loadCategories()
  }, [userId])

  const loadWildCards = () => {
    const userWildCards = storage.getUserWildCards(userId)
    setWildCards(userWildCards)
  }

  const loadCategories = () => {
    const allCategories = storage.getCategories()
    setCategories(allCategories)
  }

  const filteredWildCards = wildCards.filter(wc => {
    const matchesCategory = selectedCategory === 'all' || wc.category === selectedCategory
    const matchesSearch = !searchTerm || 
      wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const handleCreateWildCard = (formData: {
    name: string
    category: string
    content: string
    description: string
  }) => {
    const validation = validateWildCardName(formData.name)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    // Check for duplicate names
    const exists = wildCards.some(wc => wc.name === formData.name)
    if (exists) {
      alert('A wild card with this name already exists')
      return
    }

    try {
      storage.saveWildCard({
        user_id: userId,
        name: formData.name,
        category: formData.category,
        content: formData.content,
        description: formData.description || undefined,
        is_shared: false
      })
      
      loadWildCards()
      setIsCreating(false)
    } catch (error) {
      alert('Failed to create wild card')
    }
  }

  const handleUpdateWildCard = (id: string, updates: Partial<WildCard>) => {
    storage.updateWildCard(id, updates)
    loadWildCards()
    setEditingWildCard(null)
  }

  const handleDeleteWildCard = (id: string) => {
    if (confirm('Are you sure you want to delete this wild card?')) {
      storage.deleteWildCard(id, userId)
      loadWildCards()
    }
  }

  const handleImportText = (textContent: string) => {
    try {
      const imported = storage.importFromText(textContent, userId)
      loadWildCards()
      setIsImporting(false)
      alert(`Imported ${imported.length} wild card(s)`)
    } catch (error) {
      alert('Failed to import wild cards')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wild Card Manager</h2>
          <p className="text-slate-400">
            Create reusable prompt libraries with _wildcard_ syntax
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsImporting(true)}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            📤 Import
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ➕ Create Wild Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{wildCards.length}</div>
            <div className="text-sm text-slate-400">Total Wild Cards</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {wildCards.reduce((sum, wc) => sum + parseWildCardContent(wc.content).length, 0)}
            </div>
            <div className="text-sm text-slate-400">Total Entries</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{categories.length}</div>
            <div className="text-sm text-slate-400">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="🔍 Search wild cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.icon} {cat.description}
            </option>
          ))}
        </select>
      </div>

      {/* Wild Cards Grid */}
      <div className="grid gap-4">
        {filteredWildCards.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Wild Cards Yet</h3>
              <p className="text-slate-400 mb-4">
                Create your first wild card to start using _wildcard_ syntax in prompts
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Wild Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredWildCards.map(wildCard => (
            <WildCardItem
              key={wildCard.id}
              wildCard={wildCard}
              onEdit={setEditingWildCard}
              onDelete={handleDeleteWildCard}
              categories={categories}
            />
          ))
        )}
      </div>

      {/* Create Dialog */}
      <CreateWildCardDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateWildCard}
        categories={categories}
      />

      {/* Edit Dialog */}
      {editingWildCard && (
        <EditWildCardDialog
          wildCard={editingWildCard}
          open={!!editingWildCard}
          onOpenChange={() => setEditingWildCard(null)}
          onSubmit={handleUpdateWildCard}
          categories={categories}
        />
      )}

      {/* Import Dialog */}
      <ImportWildCardDialog
        open={isImporting}
        onOpenChange={setIsImporting}
        onSubmit={handleImportText}
      />
    </div>
  )
}

// Individual Wild Card Item Component
function WildCardItem({
  wildCard,
  onEdit,
  onDelete,
  categories
}: {
  wildCard: WildCard
  onEdit: (wc: WildCard) => void
  onDelete: (id: string) => void
  categories: WildCardCategory[]
}) {
  const entries = parseWildCardContent(wildCard.content)
  const category = categories.find(c => c.name === wildCard.category)

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">_{wildCard.name}_</span>
              <Badge variant="outline" className="text-xs">
                {category?.icon} {wildCard.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entries.length} entries
              </Badge>
            </div>
            
            {wildCard.description && (
              <p className="text-sm text-slate-400">{wildCard.description}</p>
            )}
            
            <div className="text-sm text-slate-300">
              <div className="font-medium mb-1">Preview:</div>
              <div className="space-y-1">
                {entries.slice(0, 3).map((entry, index) => (
                  <div key={index} className="text-slate-400">
                    • {entry}
                  </div>
                ))}
                {entries.length > 3 && (
                  <div className="text-slate-500">
                    ... and {entries.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(wildCard)}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
            >
              ✏️ Edit
            </Button>
            <Button
              onClick={() => onDelete(wildCard.id)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Create Wild Card Dialog (simplified for space)
function CreateWildCardDialog({
  open,
  onOpenChange,
  onSubmit,
  categories
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  categories: WildCardCategory[]
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    content: '',
    description: ''
  })

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Name and content are required')
      return
    }
    
    onSubmit(formData)
    setFormData({ name: '', category: 'general', content: '', description: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Wild Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., hairstyles"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              placeholder="Brief description of this wild card"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-700 border-slate-600"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Entries (One per line)</label>
            <Textarea
              placeholder="short brown hair&#10;long blonde hair&#10;curly red hair&#10;bald"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="bg-slate-700 border-slate-600 min-h-32"
              rows={8}
            />
            <div className="text-xs text-slate-400 mt-1">
              {parseWildCardContent(formData.content).length} entries
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Wild Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Edit Wild Card Dialog (similar structure, simplified)
function EditWildCardDialog({
  wildCard,
  open,
  onOpenChange,
  onSubmit,
  categories
}: {
  wildCard: WildCard
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (id: string, updates: Partial<WildCard>) => void
  categories: WildCardCategory[]
}) {
  const [formData, setFormData] = useState({
    name: wildCard.name,
    category: wildCard.category,
    content: wildCard.content,
    description: wildCard.description || ''
  })

  const handleSubmit = () => {
    onSubmit(wildCard.id, formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Wild Card: _{wildCard.name}_</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-700 border-slate-600"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Entries</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="bg-slate-700 border-slate-600 min-h-32"
              rows={8}
            />
            <div className="text-xs text-slate-400 mt-1">
              {parseWildCardContent(formData.content).length} entries
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Import Dialog (simplified)
function ImportWildCardDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (content: string) => void
}) {
  const [textContent, setTextContent] = useState('')

  const handleSubmit = () => {
    if (!textContent.trim()) {
      alert('Please enter content to import')
      return
    }
    
    onSubmit(textContent)
    setTextContent('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Wild Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Text Content</label>
            <Textarea
              placeholder="Paste your wild card entries here (one per line)"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="bg-slate-700 border-slate-600 min-h-32"
              rows={10}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import Wild Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}