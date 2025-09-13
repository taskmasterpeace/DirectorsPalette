'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Palette, Image, Sparkles, Copy, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { generateChildrenBook, extractBookReferences } from '@/app/actions/children-book/generation'

// Children's Book Configuration
const DEFAULT_BOOK_STYLE = {
  name: 'Children\'s Book Illustration',
  description: 'Age-appropriate illustrations with consistent characters',
  style: 'Child-friendly illustration style with bright colors, clear characters, and age-appropriate content. Focus on character consistency using @character_name system.'
}

// Aspect Ratios for Children's Books
const BOOK_FORMATS = [
  { id: '1:1', name: 'Square (1:1)', description: 'Popular for picture books', dimensions: '8×8 to 11×11 inches' },
  { id: '3:4', name: 'Portrait (3:4)', description: 'Standard picture book', dimensions: '8.5×11 inches' },
  { id: '4:3', name: 'Landscape (4:3)', description: 'Wide format books', dimensions: '11×8.5 inches' },
  { id: '16:9', name: 'Widescreen (16:9)', description: 'Modern landscape', dimensions: 'Digital/tablet format' },
  { id: '9:16', name: 'Tall (9:16)', description: 'Vertical format', dimensions: 'Mobile/tall books' }
]

export function ChildrenBookContainer() {
  const { toast } = useToast()
  const [story, setStory] = useState('')
  const [selectedFormat, setSelectedFormat] = useState(BOOK_FORMATS[0])
  const [ageGroup, setAgeGroup] = useState('3-7')
  const [theme, setTheme] = useState('')
  const [illustrationNotes, setIllustrationNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [bookPages, setBookPages] = useState<any[]>([])
  const [extractedReferences, setExtractedReferences] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  // Extract characters, locations, and props (EXACT same system as story mode)
  const handleExtractReferences = async () => {
    if (!story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter a story to extract references.",
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

  const handleGenerateBook = async () => {
    if (!story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter a story for your children's book.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generating Children's Book",
        description: "Creating illustrations with consistent characters..."
      })
      
      if (!extractedReferences) {
        toast({
          title: "Extract References First",
          description: "Please extract characters, locations, and props before generating the book.",
          variant: "destructive"
        })
        return
      }

      // Generate children's book using our server action with extracted references
      const result = await generateChildrenBook({
        story,
        ageGroup,
        theme: theme || undefined,
        aspectRatio: selectedFormat.id,
        references: extractedReferences,
        illustrationNotes
      })
      
      if (result.success && result.data) {
        const bookData = result.data
        const pages = bookData.pages.map(page => ({
          pageNum: page.pageNumber,
          text: page.pageText,
          scene: page.sceneDescription,
          characters: page.characters,
          location: page.location,
          props: page.props,
          mood: page.mood
        }))
        
        setBookPages(pages)
        
        toast({
          title: "Children's Book Generated!",
          description: `Created ${pages.length} illustrated pages with consistent characters`
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
    } catch (error) {
      console.error('Book generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate children's book",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-orange-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-400" />
            Children's Book Creator
            <Badge variant="secondary" className="bg-orange-900/50 text-orange-200">
              Illustrations Only
            </Badge>
          </CardTitle>
          <p className="text-orange-100/80">
            Generate beautiful illustrations for your children's book using our AI-powered system.
            Characters will be consistent throughout using our @character_name system.
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Story Input & Configuration */}
        <div className="space-y-6">
          {/* Story Input */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-400" />
                Book Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Your Children's Book Story</Label>
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Tell your children's book story here. Our system will extract characters and create consistent illustrations for each page..."
                  className="bg-slate-900 border-slate-600 text-white min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Age Group</Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3">Baby/Toddler (0-3)</SelectItem>
                      <SelectItem value="3-7">Preschool (3-7)</SelectItem>
                      <SelectItem value="6-10">Early Reader (6-10)</SelectItem>
                      <SelectItem value="8-12">Middle Grade (8-12)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white">Book Format</Label>
                  <Select value={selectedFormat.id} onValueChange={(value) => {
                    const format = BOOK_FORMATS.find(f => f.id === value)
                    if (format) setSelectedFormat(format)
                  }}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOK_FORMATS.map(format => (
                        <SelectItem key={format.id} value={format.id}>
                          <div className="flex items-center gap-2">
                            <span>{format.name}</span>
                            <Badge variant="outline" className="text-xs">{format.dimensions}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Theme/Lesson (Optional)</Label>
                <Textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="What theme or lesson should the book teach? (friendship, kindness, adventure, etc.)"
                  className="bg-slate-900 border-slate-600 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-white">Illustration Notes (Optional)</Label>
                <Textarea
                  value={illustrationNotes}
                  onChange={(e) => setIllustrationNotes(e.target.value)}
                  placeholder="Specific illustration guidance: art style, color preferences, mood, etc."
                  className="bg-slate-900 border-slate-600 text-white"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Character & Location Extraction */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Story References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleExtractReferences}
                disabled={isExtracting || !story.trim()}
                variant="outline"
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Characters...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Characters & Locations
                  </>
                )}
              </Button>

              {/* Show extracted references (same as story mode) */}
              {extractedReferences && (
                <div className="space-y-4">
                  {/* Characters */}
                  {extractedReferences.characters.length > 0 && (
                    <div>
                      <Label className="text-white text-sm">Characters ({extractedReferences.characters.length}):</Label>
                      <div className="space-y-2 mt-2">
                        {extractedReferences.characters.map((char: any, index: number) => (
                          <div key={index} className="p-2 bg-slate-900/50 rounded border border-slate-600">
                            <div className="text-white font-medium">{char.reference}</div>
                            <div className="text-slate-300 text-xs">{char.name}: {char.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Locations */}
                  {extractedReferences.locations.length > 0 && (
                    <div>
                      <Label className="text-white text-sm">Locations ({extractedReferences.locations.length}):</Label>
                      <div className="space-y-2 mt-2">
                        {extractedReferences.locations.map((loc: any, index: number) => (
                          <div key={index} className="p-2 bg-slate-900/50 rounded border border-slate-600">
                            <div className="text-white font-medium">{loc.reference}</div>
                            <div className="text-slate-300 text-xs">{loc.name}: {loc.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Props */}
                  {extractedReferences.props.length > 0 && (
                    <div>
                      <Label className="text-white text-sm">Props ({extractedReferences.props.length}):</Label>
                      <div className="space-y-2 mt-2">
                        {extractedReferences.props.map((prop: any, index: number) => (
                          <div key={index} className="p-2 bg-slate-900/50 rounded border border-slate-600">
                            <div className="text-white font-medium">{prop.reference}</div>
                            <div className="text-slate-300 text-xs">{prop.name}: {prop.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Themes */}
                  {extractedReferences.themes.length > 0 && (
                    <div>
                      <Label className="text-white text-sm">Detected Themes:</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {extractedReferences.themes.map((theme: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview & Generation */}
        <div className="space-y-6">
          {/* Format Preview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-400" alt="Book format icon" />
                Book Format: {selectedFormat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-slate-300 text-sm">{selectedFormat.description}</div>
                <div className="text-slate-400 text-xs">{selectedFormat.dimensions}</div>
                
                {/* Visual Format Preview */}
                <div className="flex justify-center">
                  <div 
                    className="border border-slate-600 bg-slate-700/30"
                    style={{
                      aspectRatio: selectedFormat.id.replace(':', '/'),
                      width: selectedFormat.id === '9:16' ? '60px' : selectedFormat.id === '16:9' ? '120px' : '80px'
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      {selectedFormat.id}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerateBook}
                disabled={isGenerating || !story.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Illustrations...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Generate Children's Book Illustrations
                  </>
                )}
              </Button>
              
              <div className="text-center text-xs text-slate-400 mt-2">
                Uses existing @character_name system for consistency
              </div>
            </CardContent>
          </Card>

          {/* Generated Pages Preview */}
          {bookPages.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-orange-400" alt="Generated pages icon" />
                    Generated Pages ({bookPages.length})
                  </div>
                  <Badge variant="outline" className="text-xs bg-orange-900/30 text-orange-200">
                    {selectedFormat.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookPages.map((page, index) => (
                    <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      {/* Page Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-white font-medium text-lg">Page {page.pageNum}</div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(page.scene)
                              toast({
                                title: "Copied!",
                                description: "Scene description copied to clipboard"
                              })
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Scene
                          </Button>
                        </div>
                      </div>
                      
                      {/* Page Text */}
                      <div className="mb-3">
                        <div className="text-slate-200 text-sm italic p-2 bg-slate-800/50 rounded">
                          "{page.text}"
                        </div>
                      </div>
                      
                      {/* Scene Description */}
                      <div className="space-y-2">
                        <div className="text-orange-300 text-sm font-medium">Scene Description:</div>
                        <div className="text-slate-300 text-sm p-2 bg-slate-800/30 rounded border border-slate-600">
                          {page.scene}
                        </div>
                        
                        {/* Reference Details */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {page.characters && page.characters.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-400">Characters:</div>
                              <div className="text-xs text-slate-300">{page.characters.join(', ')}</div>
                            </div>
                          )}
                          {page.location && (
                            <div>
                              <div className="text-xs text-slate-400">Location:</div>
                              <div className="text-xs text-slate-300">{page.location}</div>
                            </div>
                          )}
                          {page.props && page.props.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-400">Props:</div>
                              <div className="text-xs text-slate-300">{page.props.join(', ')}</div>
                            </div>
                          )}
                        </div>
                        
                        {page.mood && (
                          <div className="mt-2">
                            <div className="text-xs text-slate-400">Mood:</div>
                            <div className="text-xs text-slate-300">{page.mood}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Export Options */}
                  <div className="pt-4 border-t border-slate-600">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const allScenes = bookPages.map(page => 
                            `Page ${page.pageNum}: ${page.scene}`
                          ).join('\n\n')
                          navigator.clipboard.writeText(allScenes)
                          toast({
                            title: "All Scenes Copied!",
                            description: "All scene descriptions copied to clipboard"
                          })
                        }}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All Scenes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}