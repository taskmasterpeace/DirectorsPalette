'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft,
  Download, 
  Copy, 
  FileText, 
  Settings, 
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ExportTemplateManager } from '@/components/shared/ExportTemplateManager'
import { 
  processShotsForExport, 
  copyToClipboard, 
  downloadAsFile, 
  getSuggestedFilename,
  type ExportConfig, 
  type ShotData 
} from '@/lib/export-processor'

const DEFAULT_CONFIG: ExportConfig = {
  prefix: '',
  suffix: '',
  useArtistDescriptions: false,
  format: 'text',
  separator: '\n',
  includeMetadata: false
}

export default function ExportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [config, setConfig] = useState<ExportConfig>(DEFAULT_CONFIG)
  const [shots, setShots] = useState<ShotData[]>([])
  const [projectData, setProjectData] = useState<{
    type: 'story' | 'music-video'
    artistName?: string
    artistDescription?: string
    director?: string
    projectTitle?: string
  }>({
    type: 'story'
  })
  const [previewShots, setPreviewShots] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [exportHistory, setExportHistory] = useState<{
    timestamp: Date
    config: ExportConfig
    shotCount: number
    format: string
  }[]>([])

  // Load data from localStorage or URL params
  useEffect(() => {
    // Check for data passed via URL params or localStorage
    const storedShots = localStorage.getItem('bulk-export-shots')
    const storedProjectData = localStorage.getItem('bulk-export-project-data')
    
    if (storedShots) {
      setShots(JSON.parse(storedShots))
      localStorage.removeItem('bulk-export-shots') // Clean up
    }
    
    if (storedProjectData) {
      setProjectData(JSON.parse(storedProjectData))
      localStorage.removeItem('bulk-export-project-data') // Clean up
    }
    
    // Load export history
    const history = localStorage.getItem('export-history')
    if (history) {
      setExportHistory(JSON.parse(history))
    }
  }, [])

  // Update preview when config changes
  useEffect(() => {
    if (shots.length === 0) return

    const previewCount = Math.min(5, shots.length) // Show more shots on full page
    const previewShotData = shots.slice(0, previewCount)
    
    try {
      const result = processShotsForExport(
        previewShotData,
        config,
        {
          artistName: config.useArtistDescriptions ? undefined : projectData.artistName,
          artistDescription: config.useArtistDescriptions ? projectData.artistDescription : undefined,
          director: projectData.director
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
  }, [config, shots, projectData])

  const handleExport = async (action: 'copy' | 'download') => {
    if (shots.length === 0) {
      toast({
        title: "No Shots to Export",
        description: "Please return to generate shots first.",
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
          artistName: config.useArtistDescriptions ? undefined : projectData.artistName,
          artistDescription: config.useArtistDescriptions ? projectData.artistDescription : undefined,
          director: projectData.director
        }
      )

      if (action === 'copy') {
        const success = await copyToClipboard(result.formattedText)
        if (success) {
          toast({
            title: "Export Successful",
            description: `Copied ${result.totalShots} shots to clipboard`
          })
        } else {
          throw new Error('Failed to copy to clipboard')
        }
      } else {
        const filename = getSuggestedFilename(config, projectData.type, projectData.artistName)
        const mimeType = config.format === 'json' ? 'application/json' :
                          config.format === 'csv' ? 'text/csv' : 'text/plain'
        
        downloadAsFile(result.formattedText, filename, mimeType)
        
        toast({
          title: "Export Successful",
          description: `Downloaded ${result.totalShots} shots as ${filename}`
        })
      }

      // Add to export history
      const historyEntry = {
        timestamp: new Date(),
        config: { ...config },
        shotCount: result.totalShots,
        format: config.format
      }
      const newHistory = [historyEntry, ...exportHistory.slice(0, 9)] // Keep last 10
      setExportHistory(newHistory)
      localStorage.setItem('export-history', JSON.stringify(newHistory))

    } catch (error) {
      console.error('Export failed:', error)
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

  if (shots.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">No Shots to Export</h1>
          <p className="text-muted-foreground mb-6">
            Generate shots in Story Mode or Music Video Mode first, then use the "Export All Shots" button.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main App
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Export Center</h1>
                <p className="text-sm text-muted-foreground">
                  {shots.length} shots from {projectData.projectTitle || `${projectData.type} project`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {projectData.type === 'story' ? 'Story Mode' : 'Music Video Mode'}
              </Badge>
              {projectData.artistName && (
                <Badge variant="secondary">
                  {projectData.artistName}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Configuration Panel */}
          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prefix */}
                <div className="space-y-2">
                  <Label>Prefix (added to beginning)</Label>
                  <Textarea
                    placeholder="e.g., Camera: Wide shot, "
                    value={config.prefix}
                    onChange={(e) => updateConfig({ prefix: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Suffix */}
                <div className="space-y-2">
                  <Label>Suffix (added to end)</Label>
                  <Textarea
                    placeholder="e.g., , cinematic lighting, 4K resolution"
                    value={config.suffix}
                    onChange={(e) => updateConfig({ suffix: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Export Templates */}
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <ExportTemplateManager
                    currentPrefix={config.prefix}
                    currentSuffix={config.suffix}
                    onApplyTemplate={(prefix, suffix) => {
                      updateConfig({ prefix, suffix })
                    }}
                  />
                </div>

                {/* Artist Variable Handling */}
                {projectData.artistName && (
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
                          Use artist name: "{projectData.artistName}"
                        </Label>
                      </div>
                      {projectData.artistDescription && (
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

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => handleExport('copy')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Copy to Clipboard'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('download')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export History */}
            {exportHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {exportHistory.map((entry, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded">
                          <div className="flex justify-between">
                            <span>{entry.shotCount} shots</span>
                            <span className="text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {entry.format.toUpperCase()} format
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview and Results Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {previewShots.map((shot, index) => (
                      <div key={index} className="p-3 bg-muted rounded border-l-4 border-primary">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-xs text-muted-foreground mb-1">
                              Shot {index + 1}:
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{shot}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(shot)}
                            className="ml-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {shots.length > 5 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Sparkles className="w-5 h-5 mx-auto mb-2" />
                        ... and {shots.length - 5} more shots will be exported
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Export Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{shots.length}</div>
                    <div className="text-sm text-muted-foreground">Total Shots</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {shots.filter(s => s.chapter).length + shots.filter(s => s.section).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {projectData.type === 'story' ? 'Chapters' : 'Sections'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{config.format.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">Export Format</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Shots List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    All Shots ({shots.length})
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {projectData.type === 'story' ? 'Story Project' : 'Music Video Project'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {shots.map((shot, index) => (
                      <div key={shot.id} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-1">
                              Shot {index + 1}
                              {(shot.chapter || shot.section) && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {shot.chapter || shot.section}
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground line-clamp-2">
                              {shot.description}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(shot.description)}
                            className="ml-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}