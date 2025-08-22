'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  HelpCircle,
  BookOpen,
  PlayCircle,
  Camera,
  FileText,
  Users,
  Zap,
  Target,
  Sparkles,
  Music,
  Film,
  Download,
  Copy,
  Settings,
  Star,
  Lightbulb,
  Rocket,
  Heart,
  Brain,
  Palette,
  Wand2,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface HelpSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  badge?: string
}

function HelpSection({ title, icon, children, badge }: HelpSectionProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface ExampleCardProps {
  title: string
  description: string
  input: string
  output: string
  tips?: string[]
}

function ExampleCard({ title, description, input, output, tips }: ExampleCardProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="text-xs font-medium text-green-600 mb-1">📝 Input Example:</div>
              <div className="text-xs bg-green-900/20 p-2 rounded border-l-2 border-green-600 font-mono">
                {input}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-blue-600 mb-1">✨ Generated Output:</div>
              <div className="text-xs bg-blue-900/20 p-2 rounded border-l-2 border-blue-600">
                {output}
              </div>
            </div>
          </div>

          {tips && tips.length > 0 && (
            <div>
              <div className="text-xs font-medium text-orange-600 mb-1">💡 Pro Tips:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-orange-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-blue-500" />
            Director's Palette Help Center
            <Badge className="bg-blue-600 text-white">Machine King Labs</Badge>
          </DialogTitle>
          <DialogDescription>
            🔬 AI-Powered Content Creation Platform - Complete Guide with Examples
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="text-xs">
              <Rocket className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="story" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Story Mode
            </TabsTrigger>
            <TabsTrigger value="music-video" className="text-xs">
              <Music className="w-3 h-3 mr-1" />
              Music Video
            </TabsTrigger>
            <TabsTrigger value="commercial" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Commercial
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Help
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[70vh] mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <HelpSection 
                title="What is Director's Palette?" 
                icon={<Palette className="w-5 h-5 text-purple-500" />}
                badge="Research Project"
              >
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-300">AI Research Platform</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Director's Palette is a <strong>Machine King Labs research project</strong> that explores how AI can enhance human creativity in storytelling and visual production. Transform stories and music into professional shot lists using AI-powered director-specific styling.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-900/20 border-green-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-green-300">📚 Story Mode</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Transform written stories into cinematic shot lists with director-specific styling
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">Nolan</Badge>
                          <Badge variant="outline" className="text-xs">Fincher</Badge>
                          <Badge variant="outline" className="text-xs">Tarantino</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-900/20 border-purple-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-purple-300">🎵 Music Video Mode</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Create music video breakdowns with artist integration and visual storytelling
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">Hype Williams</Badge>
                          <Badge variant="outline" className="text-xs">Michel Gondry</Badge>
                          <Badge variant="outline" className="text-xs">Spike Jonze</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="font-medium text-amber-300">🎯 Key Features</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>AI Shot Generation</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>Artist Integration</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-green-400" />
                        <span>Professional Export</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Template System</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HelpSection>

              <HelpSection 
                title="Quick Start Guide" 
                icon={<Rocket className="w-5 h-5 text-orange-500" />}
                badge="5 minutes"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-green-300">📚 Try Story Mode First</span>
                      </div>
                      <ol className="text-sm space-y-2 text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">1</span>
                          <span>Enter a story in the textarea</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">2</span>
                          <span>Select a director (try David Fincher)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">3</span>
                          <span>Click "Extract References" or press <kbd className="bg-slate-700 px-1 rounded text-xs">Ctrl+Enter</kbd></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">4</span>
                          <span>Review and generate shots</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">5</span>
                          <span>Click "Copy All Shots" for instant results! 📋</span>
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-purple-300">🎵 Try Music Video Mode</span>
                      </div>
                      <ol className="text-sm space-y-2 text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">1</span>
                          <span>Switch to Music Video mode</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">2</span>
                          <span>Select an artist from Artist Bank</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">3</span>
                          <span>Enter lyrics or use a template</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">4</span>
                          <span>Press <kbd className="bg-slate-700 px-1 rounded text-xs">Ctrl+Enter</kbd> to generate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">5</span>
                          <span>Toggle between @artist and descriptions 🔄</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">💡 Pro Tip</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Use the <strong>Templates</strong> button to load sample content and learn the system quickly! 
                      Perfect for testing and understanding how different directors work.
                    </p>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Story Mode Tab */}
            <TabsContent value="story" className="space-y-6">
              <HelpSection 
                title="Story Mode Complete Guide" 
                icon={<BookOpen className="w-5 h-5 text-green-500" />}
                badge="Film & TV"
              >
                <div className="space-y-4">
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Film className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-green-300">🎬 What Story Mode Does</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      Transform any written story into a professional, director-specific shot list ready for film production. 
                      AI analyzes your story and creates detailed visual breakdowns that capture each director's unique style.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-600 text-white">📖 Story Analysis</Badge>
                      <Badge className="bg-green-600 text-white">🎭 Character Extraction</Badge>
                      <Badge className="bg-green-600 text-white">📍 Location Mapping</Badge>
                      <Badge className="bg-green-600 text-white">🎯 Director Styling</Badge>
                    </div>
                  </div>

                  <ExampleCard
                    title="🕵️ Detective Thriller Example"
                    description="See how a crime story becomes a shot list"
                    input="Detective Sarah Chen walked through the dimly lit warehouse, her flashlight cutting through the darkness. She noticed a red briefcase sitting on the metal table in the center of the room. The killer had left behind evidence - a bloody knife next to the briefcase."
                    output="1. EXT. WAREHOUSE - NIGHT: Wide establishing shot of abandoned warehouse district, rain glistening on asphalt\n2. INT. WAREHOUSE - NIGHT: Medium shot of Detective Sarah entering through broken door, flashlight beam cutting through darkness\n3. INT. WAREHOUSE - NIGHT: Close-up of red briefcase on metal table, camera slowly pushes in\n4. INT. WAREHOUSE - NIGHT: Extreme close-up of bloody knife, dramatic lighting reveals evidence"
                    tips={[
                      "Use specific character names (Sarah Chen) for better reference extraction",
                      "Include clear locations (warehouse, Fifth Street) for establishing shots",
                      "Mention props (briefcase, knife) for detail shots",
                      "Try David Fincher or Christopher Nolan for thriller stories"
                    ]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-amber-400" />
                          <span className="font-medium text-amber-300">🎯 Director Styles</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Christopher Nolan</span>
                            <span className="text-blue-300">Complex, IMAX, Practical</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">David Fincher</span>
                            <span className="text-green-300">Dark, Precise, Digital</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Quentin Tarantino</span>
                            <span className="text-orange-300">Stylized, Dialogue, Pop Culture</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Greta Gerwig</span>
                            <span className="text-pink-300">Intimate, Character-driven</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-yellow-300">⚡ Quick Actions</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <kbd className="bg-slate-700 px-1 rounded">Ctrl+Enter</kbd>
                            <span className="text-slate-300">Extract references from story</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Copy className="w-3 h-3 text-blue-400" />
                            <span className="text-slate-300">Copy All Shots button</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3 text-green-400" />
                            <span className="text-slate-300">Export to full page</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-slate-300">Load story templates</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </HelpSection>

              <HelpSection 
                title="Step-by-Step Story Workflow" 
                icon={<ArrowRight className="w-5 h-5 text-blue-500" />}
                badge="Detailed"
              >
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded border-l-4 border-blue-500">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      <div className="flex-1">
                        <div className="font-medium text-blue-300">📝 Enter Your Story</div>
                        <div className="text-xs text-slate-400">Paste or type your narrative. Works best with 200-2000 words.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded border-l-4 border-purple-500">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      <div className="flex-1">
                        <div className="font-medium text-purple-300">🎬 Choose Director Style</div>
                        <div className="text-xs text-slate-400">Each director creates different visual approaches to your story.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-900/20 rounded border-l-4 border-amber-500">
                      <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      <div className="flex-1">
                        <div className="font-medium text-amber-300">🎯 Extract References</div>
                        <div className="text-xs text-slate-400">AI identifies characters, locations, and props for consistency.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border-l-4 border-green-500">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                      <div className="flex-1">
                        <div className="font-medium text-green-300">✨ Generate Shot List</div>
                        <div className="text-xs text-slate-400">Professional shot breakdowns with director-specific styling.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded border-l-4 border-red-500">
                      <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                      <div className="flex-1">
                        <div className="font-medium text-red-300">📋 Copy or Export</div>
                        <div className="text-xs text-slate-400">Quick copy or professional export for production teams.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Music Video Tab */}
            <TabsContent value="music-video" className="space-y-6">
              <HelpSection 
                title="Music Video Mode Complete Guide" 
                icon={<Music className="w-5 h-5 text-purple-500" />}
                badge="Artist Integration"
              >
                <div className="space-y-4">
                  <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <PlayCircle className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-purple-300">🎵 What Music Video Mode Does</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      Create comprehensive music video breakdowns that integrate artist profiles with song structure. 
                      AI analyzes lyrics and creates section-specific shots that match the artist's brand and the song's energy.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <Badge className="bg-purple-600 text-white">🎤 Artist Integration</Badge>
                      <Badge className="bg-purple-600 text-white">📝 Lyric Analysis</Badge>
                      <Badge className="bg-purple-600 text-white">🔄 @artist Variables</Badge>
                      <Badge className="bg-purple-600 text-white">🎨 Director Styles</Badge>
                    </div>
                  </div>

                  <ExampleCard
                    title="🎤 Hip-Hop Music Video Example"
                    description="See how lyrics become visual storytelling"
                    input="[Verse 1]\nStarted from the bottom now we here\nCity lights reflecting all my fears\nGrinding every day, no time for tears\nBuilding up my empire year by year\n\n[Chorus]\nRising up, never gonna fall\nStanding tall against it all"
                    output="INTRO: Drone shot sweeping over artist's hometown neighborhood, establishing authenticity and roots\n\nVERSE 1: Performance shot of @artist rapping in recording studio, close-up with microphone, intense energy\n\nVERSE 1: Flashback montage of @artist working hard, multiple locations showing the grind\n\nCHORUS: @artist performing on stage with full crowd, high energy, multiple camera angles capturing triumph"
                    tips={[
                      "Use [Verse], [Chorus], [Bridge] structure for best results",
                      "Include themes (struggle, success, relationships) in lyrics",
                      "Select artist from Artist Bank for consistent representation",
                      "Try Hype Williams for hip-hop or Michel Gondry for creative concepts"
                    ]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-blue-300">👤 Artist Bank Integration</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Auto-populates name, genre, and details</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Visual descriptions for consistent appearance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Persistent artist indicator shows active artist</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Quick save 💾 preserves artist + song combo</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-orange-400" />
                          <span className="font-medium text-orange-300">🔄 @artist Variable System</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-orange-300 font-medium mb-1">Variable Mode:</div>
                            <div className="text-slate-300">"Wide shot of @artist walking through streets"</div>
                            <div className="text-blue-300 mt-1">→ "Wide shot of Jay-Z walking through streets"</div>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-orange-300 font-medium mb-1">Description Mode:</div>
                            <div className="text-slate-300">"Wide shot of @artist walking through streets"</div>
                            <div className="text-purple-300 mt-1">→ "Wide shot of A confident Black male rapper with gold chains walking through streets"</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </HelpSection>

              <HelpSection 
                title="Music Video Director Styles" 
                icon={<Camera className="w-5 h-5 text-orange-500" />}
                badge="Visual Styles"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔥</span>
                        <span className="font-medium text-red-300">Hype Williams</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Fish-eye lens and wide-angle distortion</div>
                        <div>• Vibrant, saturated colors</div>
                        <div>• Hip-hop culture aesthetic</div>
                        <div>• Luxury lifestyle imagery</div>
                      </div>
                      <Badge className="mt-2 bg-red-600 text-white text-xs">Best for: Hip-Hop, Rap</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎨</span>
                        <span className="font-medium text-green-300">Michel Gondry</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Handmade visual effects</div>
                        <div>• Whimsical and playful imagery</div>
                        <div>• Creative practical effects</div>
                        <div>• Colorful, artistic composition</div>
                      </div>
                      <Badge className="mt-2 bg-green-600 text-white text-xs">Best for: Pop, Alternative</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💫</span>
                        <span className="font-medium text-purple-300">Spike Jonze</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Emotional storytelling focus</div>
                        <div>• Authentic performances</div>
                        <div>• Creative conceptual approaches</div>
                        <div>• Human connection emphasis</div>
                      </div>
                      <Badge className="mt-2 bg-purple-600 text-white text-xs">Best for: Indie, Alternative</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚡</span>
                        <span className="font-medium text-yellow-300">Dave Meyers</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• High-energy choreography</div>
                        <div>• Dynamic camera movements</div>
                        <div>• Commercial polish</div>
                        <div>• Performance-focused</div>
                      </div>
                      <Badge className="mt-2 bg-yellow-600 text-white text-xs">Best for: Pop, R&B</Badge>
                    </CardContent>
                  </Card>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <HelpSection 
                title="Professional Export System" 
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                badge="Production Ready"
              >
                <div className="space-y-4">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Download className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-300">📤 Export System Overview</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      Transform your generated shots into professional formats for different production teams. 
                      Configure prefix/suffix formatting, apply professional templates, and export in multiple formats.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge className="bg-blue-600 text-white">📝 Text Format</Badge>
                      <Badge className="bg-blue-600 text-white">📊 CSV Spreadsheet</Badge>
                      <Badge className="bg-blue-600 text-white">🔢 Numbered Lists</Badge>
                      <Badge className="bg-blue-600 text-white">📋 JSON Data</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-900/20 border-green-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Film className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-green-300">🎬 For Filmmakers</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Prefix:</strong> [PRODUCTION SHOT LIST]</div>
                          <div><strong>Suffix:</strong> [Equipment: RED Camera] [Crew: DP Required]</div>
                          <div><strong>Format:</strong> Numbered list</div>
                        </div>
                        <div className="mt-2 p-2 bg-green-800/20 rounded text-xs font-mono">
                          1. [PRODUCTION SHOT LIST] Wide establishing shot of warehouse [Equipment: RED Camera]
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-900/20 border-purple-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">📱 For Social Media</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Prefix:</strong> [SOCIAL MEDIA CLIP]</div>
                          <div><strong>Suffix:</strong> [Platform: Instagram/TikTok] [Duration: 15-60s]</div>
                          <div><strong>Format:</strong> Text</div>
                        </div>
                        <div className="mt-2 p-2 bg-purple-800/20 rounded text-xs font-mono">
                          [SOCIAL MEDIA CLIP] Artist lip-syncing hook [Platform: Instagram/TikTok]
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-900/20 border-orange-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-medium text-orange-300">🎯 For Production</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Prefix:</strong> [PRODUCTION NOTES] Camera:</div>
                          <div><strong>Suffix:</strong> [Budget: Mid-tier] [Equipment: Professional]</div>
                          <div><strong>Format:</strong> CSV/JSON</div>
                        </div>
                        <div className="mt-2 p-2 bg-orange-800/20 rounded text-xs font-mono">
                          [PRODUCTION NOTES] Camera: Close-up [Budget: Mid-tier]
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <ExampleCard
                    title="🎵 Complete Music Video Workflow"
                    description="Hip-hop success story with artist integration"
                    input="Artist: Jay-Z\nLyrics: [Verse 1] Started from the bottom now we here / City lights reflecting all my fears\nConcept: Urban success story showing journey from street to penthouse\nDirector: Hype Williams"
                    output="INTRO: Establishing drone shot of Brooklyn neighborhood where Jay-Z grew up, golden hour lighting\n\nVERSE 1: Performance shot of Jay-Z rapping in high-end recording studio, close-up with professional microphone\n\nVERSE 1: Lifestyle montage of Jay-Z in luxury car driving through same neighborhood, showing success\n\nCHORUS: Wide shot of Jay-Z performing on stage with full crowd, multiple angles, triumph and energy"
                    tips={[
                      "Artist visual description automatically replaces @artist in shots",
                      "Toggle between variable (@artist) and description modes",
                      "Quick save 💾 button preserves entire song setup",
                      "Copy All Shots 📋 gives instant formatted results"
                    ]}
                  />
                </div>
              </HelpSection>

              <HelpSection 
                title="Artist Integration Deep Dive" 
                icon={<Users className="w-5 h-5 text-cyan-500" />}
                badge="Advanced"
              >
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-cyan-400" />
                      <span className="font-medium text-cyan-300">💖 Why Artist Integration Matters</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Artist integration ensures visual consistency across all shots. When you select an artist from Artist Bank, 
                      their visual characteristics, style preferences, and brand identity inform every generated shot.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        🎯 What Happens When You Select an Artist
                      </div>
                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">1</span>
                          <span><strong>Auto-Population:</strong> Name, genre, visual style loaded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">2</span>
                          <span><strong>Artist Indicator:</strong> 🎤 Artist badge appears top-right</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">3</span>
                          <span><strong>@artist Variables:</strong> Smart replacement in all shots</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">4</span>
                          <span><strong>Visual Consistency:</strong> All shots feature same artist</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-purple-400" />
                        ✨ Artist Description Magic
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded text-xs">
                        <div className="text-purple-300 font-medium mb-1">From Artist Bank Fields:</div>
                        <div className="text-slate-400 space-y-1">
                          <div>• Gender: Male</div>
                          <div>• Race: Black</div>
                          <div>• Age: 50-55</div>
                          <div>• Style: Luxury streetwear</div>
                          <div>• Accessories: Gold chains, diamond watch</div>
                        </div>
                        <div className="text-blue-300 font-medium mt-2 mb-1">Auto-Generated Description:</div>
                        <div className="text-blue-200 italic">
                          "A confident Black male rapper in his 50s with luxury streetwear and gold chains"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Commercial Mode Tab */}
            <TabsContent value="commercial" className="space-y-6">
              <HelpSection 
                title="Commercial Mode Guide" 
                icon={<Target className="w-5 h-5 text-orange-500" />}
                badge="Brand Marketing"
              >
                <div className="space-y-4">
                  <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-orange-400" />
                      <span className="font-medium text-orange-300">🎯 What Commercial Mode Does</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Create platform-optimized brand commercials with director-specific styling. 
                      Transform brand briefs into professional shot lists for TikTok, Instagram, and YouTube.
                    </p>
                  </div>

                  <ExampleCard
                    title="🏃‍♂️ Nike Commercial Example"
                    description="Brand brief to shot list"
                    input="Brand: Nike\nProduct: Air Max Collection\nAudience: Gen Z athletes\nDirector: Zach King\nPlatform: TikTok (10s)\nConcept: Magical sneaker transformation"
                    output="1. HOOK (0-2s): Worn sneakers, disappointment\n2. PROBLEM (2-4s): Discomfort while running\n3. MAGIC (4-6s): Wall transition to new Air Max\n4. TRANSFORMATION (6-8s): Perfect performance\n5. CTA (8-10s): Nike logo + 'Drops Friday'"
                    tips={[
                      "Be specific about target audience",
                      "Try different directors for different feels",
                      "Platform matters: TikTok (9:16), YouTube (16:9)",
                      "Use Templates for pre-built scenarios"
                    ]}
                  />

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-white">🚀 5-Step Workflow</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-blue-900/20 rounded border-l-2 border-blue-500">
                        <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">1</span>
                        <span className="text-blue-300">Brand Brief Input</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded border-l-2 border-purple-500">
                        <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">2</span>
                        <span className="text-purple-300">Director Selection</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border-l-2 border-green-500">
                        <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">3</span>
                        <span className="text-green-300">Platform Optimization</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-900/20 rounded border-l-2 border-orange-500">
                        <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">4</span>
                        <span className="text-orange-300">AI Generation</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-red-900/20 rounded border-l-2 border-red-500">
                        <span className="bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">5</span>
                        <span className="text-red-300">Export & Production</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HelpSection>

              <HelpSection 
                title="Commercial Directors" 
                icon={<Users className="w-5 h-5 text-blue-500" />}
                badge="6 Styles"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="bg-yellow-900/20 border-yellow-600/30">
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">✨</span>
                        <span className="text-sm font-medium text-yellow-300">Zach King</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Viral transformation magic</div>
                        <div>• TikTok/Instagram native</div>
                        <div>• Product reveals</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Tech, youth brands, viral</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border-blue-600/30">
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">📹</span>
                        <span className="text-sm font-medium text-blue-300">Casey Neistat</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Documentary authenticity</div>
                        <div>• Lifestyle integration</div>
                        <div>• Handheld realism</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Services, productivity, lifestyle</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/20 border-purple-600/30">
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🎨</span>
                        <span className="text-sm font-medium text-purple-300">David Droga</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Premium emotional storytelling</div>
                        <div>• Cinematic production</div>
                        <div>• Brand positioning</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Luxury, financial, premium</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-900/20 border-red-600/30">
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">💰</span>
                        <span className="text-sm font-medium text-red-300">Mr Beast</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Massive scale production</div>
                        <div>• Viral challenges</div>
                        <div>• High-stakes value</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Mass market, gaming, food</div>
                    </CardContent>
                  </Card>
                </div>
              </HelpSection>

              <HelpSection 
                title="Templates & Export" 
                icon={<FileText className="w-5 h-5 text-green-500" />}
                badge="Ready-to-Use"
              >
                <div className="space-y-3">
                  <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                    <div className="text-sm font-medium text-green-300 mb-2">🚀 Pre-built Templates</div>
                    <div className="text-xs text-slate-300">
                      Product Launch • Service Demo • Brand Story • Testimonial • Comparison • How-To
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-600/30">
                      <div className="text-blue-300 font-medium">TikTok</div>
                      <div className="text-slate-400">9:16, 2s Hook</div>
                    </div>
                    <div className="text-center p-2 bg-purple-900/20 rounded border border-purple-600/30">
                      <div className="text-purple-300 font-medium">Instagram</div>
                      <div className="text-slate-400">1:1, Story Arc</div>
                    </div>
                    <div className="text-center p-2 bg-red-900/20 rounded border border-red-600/30">
                      <div className="text-red-300 font-medium">YouTube</div>
                      <div className="text-slate-400">16:9, 5s Hook</div>
                    </div>
                  </div>

                  <div className="bg-amber-900/20 p-3 rounded border border-amber-600/30">
                    <div className="text-sm font-medium text-amber-300 mb-1">💡 Quick Tips</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>• Use Templates button for instant scenarios</div>
                      <div>• Match director to brand personality</div>
                      <div>• Consider platform audience differences</div>
                      <div>• Export with professional formatting</div>
                    </div>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <HelpSection 
                title="Export System Mastery" 
                icon={<Download className="w-5 h-5 text-blue-500" />}
                badge="Professional"
              >
                <div className="space-y-4">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-300">🚀 Export Power Features</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div>
                        <div className="font-medium mb-1">⚡ Quick Actions:</div>
                        <div className="space-y-1 text-xs">
                          <div>• Copy All Shots 📋 - Instant clipboard access</div>
                          <div>• Export All Shots 📄 - Full page configuration</div>
                          <div>• Quick Save 💾 - One-click song preservation</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">🎯 Professional Formats:</div>
                        <div className="space-y-1 text-xs">
                          <div>• Film Production - Technical specifications</div>
                          <div>• Social Media - Platform-optimized</div>
                          <div>• CSV/JSON - Spreadsheet compatible</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ExampleCard
                    title="📋 Copy All Shots vs Export Page"
                    description="Choose the right tool for your workflow"
                    input="Generated 15 shots for hip-hop music video"
                    output="COPY ALL: Instant numbered list in clipboard\n1. Opening drone shot of Jay-Z's hometown...\n2. Performance shot of Jay-Z in recording studio...\n\nEXPORT PAGE: Full configuration with templates\n[MUSIC VIDEO PRODUCTION] Opening drone shot [Equipment: Drone + Steadicam]"
                    tips={[
                      "Copy All = Quick clipboard for immediate use",
                      "Export Page = Professional formatting with templates",
                      "Export Page has live preview and format options",
                      "Copy All respects current @artist toggle settings"
                    ]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-blue-300">📋 Export Templates</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-blue-300 font-medium">Camera Templates:</div>
                            <div className="text-slate-400">Wide Shot, Close-up, Drone/Aerial</div>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-green-300 font-medium">Lighting Templates:</div>
                            <div className="text-slate-400">Golden Hour, Dramatic Noir, Soft Natural</div>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-orange-300 font-medium">Technical Templates:</div>
                            <div className="text-slate-400">4K Professional, Cinematic Quality</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-purple-300">👁️ Variable Processing</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-purple-300 font-medium">@artist → Artist Name:</div>
                            <div className="text-slate-400">"@artist performs" → "Jay-Z performs"</div>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-purple-300 font-medium">@artist → Description:</div>
                            <div className="text-slate-400">"@artist performs" → "A confident Black male rapper performs"</div>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <div className="text-purple-300 font-medium">Other Variables:</div>
                            <div className="text-slate-400">@director, @chapter, @section</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>

            {/* Pro Tips Tab */}
            <TabsContent value="tips" className="space-y-6">
              <HelpSection 
                title="Power User Secrets" 
                icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
                badge="Advanced"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-yellow-900/20 border-yellow-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-yellow-300">⚡ Keyboard Shortcuts</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <kbd className="bg-slate-700 px-1 rounded">Ctrl+Enter</kbd>
                            <span>Generate/Extract in any textarea</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="bg-blue-600 px-1 rounded text-white">Copy All 📋</span>
                            <span>Instant clipboard access</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="bg-green-600 px-1 rounded text-white">Quick Save 💾</span>
                            <span>One-click song saving</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="bg-purple-600 px-1 rounded text-white">Templates ⭐</span>
                            <span>Load sample content instantly</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-900/20 border-green-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-green-300">🎯 Workflow Optimization</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-300">
                          <div><strong>For Testing:</strong> Use templates to populate content instantly</div>
                          <div><strong>For Production:</strong> Create detailed artist profiles first</div>
                          <div><strong>For Teams:</strong> Export as CSV for spreadsheet sharing</div>
                          <div><strong>For Social Media:</strong> Use @artist variables for reusable content</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-purple-300">🧠 Advanced Techniques</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-purple-300 font-medium mb-1">🎭 Director Mastery:</div>
                        <div className="text-slate-300 space-y-1">
                          <div>• Study each director's signature style</div>
                          <div>• Use director notes to enhance their approach</div>
                          <div>• Combine directors for unique hybrid styles</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-300 font-medium mb-1">🔄 Variable Mastery:</div>
                        <div className="text-slate-300 space-y-1">
                          <div>• @artist for flexible, reusable content</div>
                          <div>• Toggle modes to see both versions</div>
                          <div>• Use descriptions for specific projects</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-orange-300 font-medium mb-1">📈 Scaling Up:</div>
                        <div className="text-slate-300 space-y-1">
                          <div>• Save successful setups as templates</div>
                          <div>• Build artist profile libraries</div>
                          <div>• Export in different formats for teams</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ExampleCard
                    title="🎨 Creative Director Combinations"
                    description="Mix director styles for unique results"
                    input="Story: Psychological thriller\nDirector: David Fincher\nNotes: Add some Nolan-style practical effects and Kubrick symmetrical compositions"
                    output="INT. APARTMENT - NIGHT: Symmetrical wide shot of detective's apartment (Kubrick influence), cool color temperature with precise framing (Fincher style)\n\nINT. APARTMENT - NIGHT: Extreme close-up of evidence photos on wall, practical lighting from desk lamp creates dramatic shadows (Nolan influence)\n\nINT. APARTMENT - NIGHT: Slow push-in on detective's face as realization hits, digital color grading emphasizes psychological state (Fincher signature)"
                    tips={[
                      "Use director notes to blend multiple influences",
                      "Mention specific techniques (symmetry, lighting, camera movement)",
                      "Reference other directors for hybrid approaches",
                      "Experiment with different combinations for unique styles"
                    ]}
                  />
                </div>
              </HelpSection>
            </TabsContent>

            {/* Troubleshooting Tab */}
            <TabsContent value="troubleshooting" className="space-y-6">
              <HelpSection 
                title="Common Issues & Solutions" 
                icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                badge="Support"
              >
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Card className="bg-red-900/20 border-red-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-red-300">❌ "@artist shows literally instead of name"</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-2">
                          <div><strong>Problem:</strong> Shots show "@artist walking" instead of "Jay-Z walking"</div>
                          <div className="bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            <strong className="text-green-300">✅ Solution:</strong> Make sure you've selected an artist from Artist Bank. 
                            The @artist variable automatically becomes the artist name when an artist is selected.
                          </div>
                          <div><strong className="text-blue-300">🔧 How to Fix:</strong></div>
                          <ol className="space-y-1 ml-4">
                            <li>1. Go to Music Video mode</li>
                            <li>2. Click the Artist dropdown and select an artist</li>
                            <li>3. Generate new shots - @artist will now show the name</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-900/20 border-orange-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          <span className="font-medium text-orange-300">⚠️ "Extract References button doesn't work"</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-2">
                          <div><strong>Problem:</strong> Button appears to do nothing or shows error</div>
                          <div className="bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            <strong className="text-green-300">✅ Solution:</strong> Check your internet connection and ensure OpenAI API key is configured. 
                            The system needs AI access to analyze your story.
                          </div>
                          <div><strong className="text-blue-300">🔧 Troubleshooting Steps:</strong></div>
                          <ol className="space-y-1 ml-4">
                            <li>1. Check internet connection</li>
                            <li>2. Verify story is at least 50 words long</li>
                            <li>3. Try refreshing the page</li>
                            <li>4. Contact admin about API key configuration</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-900/20 border-blue-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-blue-300">ℹ️ "Copy to clipboard not working"</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-2">
                          <div><strong>Problem:</strong> Copy buttons show error or don't copy</div>
                          <div className="bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            <strong className="text-green-300">✅ Solution:</strong> Browser clipboard permissions issue. 
                            Use the Export Page download option instead.
                          </div>
                          <div><strong className="text-blue-300">🔧 Alternative Methods:</strong></div>
                          <ol className="space-y-1 ml-4">
                            <li>1. Click "Export All Shots" → Export page</li>
                            <li>2. Use "Download File" option</li>
                            <li>3. Manually select and copy text from preview</li>
                            <li>4. Try different browser (Chrome usually works best)</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-900/20 border-purple-600/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-purple-300">🔄 "Template not loading correctly"</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-2">
                          <div><strong>Problem:</strong> Template loads but content seems wrong or incomplete</div>
                          <div className="bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            <strong className="text-green-300">✅ Solution:</strong> Templates overwrite current content. 
                            Make sure you want to replace your current work before loading.
                          </div>
                          <div><strong className="text-blue-300">🔧 Best Practices:</strong></div>
                          <ol className="space-y-1 ml-4">
                            <li>1. Save your current work first (Quick Save 💾)</li>
                            <li>2. Load template</li>
                            <li>3. Modify template content as needed</li>
                            <li>4. Generate shots with template content</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </HelpSection>

              <HelpSection 
                title="Performance & Best Practices" 
                icon={<Rocket className="w-5 h-5 text-green-500" />}
                badge="Optimization"
              >
                <div className="space-y-4">
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-green-300">✨ Getting the Best Results</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="text-green-300 font-medium">📚 For Stories:</div>
                        <div className="text-slate-300 space-y-1">
                          <div>• Keep stories 200-2000 words for best results</div>
                          <div>• Use specific character names (Sarah Chen, not "the detective")</div>
                          <div>• Include clear locations and action sequences</div>
                          <div>• Be descriptive about settings and atmosphere</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-purple-300 font-medium">🎵 For Music Videos:</div>
                        <div className="text-slate-300 space-y-1">
                          <div>• Use proper song structure [Verse], [Chorus], [Bridge]</div>
                          <div>• Create detailed Artist Bank profiles</div>
                          <div>• Include visual concepts and themes</div>
                          <div>• Specify performance vs narrative balance</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-300">⭐ Template Mastery</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div>• Start with sample templates to learn</div>
                          <div>• Save successful setups for reuse</div>
                          <div>• Create template libraries for projects</div>
                          <div>• Use Quick Save 💾 for rapid iteration</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Copy className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-300">📋 Export Mastery</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div>• Copy All 📋 for quick sharing</div>
                          <div>• Export Page for professional formatting</div>
                          <div>• Use templates for consistent formatting</div>
                          <div>• Save export configurations as templates</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">👥 Artist Mastery</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div>• Build detailed Artist Bank profiles</div>
                          <div>• Use visual descriptions for consistency</div>
                          <div>• Toggle between name and description modes</div>
                          <div>• Watch for artist indicator 🎤 in top-right</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-4 h-4 text-amber-400" />
                      <span className="font-medium text-amber-300">🚀 Machine King Labs Research Tips</span>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p>
                        <strong>🔬 Research Approach:</strong> Experiment with different director styles on the same story to understand 
                        how AI interprets and applies visual language. Document what works best for different story types.
                      </p>
                      <p>
                        <strong>📊 Data Collection:</strong> Use the export system to build libraries of successful prompts and results. 
                        Track which director/story combinations produce the most useful outputs.
                      </p>
                      <p>
                        <strong>🤝 Community Contribution:</strong> Share successful templates and techniques with the open source community. 
                        Your discoveries help advance AI-assisted creativity research.
                      </p>
                    </div>
                  </div>
                </div>
              </HelpSection>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}