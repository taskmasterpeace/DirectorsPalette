export interface StoryContainerHandlers {
  handleExtractReferences: () => Promise<void>
  handleShotSelectionComplete: (method: 'auto' | 'manual', selections?: any[]) => void
  handleShotSelectionNext: () => void
  handleGenerateWithReferences: (configuredRefs: any) => Promise<void>
  handleGenerateAdditionalShots: () => void
  handleClearStory: () => void
}

export interface StoryContainerState {
  isLoading: boolean
  generationStage: string
  stageProgress: { current: number; total: number }
  stageMessage: string
  elapsedTime: number
}

export interface StoryContainerProps {
  // This component takes no external props - uses internal stores
}