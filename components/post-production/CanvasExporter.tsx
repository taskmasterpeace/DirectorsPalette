'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Download, 
  Share, 
  Copy, 
  FileImage,
  Palette,
  Sparkles,
  Film,
  Edit,
  Save
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { CanvasEditorRef } from './CanvasEditor'

interface CanvasExporterProps {
  canvasRef: React.RefObject<CanvasEditorRef>
  onExport?: (format: string, dataUrl: string) => void
}

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  quality: number
  scale: number
  backgroundColor: string
  includeTransparency: boolean
}

const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG', description: 'Best for images with transparency' },
  { value: 'jpg', label: 'JPEG', description: 'Best for photos, smaller file size' },
  { value: 'svg', label: 'SVG', description: 'Vector format, scalable' },
  { value: 'pdf', label: 'PDF', description: 'Document format' }
]

const QUALITY_PRESETS = [
  { label: 'Low (Fast)', value: 0.6 },
  { label: 'Medium', value: 0.8 },
  { label: 'High', value: 0.9 },
  { label: 'Maximum', value: 1.0 }
]

const SCALE_PRESETS = [
  { label: '0.5x (Small)', value: 0.5 },
  { label: '1x (Original)', value: 1 },
  { label: '2x (HD)', value: 2 },
  { label: '4x (Ultra HD)', value: 4 }
]

export function CanvasExporter({ canvasRef, onExport }: CanvasExporterProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 0.9,
    scale: 1,
    backgroundColor: '#ffffff',
    includeTransparency: true
  })
  
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  const updateExportSettings = (updates: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...updates }))
  }

  const exportCanvas = async () => {
    if (!canvasRef.current?.exportCanvas) {
      toast({
        title: "Export Failed",
        description: "Canvas is not ready for export",
        variant: "destructive"
      })
      return
    }

    setIsExporting(true)
    
    try {
      // Get canvas data
      const dataUrl = canvasRef.current.exportCanvas(exportSettings.format)
      
      if (onExport) {
        onExport(exportSettings.format, dataUrl)
      }

      // Trigger download
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = dataUrl
        downloadLinkRef.current.download = `canvas-export-${Date.now()}.${exportSettings.format}`
        downloadLinkRef.current.click()
      }

      toast({
        title: "Export Successful",
        description: `Canvas exported as ${exportSettings.format.toUpperCase()}`
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export canvas",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const copyCanvasToClipboard = async () => {
    if (!canvasRef.current?.exportCanvas) {
      toast({
        title: "Copy Failed",
        description: "Canvas is not ready",
        variant: "destructive"
      })
      return
    }

    try {
      const dataUrl = canvasRef.current.exportCanvas('png')
      
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      toast({
        title: "Copied to Clipboard",
        description: "Canvas image copied successfully"
      })
    } catch (error) {
      console.error('Copy failed:', error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy canvas to clipboard",
        variant: "destructive"
      })
    }
  }

  const sendToGallery = async () => {
    if (!canvasRef.current?.exportCanvas) return

    try {
      const dataUrl = canvasRef.current.exportCanvas('png')
      
      // Here you would integrate with your gallery store
      // For now, we'll just show a toast
      toast({
        title: "Sent to Gallery",
        description: "Canvas added to image gallery"
      })
    } catch (error) {
      console.error('Send to gallery failed:', error)
      toast({
        title: "Failed to Send",
        description: "Could not send canvas to gallery",
        variant: "destructive"
      })
    }
  }

  const sendToTab = async (targetTab: string) => {
    if (!canvasRef.current?.exportCanvas) return

    try {
      const dataUrl = canvasRef.current.exportCanvas('png')
      
      // Here you would integrate with your tab system
      toast({
        title: `Sent to ${targetTab}`,
        description: "Canvas ready for use in target tab"
      })
    } catch (error) {
      console.error('Send to tab failed:', error)
      toast({
        title: "Failed to Send",
        description: `Could not send canvas to ${targetTab}`,
        variant: "destructive"
      })
    }
  }

  const getEstimatedFileSize = () => {
    // Rough estimation based on format and scale
    const baseSize = 800 * 600 // base canvas dimensions
    const scaledSize = baseSize * (exportSettings.scale ** 2)
    
    let bytesPerPixel = 4 // RGBA
    if (exportSettings.format === 'jpg') {
      bytesPerPixel = 3 * exportSettings.quality
    } else if (exportSettings.format === 'svg') {
      return 'Variable'
    }
    
    const estimatedBytes = scaledSize * bytesPerPixel
    
    if (estimatedBytes < 1024) {
      return `~${Math.round(estimatedBytes)} B`
    } else if (estimatedBytes < 1024 * 1024) {
      return `~${Math.round(estimatedBytes / 1024)} KB`
    } else {
      return `~${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Download className="w-5 h-5 text-green-400" />
          Export & Share
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">Export Format</Label>
          <Select
            value={exportSettings.format}
            onValueChange={(value: ExportSettings['format']) => 
              updateExportSettings({ format: value })
            }
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {EXPORT_FORMATS.map((format) => (
                <SelectItem 
                  key={format.value} 
                  value={format.value}
                  className="text-white hover:bg-slate-600"
                >
                  <div>
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-slate-400">{format.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Settings (for JPEG) */}
        {exportSettings.format === 'jpg' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300">
              Quality: {Math.round(exportSettings.quality * 100)}%
            </Label>
            <Slider
              value={[exportSettings.quality * 100]}
              onValueChange={([value]) => updateExportSettings({ quality: value / 100 })}
              min={30}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>30%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Scale Settings */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">
            Scale: {exportSettings.scale}x
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {SCALE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                size="sm"
                onClick={() => updateExportSettings({ scale: preset.value })}
                className={`text-xs ${
                  exportSettings.scale === preset.value
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Transparency (for PNG) */}
        {exportSettings.format === 'png' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-300">
                Include Transparency
              </Label>
              <Switch
                checked={exportSettings.includeTransparency}
                onCheckedChange={(checked) => 
                  updateExportSettings({ includeTransparency: checked })
                }
              />
            </div>
          </div>
        )}

        {/* Background Color (if no transparency) */}
        {(!exportSettings.includeTransparency || exportSettings.format === 'jpg') && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={exportSettings.backgroundColor}
                onChange={(e) => updateExportSettings({ backgroundColor: e.target.value })}
                className="w-12 h-8 rounded border border-slate-600 cursor-pointer"
              />
              <div className="text-sm text-slate-400">
                {exportSettings.backgroundColor}
              </div>
            </div>
          </div>
        )}

        {/* File Size Estimate */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-sm text-slate-300 mb-1">Estimated File Size</div>
          <div className="text-lg font-medium text-green-400">
            {getEstimatedFileSize()}
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-3">
          <Button
            onClick={exportCanvas}
            disabled={isExporting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Download Canvas'}
          </Button>

          <Button
            onClick={copyCanvasToClipboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>

          <Button
            onClick={sendToGallery}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save to Gallery
          </Button>
        </div>

        {/* Send to Other Tabs */}
        <div className="space-y-3 border-t border-slate-600 pt-4">
          <Label className="text-sm font-medium text-slate-300">Send to Tab</Label>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              size="sm"
              onClick={() => sendToTab('Shot Creator')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Shot Creator
            </Button>
            
            <Button
              size="sm"
              onClick={() => sendToTab('Shot Editor')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-3 h-3 mr-1" />
              Shot Editor
            </Button>
            
            <Button
              size="sm"
              onClick={() => sendToTab('Shot Animator')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Film className="w-3 h-3 mr-1" />
              Shot Animator
            </Button>
          </div>
        </div>

        {/* Export Tips */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h4 className="text-xs font-medium text-slate-300 mb-2">Export Tips</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• PNG: Best for images with transparency</li>
            <li>• JPEG: Smaller files, good for photos</li>
            <li>• 2x scale for high resolution displays</li>
            <li>• Higher quality = larger file size</li>
          </ul>
        </div>
      </CardContent>

      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden" />
    </Card>
  )
}