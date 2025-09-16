// Export the refactored version as the main Gen4 component
export { Gen4Refactored as default, Gen4Refactored as Gen4 } from './Gen4Refactored'

// Export individual components for reuse
export { ReferenceImagesSection } from './ReferenceImagesSection'
export { PromptSection } from './PromptSection'
export { GenerationSettings } from './GenerationSettings'
export { GenerationGallery } from './GenerationGallery'
export { useGen4Logic } from './useGen4Logic'

// Export types
export * from './types'