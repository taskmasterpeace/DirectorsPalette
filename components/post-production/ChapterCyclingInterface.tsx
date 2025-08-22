'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Sparkles,
  BookOpen,
  Music
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { PostProductionShot } from '@/lib/post-production/types'

interface ChapterCyclingInterfaceProps {
  shots: PostProductionShot[]
  onGenerateShot: (shot: PostProductionShot) => void
  generatedShots?: Set<string>
  className?: string
}

export function ChapterCyclingInterface({
  shots,
  onGenerateShot,
  generatedShots = new Set(),
  className = ''
}: ChapterCyclingInterfaceProps) {
  const { toast } = useToast()
  const [currentShotIndex, setCurrentShotIndex] = useState(0)
  
  // Group shots by chapter/section
  const groupedShots = shots.reduce((groups, shot) => {
    const groupKey = shot.sourceChapter || shot.sourceSection || 'Unknown'
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(shot)
    return groups
  }, {} as { [key: string]: PostProductionShot[] })

  const groupNames = Object.keys(groupedShots)
  const currentShot = shots[currentShotIndex]
  const currentGroup = currentShot ? (currentShot.sourceChapter || currentShot.sourceSection || 'Unknown') : null
  
  // Calculate progress
  const totalShots = shots.length
  const generatedCount = shots.filter(shot => generatedShots.has(shot.id)).length
  const progressPercentage = totalShots > 0 ? (generatedCount / totalShots) * 100 : 0

  const handlePrevious = () => {
    setCurrentShotIndex(Math.max(0, currentShotIndex - 1))
  }

  const handleNext = () => {
    setCurrentShotIndex(Math.min(shots.length - 1, currentShotIndex + 1))
  }

  const handleGenerate = () => {
    if (currentShot) {
      onGenerateShot(currentShot)
      toast({
        title: "Generation Started",
        description: `Generating image for shot ${currentShotIndex + 1}`
      })
    }
  }

  const isCurrentShotGenerated = currentShot && generatedShots.has(currentShot.id)

  if (shots.length === 0) {
    return (
      <Card className={`bg-amber-900/20 border-amber-600/30 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Circle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-medium text-amber-300 mb-1">No Shots Available</h3>
            <p className="text-sm text-slate-400">
              Generate shots in Story Mode or Music Video Mode first
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Overview */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Shot Generation
            </div>
            <Badge variant="outline">
              {generatedCount} / {totalShots} Generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Generation Progress</span>
              <span className="text-slate-400">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Current Shot Display */}
          {currentShot && (
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentShot.projectType === 'story' ? (
                    <BookOpen className="w-4 h-4 text-green-400" />
                  ) : (
                    <Music className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="font-medium text-white">
                    {currentGroup} - Shot {currentShotIndex + 1}
                  </span>
                  {isCurrentShotGenerated && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <Badge variant={isCurrentShotGenerated ? 'default' : 'outline'}>
                  {isCurrentShotGenerated ? '✅ Generated' : '⏳ Pending'}
                </Badge>
              </div>
              
              <div className="text-sm text-slate-300 leading-relaxed">
                {currentShot.description}
              </div>
              
              {/* Navigation and Generation Controls */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentShotIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isCurrentShotGenerated}
                  className={isCurrentShotGenerated ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                  size="sm"
                >
                  {isCurrentShotGenerated ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Generated
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Send to Gen4 Prompt
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentShotIndex === shots.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Chapter/Section Overview */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              📚 Chapter/Section Overview
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {groupNames.map((groupName) => {
                const groupShots = groupedShots[groupName]
                const groupGenerated = groupShots.filter(shot => generatedShots.has(shot.id)).length
                const groupProgress = (groupGenerated / groupShots.length) * 100
                
                return (
                  <Card key={groupName} className="bg-slate-800/50">
                    <CardContent className="pt-3">
                      <div className="text-xs font-medium text-white mb-1 truncate">
                        {groupName}
                      </div>
                      <div className="text-xs text-slate-400 mb-2">
                        {groupGenerated}/{groupShots.length} generated
                      </div>
                      <Progress value={groupProgress} className="h-1" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}