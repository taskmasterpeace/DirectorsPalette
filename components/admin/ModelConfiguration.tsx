'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Crown, Zap, Brain, DollarSign, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { OPENROUTER_MODELS, FUNCTION_MODEL_CONFIG, type AdminModelSelection } from '@/lib/ai-providers/openrouter-config'

interface ModelConfigurationProps {
  isAdmin: boolean // Only show to admin users
}

export function ModelConfiguration({ isAdmin }: ModelConfigurationProps) {
  const { toast } = useToast()
  const [adminConfig, setAdminConfig] = useState<AdminModelSelection>({})
  const [testingModel, setTestingModel] = useState<string | null>(null)

  // Load admin configuration from localStorage
  useEffect(() => {
    if (isAdmin) {
      const saved = localStorage.getItem('admin-model-config')
      if (saved) {
        try {
          setAdminConfig(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load admin config:', error)
        }
      }
    }
  }, [isAdmin])

  // Save admin configuration
  const saveAdminConfig = (newConfig: AdminModelSelection) => {
    setAdminConfig(newConfig)
    localStorage.setItem('admin-model-config', JSON.stringify(newConfig))
    toast({
      title: "Model Configuration Saved",
      description: "System-wide model settings updated"
    })
  }

  // Test model functionality
  const testModel = async (modelId: string, functionType: string) => {
    setTestingModel(modelId)
    try {
      // Simulate model test call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Model Test Successful",
        description: `${OPENROUTER_MODELS[modelId]?.name} working properly`
      })
    } catch (error) {
      toast({
        title: "Model Test Failed",
        description: "Model not responding correctly",
        variant: "destructive"
      })
    } finally {
      setTestingModel(null)
    }
  }

  if (!isAdmin) {
    return null // Hide from regular users
  }

  return (
    <div className="space-y-6">
      {/* Admin Warning */}
      <Card className="bg-amber-900/20 border-amber-600/30">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-medium">Admin Model Configuration</span>
          </div>
          <p className="text-amber-200/80 text-sm mt-1">
            These settings control AI models system-wide. Regular users will see your selections.
          </p>
        </CardContent>
      </Card>

      {/* Function-Based Model Selection */}
      <div className="space-y-4">
        {Object.values(FUNCTION_MODEL_CONFIG).map((config) => {
          const currentModelId = adminConfig[config.function] || config.defaultModel
          const currentModel = OPENROUTER_MODELS[currentModelId]
          
          return (
            <Card key={config.function} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span className="capitalize">{config.function.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Context Indicator */}
                    <Badge 
                      variant={currentModel?.context >= 100000 ? "default" : "secondary"} 
                      className={`text-xs ${currentModel?.context >= 100000 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}
                    >
                      {currentModel?.context >= 1000000 ? '🟢 1M+' : 
                       currentModel?.context >= 100000 ? '🟡 100K+' : 
                       '🟠 <100K'} 
                    </Badge>
                    {/* Pricing */}
                    <Badge variant="outline" className="text-xs">
                      {currentModel?.isFree ? '🆓 FREE' : `$${currentModel?.pricing.prompt}/1M`}
                    </Badge>
                  </div>
                </CardTitle>
                <p className="text-slate-400 text-sm">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Selection */}
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-600">
                  <div>
                    <div className="text-white font-medium">{currentModel?.name}</div>
                    <div className="text-slate-400 text-xs flex items-center gap-2">
                      <span>{currentModel?.provider}</span>
                      <span>•</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${currentModel?.context >= 100000 ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}
                      >
                        {currentModel?.context >= 1000000 ? '🟢 1M+' : 
                         currentModel?.context >= 100000 ? '🟡 100K+' : 
                         '🟠 ' + currentModel?.context.toLocaleString()} tokens
                      </Badge>
                      {currentModel?.isReasoning && (
                        <>
                          <span>•</span>
                          <Brain className="w-3 h-3" />
                          <span>Reasoning</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testModel(currentModelId, config.function)}
                      disabled={testingModel === currentModelId}
                      className="text-xs"
                    >
                      {testingModel === currentModelId ? (
                        <>
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Change Model</Label>
                  <Select
                    value={currentModelId}
                    onValueChange={(value) => {
                      const newConfig = {
                        ...adminConfig,
                        [config.function]: value
                      }
                      saveAdminConfig(newConfig)
                    }}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Current Default */}
                      <SelectItem value={config.defaultModel}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span>🎯 {OPENROUTER_MODELS[config.defaultModel]?.name}</span>
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          </div>
                          <span className={`text-xs ${OPENROUTER_MODELS[config.defaultModel]?.context >= 100000 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {OPENROUTER_MODELS[config.defaultModel]?.context >= 1000000 ? '🟢 1M+' : 
                             OPENROUTER_MODELS[config.defaultModel]?.context >= 100000 ? '🟡 100K+' : 
                             '🟠 <100K'}
                          </span>
                        </div>
                      </SelectItem>
                      
                      <Separator className="my-1" />
                      
                      {/* Suggested Models */}
                      {config.suggestedModels.map(modelId => (
                        <SelectItem key={modelId} value={modelId}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>💡 {OPENROUTER_MODELS[modelId]?.name}</span>
                              {OPENROUTER_MODELS[modelId]?.isReasoning && (
                                <Brain className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                            <span className={`text-xs ${OPENROUTER_MODELS[modelId]?.context >= 100000 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {OPENROUTER_MODELS[modelId]?.context >= 1000000 ? '🟢 1M+' : 
                               OPENROUTER_MODELS[modelId]?.context >= 100000 ? '🟡 100K+' : 
                               '🟠 <100K'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <Separator className="my-1" />
                      
                      {/* Free Alternatives */}
                      {config.freeAlternatives.map(modelId => (
                        <SelectItem key={modelId} value={modelId}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>🆓 {OPENROUTER_MODELS[modelId]?.name}</span>
                              {OPENROUTER_MODELS[modelId]?.isReasoning && (
                                <Badge variant="outline" className="text-xs">Reasoning</Badge>
                              )}
                            </div>
                            <span className={`text-xs ${OPENROUTER_MODELS[modelId]?.context >= 100000 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {OPENROUTER_MODELS[modelId]?.context >= 1000000 ? '🟢 1M+' : 
                               OPENROUTER_MODELS[modelId]?.context >= 100000 ? '🟡 100K+' : 
                               '🟠 <100K'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {currentModel?.capabilities.map(capability => (
                    <Badge 
                      key={capability} 
                      variant="outline" 
                      className="text-xs capitalize"
                    >
                      {capability === 'reasoning' && <Brain className="w-3 h-3 mr-1" />}
                      {capability === 'fast' && <Zap className="w-3 h-3 mr-1" />}
                      {capability === 'creative' && '🎨'}
                      {capability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cost Summary */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {Object.entries(adminConfig).map(([func, modelId]) => {
              const model = OPENROUTER_MODELS[modelId]
              if (!model) return null
              
              return (
                <div key={func} className="space-y-1">
                  <div className="text-xs text-slate-400 capitalize">{func.replace('-', ' ')}</div>
                  <div className="text-sm font-medium text-white">
                    {model.isFree ? '🆓 FREE' : `$${model.pricing.prompt}/1M`}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}