'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain,
  BookOpen,
  Music,
  Star,
  Zap,
  Users,
  FileText,
  Sparkles
} from 'lucide-react'
import { HelpSection } from './HelpSection'

export function OverviewSection() {
  return (
    <div className="space-y-6">
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
        icon={<Brain className="w-5 h-5 text-purple-500" />}
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
    </div>
  )
}