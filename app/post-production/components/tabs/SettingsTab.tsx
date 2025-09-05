'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings,
  Video,
  ImageIcon,
  Sparkles,
  DollarSign,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface SettingsTabProps {
  settings: any
  setSettings: (settings: any) => void
}

export function SettingsTab({ settings, setSettings }: SettingsTabProps) {
  const { toast } = useToast()
  const [openaiKey, setOpenaiKey] = useState('')
  const [replicateKey, setReplicateKey] = useState('')
  const [openrouterKey, setOpenrouterKey] = useState('')
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showReplicateKey, setShowReplicateKey] = useState(false)
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false)
  const [apiStatus, setApiStatus] = useState({ openai: false, replicate: false, openrouter: false })

  // Load saved keys on mount
  useEffect(() => {
    const savedOpenai = localStorage.getItem('directors-palette-openai-key')
    const savedReplicate = localStorage.getItem('directors-palette-replicate-key')
    const savedOpenrouter = localStorage.getItem('directors-palette-openrouter-key')
    
    if (savedOpenai) setOpenaiKey(savedOpenai)
    if (savedReplicate) setReplicateKey(savedReplicate)
    if (savedOpenrouter) setOpenrouterKey(savedOpenrouter)
    
    // Check API status
    setApiStatus({
      openai: !!(savedOpenai || process.env.OPENAI_API_KEY),
      replicate: !!(savedReplicate || process.env.REPLICATE_API_TOKEN),
      openrouter: !!(savedOpenrouter || process.env.OPENROUTER_API_KEY)
    })
  }, [])

  const handleSaveApiKey = (type: 'openai' | 'replicate' | 'openrouter', key: string) => {
    if (!key.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key",
        variant: "destructive"
      })
      return
    }

    const storageKey = `directors-palette-${type}-key`
    localStorage.setItem(storageKey, key.trim())
    
    setApiStatus(prev => ({ ...prev, [type]: true }))
    
    toast({
      title: "API Key Saved", 
      description: `${type === 'openai' ? 'OpenAI' : type === 'replicate' ? 'Replicate' : 'OpenRouter'} API key saved locally`
    })
  }

  const handleRemoveApiKey = (type: 'openai' | 'replicate' | 'openrouter') => {
    const storageKey = `directors-palette-${type}-key`
    localStorage.removeItem(storageKey)
    
    if (type === 'openai') {
      setOpenaiKey('')
    } else if (type === 'replicate') {
      setReplicateKey('')
    } else {
      setOpenrouterKey('')
    }
    
    setApiStatus(prev => ({ ...prev, [type]: false }))
    
    toast({
      title: "API Key Removed",
      description: `${type === 'openai' ? 'OpenAI' : type === 'replicate' ? 'Replicate' : 'OpenRouter'} API key removed`
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          ⚙️ Post Production Settings
        </h2>
        <p className="text-slate-400">
          Configure API keys, video generation, and system preferences
        </p>
      </div>

      {/* API Configuration */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-400" />
            🔑 API Configuration
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Configure your API keys for AI generation and image processing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white flex items-center gap-2">
                OpenAI API Key
                {apiStatus.openai ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </Label>
              <span className="text-xs text-slate-400">
                Required for story/music video/commercial generation
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSaveApiKey('openai', openaiKey)}
                disabled={!openaiKey.trim()}
                className="min-h-[44px]"
              >
                Save
              </Button>
              {apiStatus.openai && (
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveApiKey('openai')}
                  className="min-h-[44px]"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Replicate API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white flex items-center gap-2">
                Replicate API Token
                {apiStatus.replicate ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </Label>
              <span className="text-xs text-slate-400">
                Required for image generation and editing
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showReplicateKey ? "text" : "password"}
                  value={replicateKey}
                  onChange={(e) => setReplicateKey(e.target.value)}
                  placeholder="r8_..."
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowReplicateKey(!showReplicateKey)}
                >
                  {showReplicateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSaveApiKey('replicate', replicateKey)}
                disabled={!replicateKey.trim()}
                className="min-h-[44px]"
              >
                Save
              </Button>
              {apiStatus.replicate && (
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveApiKey('replicate')}
                  className="min-h-[44px]"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* OpenRouter API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white flex items-center gap-2">
                OpenRouter API Key
                {apiStatus.openrouter ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                )}
              </Label>
              <span className="text-xs text-slate-400">
                Optional - Advanced model selection and cost optimization
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showOpenrouterKey ? "text" : "password"}
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="bg-slate-700 border-slate-600 text-white pr-10 min-h-[44px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                >
                  {showOpenrouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSaveApiKey('openrouter', openrouterKey)}
                disabled={!openrouterKey.trim()}
                className="min-h-[44px] bg-orange-600 hover:bg-orange-700"
              >
                Save
              </Button>
              {apiStatus.openrouter && (
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveApiKey('openrouter')}
                  className="min-h-[44px]"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* API Status */}
          <div className="bg-slate-800/50 p-4 rounded border border-slate-600">
            <h4 className="text-white font-medium mb-3">API Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Story/Music/Commercial Generation</span>
                {apiStatus.openai ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Ready
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Need OpenAI Key
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Image Generation & Editing</span>
                {apiStatus.replicate ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Ready
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Need Replicate Token
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Advanced Model Selection (OpenRouter)</span>
                {apiStatus.openrouter ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Optional
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seedance Settings */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5" />
              🎥 Seedance Video Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Model Quality</Label>
              <Select
                value={settings?.seedance?.model || 'lite'}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    seedance: { ...prev.seedance, model: value },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lite">Lite (Fast & Affordable)</SelectItem>
                  <SelectItem value="pro">Pro (Premium Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Resolution</Label>
              <Select
                value={settings?.seedance?.resolution || '1080p'}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    seedance: { ...prev.seedance, resolution: value },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="4K">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">
                Duration: {settings?.seedance?.duration || 3}s
              </Label>
              <Select
                value={(settings?.seedance?.duration || 3).toString()}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    seedance: {
                      ...prev.seedance,
                      duration: Number(value),
                    },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 second</SelectItem>
                  <SelectItem value="3">3 seconds</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="camera-fixed"
                checked={settings?.seedance?.cameraFixed || false}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    seedance: { ...prev.seedance, cameraFixed: checked },
                  }))
                }
              />
              <Label htmlFor="camera-fixed" className="text-slate-300">Fixed Camera Position</Label>
            </div>
          </CardContent>
        </Card>

        {/* Image Edit Settings */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              🖼️ Image Edit Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Default Model</Label>
              <Select
                value={settings?.imageEdit?.model || 'qwen-edit'}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    imageEdit: { ...prev.imageEdit, model: value },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qwen-edit">Qwen-Edit (Recommended)</SelectItem>
                  <SelectItem value="flux-edit" disabled>FLUX Edit (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Default Output Format</Label>
              <Select
                value={settings?.imageEdit?.outputFormat || 'webp'}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    imageEdit: { ...prev.imageEdit, outputFormat: value },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Smaller file size)</SelectItem>
                  <SelectItem value="png">PNG (Higher quality)</SelectItem>
                  <SelectItem value="jpg">JPEG (Most compatible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gen4 Settings */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              ✨ Gen4 Image Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Model</Label>
              <Select
                value={settings?.gen4?.model || 'gen4-image'}
                onValueChange={(value: string) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    gen4: { ...prev.gen4, model: value },
                  }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gen4-image">Gen4 Image (High Quality)</SelectItem>
                  <SelectItem value="gen4-turbo">Gen4 Turbo (Faster)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-detect-ratio"
                checked={settings?.gen4?.autoDetectAspectRatio ?? true}
                onCheckedChange={(checked) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    gen4: { ...prev.gen4, autoDetectAspectRatio: checked },
                  }))
                }
              />
              <Label htmlFor="auto-detect-ratio" className="text-slate-300">
                Auto-detect aspect ratio from reference images
              </Label>
            </div>
            
            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">⚡ Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Gen4 Image:</span>
                  <span className="text-blue-400">High quality, ~30s</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Gen4 Turbo:</span>
                  <span className="text-green-400">Faster, ~10s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              🔧 General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-save"
                checked={settings?.general?.autoSave || true}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    general: { ...prev.general, autoSave: checked },
                  }))
                }
              />
              <Label htmlFor="auto-save" className="text-slate-300">Auto-save to IndexedDB</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-costs"
                checked={settings?.general?.showCostEstimates || false}
                onCheckedChange={(checked: boolean) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    general: {
                      ...prev.general,
                      showCostEstimates: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="show-costs" className="text-slate-300">Show cost estimates</Label>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">
                Max Concurrent Jobs: {settings?.general?.maxConcurrentJobs || 3}
              </Label>
              <Slider
                value={[settings?.general?.maxConcurrentJobs || 3]}
                onValueChange={([value]: [number]) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    general: {
                      ...prev.general,
                      maxConcurrentJobs: value,
                    },
                  }))
                }
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost Estimation */}
        {settings?.general?.showCostEstimates && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                💰 Cost Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-300 mb-4">
                  Estimated costs based on current model selections and usage
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-300">Seedance Videos</p>
                    <p className="text-lg font-bold text-blue-100">$0.12</p>
                    <p className="text-xs text-blue-400">per video generated</p>
                  </div>
                  <div className="p-3 bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium text-green-300">Gen4 Images</p>
                    <p className="text-lg font-bold text-green-100">$0.055</p>
                    <p className="text-xs text-green-400">per image generated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}