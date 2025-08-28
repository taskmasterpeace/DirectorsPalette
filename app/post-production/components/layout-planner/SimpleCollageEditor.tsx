"use client";

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash, 
  Type, 
  Image as ImageIcon, 
  Download,
  Move,
  RotateCcw
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LayoutImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalAspectRatio: number;
}

interface LayoutText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function SimpleCollageEditor() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [images, setImages] = useState<LayoutImage[]>([]);
  const [texts, setTexts] = useState<LayoutText[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update canvas size when aspect ratio changes
  React.useEffect(() => {
    const baseWidth = 800;
    switch (aspectRatio) {
      case "16:9":
        setCanvasSize({ width: baseWidth, height: Math.round(baseWidth * (9/16)) });
        break;
      case "9:16":
        setCanvasSize({ width: Math.round(baseWidth * (9/16)), height: baseWidth });
        break;
      case "1:1":
        setCanvasSize({ width: baseWidth, height: baseWidth });
        break;
    }
  }, [aspectRatio]);

  // Add image to layout
  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxSize = 200; // Maximum initial size
        
        let width = Math.min(img.width, maxSize);
        let height = width / aspectRatio;
        
        if (height > maxSize) {
          height = maxSize;
          width = height * aspectRatio;
        }

        const newImage: LayoutImage = {
          id: Date.now().toString(),
          src: e.target?.result as string,
          x: Math.random() * (canvasSize.width - width),
          y: Math.random() * (canvasSize.height - height),
          width,
          height,
          originalAspectRatio: aspectRatio
        };

        setImages(prev => [...prev, newImage]);
        setSelectedElement(newImage.id);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add text element
  const addText = () => {
    const newText: LayoutText = {
      id: Date.now().toString(),
      text: "New Text",
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2,
      fontSize: 24,
      color: "#FFFFFF"
    };

    setTexts(prev => [...prev, newText]);
    setSelectedElement(newText.id);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedElement) return;

    setImages(prev => prev.filter(img => img.id !== selectedElement));
    setTexts(prev => prev.filter(text => text.id !== selectedElement));
    setSelectedElement(null);
  };

  // Export layout
  const exportLayout = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw images
      for (const img of images) {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          imgElement.onload = resolve;
          imgElement.src = img.src;
        });
        
        ctx.drawImage(imgElement, img.x, img.y, img.width, img.height);
      }

      // Draw texts
      for (const text of texts) {
        ctx.fillStyle = text.color;
        ctx.font = `${text.fontSize}px Arial`;
        ctx.fillText(text.text, text.x, text.y + text.fontSize);
      }

      // Export
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `collage-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Layout Exported",
            description: "Collage saved successfully"
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export layout",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Collage Layout Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Canvas Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <div className="text-xs text-slate-400">
                Canvas: {canvasSize.width} × {canvasSize.height}px
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={addText}
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={deleteSelected}
              disabled={!selectedElement}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            
            <Button
              size="sm"
              onClick={exportLayout}
              disabled={images.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Collage
            </Button>
          </div>
          
          {/* Element Count */}
          <div className="text-xs text-slate-400">
            {images.length} images, {texts.length} text elements
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div 
            ref={canvasRef}
            className="relative bg-white rounded-lg overflow-hidden mx-auto"
            style={{ 
              width: canvasSize.width, 
              height: canvasSize.height
            }}
            onClick={() => setSelectedElement(null)}
          >
            {/* Images */}
            {images.map(img => (
              <div
                key={img.id}
                className={`absolute border-2 select-none ${
                  selectedElement === img.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-transparent hover:border-blue-300'
                }`}
                style={{
                  left: img.x,
                  top: img.y,
                  width: img.width,
                  height: img.height,
                  cursor: selectedElement === img.id ? 'move' : 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(img.id);
                }}
              >
                <img
                  src={img.src}
                  alt="Layout element"
                  className="w-full h-full object-cover rounded"
                  draggable={false}
                />
                
                {/* Resize handle (bottom-right only for simplicity) */}
                {selectedElement === img.id && (
                  <div 
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-se-resize"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsResizing(true);
                      setIsDragging(false);
                    }}
                  />
                )}
              </div>
            ))}

            {/* Text Elements */}
            {texts.map(text => (
              <div
                key={text.id}
                className={`absolute select-none cursor-pointer ${
                  selectedElement === text.id 
                    ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                    : 'hover:ring-1 hover:ring-blue-300'
                }`}
                style={{
                  left: text.x,
                  top: text.y,
                  fontSize: text.fontSize,
                  color: text.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(text.id);
                }}
              >
                {text.text}
              </div>
            ))}

            {/* Instructions */}
            {images.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Create Your Collage</p>
                  <p className="text-sm">Add multiple images, resize them, add text annotations</p>
                  <p className="text-xs mt-2 opacity-75">Click "Add Images" to get started</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      {selectedElement && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Edit Selected Element</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedImage = images.find(img => img.id === selectedElement);
              const selectedText = texts.find(text => text.id === selectedElement);

              if (selectedImage) {
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-300 text-xs">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedImage.width)}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value) || selectedImage.width;
                            const newHeight = newWidth / selectedImage.originalAspectRatio;
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement 
                                ? { ...img, width: newWidth, height: newHeight } 
                                : img
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">Height</Label>
                        <Input
                          type="number" 
                          value={Math.round(selectedImage.height)}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value) || selectedImage.height;
                            const newWidth = newHeight * selectedImage.originalAspectRatio;
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement 
                                ? { ...img, width: newWidth, height: newHeight } 
                                : img
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-300 text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedImage.x)}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value) || 0;
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement ? { ...img, x: newX } : img
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">Y Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedImage.y)}
                          onChange={(e) => {
                            const newY = parseInt(e.target.value) || 0;
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement ? { ...img, y: newY } : img
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (selectedText) {
                return (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-xs">Text Content</Label>
                      <Input
                        value={selectedText.text}
                        onChange={(e) => {
                          setTexts(prev => prev.map(text => 
                            text.id === selectedElement ? { ...text, text: e.target.value } : text
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-slate-300 text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={selectedText.fontSize}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value) || 16;
                            setTexts(prev => prev.map(text => 
                              text.id === selectedElement ? { ...text, fontSize: newSize } : text
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">Color</Label>
                        <Input
                          type="color"
                          value={selectedText.color}
                          onChange={(e) => {
                            setTexts(prev => prev.map(text => 
                              text.id === selectedElement ? { ...text, color: e.target.value } : text
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedText.x)}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value) || 0;
                            setTexts(prev => prev.map(text => 
                              text.id === selectedElement ? { ...text, x: newX } : text
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="text-slate-400 text-sm text-center py-4">
                  Select an image or text element to edit its properties
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            Array.from(files).forEach(file => handleAddImage(file));
          }
        }}
      />
    </div>
  );
}