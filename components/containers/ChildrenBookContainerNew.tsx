'use client'

import { useState } from 'react'
import { TemplateBanner } from '@/components/shared/TemplateBanner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Target, Send, Sparkles, Copy, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { extractBookReferences } from '@/app/actions/children-book/generation'
import { ManualShotSelector } from '@/components/prototypes/ManualShotSelector'
import { SendToPostProduction } from '@/components/shared/SendToPostProduction'

// Age Groups removed - not needed for core functionality

interface ChildrenBookShot {
  id: string
  sourceText: string
  description: string
  timestamp: Date
  pageNumber: number
  ageGroup: string
  contextBefore: string
  contextAfter: string
}

export function ChildrenBookContainerNew() {
  const { toast } = useToast()
  const [story, setStory] = useState('')
  const [theme, setTheme] = useState('')
  const [extractedReferences, setExtractedReferences] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [bookShots, setBookShots] = useState<ChildrenBookShot[]>([])
  const [showManualSelector, setShowManualSelector] = useState(false)

  // Extract characters, locations, and props (same as other modes)
  const handleExtractReferences = async () => {
    if (!story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter your children's book story to extract references.",
        variant: "destructive"
      })
      return
    }

    setIsExtracting(true)
    try {
      const result = await extractBookReferences(story)
      
      if (result.success && result.data) {
        setExtractedReferences(result.data)
        const totalRefs = result.data.characters.length + result.data.locations.length + result.data.props.length
        toast({
          title: "References Extracted!",
          description: `Found ${result.data.characters.length} characters, ${result.data.locations.length} locations, ${result.data.props.length} props`
        })
        
        // Enable manual shot selection
        setShowManualSelector(true)
      } else {
        throw new Error(result.error || 'Extraction failed')
      }
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract references",
        variant: "destructive"
      })
    } finally {
      setIsExtracting(false)
    }
  }

  // Handle manual shot generation with book-specific context
  const handleShotsGenerated = (shots: any[]) => {
    const bookShots: ChildrenBookShot[] = shots.map((shot, index) => ({
      id: `book_page_${index + 1}_${Date.now()}`,
      sourceText: shot.sourceText,
      description: shot.description,
      timestamp: new Date(),
      pageNumber: index + 1,
      ageGroup: selectedAgeGroup.id,
      contextBefore: shot.contextBefore,
      contextAfter: shot.contextAfter
    }))
    
    setBookShots(bookShots)
  }

  // Convert book shots to standard shot format for post-production
  const convertToStandardShots = () => {
    return bookShots.map(bookShot => ({
      id: bookShot.id,
      projectId: `children_book_${Date.now()}`,
      projectType: 'children_book' as const,
      chapterNumber: Math.ceil(bookShot.pageNumber / 4), // Group pages into chapters  
      shotNumber: bookShot.pageNumber,
      description: bookShot.description,
      referenceImage: null,
      status: 'pending' as const,
      timestamp: bookShot.timestamp,
      metadata: {
        sourceText: bookShot.sourceText,
        pageNumber: bookShot.pageNumber,
        ageGroup: bookShot.ageGroup,
        theme: theme,
        extractedReferences
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Template Banner */}
      <TemplateBanner
        mode="children-book"
        templates={[]} // TODO: Add actual templates
        selectedTemplate={null}
        onTemplateSelect={() => {}} // TODO: Implement template selection
        onCreateNew={() => {}} // TODO: Implement template creation
      />
      
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Children's Book Creator
            <Badge variant="secondary">Manual Shot Workflow</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Create page-by-page shot lists for your children's book using our manual selection tool. 
            Each text selection becomes a book page illustration with consistent @character_name system.
          </p>
        </CardContent>
      </Card>

      {/* Story Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Book Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="story">Your Children's Book Story</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tell your children's book story here. Our system will extract characters and create consistent illustrations for each page..."
                className="min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="theme">Theme/Lesson (Optional)</Label>
                <Textarea
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="What theme or lesson should the book teach? (friendship, kindness, adventure, etc.)"
                  className="min-h-20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extract References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Story References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Extract @characters, @locations, and @props for consistent illustrations
            </div>
            <Button
              onClick={handleExtractReferences}
              disabled={!story.trim() || isExtracting}
            >
              <Target className="w-4 h-4 mr-2" />
              {isExtracting ? 'Extracting...' : 'Extract Characters & Locations'}
            </Button>
          </div>

          {/* Display extracted references */}
          {extractedReferences && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium text-blue-900 mb-2">
                  Characters ({extractedReferences.characters?.length || 0})
                </div>
                <div className="space-y-1">
                  {extractedReferences.characters?.map((char: any, index: number) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      @{char.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="font-medium text-green-900 mb-2">
                  Locations ({extractedReferences.locations?.length || 0})
                </div>
                <div className="space-y-1">
                  {extractedReferences.locations?.map((loc: any, index: number) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      @{loc.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <div className="font-medium text-yellow-900 mb-2">
                  Props ({extractedReferences.props?.length || 0})
                </div>
                <div className="space-y-1">
                  {extractedReferences.props?.map((prop: any, index: number) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      @{prop.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Page Selection */}
      {showManualSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Create Book Pages
              <Badge variant="outline">Age: {selectedAgeGroup.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select text portions that should appear on each book page</li>
                <li>• Each selection becomes one page illustration</li>
                <li>• Use @character_name references for consistent illustrations</li>
                <li>• Create engaging, age-appropriate illustrations</li>
              </ul>
            </div>

            <ManualShotSelector
              text={story}
              contentType="children_book"
              onShotsChange={handleShotsGenerated}
            />
          </CardContent>
        </Card>
      )}

      {/* Generated Book Pages */}
      {bookShots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Book Pages ({bookShots.length} pages)
              </span>
              <SendToPostProduction
                shots={convertToStandardShots()}
                projectType="children_book"
                buttonText="Send Pages to Post Production"
                buttonIcon={<Send className="w-4 h-4" />}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookShots.map((shot, index) => (
                <div
                  key={shot.id}
                  className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50"
                >
                  <Badge variant="outline" className="mt-1 shrink-0">
                    Page {shot.pageNumber}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Text: "{shot.sourceText}"
                    </div>
                    <div className="text-sm text-gray-800">
                      Illustration: {shot.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Age: {shot.ageGroup} • {shot.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(shot.description)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  {bookShots.length} pages created • Age: {selectedAgeGroup.name}
                  {theme && ` • Theme: ${theme}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log('Export book:', bookShots)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export Book
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}