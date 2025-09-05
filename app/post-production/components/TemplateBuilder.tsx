'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Camera, User, Save, Edit2, Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Template {
  id: string;
  name: string;
  prompt: string;
  category: string;
  favorite?: boolean;
}

interface CameraMovement {
  id: string;
  name: string;
  prompt: string;
  category: string;
}

interface CharacterAction {
  id: string;
  name: string;
  prompt: string;
  category: string;
}

const defaultCameraMovements: CameraMovement[] = [
  { id: 'cam1', name: 'Pan Left to Right', prompt: 'slowly pan from left to right', category: 'pan' },
  { id: 'cam2', name: 'Pan Right to Left', prompt: 'slowly pan from right to left', category: 'pan' },
  { id: 'cam3', name: 'Tilt Up', prompt: 'slowly tilt camera upward', category: 'pan' },
  { id: 'cam4', name: 'Tilt Down', prompt: 'slowly tilt camera downward', category: 'pan' },
  { id: 'cam5', name: 'Zoom In', prompt: 'slowly zoom in on the subject', category: 'zoom' },
  { id: 'cam6', name: 'Zoom Out', prompt: 'slowly zoom out from the subject', category: 'zoom' },
  { id: 'cam7', name: 'Rotate Clockwise', prompt: 'rotate camera clockwise around the subject', category: 'rotate' },
  { id: 'cam8', name: 'Rotate Counter-CW', prompt: 'rotate camera counter-clockwise around the subject', category: 'rotate' },
  { id: 'cam9', name: 'Track Forward', prompt: 'move camera forward tracking the subject', category: 'track' },
  { id: 'cam10', name: 'Track Backward', prompt: 'move camera backward while keeping subject in frame', category: 'track' },
  { id: 'cam11', name: 'Dolly Left', prompt: 'move camera sideways to the left', category: 'track' },
  { id: 'cam12', name: 'Dolly Right', prompt: 'move camera sideways to the right', category: 'track' },
  { id: 'cam13', name: 'Static Shot', prompt: 'keep camera still', category: 'static' },
];

const defaultCharacterActions: CharacterAction[] = [
  { id: 'act1', name: 'Walking', prompt: 'character walking forward', category: 'movement' },
  { id: 'act2', name: 'Running', prompt: 'character running', category: 'movement' },
  { id: 'act3', name: 'Jumping', prompt: 'character jumping', category: 'movement' },
  { id: 'act4', name: 'Dancing', prompt: 'character dancing', category: 'movement' },
  { id: 'act5', name: 'Sitting', prompt: 'character sitting down', category: 'movement' },
  { id: 'act6', name: 'Standing', prompt: 'character standing up', category: 'movement' },
  { id: 'act7', name: 'Turning', prompt: 'character turning around', category: 'movement' },
  { id: 'act8', name: 'Smiling', prompt: 'character smiling', category: 'expression' },
  { id: 'act9', name: 'Talking', prompt: 'character talking', category: 'expression' },
  { id: 'act10', name: 'Laughing', prompt: 'character laughing', category: 'expression' },
  { id: 'act11', name: 'Waving', prompt: 'character waving hand', category: 'gesture' },
  { id: 'act12', name: 'Pointing', prompt: 'character pointing', category: 'gesture' },
  { id: 'act13', name: 'Gesturing', prompt: 'character making hand gestures', category: 'gesture' },
  { id: 'act14', name: 'Working', prompt: 'character working', category: 'activity' },
  { id: 'act15', name: 'Reading', prompt: 'character reading', category: 'activity' },
  { id: 'act16', name: 'Writing', prompt: 'character writing', category: 'activity' },
];

interface TemplateBuilderProps {
  selectedCount: number;
  onApplyPrompt: (prompt: string) => void;
  referenceTags?: string[];
}

export default function TemplateBuilder({ selectedCount, onApplyPrompt, referenceTags = [] }: TemplateBuilderProps) {
  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('post-production-templates');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedActionId2, setSelectedActionId2] = useState<string | null>(null);
  const [useTwoCharacters, setUseTwoCharacters] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getCombinedPrompt = () => {
    const parts: string[] = [];
    
    if (selectedCameraId) {
      const camera = defaultCameraMovements.find(c => c.id === selectedCameraId);
      if (camera) parts.push(camera.prompt);
    }
    
    if (selectedActionId) {
      const action = defaultCharacterActions.find(a => a.id === selectedActionId);
      if (action) {
        if (useTwoCharacters) {
          parts.push(parts.length > 0 ? `while character 1 is ${action.prompt}` : `character 1 is ${action.prompt}`);
        } else {
          parts.push(parts.length > 0 ? `while ${action.prompt}` : action.prompt);
        }
      }
    }
    
    if (useTwoCharacters && selectedActionId2) {
      const action2 = defaultCharacterActions.find(a => a.id === selectedActionId2);
      if (action2) {
        parts.push(`and character 2 is ${action2.prompt}`);
      }
    }
    
    return parts.join(', ');
  };

  const combinedPrompt = getCombinedPrompt();
  const finalPrompt = customPrompt || combinedPrompt;

  const handleApplyTemplate = () => {
    if (!finalPrompt.trim()) {
      toast({
        title: 'No prompt created',
        description: 'Please select camera movement and/or character action',
        variant: 'destructive',
      });
      return;
    }

    onApplyPrompt(finalPrompt);
    toast({
      title: 'Template applied',
      description: `Applied to ${selectedCount} selected images`,
    });
  };

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('post-production-templates', JSON.stringify(newTemplates));
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !finalPrompt.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a template name and create a prompt',
        variant: 'destructive',
      });
      return;
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      prompt: finalPrompt,
      category: 'Custom',
      favorite: false,
    };

    saveTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setShowSaveDialog(false);
    toast({
      title: 'Template saved',
      description: `"${newTemplateName}" has been saved to your templates`,
    });
  };

  const handleEditTemplate = (id: string, newPrompt: string) => {
    const updated = templates.map(t => 
      t.id === id ? { ...t, prompt: newPrompt } : t
    );
    saveTemplates(updated);
    setEditingTemplate(null);
    toast({
      title: 'Template updated',
      description: 'Your template has been updated successfully',
    });
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    saveTemplates(templates.filter(t => t.id !== id));
    toast({
      title: 'Template deleted',
      description: `"${template?.name}" has been removed`,
    });
  };

  const groupedCameras = defaultCameraMovements.reduce((acc, cam) => {
    if (!acc[cam.category]) acc[cam.category] = [];
    acc[cam.category].push(cam);
    return acc;
  }, {} as Record<string, typeof defaultCameraMovements>);

  const groupedActions = defaultCharacterActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof defaultCharacterActions>);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-semibold hover:bg-transparent">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Template Builder
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {isEditMode ? 'Done' : 'Edit'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Build Template</TabsTrigger>
            <TabsTrigger value="saved">Saved Templates ({templates.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-3">
            {/* Camera Movements */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Camera className="w-4 h-4" />
                Camera Movement
              </div>
              <ScrollArea className="h-24 w-full rounded-md border p-1">
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(groupedCameras).map(([category, movements]) => (
                    <div key={category}>
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{category}</p>
                      {movements.map((cam) => (
                        <Button
                          key={cam.id}
                          size="sm"
                          variant={selectedCameraId === cam.id ? "default" : "outline"}
                          className="w-full justify-start text-xs mb-0.5 h-7"
                          onClick={() => setSelectedCameraId(selectedCameraId === cam.id ? null : cam.id)}
                        >
                          {cam.name}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Character Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Character {useTwoCharacters ? '1' : ''} Action
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="two-chars" className="text-xs">Two Characters</Label>
                  <Switch
                    id="two-chars"
                    checked={useTwoCharacters}
                    onCheckedChange={setUseTwoCharacters}
                  />
                </div>
              </div>
              <ScrollArea className="h-24 w-full rounded-md border p-1">
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(groupedActions).map(([category, actions]) => (
                    <div key={category}>
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{category}</p>
                      {actions.map((action) => (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={selectedActionId === action.id ? "default" : "outline"}
                          className="w-full justify-start text-xs mb-0.5 h-7"
                          onClick={() => setSelectedActionId(selectedActionId === action.id ? null : action.id)}
                        >
                          {action.name}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Second Character Action */}
            {useTwoCharacters && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Character 2 Action
                </div>
                <ScrollArea className="h-24 w-full rounded-md border p-1">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(groupedActions).map(([category, actions]) => (
                      <div key={category}>
                        <p className="text-xs text-muted-foreground mb-1 capitalize">{category}</p>
                        {actions.map((action) => (
                          <Button
                            key={action.id}
                            size="sm"
                            variant={selectedActionId2 === action.id ? "default" : "outline"}
                            className="w-full justify-start text-xs mb-0.5 h-7"
                            onClick={() => setSelectedActionId2(selectedActionId2 === action.id ? null : action.id)}
                          >
                            {action.name}
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Reference Tags (if available) */}
            {referenceTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="secondary" className="h-5">@</Badge>
                  Reference Tags - Click to Insert
                </div>
                <div className="flex gap-2 flex-wrap">
                  {referenceTags.map((tag, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        const currentPrompt = customPrompt || combinedPrompt;
                        const tagToInsert = `@${tag}`;
                        if (!currentPrompt.includes(tagToInsert)) {
                          setCustomPrompt(currentPrompt ? `${currentPrompt} ${tagToInsert}` : tagToInsert);
                          toast({
                            title: 'Tag inserted',
                            description: `Added @${tag} to prompt`,
                          });
                        }
                      }}
                    >
                      @{tag}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Use these tags to reference specific elements in your generation
                </p>
              </div>
            )}

            {/* Combined Prompt Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Combined Prompt</p>
              <Textarea
                placeholder="Your combined prompt will appear here, or type a custom one..."
                value={customPrompt || combinedPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                className="resize-vertical min-h-[40px] max-h-[100px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApplyTemplate}
                disabled={selectedCount === 0 || !finalPrompt.trim()}
                className="flex-1"
              >
                Apply to Selected ({selectedCount})
              </Button>
              
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!finalPrompt.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Template</DialogTitle>
                    <DialogDescription>
                      Save this prompt combination as a reusable template
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template Name</label>
                      <Input
                        placeholder="Enter template name..."
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prompt</label>
                      <Textarea
                        value={finalPrompt}
                        readOnly
                        rows={3}
                        className="resize-none bg-muted"
                      />
                    </div>
                    <Button onClick={handleSaveTemplate} className="w-full">
                      Save Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-2">
            <ScrollArea className="h-48 w-full">
              {templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved templates yet. Create one using the builder!
                </p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{template.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          {editingTemplate === template.id ? (
                            <Textarea
                              defaultValue={template.prompt}
                              onBlur={(e) => handleEditTemplate(template.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  handleEditTemplate(template.id, e.currentTarget.value);
                                }
                              }}
                              rows={2}
                              className="mt-2 resize-none"
                              autoFocus
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {template.prompt}
                            </p>
                          )}
                        </div>
                        {isEditMode && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => setEditingTemplate(
                                editingTemplate === template.id ? null : template.id
                              )}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {!isEditMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            onApplyPrompt(template.prompt);
                            toast({
                              title: 'Template applied',
                              description: `Applied "${template.name}" to ${selectedCount} selected images`,
                            });
                          }}
                          disabled={selectedCount === 0}
                        >
                          Apply This Template
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </CollapsibleContent>
    </Card>
  </Collapsible>
  );
}