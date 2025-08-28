"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Star, 
  Music, 
  Film, 
  Briefcase, 
  BookOpen,
  Crown,
  Download
} from "lucide-react"

export function StyleGuide() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Director's Palette Style Guide</h1>
              <p className="text-slate-400">Official design system for Machine King Labs applications</p>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-white font-bold mb-2">Design Philosophy</h2>
                  <p className="text-amber-200">
                    Professional, cinematic interfaces that empower creators with intuitive tools while maintaining visual sophistication.
                  </p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>

          {/* Branding */}
          <TabsContent value="branding" className="space-y-6">
            
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Logo Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Logo Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Logo Size Hierarchy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-slate-300">Sidebar Primary</h4>
                        <code className="text-xs text-amber-400">w-16 h-16 (64px)</code>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700 rounded">
                        <img src="/mkl-logo.png" alt="MKL" className="w-16 h-16 rounded-lg" />
                        <div>
                          <div className="text-white font-bold">Director's Palette</div>
                          <div className="text-amber-400 text-sm">Machine King Labs</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-slate-300">Header Secondary</h4>
                        <code className="text-xs text-amber-400">w-12 h-12 (48px)</code>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700 rounded">
                        <img src="/mkl-logo.png" alt="MKL" className="w-12 h-12 rounded-md" />
                        <div>
                          <div className="text-white text-lg font-bold">Director's Palette</div>
                          <div className="text-amber-400 text-xs">Machine King Labs</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-slate-300">Form/Card Icon</h4>
                        <code className="text-xs text-amber-400">w-8 h-8 (32px)</code>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-700 rounded">
                        <img src="/mkl-logo.png" alt="MKL" className="w-8 h-8 rounded" />
                        <div className="text-white text-sm">Director's Palette</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Brand Color Palette</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white">
                      <div className="font-bold">Primary Gold</div>
                      <div className="text-xs opacity-90">Amber-500 to Orange-600</div>
                      <div className="text-xs font-mono">#F59E0B → #EA580C</div>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg text-white border border-slate-700">
                      <div className="font-bold">Dark Base</div>
                      <div className="text-xs text-slate-300">Slate-800</div>
                      <div className="text-xs font-mono">#1E293B</div>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-lg text-white border border-slate-600">
                      <div className="font-bold">Darker Base</div>
                      <div className="text-xs text-slate-300">Slate-900</div>
                      <div className="text-xs font-mono">#0F172A</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg text-white border border-slate-500">
                      <div className="font-bold">Background</div>
                      <div className="text-xs text-slate-300">Slate-950</div>
                      <div className="text-xs font-mono">#020617</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Color System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Semantic Colors */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Semantic Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-green-600 rounded-lg text-white">
                      <div className="font-bold">Success</div>
                      <div className="text-xs">Green-600</div>
                      <div className="text-xs font-mono">#16A34A</div>
                    </div>
                    <div className="p-4 bg-blue-600 rounded-lg text-white">
                      <div className="font-bold">Primary Action</div>
                      <div className="text-xs">Blue-600</div>
                      <div className="text-xs font-mono">#2563EB</div>
                    </div>
                    <div className="p-4 bg-purple-600 rounded-lg text-white">
                      <div className="font-bold">Microgenres</div>
                      <div className="text-xs">Purple-600</div>
                      <div className="text-xs font-mono">#9333EA</div>
                    </div>
                    <div className="p-4 bg-orange-600 rounded-lg text-white">
                      <div className="font-bold">Warning</div>
                      <div className="text-xs">Orange-600</div>
                      <div className="text-xs font-mono">#EA580C</div>
                    </div>
                    <div className="p-4 bg-red-600 rounded-lg text-white">
                      <div className="font-bold">Danger</div>
                      <div className="text-xs">Red-600</div>
                      <div className="text-xs font-mono">#DC2626</div>
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Text Color Hierarchy</h3>
                  <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
                    <div className="text-white">Primary Text (text-white) - Main headings and important content</div>
                    <div className="text-slate-300">Secondary Text (text-slate-300) - Regular content and labels</div>
                    <div className="text-slate-400">Muted Text (text-slate-400) - Helper text and descriptions</div>
                    <div className="text-slate-500">Disabled Text (text-slate-500) - Inactive or placeholder text</div>
                    <div className="text-amber-400">Brand Accent (text-amber-400) - Machine King Labs branding</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Typography Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h1 className="text-3xl font-bold text-white mb-2">Heading 1 (text-3xl font-bold)</h1>
                    <code className="text-xs text-amber-400">Used for main page titles</code>
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-2">Heading 2 (text-2xl font-bold)</h2>
                    <code className="text-xs text-amber-400">Used for section titles</code>
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-2">Heading 3 (text-xl font-bold)</h3>
                    <code className="text-xs text-amber-400">Used for card titles and subsections</code>
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-2">Heading 4 (text-lg font-medium)</h4>
                    <code className="text-xs text-amber-400">Used for component titles</code>
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-slate-300 mb-2">Body Text (text-slate-300)</p>
                    <code className="text-xs text-amber-400">Default body text for content</code>
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Small Text (text-sm text-slate-400)</p>
                    <code className="text-xs text-amber-400">Helper text, captions, metadata</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components */}
          <TabsContent value="components" className="space-y-6">
            
            {/* Buttons */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Button System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Button Sizes</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button size="sm" className="h-8">Small (h-8)</Button>
                    <Button className="h-10">Default (h-10)</Button>
                    <Button size="lg" className="h-12">Large (h-12)</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Button Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button>Primary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">Brand</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Mode Buttons</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-12 px-4">
                      <Film className="h-5 w-5 mr-2" />
                      Story Mode
                    </Button>
                    <Button variant="outline" className="h-12 px-4">
                      <Music className="h-5 w-5 mr-2" />
                      Music Video Mode
                    </Button>
                    <Button variant="outline" className="h-12 px-4">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Commercial Mode
                    </Button>
                    <Button variant="outline" className="h-12 px-4">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Children's Book Mode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Badge System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Badge Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge className="bg-green-600">Selected Genre</Badge>
                    <Badge className="bg-purple-600">Microgenre</Badge>
                    <Badge className="bg-amber-600">Popular ⭐</Badge>
                    <Badge className="bg-blue-600">User Selection</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Genre Hierarchy Colors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600 text-white">Main Genre</Badge>
                      <span className="text-xs text-slate-400">Green-600 for primary genre categories</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600 text-white">Subgenre</Badge>
                      <span className="text-xs text-slate-400">Blue-600 for secondary categories</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600 text-white">Microgenre</Badge>
                      <span className="text-xs text-slate-400">Purple-600 for specific styles</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Form Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Input Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Standard Input</label>
                      <Input placeholder="Enter text..." className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Textarea</label>
                      <Textarea placeholder="Enter description..." className="bg-slate-800 border-slate-700 text-white" rows={3} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layouts */}
          <TabsContent value="layouts" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Layout Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Spacing Standards */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Spacing Standards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <h4 className="text-slate-300 mb-3">Component Spacing</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li><code>mb-2</code> - Between related elements (8px)</li>
                        <li><code>mb-4</code> - Between form sections (16px)</li>
                        <li><code>mb-6</code> - Between major sections (24px)</li>
                        <li><code>mb-8</code> - Between page sections (32px)</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <h4 className="text-slate-300 mb-3">Padding Standards</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li><code>p-3</code> - Small components (12px)</li>
                        <li><code>p-4</code> - Standard cards (16px)</li>
                        <li><code>p-6</code> - Large containers (24px)</li>
                        <li><code>px-4 py-3</code> - Form fields</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Layouts */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Card System</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm">Standard Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 text-sm">Regular content cards with standard spacing</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-800/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-400" />
                          Enhanced Card
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 text-sm">Special features with gradient backgrounds</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-400" />
                          Brand Card
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-amber-200 text-sm">Brand-themed cards for special content</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons */}
          <TabsContent value="icons" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Icon Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* App Icons */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Application Icons</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Film className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm text-white">Story Mode</div>
                      <code className="text-xs text-slate-400">Film</code>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-white">Music Video</div>
                      <code className="text-xs text-slate-400">Music</code>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Briefcase className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-white">Commercial</div>
                      <code className="text-xs text-slate-400">Briefcase</code>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <BookOpen className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                      <div className="text-sm text-white">Children's Book</div>
                      <code className="text-xs text-slate-400">BookOpen</code>
                    </div>
                  </div>
                </div>

                {/* Icon Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Icon Size Guidelines</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Star className="h-3 w-3 text-amber-400 mx-auto mb-2" />
                      <div className="text-xs text-white">Small (h-3 w-3)</div>
                      <code className="text-xs text-slate-400">Inline icons</code>
                    </div>
                    
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Star className="h-4 w-4 text-amber-400 mx-auto mb-2" />
                      <div className="text-xs text-white">Default (h-4 w-4)</div>
                      <code className="text-xs text-slate-400">Button icons</code>
                    </div>
                    
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Star className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                      <div className="text-xs text-white">Medium (h-5 w-5)</div>
                      <code className="text-xs text-slate-400">Card headers</code>
                    </div>
                    
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Star className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                      <div className="text-xs text-white">Large (h-8 w-8)</div>
                      <code className="text-xs text-slate-400">Feature highlights</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}