'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Copy, 
  FileText, 
  Settings, 
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ExportTemplateManager } from './ExportTemplateManager'
import { 
  processShotsForExport, 
  copyToClipboard, 
  downloadAsFile, 
  getSuggestedFilename,
  type ExportConfig, 
  type ShotData 
} from '@/lib/export-processor'

interface BulkExportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  shots: ShotData[]
  projectType: 'story' | 'music-video'
  artistName?: string
  artistDescription?: string
  director?: string
  projectTitle?: string
}

const DEFAULT_CONFIG: ExportConfig = {
  prefix: '',
  suffix: '',
  useArtistDescriptions: false,
  format: 'text',
  separator: '\n',
  includeMetadata: false
}

const COMMON_PREFIXES = [
  'Camera: Wide shot, ',
  'Scene setup: ',
  'Shot description: ',
  'Visual: ',
  ''
]

const COMMON_SUFFIXES = [
  ', cinematic lighting, 4K resolution',
  ', professional photography, detailed',
  ', dramatic lighting, film grain',
  ', golden hour, cinematic style',
  ''
]

export function BulkExportDialog({
  isOpen,
  onOpenChange,
  shots,
  projectType,
  artistName,
  artistDescription,
  director,
  projectTitle
}: BulkExportDialogProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<ExportConfig>(DEFAULT_CONFIG)
  const [previewShots, setPreviewShots] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastExportResult, setLastExportResult] = useState<{
    success: boolean
    message: string
    totalShots: number
    processingTime: number
  } | null>(null)

  // Update preview when config changes
  useEffect(() => {
    if (shots.length === 0) return

    const previewCount = Math.min(3, shots.length)
    const previewShotData = shots.slice(0, previewCount)
    
    try {
      const result = processShotsForExport(
        previewShotData,
        config,
        {
          artistName: config.useArtistDescriptions ? undefined : artistName,
          artistDescription: config.useArtistDescriptions ? artistDescription : undefined,
          director
        }
      )
      
      // Parse result based on format
      if (config.format === 'json') {
        const parsed = JSON.parse(result.formattedText)
        setPreviewShots(parsed.shots.map((shot: any) => shot.description))
      } else if (config.format === 'csv') {
        const lines = result.formattedText.split('\n').slice(1) // Skip header
        setPreviewShots(lines.map(line => {
          const columns = line.split('","')
          return columns[1]?.replace(/"/g, '') || line
        }))
      } else {
        setPreviewShots(result.formattedText.split(config.separator))
      }
    } catch (error) {
      console.error('Preview generation failed:', error)
      setPreviewShots(['Error generating preview...'])
    }
  }, [config, shots, artistName, artistDescription, director])

  const handleExport = async (action: 'copy' | 'download') => {
    if (shots.length === 0) {
      toast({
        title: "No Shots to Export",
        description: "Please generate some shots first.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      const result = processShotsForExport(
        shots,
        config,
        {
          artistName: config.useArtistDescriptions ? undefined : artistName,
          artistDescription: config.useArtistDescriptions ? artistDescription : undefined,
          director
        }
      )

      if (action === 'copy') {
        const success = await copyToClipboard(result.formattedText)
        if (success) {
          setLastExportResult({
            success: true,
            message: `Copied ${result.totalShots} shots to clipboard`,
            totalShots: result.totalShots,
            processingTime: result.processingTime
          })
          
          toast({
            title: "Export Successful",
            description: `Copied ${result.totalShots} shots to clipboard`
          })
        } else {
          throw new Error('Failed to copy to clipboard')
        }
      } else {
        const filename = getSuggestedFilename(config, projectType, artistName)
        const mimeType = config.format === 'json' ? 'application/json' :
                          config.format === 'csv' ? 'text/csv' : 'text/plain'
        
        downloadAsFile(result.formattedText, filename, mimeType)
        
        setLastExportResult({
          success: true,
          message: `Downloaded ${result.totalShots} shots as ${filename}`,
          totalShots: result.totalShots,
          processingTime: result.processingTime
        })
        
        toast({
          title: "Export Successful",
          description: `Downloaded ${result.totalShots} shots as ${filename}`
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      setLastExportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
        totalShots: shots.length,
        processingTime: 0
      })
      
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'An error occurred during export',
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const updateConfig = (updates: Partial<ExportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="truncate">Bulk Export Shots</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Export all {shots.length} shots with custom formatting.
            {projectTitle && (
              <span className="block truncate mt-1">Project: {projectTitle}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="w-4 h-4" />
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prefix */}
                <div className="space-y-2">
                  <Label>Prefix (added to beginning of each shot)</Label>
                  <Input
                    placeholder="e.g., Camera: Wide shot, "
                    value={config.prefix}
                    onChange={(e) => updateConfig({ prefix: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-1">
                    {COMMON_PREFIXES.map((prefix, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => updateConfig({ prefix })}
                      >
                        {prefix || 'None'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Suffix */}
                <div className="space-y-2">
                  <Label>Suffix (added to end of each shot)</Label>
                  <Input
                    placeholder="e.g., , cinematic lighting, 4K resolution"
                    value={config.suffix}
                    onChange={(e) => updateConfig({ suffix: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SUFFIXES.map((suffix, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => updateConfig({ suffix })}
                      >
                        {suffix || 'None'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Export Templates */}
                <div className="space-y-2">
                  <Label>Export Templates</Label>
                  <ExportTemplateManager
                    currentPrefix={config.prefix}
                    currentSuffix={config.suffix}
                    onApplyTemplate={(prefix, suffix) => {
                      updateConfig({ prefix, suffix })
                    }}
                    onSaveTemplate={(name, category) => {
                      // This will be handled by the ExportTemplateManager itself
                    }}
                  />
                </div>

                {/* Artist Variable Handling */}
                {artistName && (
                  <div className="space-y-2">
                    <Label>Artist Variable (@artist)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="use-artist-name"
                          checked={!config.useArtistDescriptions}
                          onCheckedChange={(checked) => updateConfig({ useArtistDescriptions: !checked })}
                        />
                        <Label htmlFor="use-artist-name" className="text-sm">
                          Use artist name: "{artistName}"
                        </Label>
                      </div>
                      {artistDescription && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="use-artist-description"
                            checked={config.useArtistDescriptions}
                            onCheckedChange={(checked) => updateConfig({ useArtistDescriptions: !!checked })}
                          />
                          <Label htmlFor="use-artist-description" className="text-sm">
                            Use full description
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Format Options */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={config.format} onValueChange={(value: any) => updateConfig({ format: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="numbered">Numbered List</SelectItem>
                      <SelectItem value="json">JSON Format</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Separator Options for Text Formats */}
                {(config.format === 'text' || config.format === 'numbered') && (
                  <div className="space-y-2">
                    <Label>Line Separator</Label>
                    <Select value={config.separator} onValueChange={(value: any) => updateConfig({ separator: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="\n">Single Line Break</SelectItem>
                        <SelectItem value="\n\n">Double Line Break</SelectItem>
                        <SelectItem value=", ">Comma Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Include Metadata */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={config.includeMetadata}
                    onCheckedChange={(checked) => updateConfig({ includeMetadata: !!checked })}
                  />
                  <Label htmlFor="include-metadata" className="text-sm">
                    Include metadata (JSON/CSV only)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-4 h-4" />
                  Preview (First {Math.min(3, shots.length)} shots)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {previewShots.map((shot, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded border-l-2 border-primary">
                        <div className="font-mono text-xs text-muted-foreground mb-1">
                          Shot {index + 1}:
                        </div>
                        <div className="line-clamp-3">{shot}</div>
                      </div>
                    ))}
                    {shots.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        ... and {shots.length - 3} more shots
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Export Status */}
            {lastExportResult && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {lastExportResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {lastExportResult.message}
                      </div>
                      {lastExportResult.success && (
                        <div className="text-xs text-muted-foreground">
                          Processed in {lastExportResult.processingTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {shots.length} shots ready for export
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('copy')}
              disabled={isProcessing || shots.length === 0}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Copy to Clipboard</span>
            </Button>
            <Button
              onClick={() => handleExport('download')}
              disabled={isProcessing || shots.length === 0}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{isProcessing ? 'Processing...' : 'Download File'}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}