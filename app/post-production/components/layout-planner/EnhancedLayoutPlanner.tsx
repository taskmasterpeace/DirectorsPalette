"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Move, 
  Type, 
  Image as ImageIcon, 
  Download,
  RotateCcw,
  Copy,
  ArrowUp,
  ArrowDown,
  Save
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LayoutImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  originalWidth?: number;
  originalHeight?: number;
}

interface LayoutText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  zIndex: number;
}

interface LayoutArrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness: number;
  zIndex: number;
}

type LayoutElement = LayoutImage | LayoutText | LayoutArrow;

export default function EnhancedLayoutPlanner() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [images, setImages] = useState<LayoutImage[]>([]);
  const [texts, setTexts] = useState<LayoutText[]>([]);
  const [arrows, setArrows] = useState<LayoutArrow[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isAddingText, setIsAddingText] = useState(false);
  const [isAddingArrow, setIsAddingArrow] = useState(false);
  
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
        const maxWidth = canvasSize.width * 0.3; // Max 30% of canvas width
        const maxHeight = canvasSize.height * 0.3; // Max 30% of canvas height
        
        let { width, height } = img;
        
        // Scale down if too large
        if (width > maxWidth || height > maxHeight) {
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY);
          width *= scale;
          height *= scale;
        }

        const newImage: LayoutImage = {
          id: Date.now().toString(),
          src: e.target?.result as string,
          x: Math.random() * (canvasSize.width - width),
          y: Math.random() * (canvasSize.height - height),
          width,
          height,
          rotation: 0,
          zIndex: images.length + texts.length + arrows.length + 1,
          originalWidth: img.width,
          originalHeight: img.height
        };

        setImages(prev => [...prev, newImage]);
        setSelectedElement(newImage.id);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add text element
  const handleAddText = (x: number, y: number) => {
    const newText: LayoutText = {
      id: Date.now().toString(),
      text: "New Text",
      x: Math.max(0, Math.min(x, canvasSize.width - 100)),
      y: Math.max(0, Math.min(y, canvasSize.height - 30)),
      fontSize: 24,
      color: "#FFFFFF",
      fontWeight: 'normal',
      zIndex: images.length + texts.length + arrows.length + 1
    };

    setTexts(prev => [...prev, newText]);
    setSelectedElement(newText.id);
    setIsAddingText(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setSelectedElement(elementId);

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      const element = images.find(img => img.id === elementId);
      if (element) {
        setElementStart({ 
          x: element.x, 
          y: element.y, 
          width: element.width, 
          height: element.height 
        });
      }
    } else {
      setIsDragging(true);
      const element = images.find(img => img.id === elementId) || texts.find(text => text.id === elementId);
      if (element) {
        setElementStart({ 
          x: element.x, 
          y: element.y, 
          width: 'width' in element ? element.width : 0, 
          height: 'height' in element ? element.height : 0 
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (isDragging && selectedElement) {
      // Move element
      setImages(prev => prev.map(img => 
        img.id === selectedElement 
          ? { 
              ...img, 
              x: Math.max(0, Math.min(elementStart.x + deltaX, canvasSize.width - img.width)),
              y: Math.max(0, Math.min(elementStart.y + deltaY, canvasSize.height - img.height))
            }
          : img
      ));
      
      setTexts(prev => prev.map(text => 
        text.id === selectedElement 
          ? { 
              ...text, 
              x: Math.max(0, Math.min(elementStart.x + deltaX, canvasSize.width - 100)),
              y: Math.max(20, Math.min(elementStart.y + deltaY, canvasSize.height))
            }
          : text
      ));
    }

    if (isResizing && selectedElement && resizeHandle) {
      const element = images.find(img => img.id === selectedElement);
      if (!element) return;

      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      let newX = elementStart.x;
      let newY = elementStart.y;

      // Calculate aspect ratio
      const aspectRatio = elementStart.width / elementStart.height;

      switch (resizeHandle) {
        case 'se': // Bottom-right
          newWidth = Math.max(20, elementStart.width + deltaX);
          newHeight = newWidth / aspectRatio; // Preserve aspect ratio
          break;
        case 'sw': // Bottom-left  
          newWidth = Math.max(20, elementStart.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = elementStart.x + (elementStart.width - newWidth);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(20, elementStart.width + deltaX);
          newHeight = newWidth / aspectRatio;
          newY = elementStart.y + (elementStart.height - newHeight);
          break;
        case 'nw': // Top-left
          newWidth = Math.max(20, elementStart.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = elementStart.x + (elementStart.width - newWidth);
          newY = elementStart.y + (elementStart.height - newHeight);
          break;
      }

      // Keep within canvas bounds
      if (newX + newWidth > canvasSize.width) {
        newWidth = canvasSize.width - newX;
        newHeight = newWidth / aspectRatio;
      }
      if (newY + newHeight > canvasSize.height) {
        newHeight = canvasSize.height - newY;
        newWidth = newHeight * aspectRatio;
      }

      setImages(prev => prev.map(img => 
        img.id === selectedElement 
          ? { ...img, x: newX, y: newY, width: newWidth, height: newHeight }
          : img
      ));
    }
  }, [isDragging, isResizing, selectedElement, dragStart, elementStart, canvasSize, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isAddingText) {
      handleAddText(x, y);
      return;
    }

    // Deselect if clicking empty space
    setSelectedElement(null);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedElement) return;

    setImages(prev => prev.filter(img => img.id !== selectedElement));
    setTexts(prev => prev.filter(text => text.id !== selectedElement));
    setArrows(prev => prev.filter(arrow => arrow.id !== selectedElement));
    setSelectedElement(null);
  };

  // Export layout as image
  const exportLayout = async () => {
    if (!canvasRef.current) return;

    try {
      // Create a new canvas for export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sort all elements by zIndex
      const allElements = [
        ...images.map(img => ({ ...img, type: 'image' as const })),
        ...texts.map(text => ({ ...text, type: 'text' as const })),
        ...arrows.map(arrow => ({ ...arrow, type: 'arrow' as const }))
      ].sort((a, b) => a.zIndex - b.zIndex);

      // Render each element
      for (const element of allElements) {
        if (element.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = element.src;
          });
          
          ctx.save();
          ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
          ctx.restore();
        } else if (element.type === 'text') {
          ctx.fillStyle = element.color;
          ctx.font = `${element.fontWeight} ${element.fontSize}px Arial`;
          ctx.fillText(element.text, element.x, element.y);
        } else if (element.type === 'arrow') {
          ctx.strokeStyle = element.color;
          ctx.lineWidth = element.thickness;
          ctx.beginPath();
          ctx.moveTo(element.startX, element.startY);
          ctx.lineTo(element.endX, element.endY);
          
          // Arrow head
          const headlen = 15;
          const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX);
          ctx.lineTo(element.endX - headlen * Math.cos(angle - Math.PI / 6), element.endY - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(element.endX, element.endY);
          ctx.lineTo(element.endX - headlen * Math.cos(angle + Math.PI / 6), element.endY - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }

      // Convert to blob and save
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `layout-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Layout Exported",
            description: "Collage saved as PNG file"
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
            Enhanced Layout Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Aspect Ratio Control */}
          <div>
            <Label className="text-slate-300">Canvas Aspect Ratio</Label>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingText(true)}
              className={isAddingText ? 'bg-blue-600' : ''}
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingArrow(true)}
              className={isAddingArrow ? 'bg-purple-600' : ''}
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Add Arrow
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={deleteSelected}
              disabled={!selectedElement}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={exportLayout}
              disabled={images.length === 0 && texts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div 
            ref={canvasRef}
            className="relative bg-white rounded-lg overflow-hidden cursor-crosshair"
            style={{ 
              width: canvasSize.width, 
              height: canvasSize.height,
              margin: '0 auto'
            }}
            onClick={handleCanvasClick}
          >
            {/* Images */}
            {images.map(img => (
              <div
                key={img.id}
                className={`absolute select-none border-2 ${
                  selectedElement === img.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-transparent hover:border-blue-300'
                } ${isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: img.x,
                  top: img.y,
                  width: img.width,
                  height: img.height,
                  transform: `rotate(${img.rotation}deg)`,
                  zIndex: img.zIndex
                }}
                onMouseDown={(e) => handleMouseDown(e, img.id)}
              >
                <img
                  src={img.src}
                  alt="Layout element"
                  className="w-full h-full object-cover rounded"
                  draggable={false}
                />
                
                {/* Resize handles */}
                {selectedElement === img.id && (
                  <>
                    <div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded cursor-se-resize border-2 border-white shadow-lg"
                      onMouseDown={(e) => handleMouseDown(e, img.id, 'se')}
                    ></div>
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded cursor-ne-resize border-2 border-white shadow-lg"
                      onMouseDown={(e) => handleMouseDown(e, img.id, 'ne')}
                    ></div>
                    <div 
                      className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded cursor-nw-resize border-2 border-white shadow-lg"
                      onMouseDown={(e) => handleMouseDown(e, img.id, 'nw')}
                    ></div>
                    <div 
                      className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded cursor-sw-resize border-2 border-white shadow-lg"
                      onMouseDown={(e) => handleMouseDown(e, img.id, 'sw')}
                    ></div>
                  </>
                )}
              </div>
            ))}

            {/* Text Elements */}
            {texts.map(text => (
              <div
                key={text.id}
                className={`absolute select-none ${
                  selectedElement === text.id 
                    ? 'ring-2 ring-blue-500 cursor-grabbing' 
                    : 'cursor-grab hover:ring-2 hover:ring-blue-300'
                }`}
                style={{
                  left: text.x,
                  top: text.y,
                  fontSize: text.fontSize,
                  color: text.color,
                  fontWeight: text.fontWeight,
                  zIndex: text.zIndex,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)', // Better visibility on images
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedElement === text.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
                onMouseDown={(e) => handleMouseDown(e, text.id)}
              >
                {text.text}
              </div>
            ))}

            {/* Arrows */}
            {arrows.map(arrow => (
              <svg
                key={arrow.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: 0, 
                  top: 0, 
                  width: canvasSize.width, 
                  height: canvasSize.height,
                  zIndex: arrow.zIndex
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(arrow.id);
                }}
              >
                <defs>
                  <marker
                    id={`arrowhead-${arrow.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={arrow.color}
                    />
                  </marker>
                </defs>
                <line
                  x1={arrow.startX}
                  y1={arrow.startY}
                  x2={arrow.endX}
                  y2={arrow.endY}
                  stroke={arrow.color}
                  strokeWidth={arrow.thickness}
                  markerEnd={`url(#arrowhead-${arrow.id})`}
                  className={selectedElement === arrow.id ? 'stroke-blue-500' : ''}
                />
              </svg>
            ))}

            {/* Instructions Overlay */}
            {images.length === 0 && texts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Start Building Your Layout</p>
                  <p className="text-sm">Add images, text, and annotations to create a collage</p>
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
            <CardTitle className="text-white text-sm">Element Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedImage = images.find(img => img.id === selectedElement);
              const selectedText = texts.find(text => text.id === selectedElement);
              const selectedArrow = arrows.find(arrow => arrow.id === selectedElement);

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
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement ? { ...img, width: newWidth } : img
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
                            setImages(prev => prev.map(img => 
                              img.id === selectedElement ? { ...img, height: newHeight } : img
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement 
                              ? { ...img, zIndex: Math.max(...allElements.map(el => el.zIndex)) + 1 }
                              : img
                          ));
                        }}
                      >
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Bring Forward
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement 
                              ? { ...img, zIndex: Math.min(...allElements.map(el => el.zIndex)) - 1 }
                              : img
                          ));
                        }}
                      >
                        <ArrowDown className="w-3 h-3 mr-1" />
                        Send Back
                      </Button>
                    </div>
                  </div>
                );
              }

              if (selectedText) {
                return (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-xs">Text Content</Label>
                      <Textarea
                        value={selectedText.text}
                        onChange={(e) => {
                          setTexts(prev => prev.map(text => 
                            text.id === selectedElement ? { ...text, text: e.target.value } : text
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white text-xs"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>
                  </div>
                );
              }

              return <div className="text-slate-400 text-sm">Select an element to edit properties</div>;
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