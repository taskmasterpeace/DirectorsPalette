'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Wand2, 
  Plus, 
  Edit, 
  Download, 
  Upload,
  Tag,
  Search,
  X
} from 'lucide-react'
import { 
  PRESET_CATEGORIES, 
  COMPREHENSIVE_PRESETS, 
  getPresetsByCategory,
  getCategoryById,
  type Preset,
  type PresetCategory
} from '@/lib/presets/preset-categories'

interface EnhancedPresetManagerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onApplyPreset: (preset: Preset) => void
  currentTool: 'shot-creator' | 'shot-editor'
}

export function EnhancedPresetManager({
  isOpen,
  onOpenChange,
  onApplyPreset,
  currentTool
}: EnhancedPresetManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Filter presets based on category, search, and tool
  const filteredPresets = COMPREHENSIVE_PRESETS.filter(preset => {
    // Tool compatibility
    const toolMatch = preset.usedFor.includes(currentTool) || preset.usedFor.includes('both')
    
    // Category filter
    const categoryMatch = selectedCategory === 'all' || preset.category === selectedCategory
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return toolMatch && categoryMatch && searchMatch
  })

  const handleApplyPreset = (preset: Preset) => {
    onApplyPreset(preset)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Enhanced Preset Library - {currentTool === 'shot-creator' ? 'Shot Creator' : 'Shot Editor'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Tools */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 gap-1">
              <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
                All ({filteredPresets.length})
              </TabsTrigger>
              <TabsTrigger value="background-editing" className="flex items-center gap-1 text-xs">
                🖼️ Background ({getPresetsByCategory('background-editing').filter(p => p.usedFor.includes(currentTool) || p.usedFor.includes('both')).length})
              </TabsTrigger>
              <TabsTrigger value="character-consistency" className="flex items-center gap-1 text-xs">
                👤 Character ({getPresetsByCategory('character-consistency').filter(p => p.usedFor.includes(currentTool) || p.usedFor.includes('both')).length})
              </TabsTrigger>
              <TabsTrigger value="lighting-effects" className="flex items-center gap-1 text-xs">
                💡 Lighting ({getPresetsByCategory('lighting-effects').filter(p => p.usedFor.includes(currentTool) || p.usedFor.includes('both')).length})
              </TabsTrigger>
            </TabsList>

            {/* Preset Grid */}
            <div className="mt-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPresets.map((preset) => {
                  const category = getCategoryById(preset.category)
                  return (
                    <div
                      key={preset.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-purple-500 transition-colors cursor-pointer group bg-white dark:bg-slate-800"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{category?.icon}</span>
                          <h4 className="font-medium text-sm truncate flex-1">{preset.name}</h4>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPreset(preset)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-tight">
                        {preset.prompt.slice(0, 80)}...
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {preset.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs h-4 px-1">
                            {tag}
                          </Badge>
                        ))}
                        {preset.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs h-4 px-1">
                            +{preset.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {filteredPresets.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">No presets found for current filters</p>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Edit Preset Dialog */}
      {editingPreset && (
        <Dialog open={!!editingPreset} onOpenChange={() => setEditingPreset(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Preset: {editingPreset.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Preset Name</Label>
                <Input defaultValue={editingPreset.name} />
              </div>
              <div>
                <Label>Category</Label>
                <Select defaultValue={editingPreset.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prompt</Label>
                <Textarea 
                  defaultValue={editingPreset.prompt} 
                  className="min-h-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPreset(null)}>Cancel</Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}