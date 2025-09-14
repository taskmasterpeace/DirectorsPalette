'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  Star,
  Camera,
  Music,
  Sparkles,
  Rocket
} from 'lucide-react'
import { HelpSection } from './HelpSection'

export function CreditsSection() {
  return (
    <div className="space-y-6">
      <HelpSection 
        title="💳 Credits System & Pricing" 
        icon={<Zap className="w-5 h-5 text-amber-500" />}
        badge="Pre-Production"
      >
        <div className="space-y-6">
          <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-amber-400" />
              <div>
                <h3 className="text-xl font-bold text-amber-300">⚡ How Credits Work</h3>
                <p className="text-amber-200 text-sm">Every AI operation costs credits - here's the complete breakdown</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Directors Palette uses a credit system to manage AI generation costs. You get <strong>2,500 credits monthly</strong> with Creator Pro ($20/month), 
              plus access to <strong>6 FREE models</strong> that don't require credits. When you need more, boost packs provide instant credits.
            </p>
          </div>

          {/* Free Models */}
          <Card className="bg-green-900/20 border-green-600/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Star className="w-5 h-5" />
                🆓 FREE Models (Unlimited Usage)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium text-green-400">Text Generation Models:</div>
                  <div className="text-sm text-slate-300 space-y-1 ml-2">
                    <div>• Story breakdown generation</div>
                    <div>• Music video structure analysis</div>
                    <div>• Commercial concept development</div>
                    <div>• Character consistency extraction</div>
                    <div>• Director style application</div>
                    <div>• Template creation and management</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-green-400">Analysis Models:</div>
                  <div className="text-sm text-slate-300 space-y-1 ml-2">
                    <div>• Reference extraction</div>
                    <div>• Entity identification (@character, @location)</div>
                    <div>• Lyric structure analysis</div>
                    <div>• Brand brief processing</div>
                    <div>• Age-appropriate content adaptation</div>
                    <div>• Director question generation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Models */}
          <Card className="bg-purple-900/20 border-purple-600/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                💎 Premium Models (Credit Required)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Generation */}
                <div>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    🖼️ Image Generation Models
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-blue-300 mb-2">nano-banana (Gen4)</div>
                      <div className="text-sm text-slate-300 mb-3">Fast, general-purpose image generation</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>All Resolutions:</span>
                          <span className="text-amber-400 font-bold">15 credits</span>
                        </div>
                        <div className="text-green-400 text-xs mt-1">
                          ✅ Simplified pricing - all resolutions same cost
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-purple-300 mb-2">gen4-image (Premium)</div>
                      <div className="text-sm text-slate-300 mb-3">High-quality, detailed image generation</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>720p (Base):</span>
                          <span className="text-amber-400 font-bold">15 credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1080p (HD):</span>
                          <span className="text-amber-400 font-bold">25 credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4K (Ultra):</span>
                          <span className="text-amber-400 font-bold">25 credits</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-green-300 mb-2">gen4-image-turbo</div>
                      <div className="text-sm text-slate-300 mb-3">Ultra-fast, professional quality</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>All Resolutions:</span>
                          <span className="text-amber-400 font-bold">15 credits</span>
                        </div>
                        <div className="text-green-400 text-xs mt-1">
                          ✅ Ultra-fast generation - best value option
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-cyan-300 mb-2">qwen-image-edit</div>
                      <div className="text-sm text-slate-300 mb-3">Professional image editing with precise instructions</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>All Resolutions:</span>
                          <span className="text-amber-400 font-bold">15 credits</span>
                        </div>
                        <div className="text-green-400 text-xs mt-1">
                          ✅ Advanced editing capabilities - modify existing images
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Processing */}
                <div>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    🎵 Audio Processing Models
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-purple-300 mb-2">Simple Whisper (English)</div>
                      <div className="text-sm text-slate-300 mb-3">Basic lyrics extraction from audio</div>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>Cost per minute:</span>
                          <span className="text-amber-400 font-bold">$0.05 (~5 credits)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded border">
                      <div className="font-medium text-blue-300 mb-2">Advanced Whisper</div>
                      <div className="text-sm text-slate-300 mb-3">Multi-language, timestamp extraction</div>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>Cost per minute:</span>
                          <span className="text-amber-400 font-bold">$0.10 (~10 credits)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Examples */}
                <div className="bg-blue-900/20 p-4 rounded border border-blue-600/30">
                  <h4 className="font-bold text-blue-300 mb-3">📊 Typical Usage Examples</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-white mb-2">💡 Light Creator (Story Mode Only)</div>
                      <div className="space-y-1 text-slate-300">
                        <div>• 10 story breakdowns/month (FREE)</div>
                        <div>• 5 HD images: 125 credits</div>
                        <div>• <strong>Total Monthly: ~125 credits</strong></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-white mb-2">🚀 Power Creator (All Modes)</div>
                      <div className="space-y-1 text-slate-300">
                        <div>• 25 stories + music videos (FREE)</div>
                        <div>• 20 HD images: 300-500 credits</div>
                        <div>• 10 minutes audio processing: 50 credits</div>
                        <div>• <strong>Total Monthly: ~400 credits</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boost Packs */}
          <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-600/30">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                🚀 Boost Packs (When You Need More)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-900/20 rounded border">
                  <div className="text-2xl font-bold text-blue-400">$4</div>
                  <div className="text-sm text-white font-medium">Quick Boost</div>
                  <div className="text-lg font-bold text-amber-400">+500 credits</div>
                  <div className="text-xs text-slate-400 mt-1">~33 HD images</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded border ring-2 ring-amber-500/50">
                  <div className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full mb-1">Most Popular</div>
                  <div className="text-2xl font-bold text-purple-400">$10</div>
                  <div className="text-sm text-white font-medium">Power Boost</div>
                  <div className="text-lg font-bold text-amber-400">+1,500 credits</div>
                  <div className="text-xs text-slate-400 mt-1">~100 HD images</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded border">
                  <div className="text-2xl font-bold text-green-400">$30</div>
                  <div className="text-sm text-white font-medium">Mega Boost</div>
                  <div className="text-lg font-bold text-amber-400">+5,000 credits</div>
                  <div className="text-xs text-slate-400 mt-1">~333 HD images</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </HelpSection>
    </div>
  )
}