'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft,
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
  Info,
  HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

export default function HelpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-500" />
                  Director's Palette Help Center
                </h1>
                <p className="text-slate-400">Machine King Labs AI Research Project</p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white">
              🔬 Research Platform
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-7xl p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
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
            <TabsTrigger value="children-book" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Children's Books
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Export System
            </TabsTrigger>
            <TabsTrigger value="credits" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Credits & Costs
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Pro Tips
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Enhanced with Hero Images */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Image Section */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-600 mb-8">
              <div className="absolute inset-0">
                <img 
                  src="/images/heroes/one-story-every-medium-hero.jpg" 
                  alt="One Story Every Medium" 
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90"></div>
              </div>
              <div className="relative z-10 p-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  One Story, Every Medium
                </h2>
                <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  Transform your creative vision across films, music videos, commercials, and children's books - all with consistent characters.
                </p>
              </div>
            </div>

            <HelpSection 
              title="What is Director's Palette?" 
              icon={<Palette className="w-5 h-5 text-purple-500" />}
              badge="Research Project"
            >
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-blue-400" />
                    <div>
                      <span className="text-lg font-bold text-blue-300">🔬 AI Research Platform</span>
                      <div className="text-sm text-slate-400">Machine King Labs</div>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Director's Palette is a <strong>Machine King Labs research project</strong> that explores how AI can enhance human creativity in storytelling and visual production. Transform stories and music into professional shot lists using AI-powered director-specific styling.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-green-900/20 border-green-600/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-green-400" />
                        <span className="text-lg font-bold text-green-300">📚 Story Mode</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Transform written stories into cinematic shot lists with director-specific styling. 
                        Perfect for filmmakers, screenwriters, and content creators.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Christopher Nolan</Badge>
                        <Badge variant="outline" className="text-xs">David Fincher</Badge>
                        <Badge variant="outline" className="text-xs">Quentin Tarantino</Badge>
                        <Badge variant="outline" className="text-xs">Greta Gerwig</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/20 border-purple-600/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Music className="w-6 h-6 text-purple-400" />
                        <span className="text-lg font-bold text-purple-300">🎵 Music Video Mode</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Create music video breakdowns with artist integration and visual storytelling. 
                        Perfect for musicians, video creators, and music producers.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Hype Williams</Badge>
                        <Badge variant="outline" className="text-xs">Michel Gondry</Badge>
                        <Badge variant="outline" className="text-xs">Spike Jonze</Badge>
                        <Badge variant="outline" className="text-xs">Dave Meyers</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-amber-400" />
                    <span className="text-lg font-bold text-amber-300">🎯 Key Features</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">AI Shot Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Artist Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Professional Export</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Template System</span>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-bold text-green-300">📚 Try Story Mode First</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Enter a story in the textarea",
                        "Select a director (try David Fincher)",
                        "Click 'Extract References' or press Ctrl+Enter",
                        "Review and generate shots", 
                        "Click 'Copy All Shots' for instant results! 📋"
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-400" />
                      <span className="text-lg font-bold text-purple-300">🎵 Try Music Video Mode</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Switch to Music Video mode",
                        "Select an artist from Artist Bank",
                        "Enter lyrics or use a template",
                        "Press Ctrl+Enter to generate",
                        "Toggle between @artist and descriptions 🔄"
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 p-4 rounded border border-blue-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-yellow-300">💡 Pro Tip</span>
                  </div>
                  <p className="text-slate-300">
                    Use the <strong>Templates</strong> button to load sample content and learn the system quickly! 
                    Perfect for testing and understanding how different directors work.
                  </p>
                </div>
              </div>
            </HelpSection>
          </TabsContent>

          {/* Story Mode Comprehensive Guide */}
          <TabsContent value="story" className="space-y-6">
            {/* Character Consistency Hero */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-600 mb-8">
              <div className="absolute inset-0">
                <img 
                  src="/images/heroes/character-consistency-hero.jpg" 
                  alt="Character Consistency" 
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/85"></div>
              </div>
              <div className="relative z-10 p-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  Character Consistency System
                </h2>
                <p className="text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  Maintain visual consistency across all your creative projects with @character references
                </p>
              </div>
            </div>

            <HelpSection 
              title="📚 Story Mode Complete Guide" 
              icon={<BookOpen className="w-5 h-5 text-green-500" />}
              badge="Film & TV"
            >
              <div className="space-y-6">
                <div className="bg-green-900/20 p-6 rounded-lg border border-green-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Film className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="text-xl font-bold text-green-300">🎬 What Story Mode Does</h3>
                      <p className="text-green-200 text-sm">Transform written stories into cinematic shot lists</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Story Mode uses AI to analyze your narrative and create professional shot breakdowns with director-specific styling. 
                    Perfect for filmmakers, screenwriters, and content creators who want to visualize their stories.
                  </p>
                </div>

                {/* Example Workflow */}
                <ExampleCard
                  title="🕵️ Detective Thriller Complete Example"
                  description="See how a crime story becomes a professional shot list"
                  input="Detective Sarah Chen walked through the dimly lit warehouse, her flashlight cutting through the darkness. She noticed a red briefcase sitting on the metal table in the center of the room. The killer had left behind evidence - a bloody knife next to the briefcase. Sarah called her partner Mike Rodriguez on her radio. 'Mike, I found something important at the old warehouse on Fifth Street,' she said."
                  output="1. EXT. WAREHOUSE DISTRICT - NIGHT: Wide establishing shot of abandoned industrial area, rain glistening on asphalt, Detective Sarah Chen's car approaching through empty streets\n\n2. INT. WAREHOUSE - NIGHT: Medium shot of Detective Sarah entering through broken door, flashlight beam cutting through darkness, footsteps echoing in empty space\n\n3. INT. WAREHOUSE - NIGHT: Close-up of red briefcase on metal table, camera slowly pushes in, building tension and mystery\n\n4. INT. WAREHOUSE - NIGHT: Extreme close-up of bloody knife next to briefcase, dramatic lighting reveals evidence of violence\n\n5. INT. WAREHOUSE - NIGHT: Over-the-shoulder shot of Sarah photographing evidence with professional camera, methodical police work\n\n6. INT. WAREHOUSE - NIGHT: Wide shot showing Sarah calling Mike Rodriguez on radio, crime scene dramatically lit in background"
                  tips={[
                    "Use specific character names (Sarah Chen) for better reference extraction",
                    "Include clear locations (warehouse, Fifth Street) for establishing shots", 
                    "Mention props (briefcase, knife) for detail shots",
                    "Try David Fincher or Christopher Nolan for thriller stories",
                    "Use 'Copy All Shots' button for instant clipboard access"
                  ]}
                />

                {/* Director Styles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50">
                    <CardContent className="pt-4">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-400" />
                        🎭 Director Styles Available
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Christopher Nolan</span>
                          <span className="text-blue-300">Complex, IMAX, Practical Effects</span>
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
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        ⚡ Quick Actions Available
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <kbd className="bg-slate-700 px-1 rounded text-xs">Ctrl+Enter</kbd>
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
          </TabsContent>

          {/* Music Video Mode Guide */}
          <TabsContent value="music-video" className="space-y-6">
            <HelpSection 
              title="🎵 Music Video Mode Complete Guide" 
              icon={<Music className="w-5 h-5 text-purple-500" />}
              badge="Artist Integration"
            >
              <div className="space-y-6">
                <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <PlayCircle className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-300">🎵 What Music Video Mode Does</h3>
                      <p className="text-purple-200 text-sm">Create music video breakdowns with artist integration</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Music Video Mode analyzes song lyrics and creates section-specific shots that integrate with Artist Bank profiles. 
                    The @artist variable system lets you create reusable templates or specific artist descriptions.
                  </p>
                </div>

                <ExampleCard
                  title="🎤 Hip-Hop Success Story Complete Example"
                  description="From lyrics to professional music video shot breakdown"
                  input="Artist: Jay-Z (from Artist Bank)\nLyrics:\n[Verse 1]\nStarted from the bottom now we here\nCity lights reflecting all my fears\nGrinding every day, no time for tears\nBuilding up my empire year by year\n\n[Chorus]\nRising up, never gonna fall\nStanding tall against it all\nFrom the streets to the penthouse hall\nI remember when I had it all"
                  output="INTRO: Establishing drone shot of Jay-Z's hometown Brooklyn neighborhood at golden hour, showing authentic roots and origin story\n\nVERSE 1: Performance shot of Jay-Z rapping first verse in high-end recording studio, close-up with professional microphone, intense focus and determination\n\nVERSE 1: Lifestyle montage of Jay-Z in luxury car driving through same neighborhood where he started, showing success progression\n\nCHORUS: Wide shot of Jay-Z performing on stage with full crowd, multiple camera angles, high energy, triumph and vindication\n\nCHORUS: Crowd reaction shots intercut with Jay-Z's performance, building energy and connection with audience"
                  tips={[
                    "Select artist from Artist Bank for auto-population of name and visual details",
                    "Use [Verse], [Chorus], [Bridge] structure in lyrics for best AI analysis",
                    "Toggle between @artist variable and full description modes", 
                    "Try Hype Williams for hip-hop or Michel Gondry for creative concepts",
                    "Use Quick Save 💾 button next to song title for instant saving",
                    "Click 'Copy All Shots' for immediate formatted results"
                  ]}
                />
              </div>
            </HelpSection>
          </TabsContent>

          {/* Commercial Mode Complete Guide */}
          <TabsContent value="commercial" className="space-y-6">
            {/* Commercial Editorial Hero */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-600 mb-8">
              <div className="absolute inset-0">
                <img 
                  src="/images/heroes/commercial-editorial-hero.jpg" 
                  alt="Commercial Editorial" 
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/85"></div>
              </div>
              <div className="relative z-10 p-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  Professional Commercial Production
                </h2>
                <p className="text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  Create platform-optimized brand commercials with director-specific styling
                </p>
              </div>
            </div>
            <HelpSection 
              title="🎯 Commercial Mode Complete Guide" 
              icon={<Target className="w-5 h-5 text-orange-500" />}
              badge="Brand Marketing"
            >
              <div className="space-y-6">
                <div className="bg-orange-900/20 p-6 rounded-lg border border-orange-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8 text-orange-400" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-300">🎯 What Commercial Mode Does</h3>
                      <p className="text-orange-200 text-sm">Create platform-optimized brand commercials with director-specific styling</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Commercial Mode transforms brand briefs into professional commercial shot lists optimized for specific platforms (TikTok, Instagram, YouTube). 
                    AI analyzes your brand story and creates director-specific commercials with platform optimization and brand integration.
                  </p>
                </div>

                <ExampleCard
                  title="🏃‍♂️ Nike Sneaker Launch Commercial Example"
                  description="From brand brief to platform-optimized commercial shot list"
                  input="Brand: Nike\nProduct: Air Max Collection\nTarget Audience: Gen Z sneaker enthusiasts and athletes\nCampaign Goals: Build excitement for new sneaker drop, showcase performance benefits\nKey Messages: Revolutionary comfort technology, street style meets performance\nDirector: Zach King (viral transformation style)\nPlatform: TikTok (10 seconds)\nConcept: Magical transformation showing old sneakers instantly becoming new Air Max"
                  output="1. HOOK (0-2s): Close-up of worn-out sneakers on feet, person looking disappointed walking on street\n\n2. PROBLEM (2-4s): Quick cuts showing discomfort - grimacing while running, slipping on basketball court\n\n3. MAGIC MOMENT (4-6s): Zach King signature transition - person steps behind wall, instantly emerges with fresh Nike Air Max, confident stride\n\n4. TRANSFORMATION (6-8s): Dynamic shots of new performance - smooth running, perfect basketball shot, street style confidence\n\n5. BRAND CTA (8-10s): Nike Air Max logo with text overlay 'Revolutionary Comfort Drops Friday' + swipe up link"
                  tips={[
                    "Be specific about your target audience for better shot targeting",
                    "Include clear campaign goals and key messages in your brief",
                    "Try different directors: Zach King (viral), Casey Neistat (authentic), David Droga (premium)",
                    "Consider platform: TikTok (9:16, quick hook), Instagram (1:1, story-focused), YouTube (16:9, longer narrative)",
                    "Use Templates button for pre-built commercial scenarios",
                    "Export to production teams with professional formatting"
                  ]}
                />

                {/* Commercial Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50">
                    <CardContent className="pt-4">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        🚀 5-Step Commercial Workflow
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 p-2 bg-blue-900/20 rounded border-l-4 border-blue-500">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                          <span className="text-blue-300">Brand Brief Input</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-purple-900/20 rounded border-l-4 border-purple-500">
                          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                          <span className="text-purple-300">Director Selection</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-green-900/20 rounded border-l-4 border-green-500">
                          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                          <span className="text-green-300">Platform Optimization</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-orange-900/20 rounded border-l-4 border-orange-500">
                          <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                          <span className="text-orange-300">AI Generation</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-red-900/20 rounded border-l-4 border-red-500">
                          <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                          <span className="text-red-300">Export & Production</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50">
                    <CardContent className="pt-4">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Film className="w-5 h-5 text-cyan-400" />
                        🎬 Platform Optimization Features
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">TikTok</span>
                          <Badge variant="outline" className="text-pink-300">9:16, 2s Hook, Viral</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Instagram</span>
                          <Badge variant="outline" className="text-purple-300">1:1, Story Arc, Aesthetic</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">YouTube</span>
                          <Badge variant="outline" className="text-red-300">16:9, 5s Hook, Subscribe CTA</Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-3">
                          Each platform gets optimized aspect ratios, timing, and call-to-action strategies
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </HelpSection>

            <HelpSection 
              title="🎭 Commercial Director Showcase" 
              icon={<Users className="w-5 h-5 text-blue-500" />}
              badge="6 Directors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✨</span>
                      <span className="font-medium text-yellow-300">Zach King</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Viral transformation magic</div>
                      <div>• Mobile-optimized creativity</div>
                      <div>• Product reveal mastery</div>
                      <div>• TikTok/Instagram native</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-green-600 text-white">Creativity: 10</Badge>
                      <Badge className="bg-blue-600 text-white">Engagement: 10</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Tech products, youth brands, viral campaigns</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📹</span>
                      <span className="font-medium text-blue-300">Casey Neistat</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Documentary authenticity</div>
                      <div>• Handheld realism</div>
                      <div>• Lifestyle integration</div>
                      <div>• YouTube/Instagram focus</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-green-600 text-white">Authenticity: 10</Badge>
                      <Badge className="bg-purple-600 text-white">Engagement: 9</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Services, productivity tools, lifestyle brands</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎨</span>
                      <span className="font-medium text-purple-300">David Droga</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Premium emotional storytelling</div>
                      <div>• Cinematic production value</div>
                      <div>• Brand positioning mastery</div>
                      <div>• YouTube premium focus</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-yellow-600 text-white">Premium: 10</Badge>
                      <Badge className="bg-green-600 text-white">Creativity: 9</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Luxury brands, financial services, premium positioning</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💰</span>
                      <span className="font-medium text-red-300">Mr Beast</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Massive scale production</div>
                      <div>• Viral challenge elements</div>
                      <div>• High-stakes value propositions</div>
                      <div>• YouTube/TikTok optimized</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-blue-600 text-white">Engagement: 10</Badge>
                      <Badge className="bg-green-600 text-white">Creativity: 9</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Mass market brands, gaming, food & beverage</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎬</span>
                      <span className="font-medium text-green-300">Lucia Aniello</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Sophisticated humor</div>
                      <div>• Emmy-winning storytelling</div>
                      <div>• Premium entertainment value</div>
                      <div>• YouTube/Instagram focus</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-green-600 text-white">Creativity: 9</Badge>
                      <Badge className="bg-yellow-600 text-white">Premium: 8</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Entertainment brands, subscription services, sophisticated humor</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👑</span>
                      <span className="font-medium text-gray-300">Ridley Scott</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>• Epic cinematic scale</div>
                      <div>• Cultural icon creation</div>
                      <div>• Legendary brand storytelling</div>
                      <div>• YouTube premium focus</div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <Badge className="bg-yellow-600 text-white">Premium: 10</Badge>
                      <Badge className="bg-green-600 text-white">Creativity: 10</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Best for: Automotive, heritage brands, revolutionary products</div>
                  </CardContent>
                </Card>
              </div>
            </HelpSection>

            <HelpSection 
              title="📊 Commercial Templates & Categories" 
              icon={<FileText className="w-5 h-5 text-green-500" />}
              badge="Pre-built Scenarios"
            >
              <div className="space-y-4">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-300">🚀 Ready-to-Use Commercial Templates</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Commercial Mode includes pre-built templates for common scenarios. Each template provides brand/product placeholders, 
                    suggested directors, and platform optimization settings for immediate use.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-blue-900/20 border-blue-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🚀</span>
                        <span className="text-sm font-medium text-blue-300">Product Launch</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Tech Product Reveals</div>
                        <div>• Fashion Collection Drops</div>
                        <div>• Consumer Electronics</div>
                        <div>• Before/After Transformations</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/20 border-purple-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🛠️</span>
                        <span className="text-sm font-medium text-purple-300">Service Demo</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Productivity Tools</div>
                        <div>• Food Delivery Services</div>
                        <div>• Software Demonstrations</div>
                        <div>• Professional How-To</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-900/20 border-orange-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📖</span>
                        <span className="text-sm font-medium text-orange-300">Brand Story</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Luxury Heritage</div>
                        <div>• Sustainability Initiatives</div>
                        <div>• Company Values</div>
                        <div>• Mission-Driven Content</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-cyan-900/20 border-cyan-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💬</span>
                        <span className="text-sm font-medium text-cyan-300">Testimonial</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Customer Success Stories</div>
                        <div>• User Experience Showcases</div>
                        <div>• Social Proof Content</div>
                        <div>• Case Study Narratives</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-900/20 border-yellow-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚖️</span>
                        <span className="text-sm font-medium text-yellow-300">Comparison</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Competitive Advantages</div>
                        <div>• Feature Comparisons</div>
                        <div>• Problem vs Solution</div>
                        <div>• Upgrade Demonstrations</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-900/20 border-green-600/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📚</span>
                        <span className="text-sm font-medium text-green-300">How-To/Tutorial</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>• Creative Tutorials</div>
                        <div>• Professional Workflows</div>
                        <div>• Educational Content</div>
                        <div>• Step-by-Step Guides</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </HelpSection>
          </TabsContent>

          {/* Credits & Costs Guide */}
          <TabsContent value="credits" className="space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              <div>• 5 HD images: 190 credits</div>
                              <div>• <strong>Total Monthly: ~200 credits</strong></div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-white mb-2">🚀 Power Creator (All Modes)</div>
                            <div className="space-y-1 text-slate-300">
                              <div>• 25 stories + music videos (FREE)</div>
                              <div>• 20 HD images: 750 credits</div>
                              <div>• 10 minutes audio processing: 50 credits</div>
                              <div>• <strong>Total Monthly: ~800 credits</strong></div>
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
                        <div className="text-xs text-slate-400 mt-1">~20 HD images</div>
                      </div>
                      <div className="text-center p-4 bg-purple-900/20 rounded border ring-2 ring-amber-500/50">
                        <div className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full mb-1">Most Popular</div>
                        <div className="text-2xl font-bold text-purple-400">$10</div>
                        <div className="text-sm text-white font-medium">Power Boost</div>
                        <div className="text-lg font-bold text-amber-400">+1,500 credits</div>
                        <div className="text-xs text-slate-400 mt-1">~60 HD images</div>
                      </div>
                      <div className="text-center p-4 bg-green-900/20 rounded border">
                        <div className="text-2xl font-bold text-green-400">$30</div>
                        <div className="text-sm text-white font-medium">Mega Boost</div>
                        <div className="text-lg font-bold text-amber-400">+5,000 credits</div>
                        <div className="text-xs text-slate-400 mt-1">~200 HD images</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </HelpSection>
          </TabsContent>

          {/* Export System Guide */}
          <TabsContent value="export" className="space-y-6">
            <HelpSection 
              title="📤 Export System Complete Guide" 
              icon={<FileText className="w-5 h-5 text-blue-500" />}
              badge="Professional Output"
            >
              <div className="space-y-6">
                <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Download className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-300">📋 Enhanced Shot List Manager</h3>
                      <p className="text-blue-200 text-sm">Professional shot management with export capabilities</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    The new Shot List tab in Post Production provides comprehensive shot management with grouping, filtering, and export configuration. 
                    Use prefix/suffix formatting to create production-ready shot lists for different teams.
                  </p>
                </div>

                <ExampleCard
                  title="📋 Shot List Export with Formatting Example"
                  description="Transform shots into professional production formats"
                  input="Generated shots from hip-hop music video:\n1. Opening drone shot of artist's hometown\n2. Performance shot in recording studio\n3. Lifestyle montage in luxury car\n\nExport Configuration:\nPrefix: '[MUSIC VIDEO PRODUCTION]'\nSuffix: ', hip-hop style, urban aesthetic, 4K resolution'"
                  output="1. [MUSIC VIDEO PRODUCTION] Opening drone shot of Jay-Z's hometown, hip-hop style, urban aesthetic, 4K resolution\n\n2. [MUSIC VIDEO PRODUCTION] Performance shot of Jay-Z in recording studio, hip-hop style, urban aesthetic, 4K resolution\n\n3. [MUSIC VIDEO PRODUCTION] Lifestyle montage of Jay-Z in luxury car, hip-hop style, urban aesthetic, 4K resolution"
                  tips={[
                    "Access Shot List via Post Production → Shot List tab",
                    "Shots automatically grouped by chapter/section by default",
                    "Use People/Places/Props filters to find specific shot types",
                    "Click 'Export Config' to set prefix/suffix formatting",
                    "Search functionality works across shots, chapters, and metadata",
                    "Individual actions: Copy, Edit, Delete, Send to Gen4, Mark Complete"
                  ]}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-900/20 border-green-600/30">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Film className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <h4 className="font-bold text-green-300 mb-2">🎬 For Filmmakers</h4>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Prefix:</strong> [PRODUCTION SHOT LIST]</div>
                          <div><strong>Suffix:</strong> [Equipment: RED Camera] [Crew: DP Required]</div>
                          <div><strong>Result:</strong> Professional shot lists ready for production teams</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/20 border-purple-600/30">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Camera className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <h4 className="font-bold text-purple-300 mb-2">📱 For Social Media</h4>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Prefix:</strong> [SOCIAL MEDIA CLIP]</div>
                          <div><strong>Suffix:</strong> [Platform: Instagram/TikTok] [Duration: 15-60s]</div>
                          <div><strong>Result:</strong> Platform-optimized content descriptions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-900/20 border-orange-600/30">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Settings className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                        <h4 className="font-bold text-orange-300 mb-2">🎯 For Production Teams</h4>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div><strong>Format:</strong> CSV/JSON with metadata</div>
                          <div><strong>Includes:</strong> Chapter, director style, timestamps</div>
                          <div><strong>Result:</strong> Organized data for production planning</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </HelpSection>
          </TabsContent>

          {/* Additional tabs would include the same content... */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <HelpSection 
              title="Common Issues & Solutions" 
              icon={<AlertCircle className="w-5 h-5 text-red-500" />}
              badge="Support"
            >
              <div className="space-y-4">
                <Card className="bg-red-900/20 border-red-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="font-bold text-red-300">❌ Artist Profile Creation Fails</span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div><strong>Problem:</strong> Entering artist description doesn't generate profile</div>
                      <div className="bg-green-900/20 p-3 rounded border-l-2 border-green-500">
                        <strong className="text-green-300">✅ Solution:</strong> This requires an OpenAI API key to be configured. 
                        Contact your admin to set up the API key for AI generation functionality.
                      </div>
                      <div><strong className="text-blue-300">🔧 Admin Setup Required:</strong></div>
                      <ol className="space-y-1 ml-4 text-xs">
                        <li>1. Get OpenAI API key from openai.com</li>
                        <li>2. Add OPENAI_API_KEY to environment variables</li>
                        <li>3. Restart the application</li>
                        <li>4. Artist generation will then work</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-900/20 border-orange-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <span className="font-bold text-orange-300">⚠️ "@artist shows literally instead of name"</span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div><strong>Problem:</strong> Shots show "@artist walking" instead of "Jay-Z walking"</div>
                      <div className="bg-green-900/20 p-3 rounded border-l-2 border-green-500">
                        <strong className="text-green-300">✅ Solution:</strong> Make sure you've selected an artist from Artist Bank. 
                        The @artist variable automatically becomes the artist name when an artist is selected.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-600/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-blue-300">ℹ️ Shot Queue Too Narrow</span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div><strong>Problem:</strong> Can't see full shot descriptions or manage shots properly</div>
                      <div className="bg-green-900/20 p-3 rounded border-l-2 border-green-500">
                        <strong className="text-green-300">✅ Solution:</strong> Use the new "Shot List" tab in Post Production for full shot management with editing, copying, and metadata viewing.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </HelpSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}