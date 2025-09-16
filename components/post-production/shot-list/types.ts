// Shot List Manager Types
export interface ShotListManagerProps {
  className?: string
}

export interface ShotGroup {
  groupName: string
  shots: any[] // Replace with proper PostProductionShot type
}

export interface FilterState {
  searchTerm: string
  filterStatus: 'all' | 'completed' | 'pending' | 'priority'
  groupBy: 'none' | 'chapter' | 'section'
  entityFilter: 'all' | 'characters' | 'places' | 'props'
}

export interface EditDialogState {
  isOpen: boolean
  shot: any | null // Replace with proper PostProductionShot type
  editedDescription: string
}

export interface ExportDialogState {
  isOpen: boolean
  format: 'pdf' | 'csv' | 'json' | 'txt'
}