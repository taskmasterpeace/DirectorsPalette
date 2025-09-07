'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  BookOpen,
  Music,
  Target,
  FileText,
  Zap,
  Lightbulb,
  Settings,
  Brain,
  Rocket
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Import the modular help components
import { OverviewSection } from '@/components/help/OverviewSection'
import { CreditsSection } from '@/components/help/CreditsSection'

export default function HelpPageRefactored() {
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
            <TabsTrigger value="credits" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Credits & Costs
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <CreditsSection />
          </TabsContent>

          {/* Story Mode Tab */}
          <TabsContent value="story" className="space-y-6">
            <div className="text-center py-12 bg-slate-800/50 rounded-lg">
              <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Story Mode Guide</h3>
              <p className="text-slate-300">Detailed story mode documentation coming soon</p>
            </div>
          </TabsContent>

          {/* Music Video Tab */}
          <TabsContent value="music-video" className="space-y-6">
            <div className="text-center py-12 bg-slate-800/50 rounded-lg">
              <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Music Video Guide</h3>
              <p className="text-slate-300">Detailed music video documentation coming soon</p>
            </div>
          </TabsContent>

          {/* Commercial Tab */}
          <TabsContent value="commercial" className="space-y-6">
            <div className="text-center py-12 bg-slate-800/50 rounded-lg">
              <Target className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Commercial Guide</h3>
              <p className="text-slate-300">Detailed commercial documentation coming soon</p>
            </div>
          </TabsContent>

          {/* Children's Book Tab */}
          <TabsContent value="children-book" className="space-y-6">
            <div className="text-center py-12 bg-slate-800/50 rounded-lg">
              <BookOpen className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Children's Book Guide</h3>
              <p className="text-slate-300">Detailed children's book documentation coming soon</p>
            </div>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <div className="text-center py-12 bg-slate-800/50 rounded-lg">
              <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Troubleshooting Guide</h3>
              <p className="text-slate-300">Common issues and solutions coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}