'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Brackets, GitBranch, Sparkles, BookOpen, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PromptLanguageHelp() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const copyExample = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(id);
    toast.success('Example copied to clipboard');
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const examples = {
    brackets: [
      {
        id: 'bracket1',
        prompt: 'A woman in a [red, blue, green] dress',
        output: '3 images with different colored dresses',
      },
      {
        id: 'bracket2',
        prompt: 'A [young, elderly] [man, woman] in a [suit, casual outfit]',
        output: '8 images (2×2×2 combinations)',
      },
      {
        id: 'bracket3',
        prompt: '[Sunrise, Sunset, Night] over a [mountain, ocean, desert] landscape',
        output: '9 unique variations (3×3)',
      },
    ],
    pipes: [
      {
        id: 'pipe1',
        prompt: 'A simple sketch of a house |\nAdd color and shading |\nTransform into photorealistic rendering',
        output: '3 progressive images',
      },
      {
        id: 'pipe2',
        prompt: 'Empty stage |\nAdd single performer |\nAdd full orchestra |\nAdd audience',
        output: '4 sequential images',
      },
    ],
    wildcards: [
      {
        id: 'wild1',
        prompt: 'A detective in _location_ during _time_of_day_',
        output: 'Random location and time',
      },
      {
        id: 'wild2',
        prompt: '[Young, Old] wizard in _location_ casting [fire, ice] magic',
        output: 'Combinations with random locations',
      },
    ],
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Prompt Language Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Director's Palette Prompt Language
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="brackets">Variations</TabsTrigger>
            <TabsTrigger value="pipes">Chaining</TabsTrigger>
            <TabsTrigger value="wildcards">Wild Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Three Powerful Syntaxes</CardTitle>
                <CardDescription>
                  Combine these techniques for unlimited creative control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Brackets className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Bracket Syntax [a, b, c]</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate multiple variations from a single prompt
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GitBranch className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Pipe Syntax |</h4>
                    <p className="text-sm text-muted-foreground">
                      Chain prompts sequentially for progressive transformations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Wild Cards _placeholder_</h4>
                    <p className="text-sm text-muted-foreground">
                      Dynamic placeholders that expand to random values
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm space-y-2">
                  <div>[option1, option2, option3] → Multiple variations</div>
                  <div>prompt1 | prompt2 | prompt3 → Sequential chain</div>
                  <div>_wildcard_ → Random expansion</div>
                  <div>{`{ref:image_id}`} → Reference image</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brackets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brackets className="h-5 w-5 text-blue-500" />
                  Bracket Syntax - Multiple Variations
                </CardTitle>
                <CardDescription>
                  Generate multiple images with different options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {examples.brackets.map((example) => (
                  <div key={example.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <code className="text-sm bg-muted p-2 rounded flex-1 mr-2">
                        {example.prompt}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyExample(example.prompt, example.id)}
                      >
                        {copiedExample === example.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Output:</span>
                      <Badge variant="secondary">{example.output}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  Pipe Syntax - Sequential Chaining
                </CardTitle>
                <CardDescription>
                  Each prompt builds upon the previous result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {examples.pipes.map((example) => (
                  <div key={example.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <pre className="text-sm bg-muted p-2 rounded flex-1 mr-2 whitespace-pre-wrap">
                        {example.prompt}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyExample(example.prompt, example.id)}
                      >
                        {copiedExample === example.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Output:</span>
                      <Badge variant="secondary">{example.output}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wildcards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Wild Cards - Dynamic Expansion
                </CardTitle>
                <CardDescription>
                  Placeholders that expand to random values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2">Location Wild Cards</h4>
                    <div className="space-y-1 text-sm">
                      <Badge variant="outline">_location_</Badge>
                      <Badge variant="outline">_interior_</Badge>
                      <Badge variant="outline">_exterior_</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Time Wild Cards</h4>
                    <div className="space-y-1 text-sm">
                      <Badge variant="outline">_time_of_day_</Badge>
                      <Badge variant="outline">_season_</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mood Wild Cards</h4>
                    <div className="space-y-1 text-sm">
                      <Badge variant="outline">_mood_</Badge>
                      <Badge variant="outline">_atmosphere_</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Camera Wild Cards</h4>
                    <div className="space-y-1 text-sm">
                      <Badge variant="outline">_shot_type_</Badge>
                      <Badge variant="outline">_lens_</Badge>
                    </div>
                  </div>
                </div>

                {examples.wildcards.map((example) => (
                  <div key={example.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <code className="text-sm bg-muted p-2 rounded flex-1 mr-2">
                        {example.prompt}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyExample(example.prompt, example.id)}
                      >
                        {copiedExample === example.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Output:</span>
                      <Badge variant="secondary">{example.output}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Combination</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2">
                  <pre className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
{`[Male, Female] hero in _location_ |
Add _mood_ lighting |
Apply [cinematic, noir, anime] style`}
                  </pre>
                  <p className="text-sm text-muted-foreground">
                    Combines all three syntaxes for complex generation workflows
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}