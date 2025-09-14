'use client'

import { TemplateBanner } from '@/components/shared/TemplateBanner'
import { StoryInputConnected } from '@/components/story/StoryInputConnected'
import type { StoryContainerHandlers } from './StoryContainerTypes'

interface StoryInputSectionProps {
  onExtractReferences: StoryContainerHandlers['handleExtractReferences']
  onClearStory: StoryContainerHandlers['handleClearStory']
}

export function StoryInputSection({
  onExtractReferences,
  onClearStory
}: StoryInputSectionProps) {
  return (
    <>
      {/* Template Banner */}
      <TemplateBanner
        mode="story"
        templates={[]} // TODO: Add actual templates
        selectedTemplate={null}
        onTemplateSelect={() => {}} // TODO: Implement template selection
        onCreateNew={() => {}} // TODO: Implement template creation
      />
      
      {/* Story Input Section - Now connected directly to stores */}
      <StoryInputConnected
        onExtractReferences={onExtractReferences}
        onClear={onClearStory}
      />
    </>
  )
}