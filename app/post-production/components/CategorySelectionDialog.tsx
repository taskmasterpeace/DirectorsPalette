'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CategorySelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (category: string, tags: string[]) => void
  initialTags?: string[]
  imageUrl?: string
}

export default function CategorySelectionDialog({
  open,
  onOpenChange,
  onSave,
  initialTags = [],
  imageUrl
}: CategorySelectionDialogProps) {
  const [category, setCategory] = useState<'people' | 'places' | 'props' | 'unorganized'>('unorganized')
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')

  const categories = [
    { value: 'people', label: 'People', description: 'Characters, portraits, persons' },
    { value: 'places', label: 'Places', description: 'Locations, environments, settings' },
    { value: 'props', label: 'Props', description: 'Objects, items, things' },
    { value: 'unorganized', label: 'Unorganized', description: 'General or uncategorized' }
  ]

  const suggestedTags = {
    people: ['portrait', 'character', 'person', 'face', 'human'],
    places: ['landscape', 'environment', 'location', 'scene', 'background'],
    props: ['object', 'item', 'thing', 'prop', 'accessory'],
    unorganized: ['generated', 'art', 'design', 'concept', 'abstract']
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSave = () => {
    onSave(category, tags)
    onOpenChange(false)
    // Reset for next use
    setCategory('unorganized')
    setTags([])
    setTagInput('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Save to Reference Library</DialogTitle>
          <DialogDescription>
            Choose a category and add tags to organize your generated image
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Image Preview */}
          {imageUrl && (
            <div className="flex justify-center">
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div>
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Show selected category description */}
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                {categories.find(c => c.value === category)?.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags[category].map(tag => (
                  <Badge 
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() => {
                      if (!tags.includes(tag)) {
                        setTags([...tags, tag])
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save to Library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}