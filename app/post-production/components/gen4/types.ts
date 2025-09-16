// Gen4 Types
export interface Gen4Settings {
  model: string
  resolution: string
  duration?: number
  fps?: number
  seed?: number
  motionIntensity?: number
  aspectRatio?: string
}

export interface Generation {
  id: string
  prompt: string
  outputUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  tags?: string[]
  timestamp: number
  model: string
  settings: Gen4Settings
}

export interface ImageReference {
  id: string
  url: string
  file?: File
  source?: 'upload' | 'library' | 'generated'
  libraryId?: string
}

export interface Gen4Props {
  gen4Generations: Generation[]
  gen4Processing: boolean
  openFullscreenImage: (url: string) => void
  downloadFile: (url: string, filename: string) => void
  copyToClipboard: (text: string) => void
  removeImage: (id: string) => void
  removeGeneration: (id: string) => void
  gen4FileInputRef: React.RefObject<HTMLInputElement>
  handleFileUpload: (files: FileList | null, isGen4?: boolean) => void
  handleDrop: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  gen4ReferenceImages: ImageReference[]
  gen4Prompt: string
  setGen4Prompt: (prompt: string) => void
  generateGen4: () => void
  activeTab: string
  removeTagFromGen4Image: (genId: string, tag: string) => void
  addTagToGen4Image: (genId: string) => void
  gen4Settings: Gen4Settings
  setGen4Settings: (settings: Gen4Settings) => void
  replaceReferenceWithGen: (genId: string, refIndex: number) => void
  sendGenerationToWorkspace: (generation: Generation) => void
  saveToLibrary: (generation: Generation) => void
}