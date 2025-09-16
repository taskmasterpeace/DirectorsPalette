// Export the refactored version as the main ShotListManager
export { ShotListManagerRefactored as ShotListManager } from './ShotListManagerRefactored'

// Export individual components for reuse
export { ShotCard } from './ShotCard'
export { ShotListFilters } from './ShotListFilters'
export { ShotEditDialog } from './ShotEditDialog'
export { ExportDialog } from './ExportDialog'
export { useShotListLogic } from './useShotListLogic'
export * from './types'