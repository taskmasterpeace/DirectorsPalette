'use client'

import { forwardRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Image as ImageIcon, Hash } from 'lucide-react'
import type { ReferenceItem, AutocompleteState } from '@/hooks/useReferenceAutocomplete'

interface ReferenceAutocompleteProps {
  autocompleteState: AutocompleteState
  position: { top: number; left: number }
  onSelect: (item: ReferenceItem) => void
  className?: string
}

export const ReferenceAutocomplete = forwardRef<HTMLDivElement, ReferenceAutocompleteProps>(
  ({ autocompleteState, position, onSelect, className = '' }, ref) => {
    if (!autocompleteState.isOpen || autocompleteState.items.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`fixed z-50 w-80 max-h-60 overflow-y-auto ${className}`}
        style={{
          top: position.top,
          left: position.left
        }}
      >
        <Card className="bg-slate-800 border-purple-500/20 shadow-xl border-2">
          <div className="p-2">
            <div className="text-xs text-purple-300 mb-2 px-2">
              References ({autocompleteState.items.length})
            </div>

            {autocompleteState.items.map((item, index) => (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-150
                  ${index === autocompleteState.selectedIndex
                    ? 'bg-purple-600/30 border border-purple-400/50'
                    : 'hover:bg-slate-700/50'
                  }
                `}
                onClick={() => onSelect(item)}
              >
                {/* Icon and Thumbnail */}
                <div className="flex-shrink-0">
                  {item.type === 'image' && item.thumbnailUrl ? (
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-700">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`
                      w-8 h-8 rounded-md flex items-center justify-center
                      ${item.type === 'prompt'
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'bg-purple-600/20 text-purple-400'
                      }
                    `}>
                      {item.type === 'prompt' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm truncate">
                      {item.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`
                        text-xs px-1.5 py-0.5 h-auto
                        ${item.type === 'prompt'
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                        }
                      `}
                    >
                      {item.type === 'prompt' ? 'Prompt' : 'Image'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="text-xs text-purple-300 bg-purple-900/30 px-1.5 py-0.5 rounded">
                      {item.reference}
                    </code>

                    {item.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400 truncate">
                          {item.tags.slice(0, 2).join(', ')}
                          {item.tags.length > 2 && '...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preview text for prompts */}
                  {item.type === 'prompt' && item.content && (
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {item.content.slice(0, 80)}
                      {item.content.length > 80 && '...'}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="border-t border-slate-700 mt-2 pt-2 px-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>ESC to close</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }
)

ReferenceAutocomplete.displayName = 'ReferenceAutocomplete'

export default ReferenceAutocomplete