'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Copy,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Tag,
  Sparkles,
  Upload
} from "lucide-react"
import { Generation } from "./types"

interface GenerationGalleryProps {
  generations: Generation[]
  onOpenFullscreen: (url: string) => void
  onDownload: (url: string, filename: string) => void
  onCopyPrompt: (prompt: string) => void
  onRemove: (id: string) => void
  onAddTag: (genId: string) => void
  onRemoveTag: (genId: string, tag: string) => void
  onReplaceReference?: (genId: string, refIndex: number) => void
  onSendToWorkspace?: (generation: Generation) => void
  onSaveToLibrary?: (generation: Generation) => void
}

export function GenerationGallery({
  generations,
  onOpenFullscreen,
  onDownload,
  onCopyPrompt,
  onRemove,
  onAddTag,
  onRemoveTag,
  onReplaceReference,
  onSendToWorkspace,
  onSaveToLibrary
}: GenerationGalleryProps) {
  if (generations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No generations yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generations</CardTitle>
          <Badge variant="secondary">{generations.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="relative group border rounded-lg overflow-hidden"
              >
                {gen.outputUrl ? (
                  <>
                    <div
                      className="aspect-square cursor-pointer"
                      onClick={() => onOpenFullscreen(gen.outputUrl!)}
                    >
                      <img
                        src={gen.outputUrl}
                        alt={gen.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onDownload(gen.outputUrl!, `gen4_${gen.id}.png`)}
                        className="h-8 w-8"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onCopyPrompt(gen.prompt)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRemove(gen.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Bottom Actions */}
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      {onSaveToLibrary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSaveToLibrary(gen)}
                          className="flex-1 h-7 text-xs"
                        >
                          Save to Library
                        </Button>
                      )}
                      {onSendToWorkspace && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSendToWorkspace(gen)}
                          className="flex-1 h-7 text-xs"
                        >
                          To Workspace
                        </Button>
                      )}
                    </div>

                    {/* Reference Replacement Buttons */}
                    {onReplaceReference && (
                      <div className="absolute top-12 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[0, 1, 2].map((index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            onClick={() => onReplaceReference(gen.id, index)}
                            className="h-6 text-xs"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Ref {index + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-muted">
                    {gen.status === 'processing' ? (
                      <Clock className="w-8 h-8 animate-spin text-muted-foreground" />
                    ) : gen.status === 'failed' ? (
                      <div className="text-center p-4">
                        <X className="w-8 h-8 mx-auto mb-2 text-destructive" />
                        <p className="text-sm text-destructive">Failed</p>
                        {gen.error && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {gen.error}
                          </p>
                        )}
                      </div>
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                )}

                {/* Info Section */}
                <div className="p-3 bg-background">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {gen.prompt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {gen.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs cursor-pointer"
                        onClick={() => onRemoveTag(gen.id, tag)}
                      >
                        {tag}
                        <X className="ml-1 h-2 w-2" />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddTag(gen.id)}
                      className="h-5 px-2"
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}