'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wand2, Sparkles } from "lucide-react"

interface PromptSectionProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  onGenerate: () => void
  isProcessing: boolean
  onShowTemplates?: () => void
}

export function PromptSection({
  prompt,
  onPromptChange,
  onGenerate,
  isProcessing,
  onShowTemplates
}: PromptSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Prompt</CardTitle>
          {onShowTemplates && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTemplates}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Templates
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt">Image Description</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="min-h-[100px] mt-2"
          />
        </div>

        <Button
          onClick={onGenerate}
          disabled={isProcessing || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isProcessing ? 'Generating...' : 'Generate Image'}
        </Button>
      </CardContent>
    </Card>
  )
}