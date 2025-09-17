'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  parsePipelinePrompt,
  calculatePipelineCost,
  validatePipelineSyntax,
  getPipelinePreview,
  type PipelineResult
} from '@/lib/pipeline-prompting'
import { WildCardStorage } from '@/lib/wildcards/storage'
import type { WildCard } from '@/lib/wildcards/types'

interface PipelinePromptInputProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  onPipelineChange: (pipeline: PipelineResult | null) => void
  creditsPerImage: number
  placeholder?: string
  disabled?: boolean
  userId?: string
  disablePipeline?: boolean // NEW: Disable pipeline syntax when coming from other sources
}

export function PipelinePromptInput({
  prompt,
  onPromptChange,
  onPipelineChange,
  creditsPerImage,
  placeholder = "Enter your prompt... Use [option1, option2], _wildcard_, or | for pipeline steps",
  disabled = false,
  userId = 'anonymous',
  disablePipeline = false
}: PipelinePromptInputProps) {
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
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
      setPipelineResult(null)
      setSyntaxValidation({ isValid: true })
      onPipelineChange(null)
      return
    }

    // If pipeline is disabled, check for pipe syntax and show error
    if (disablePipeline && prompt.includes('|')) {
      setSyntaxValidation({
        isValid: false,
        error: 'Pipeline syntax not available',
        suggestion: 'Pipeline (|) can only be used when starting fresh. You can still use brackets [option1, option2] and wildcards _name_'
      })
      setPipelineResult(null)
      onPipelineChange(null)
      return
    }

    // Validate pipeline syntax in real-time
    const validation = validatePipelineSyntax(prompt)
    setSyntaxValidation(validation)

    // Parse pipeline prompt (or just dynamic prompt if pipeline disabled)
    const result = disablePipeline
      ? parsePipelinePrompt(prompt.replace(/\|/g, ' '), userWildCards) // Replace pipes with spaces if disabled
      : parsePipelinePrompt(prompt, userWildCards)
    setPipelineResult(result)

    // Update parent with pipeline result
    onPipelineChange(result)
  }, [prompt, onPipelineChange, userWildCards, disablePipeline])

  const costCalculation = pipelineResult ?
    calculatePipelineCost(pipelineResult, creditsPerImage) :
    { totalCost: 0, breakdown: [] }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value)
  }

  const previewText = pipelineResult ? getPipelinePreview(pipelineResult) : ''

  return (
    <div className="space-y-3">
      {/* Usage Examples */}
      <div className="mb-3 p-3 bg-slate-800/30 rounded border border-slate-600">
        <div className="text-xs text-slate-300 space-y-2">
          <div className="font-medium text-white">💡 Enhanced Prompting Examples:</div>
          <div className="grid grid-cols-1 gap-1">
            <div><strong>Brackets:</strong> <code className="bg-slate-900 px-1 rounded">character [smiling, frowning, surprised]</code> → generates 3 images</div>
            <div><strong>Wild Cards:</strong> <code className="bg-slate-900 px-1 rounded">character in _locations_ with dramatic lighting</code> → generates multiple variations</div>
            {!disablePipeline ? (
              <>
                <div><strong>🔥 Pipeline:</strong> <code className="bg-slate-900 px-1 rounded">enhance lighting | remove background | add office setting</code> → 3 sequential steps</div>
                <div className="mt-2 p-2 bg-slate-900 rounded">
                  <div className="font-medium text-blue-400 mb-1">Pipeline with Variations:</div>
                  <code className="text-xs text-slate-200">isolate character | show character [smiling, dancing]</code>
                  <div className="text-slate-400 mt-1">
                    • Step 1: isolate character (1 image)<br/>
                    • Step 2: show character smiling + dancing (2 images)<br/>
                    • Result: 3 total images (step 1 + both variations of step 2)
                  </div>
                </div>
                <div className="text-slate-500 text-xs mt-2">
                  ℹ️ Each variation is generated separately. The last image from each step feeds into the next.
                </div>
              </>
            ) : (
              <div className="text-yellow-400 text-xs mt-1">
                ⚠️ Pipeline syntax (|) is disabled when using images from other sources. Use brackets and wildcards for variations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">
            Prompt
          </label>
          {pipelineResult && (
            <div className="flex items-center gap-2">
              {pipelineResult.isPipeline ? (
                <Badge variant="outline" className="text-purple-400 border-purple-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {previewText}
                </Badge>
              ) : pipelineResult.steps[0]?.hasVariations && (
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {pipelineResult.estimatedImages} variations
                </Badge>
              )}
            </div>
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
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium">{syntaxValidation.error}</div>
              {syntaxValidation.suggestion && (
                <div className="text-xs text-red-400 mt-1">{syntaxValidation.suggestion}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Preview */}
      {pipelineResult?.isPipeline && pipelineResult.isValid && (
        <Card className="bg-slate-900/50 border-purple-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium text-sm">Pipeline Steps</span>
              <Badge variant="outline" className="text-purple-300 border-purple-400">
                {pipelineResult.totalSteps} steps → {costCalculation.totalCost} credits
              </Badge>
            </div>

            <div className="space-y-2">
              {pipelineResult.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-medium">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 text-slate-300">
                    {step.prompt}
                    {step.hasVariations && (
                      <span className="text-slate-500 text-xs ml-2">
                        ({step.expandedPrompts?.length} variations - using first)
                      </span>
                    )}
                  </div>
                  {index < pipelineResult.steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              ))}
            </div>

            {/* Warnings */}
            {pipelineResult.warnings.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                {pipelineResult.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2 text-yellow-300 text-xs">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Cost Breakdown */}
            {costCalculation.breakdown.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Credit Usage:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {costCalculation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-slate-300">
                      <span>Step {item.step}</span>
                      <span>{item.cost} credits</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium text-white border-t border-slate-700 pt-1 col-span-2">
                    <span>Total</span>
                    <span>{costCalculation.totalCost} credits</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Single Generation Preview (non-pipeline) */}
      {pipelineResult && !pipelineResult.isPipeline && pipelineResult.steps[0]?.hasVariations && (
        <Card className="bg-slate-900/50 border-blue-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Variations Detected</span>
              <Badge variant="outline" className="text-blue-300 border-blue-400">
                {pipelineResult.estimatedImages} images
              </Badge>
            </div>

            <div className="text-xs text-slate-300">
              {pipelineResult.estimatedImages} variations will be generated: {pipelineResult.estimatedImages * creditsPerImage} credits total
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {pipelineResult?.errors && pipelineResult.errors.length > 0 && (
        <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
          {pipelineResult.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}