"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Download
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LayoutImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
}

interface LayoutText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function WorkingLayoutEditor() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [images, setImages] = useState<LayoutImage[]>([]);
  const [texts, setTexts] = useState<LayoutText[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update canvas size when aspect ratio changes
  useEffect(() => {
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

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (isDragging && selectedElement) {
      // Dragging - move element
      const selectedImage = images.find(img => img.id === selectedElement);
      const selectedText = texts.find(text => text.id === selectedElement);
      
      if (selectedImage) {
        const newX = Math.max(0, Math.min(elementStart.x + deltaX, canvasSize.width - selectedImage.width));
        const newY = Math.max(0, Math.min(elementStart.y + deltaY, canvasSize.height - selectedImage.height));
        
        setImages(prev => prev.map(img => 
          img.id === selectedElement ? { ...img, x: newX, y: newY } : img
        ));
      }
      
      if (selectedText) {
        const newX = Math.max(0, Math.min(elementStart.x + deltaX, canvasSize.width - 100));
        const newY = Math.max(20, Math.min(elementStart.y + deltaY, canvasSize.height - 10));
        
        setTexts(prev => prev.map(text => 
          text.id === selectedElement ? { ...text, x: newX, y: newY } : text
        ));
      }
    }

    if (isResizing && selectedElement) {
      // Resizing - maintain aspect ratio
      const selectedImage = images.find(img => img.id === selectedElement);
      if (!selectedImage) return;

      const newWidth = Math.max(50, elementStart.width + deltaX);
      const newHeight = newWidth / selectedImage.aspectRatio; // KEEP ASPECT RATIO
      
      // Keep within canvas bounds
      const maxWidth = canvasSize.width - selectedImage.x;
      const maxHeight = canvasSize.height - selectedImage.y;
      
      const finalWidth = Math.min(newWidth, maxWidth);
      const finalHeight = Math.min(newHeight, maxHeight, finalWidth / selectedImage.aspectRatio);
      const adjustedWidth = finalHeight * selectedImage.aspectRatio;

      setImages(prev => prev.map(img => 
        img.id === selectedElement 
          ? { ...img, width: adjustedWidth, height: finalHeight }
          : img
      ));
    }
  }, [isDragging, isResizing, selectedElement, dragStart, elementStart, images, texts, canvasSize]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
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

  // Start dragging an element
  const startDrag = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setSelectedElement(elementId);
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
  };

  // Start resizing an element
  const startResize = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setSelectedElement(elementId);
    setIsResizing(true);

    const element = images.find(img => img.id === elementId);
    if (element) {
      setElementStart({ 
        x: element.x, 
        y: element.y, 
        width: element.width, 
        height: element.height 
      });
    }
  };

  // Add image to layout
  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxSize = 200;
        
        let width = Math.min(img.width, maxSize);
        let height = width / aspectRatio;
        
        if (height > maxSize) {
          height = maxSize;
          width = height * aspectRatio;
        }

        const newImage: LayoutImage = {
          id: Date.now().toString() + Math.random(),
          src: e.target?.result as string,
          x: Math.random() * (canvasSize.width - width),
          y: Math.random() * (canvasSize.height - height),
          width,
          height,
          aspectRatio
        };

        setImages(prev => [...prev, newImage]);
        setSelectedElement(newImage.id);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add text
  const addText = () => {
    const newText: LayoutText = {
      id: Date.now().toString() + Math.random(),
      text: "New Text",
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2,
      fontSize: 32,
      color: "#FFFFFF"
    };

    setTexts(prev => [...prev, newText]);
    setSelectedElement(newText.id);
  };

  // Delete selected
  const deleteSelected = () => {
    if (!selectedElement) return;
    setImages(prev => prev.filter(img => img.id !== selectedElement));
    setTexts(prev => prev.filter(text => text.id !== selectedElement));
    setSelectedElement(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Collage Layout Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
            
            <Button variant="outline" onClick={addText}>
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            
            <Button variant="outline" onClick={deleteSelected} disabled={!selectedElement}>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
            
            <Button variant="secondary" disabled={images.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Collage
            </Button>
          </div>

          <div className="text-xs text-slate-400">
            {images.length} images • {texts.length} text elements • Click and drag to move • Drag resize handle to scale
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div 
            ref={canvasRef}
            className="relative bg-white rounded-lg mx-auto border-2 border-slate-600"
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
                className={`absolute border-2 ${
                  selectedElement === img.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-transparent hover:border-blue-300'
                } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: img.x,
                  top: img.y,
                  width: img.width,
                  height: img.height
                }}
                onMouseDown={(e) => startDrag(e, img.id)}
              >
                <img
                  src={img.src}
                  alt="Collage element"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                
                {/* Resize handle - bottom right corner */}
                {selectedElement === img.id && (
                  <div 
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-se-resize hover:bg-blue-600"
                    onMouseDown={(e) => startResize(e, img.id)}
                    title="Drag to resize (maintains aspect ratio)"
                  />
                )}
              </div>
            ))}

            {/* Text Elements */}
            {texts.map(text => (
              <div
                key={text.id}
                className={`absolute cursor-move select-none px-2 py-1 rounded ${
                  selectedElement === text.id 
                    ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                    : 'hover:ring-1 hover:ring-blue-300 hover:bg-blue-500/10'
                }`}
                style={{
                  left: text.x,
                  top: text.y,
                  fontSize: text.fontSize,
                  color: text.color,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
                }}
                onMouseDown={(e) => startDrag(e, text.id)}
              >
                {text.text}
              </div>
            ))}

            {/* Instructions */}
            {images.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-bold mb-2">Create Your Collage</h3>
                  <p className="text-sm mb-1">• Add multiple images</p>
                  <p className="text-sm mb-1">• Drag images to move them</p>
                  <p className="text-sm mb-1">• Drag resize handle to scale (keeps aspect ratio)</p>
                  <p className="text-sm">• Add text annotations anywhere</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties for selected element */}
      {selectedElement && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Edit Selected {images.find(i => i.id === selectedElement) ? 'Image' : 'Text'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedImage = images.find(img => img.id === selectedElement);
              const selectedText = texts.find(text => text.id === selectedElement);

              if (selectedImage) {
                return (
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <Label className="text-slate-300">Width</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedImage.width)}
                        onChange={(e) => {
                          const newWidth = Math.max(20, parseInt(e.target.value) || selectedImage.width);
                          const newHeight = newWidth / selectedImage.aspectRatio;
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement 
                              ? { ...img, width: newWidth, height: newHeight } 
                              : img
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Height</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedImage.height)}
                        onChange={(e) => {
                          const newHeight = Math.max(20, parseInt(e.target.value) || selectedImage.height);
                          const newWidth = newHeight * selectedImage.aspectRatio;
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement 
                              ? { ...img, width: newWidth, height: newHeight } 
                              : img
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">X</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedImage.x)}
                        onChange={(e) => {
                          const newX = Math.max(0, Math.min(parseInt(e.target.value) || 0, canvasSize.width - selectedImage.width));
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement ? { ...img, x: newX } : img
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Y</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedImage.y)}
                        onChange={(e) => {
                          const newY = Math.max(0, Math.min(parseInt(e.target.value) || 0, canvasSize.height - selectedImage.height));
                          setImages(prev => prev.map(img => 
                            img.id === selectedElement ? { ...img, y: newY } : img
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                  </div>
                );
              }

              if (selectedText) {
                return (
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="col-span-2">
                      <Label className="text-slate-300">Text</Label>
                      <Input
                        value={selectedText.text}
                        onChange={(e) => {
                          setTexts(prev => prev.map(text => 
                            text.id === selectedElement ? { ...text, text: e.target.value } : text
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Size</Label>
                      <Input
                        type="number"
                        value={selectedText.fontSize}
                        onChange={(e) => {
                          const newSize = Math.max(12, parseInt(e.target.value) || 24);
                          setTexts(prev => prev.map(text => 
                            text.id === selectedElement ? { ...text, fontSize: newSize } : text
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Color</Label>
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
                );
              }

              return null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* File input */}
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