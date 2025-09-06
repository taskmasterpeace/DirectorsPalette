/**
 * Migration Dialog Component
 * Helps users migrate their data from IndexedDB to Supabase
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Database, Cloud, ArrowRight } from 'lucide-react'
import { useMigration } from '@/hooks/useDatabase'

interface MigrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MigrationDialog({ open, onOpenChange }: MigrationDialogProps) {
  const { migrationStatus, loading, error, checkMigrationNeeded, runMigration } = useMigration()
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  useEffect(() => {
    if (open) {
      checkMigrationNeeded()
    }
  }, [open, checkMigrationNeeded])

  const handleMigration = async () => {
    setMigrating(true)
    setMigrationResult(null)
    
    try {
      const result = await runMigration()
      setMigrationResult(result)
    } catch (error) {
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
        projectsMigrated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setMigrating(false)
    }
  }

  const renderMigrationStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking migration status...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )
    }

    if (!migrationStatus) {
      return null
    }

    return (
      <div className="space-y-6">
        {/* Migration Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-slate-600" />
              <div>
                <p className="font-semibold text-slate-900">IndexedDB</p>
                <p className="text-sm text-slate-600">{migrationStatus.indexedDBProjects} projects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Supabase</p>
                <p className="text-sm text-blue-600">{migrationStatus.supabaseProjects} projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Migration Needed Check */}
        {migrationStatus.needed ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You have {migrationStatus.indexedDBProjects} projects in local storage that need to be migrated to the cloud.
              This will ensure your data is backed up and synced across devices.
            </AlertDescription>
          </Alert>
        ) : migrationStatus.indexedDBProjects === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              No migration needed. Your data is already synced to the cloud.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your data is already synced. You have local projects that may be duplicates.
            </AlertDescription>
          </Alert>
        )}

        {/* Migration Process Visualization */}
        {migrationStatus.needed && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Migration Process</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="text-sm">Local Storage</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Cloud Database</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Your projects will be copied to the cloud. Local data will be preserved until you choose to clean it up.
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderMigrationProgress = () => {
    if (!migrating) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="font-medium">Migrating your projects...</span>
        </div>
        <Progress value={50} className="w-full" />
        <p className="text-sm text-gray-600">
          Please don't close this dialog while migration is in progress.
        </p>
      </div>
    )
  }

  const renderMigrationResult = () => {
    if (!migrationResult) return null

    return (
      <div className="space-y-4">
        {migrationResult.success ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Migration completed successfully!</strong>
              <br />
              {migrationResult.projectsMigrated} projects have been migrated to the cloud.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Migration completed with errors:</strong>
              <br />
              {migrationResult.message}
              {migrationResult.errors?.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {migrationResult.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {migrationResult.success && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your projects are now safely backed up in the cloud</li>
              <li>• Data will sync across all your devices</li>
              <li>• You can optionally clean up local storage to free up space</li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            Data Migration to Cloud
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status or Progress */}
          {migrating ? renderMigrationProgress() : renderMigrationStatus()}
          
          {/* Migration Result */}
          {renderMigrationResult()}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!migrating && !migrationResult && migrationStatus?.needed && (
              <Button 
                onClick={handleMigration}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Start Migration
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={migrating}
            >
              {migrationResult ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}