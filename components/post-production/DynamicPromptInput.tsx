'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  parseDynamicPrompt, 
  validateBracketSyntax, 
  calculateDynamicPromptCost,
  type DynamicPromptResult 
} from '@/lib/dynamic-prompting'
import { WildCardStorage } from '@/lib/wildcards/storage'
import type { WildCard } from '@/lib/wildcards/types'

interface DynamicPromptInputProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  onDynamicPromptsChange: (prompts: string[]) => void
  creditsPerImage: number
  maxImages?: number
  placeholder?: string
  disabled?: boolean
  userId?: string
}

export function DynamicPromptInput({
  prompt,
  onPromptChange,
  onDynamicPromptsChange,
  creditsPerImage,
  maxImages = 5,
  placeholder = "Enter your prompt... Use [option1, option2] or _wildcard_ for variations",
  disabled = false,
  userId = 'anonymous'
}: DynamicPromptInputProps) {
  const [promptResult, setPromptResult] = useState<DynamicPromptResult | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [syntaxValidation, setSyntaxValidation] = useState<any>({ isValid: true })
  const [userWildCards, setUserWildCards] = useState<WildCard[]>([])
  
  const storage = WildCardStorage.getInstance()

  // Load user wild cards
  useEffect(() => {
    if (userId) {
      const wildCards = storage.getUserWildCards(userId)
      setUserWildCards(wildCards)
    }
  }, [userId])

  useEffect(() => {
    if (!prompt.trim()) {
      setPromptResult(null)
      setSyntaxValidation({ isValid: true })
      onDynamicPromptsChange([])
      return
    }

    // Validate syntax in real-time
    const validation = validateBracketSyntax(prompt)
    setSyntaxValidation(validation)

    // Parse dynamic prompts (with wild card support)
    const result = parseDynamicPrompt(prompt, { maxPreview: maxImages }, userWildCards)
    setPromptResult(result)
    
    // Update parent with expanded prompts
    onDynamicPromptsChange(result.expandedPrompts)
  }, [prompt, maxImages, onDynamicPromptsChange, userWildCards])

  const costCalculation = promptResult ? 
    calculateDynamicPromptCost(prompt, creditsPerImage, { maxPreview: maxImages }) : 
    { totalCost: 0, imageCount: 0, isValid: true }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value)
  }

  return (
    <div className="space-y-3">
      {/* Usage Examples - Moved to top for better visibility */}
      <div className="mb-3 p-3 bg-slate-800/30 rounded border border-slate-600">
        <div className="text-xs text-slate-300 space-y-2">
          <div className="font-medium text-white">💡 Dynamic Prompting Examples:</div>
          <div className="grid grid-cols-1 gap-1">
            <div><strong>Brackets:</strong> <code className="bg-slate-900 px-1 rounded">character [smiling, frowning, surprised]</code></div>
            <div><strong>Wild Cards:</strong> <code className="bg-slate-900 px-1 rounded">character in _locations_ with dramatic lighting</code></div>
            <div className="text-slate-400 text-xs mt-1">
              Create wild cards in Settings → Wild Cards (e.g., _locations_, _moods_, _characters_)
            </div>
          </div>
        </div>
      </div>

      {/* Main Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">
            Prompt
          </label>
          {(promptResult?.hasBrackets || promptResult?.hasWildCards) && (
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {promptResult.totalCount} variations
            </Badge>
          )}
        </div>
        
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        {/* Syntax Validation */}
        {!syntaxValidation.isValid && (
          <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
            <span>⚠️</span>
            <div>
              <div className="font-medium">{syntaxValidation.error}</div>
              {syntaxValidation.suggestion && (
                <div className="text-red-400">{syntaxValidation.suggestion}</div>
              )}
            </div>
          </div>
        )}

        {/* Cost Preview */}
        {promptResult?.isValid && costCalculation.isValid && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              {costCalculation.imageCount} image{costCalculation.imageCount !== 1 ? 's' : ''} • {costCalculation.totalCost} credits total
            </div>
            {(promptResult.hasBrackets || promptResult.hasWildCards) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-blue-400 hover:text-blue-300"
              >
                {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Prompt Preview */}
      {(promptResult?.hasBrackets || promptResult?.hasWildCards) && showPreview && promptResult.isValid && (
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium flex items-center gap-2">
                  🔄 Generated Variations
                </h4>
                <div className="text-sm text-slate-400">
                  Showing {promptResult.previewCount} of {promptResult.totalCount}
                </div>
              </div>
              
              <div className="space-y-2">
                {promptResult.expandedPrompts.slice(0, maxImages).map((expandedPrompt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-700/50 rounded border border-slate-600 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs min-w-0 shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-slate-200">{expandedPrompt}</span>
                    </div>
                  </div>
                ))}
                
                {promptResult.totalCount > maxImages && (
                  <div className="p-3 bg-slate-700/30 rounded border border-slate-600 text-center text-slate-400 text-sm">
                    +{promptResult.totalCount - maxImages} more variations (limited to {maxImages} for generation)
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {promptResult && !promptResult.isValid && promptResult.hasBrackets && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="text-red-300 space-y-2">
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span className="font-medium">Invalid Dynamic Prompt</span>
              </div>
              
              {promptResult.totalCount > maxImages && (
                <div className="text-sm">
                  Too many options ({promptResult.totalCount}). Maximum allowed: {maxImages}
                </div>
              )}
              
              {promptResult.options?.length === 0 && (
                <div className="text-sm">
                  Empty brackets detected. Add options: [option1, option2]
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}