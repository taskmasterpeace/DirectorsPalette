'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  MapPin,
  Package,
  Layout,
  Maximize2,
  ImageIcon,
  Edit3,
  MoreVertical
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type { LibraryImageReference } from '@/lib/post-production/enhanced-types'

interface Gen4ReferenceLibraryProps {
  libraryItems: LibraryImageReference[]
  libraryCategory: string
  setLibraryCategory: (category: string) => void
  libraryLoading: boolean
  onFullscreenImage: (image: LibraryImageReference) => void
  onCategoryChange?: (itemId: string, newCategory: 'people' | 'places' | 'props' | 'unorganized') => void
  compact?: boolean
}

const categoryConfig = {
  'all': { icon: ImageIcon, label: 'All', color: 'slate' },
  'people': { icon: Users, label: 'People', color: 'blue' },
  'places': { icon: MapPin, label: 'Places', color: 'green' },
  'props': { icon: Package, label: 'Props', color: 'orange' },
  'layouts': { icon: Layout, label: 'Layouts', color: 'purple' }
}

export function Gen4ReferenceLibrary({
  libraryItems,
  libraryCategory,
  setLibraryCategory,
  libraryLoading,
  onFullscreenImage,
  onCategoryChange,
  compact = false
}: Gen4ReferenceLibraryProps) {
  const filteredItems = libraryCategory === 'all' 
    ? libraryItems 
    : libraryItems.filter(item => item.tags?.includes(libraryCategory))

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <span>Reference Library</span>
          <Button
            variant="outline"
            size="sm" 
            onClick={() => onFullscreenImage({ 
              id: 'fullscreen-view',
              imageData: '',
              preview: '',
              tags: [],
              prompt: 'Library View',
              category: 'library',
              metadata: {},
              uploadedAt: new Date().toISOString()
            })}
          >
            <Maximize2 className="w-3 h-3 mr-1" />
            View fullscreen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const IconComponent = config.icon
            const isActive = libraryCategory === key
            
            return (
              <Button
                key={key}
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setLibraryCategory(key)}
                className={`h-8 ${isActive ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-slate-300'}`}
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
              </Button>
            )
          })}
        </div>

        {/* Library Grid */}
        {libraryLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading library...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Library is empty</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div 
                    className="rounded border border-slate-600 overflow-hidden bg-slate-800 cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => onFullscreenImage(item)}
                  >
                    <img
                      src={item.preview || item.imageData}
                      alt={item.prompt || 'Library image'}
                      className="w-full h-auto max-h-32 object-contain"
                    />
                    
                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFullscreenImage(item)
                        }}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      
                      {onCategoryChange && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-white hover:bg-blue-500 bg-blue-600/80"
                              onClick={(e) => e.stopPropagation()}
                              title="Edit Category"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onCategoryChange(item.id, 'people')}>
                              <Users className="w-4 h-4 mr-2" />
                              People
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCategoryChange(item.id, 'places')}>
                              <MapPin className="w-4 h-4 mr-2" />
                              Places
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCategoryChange(item.id, 'props')}>
                              <Package className="w-4 h-4 mr-2" />
                              Props
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCategoryChange(item.id, 'unorganized')}>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Unorganized
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {/* Category badge */}
                    {item.category && (
                      <div className="absolute top-1 left-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Image info */}
                  <div className="mt-1">
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.prompt?.slice(0, 30) || 'No prompt'}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}