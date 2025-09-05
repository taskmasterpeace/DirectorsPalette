"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Type, 
  Image as ImageIcon, 
  Download,
  Square,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  Save,
  FolderOpen
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { saveImageToLibrary } from "@/lib/post-production/referenceLibrary";

// Restored original bounding box interface
interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
}

// New collage image interface
interface CollageImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
  visible: boolean;
  zIndex: number;
}

// New independent text interface
interface IndependentText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

type DragMode = 'none' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';
type ElementType = 'box' | 'image' | 'text';

const colors = [
  "#FF5733", "#33A1FD", "#4CAF50", "#9C27B0", "#FF9800", 
  "#E91E63", "#00BCD4", "#8BC34A", "#FFC107", "#795548"
];

export default function CompleteLayoutEditor() {
  // Canvas setup
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  
  // Element collections
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [collageImages, setCollageImages] = useState<CollageImage[]>([]);
  const [independentTexts, setIndependentTexts] = useState<IndependentText[]>([]);
  
  // Interaction state
  const [selectedElement, setSelectedElement] = useState<{id: string, type: ElementType} | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  
  // Drawing/dragging state
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [currentBox, setCurrentBox] = useState<Partial<BoundingBox> | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<any>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Get next available color
  const getNextColor = () => {
    if (boundingBoxes.length === 0) return colors[0];
    const recentColors = boundingBoxes.slice(-3).map(box => box.color);
    const availableColors = colors.filter(color => !recentColors.includes(color));
    return availableColors.length > 0 
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : colors[Math.floor(Math.random() * colors.length)];
  };

  // MOUSE DOWN - Start drawing or dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If in edit mode or dragging, don't start new actions
    if (dragMode !== 'none' || editingText) return;
    
    // If clicking on selected box, handled by box's own handlers
    if (selectedElement) return;

    // Start drawing new bounding box
    setIsDrawingBox(true);
    setStartPos({ x, y });
    
    const newBox: Partial<BoundingBox> = {
      id: Date.now().toString(),
      x,
      y,
      width: 0,
      height: 0,
      color: getNextColor(),
      text: '',
    };
    
    setCurrentBox(newBox);
  };

  // MOUSE MOVE - Handle drawing and dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Drawing new bounding box
    if (isDrawingBox && currentBox) {
      setCurrentBox({
        ...currentBox,
        width: Math.abs(x - startPos.x),
        height: Math.abs(y - startPos.y),
        x: Math.min(x, startPos.x),
        y: Math.min(y, startPos.y)
      });
      return;
    }
    
    // Dragging or resizing existing elements
    if (dragMode !== 'none' && draggedElement) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      if (draggedElement.type === 'box') {
        let updatedBox = { ...draggedElement };
        
        switch (dragMode) {
          case 'move':
            updatedBox.x = Math.max(0, Math.min(draggedElement.x + dx, canvasSize.width - draggedElement.width));
            updatedBox.y = Math.max(0, Math.min(draggedElement.y + dy, canvasSize.height - draggedElement.height));
            break;
            
          case 'resize-se':
            updatedBox.width = Math.max(20, draggedElement.width + dx);
            updatedBox.height = Math.max(20, draggedElement.height + dy);
            break;
            
          case 'resize-sw':
            const newWidth = Math.max(20, draggedElement.width - dx);
            updatedBox.width = newWidth;
            updatedBox.height = Math.max(20, draggedElement.height + dy);
            updatedBox.x = draggedElement.x + (draggedElement.width - newWidth);
            break;
            
          case 'resize-ne':
            updatedBox.width = Math.max(20, draggedElement.width + dx);
            const newHeight = Math.max(20, draggedElement.height - dy);
            updatedBox.height = newHeight;
            updatedBox.y = draggedElement.y + (draggedElement.height - newHeight);
            break;
            
          case 'resize-nw':
            const nwWidth = Math.max(20, draggedElement.width - dx);
            const nwHeight = Math.max(20, draggedElement.height - dy);
            updatedBox.width = nwWidth;
            updatedBox.height = nwHeight;
            updatedBox.x = draggedElement.x + (draggedElement.width - nwWidth);
            updatedBox.y = draggedElement.y + (draggedElement.height - nwHeight);
            break;
        }
        
        setBoundingBoxes(prev => 
          prev.map(box => box.id === draggedElement.id ? updatedBox : box)
        );
      }
      
      if (draggedElement.type === 'image') {
        let updatedImage = { ...draggedElement };
        
        if (dragMode === 'move') {
          updatedImage.x = Math.max(0, Math.min(draggedElement.x + dx, canvasSize.width - draggedElement.width));
          updatedImage.y = Math.max(0, Math.min(draggedElement.y + dy, canvasSize.height - draggedElement.height));
        } else if (dragMode === 'resize-se') {
          const newWidth = Math.max(50, draggedElement.width + dx);
          const newHeight = newWidth / draggedElement.aspectRatio; // PRESERVE ASPECT RATIO
          updatedImage.width = newWidth;
          updatedImage.height = newHeight;
        }
        
        setCollageImages(prev => 
          prev.map(img => img.id === draggedElement.id ? updatedImage : img)
        );
      }
      
      if (draggedElement.type === 'text') {
        let updatedText = { ...draggedElement };
        updatedText.x = Math.max(0, Math.min(draggedElement.x + dx, canvasSize.width - 100));
        updatedText.y = Math.max(20, Math.min(draggedElement.y + dy, canvasSize.height - 10));
        
        setIndependentTexts(prev => 
          prev.map(text => text.id === draggedElement.id ? updatedText : text)
        );
      }
    }
  };

  // MOUSE UP - Finish drawing or dragging
  const handleMouseUp = () => {
    if (isDrawingBox && currentBox && currentBox.width! > 10 && currentBox.height! > 10) {
      const finalBox: BoundingBox = {
        id: currentBox.id!,
        x: currentBox.x!,
        y: currentBox.y!,
        width: currentBox.width!,
        height: currentBox.height!,
        color: currentBox.color!,
        text: currentBox.text!,
      };
      
      setBoundingBoxes(prev => [...prev, finalBox]);
      setSelectedElement({ id: finalBox.id, type: 'box' });
      
      // Auto-start text editing
      setTimeout(() => {
        setEditingText(finalBox.id);
        inputRef.current?.focus();
      }, 10);
    }
    
    setIsDrawingBox(false);
    setCurrentBox(null);
    setDragMode('none');
    setDraggedElement(null);
  };

  // Start dragging element
  const startDrag = (e: React.MouseEvent, element: any, type: ElementType, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragMode(mode);
    setDragStartPos({ x, y });
    setDraggedElement({ ...element, type });
    setSelectedElement({ id: element.id, type });
  };

  // Add collage image
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

        const newImage: CollageImage = {
          id: Date.now().toString() + Math.random(),
          src: e.target?.result as string,
          x: Math.random() * (canvasSize.width - width),
          y: Math.random() * (canvasSize.height - height),
          width,
          height,
          aspectRatio,
          visible: true,
          zIndex: collageImages.length + 1
        };

        setCollageImages(prev => [...prev, newImage]);
        setSelectedElement({ id: newImage.id, type: 'image' });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add independent text
  const addText = () => {
    const newText: IndependentText = {
      id: Date.now().toString(),
      text: "New Text",
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2,
      fontSize: 24,
      color: "#FFFFFF",
      fontWeight: 'bold'
    };

    setIndependentTexts(prev => [...prev, newText]);
    setSelectedElement({ id: newText.id, type: 'text' });
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedElement) return;

    switch (selectedElement.type) {
      case 'box':
        setBoundingBoxes(prev => prev.filter(box => box.id !== selectedElement.id));
        break;
      case 'image':
        setCollageImages(prev => prev.filter(img => img.id !== selectedElement.id));
        break;
      case 'text':
        setIndependentTexts(prev => prev.filter(text => text.id !== selectedElement.id));
        break;
    }
    
    setSelectedElement(null);
    setEditingText(null);
  };

  // Export complete layout
  const exportLayout = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const SCALE = 2; // High resolution export
      canvas.width = canvasSize.width * SCALE;
      canvas.height = canvasSize.height * SCALE;
      ctx.scale(SCALE, SCALE);

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw images first (lowest layer)
      for (const img of collageImages.filter(img => img.visible)) {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          imgElement.onload = resolve;
          imgElement.src = img.src;
        });
        ctx.drawImage(imgElement, img.x, img.y, img.width, img.height);
      }

      // Draw bounding boxes
      boundingBoxes.forEach(box => {
        ctx.strokeStyle = box.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = box.color + "33"; // Transparent fill
        ctx.fillRect(box.x, box.y, box.width, box.height);
        
        if (box.text) {
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText(box.text, box.x + 8, box.y + 24);
        }
      });

      // Draw independent texts
      independentTexts.forEach(text => {
        ctx.font = `${text.fontWeight} ${text.fontSize}px Arial`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeText(text.text, text.x, text.y + text.fontSize); // Text outline
        ctx.fillText(text.text, text.x, text.y + text.fontSize);
      });

      // Add watermark
      ctx.font = "14px Arial";
      ctx.fillStyle = "#666666";
      ctx.textAlign = "center";
      ctx.fillText("Machine King Labs", canvasSize.width / 2, canvasSize.height - 15);

      // Export
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
            description: "High-resolution layout saved"
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

  // Save layout to library
  const saveToLibrary = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Render layout (same as export but for library)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw images
      for (const img of collageImages.filter(img => img.visible)) {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          imgElement.onload = resolve;
          imgElement.src = img.src;
        });
        ctx.drawImage(imgElement, img.x, img.y, img.width, img.height);
      }

      // Draw annotations
      boundingBoxes.forEach(box => {
        ctx.strokeStyle = box.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = box.color + "33";
        ctx.fillRect(box.x, box.y, box.width, box.height);
        
        if (box.text) {
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText(box.text, box.x + 5, box.y + 18);
        }
      });

      // Draw texts
      independentTexts.forEach(text => {
        ctx.font = `${text.fontWeight} ${text.fontSize}px Arial`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeText(text.text, text.x, text.y + text.fontSize);
        ctx.fillText(text.text, text.x, text.y + text.fontSize);
      });

      // Convert to data URL and save to library
      const dataUrl = canvas.toDataURL('image/png');
      
      await saveImageToLibrary({
        imageData: dataUrl,
        preview: dataUrl,
        tags: ['layout', 'annotated'],
        prompt: `Layout with ${boundingBoxes.length} annotations and ${collageImages.length} images`,
        category: 'layouts',
        source: 'layout-editor'
      });

      toast({
        title: "Saved to Layouts",
        description: "Layout saved to reference library"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save to library",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Complete Layout & Annotation Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Canvas Size</Label>
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
            
            <div className="text-xs text-slate-400 flex items-end">
              {collageImages.length} images • {boundingBoxes.length} boxes • {independentTexts.length} text elements
            </div>
          </div>

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
            >
              <Square className="w-4 h-4 mr-2" />
              Draw Boxes
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
              Delete
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={saveToLibrary}
              disabled={collageImages.length === 0 && boundingBoxes.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Layouts
            </Button>
            
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={exportLayout}
              disabled={collageImages.length === 0 && boundingBoxes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export as PNG
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div 
            ref={canvasRef}
            className="relative bg-white rounded-lg mx-auto border-2 border-slate-600 select-none"
            style={{ 
              width: canvasSize.width, 
              height: canvasSize.height
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            
            {/* Background Images (bottom layer) */}
            {collageImages
              .filter(img => img.visible)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(img => (
              <div
                key={img.id}
                className={`absolute border-2 ${
                  selectedElement?.id === img.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-transparent hover:border-blue-300'
                } cursor-move`}
                style={{
                  left: img.x,
                  top: img.y,
                  width: img.width,
                  height: img.height,
                  zIndex: img.zIndex
                }}
                onMouseDown={(e) => startDrag(e, img, 'image', 'move')}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: img.id, type: 'image' });
                }}
              >
                <img
                  src={img.src}
                  alt="Collage element"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                
                {/* Image resize handle */}
                {selectedElement?.id === img.id && (
                  <div 
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-se-resize hover:bg-blue-600"
                    onMouseDown={(e) => startDrag(e, img, 'image', 'resize-se')}
                  />
                )}
              </div>
            ))}

            {/* Bounding Boxes (annotation layer) */}
            {boundingBoxes.map(box => (
              <div
                key={box.id}
                className={`absolute border-2 ${
                  selectedElement?.id === box.id ? 'shadow-lg' : ''
                }`}
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  borderColor: box.color,
                  backgroundColor: box.color + "20", // Transparent background
                  zIndex: 100 // Above images
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: box.id, type: 'box' });
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: box.id, type: 'box' });
                  setEditingText(box.id);
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}
                onMouseDown={(e) => startDrag(e, box, 'box', 'move')}
              >
                {/* Box text */}
                {box.text && (
                  <div 
                    className="absolute top-1 left-1 text-sm font-bold text-black bg-white/80 px-1 rounded"
                    style={{ color: box.color }}
                  >
                    {box.text}
                  </div>
                )}
                
                {/* Resize handles for boxes */}
                {selectedElement?.id === box.id && (
                  <>
                    <div 
                      className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded cursor-nw-resize"
                      onMouseDown={(e) => startDrag(e, box, 'box', 'resize-nw')}
                    />
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded cursor-ne-resize"
                      onMouseDown={(e) => startDrag(e, box, 'box', 'resize-ne')}
                    />
                    <div 
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded cursor-sw-resize"
                      onMouseDown={(e) => startDrag(e, box, 'box', 'resize-sw')}
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded cursor-se-resize"
                      onMouseDown={(e) => startDrag(e, box, 'box', 'resize-se')}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Current drawing box */}
            {isDrawingBox && currentBox && (
              <div
                className="absolute border-2 border-dashed pointer-events-none"
                style={{
                  left: currentBox.x,
                  top: currentBox.y,
                  width: currentBox.width,
                  height: currentBox.height,
                  borderColor: currentBox.color,
                  backgroundColor: currentBox.color + "20"
                }}
              />
            )}

            {/* Independent Text Elements (top layer) */}
            {independentTexts.map(text => (
              <div
                key={text.id}
                className={`absolute cursor-move select-none px-2 py-1 rounded ${
                  selectedElement?.id === text.id 
                    ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                    : 'hover:ring-1 hover:ring-blue-300'
                }`}
                style={{
                  left: text.x,
                  top: text.y,
                  fontSize: text.fontSize,
                  color: text.color,
                  fontWeight: text.fontWeight,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  zIndex: 200 // Above everything
                }}
                onMouseDown={(e) => startDrag(e, text, 'text', 'move')}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: text.id, type: 'text' });
                }}
              >
                {text.text}
              </div>
            ))}

            {/* Instructions */}
            {collageImages.length === 0 && boundingBoxes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-slate-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-bold mb-2">Complete Layout Editor</p>
                  <p className="text-sm mb-1">• Add images for collages</p>
                  <p className="text-sm mb-1">• Draw bounding boxes to annotate</p>
                  <p className="text-sm mb-1">• Add text labels anywhere</p>
                  <p className="text-sm">• Drag to move, resize handles to scale</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel - PERSISTENT */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">
            {selectedElement ? 
              `Edit ${selectedElement.type === 'box' ? 'Bounding Box' : 
                     selectedElement.type === 'image' ? 'Image' : 'Text'}` : 
              'Element Properties'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[120px]">
          {selectedElement ? (
            (() => {
              if (selectedElement.type === 'box') {
                const box = boundingBoxes.find(b => b.id === selectedElement.id);
                if (!box) return null;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-sm">Box Text</Label>
                      {editingText === box.id ? (
                        <Input
                          ref={inputRef}
                          value={box.text}
                          onChange={(e) => {
                            setBoundingBoxes(prev => prev.map(b => 
                              b.id === box.id ? { ...b, text: e.target.value } : b
                            ));
                          }}
                          onBlur={() => setEditingText(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingText(null);
                            }
                          }}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="Enter text for this box..."
                        />
                      ) : (
                        <div 
                          className="p-2 bg-slate-800 border border-slate-600 rounded cursor-pointer text-white"
                          onClick={() => {
                            setEditingText(box.id);
                            setTimeout(() => inputRef.current?.focus(), 10);
                          }}
                        >
                          {box.text || "Click to add text..."}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <Label className="text-slate-300">X</Label>
                        <Input
                          type="number"
                          value={Math.round(box.x)}
                          onChange={(e) => {
                            const newX = Math.max(0, parseInt(e.target.value) || 0);
                            setBoundingBoxes(prev => prev.map(b => 
                              b.id === box.id ? { ...b, x: newX } : b
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Y</Label>
                        <Input
                          type="number"
                          value={Math.round(box.y)}
                          onChange={(e) => {
                            const newY = Math.max(0, parseInt(e.target.value) || 0);
                            setBoundingBoxes(prev => prev.map(b => 
                              b.id === box.id ? { ...b, y: newY } : b
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(box.width)}
                          onChange={(e) => {
                            const newWidth = Math.max(20, parseInt(e.target.value) || 20);
                            setBoundingBoxes(prev => prev.map(b => 
                              b.id === box.id ? { ...b, width: newWidth } : b
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Height</Label>
                        <Input
                          type="number"
                          value={Math.round(box.height)}
                          onChange={(e) => {
                            const newHeight = Math.max(20, parseInt(e.target.value) || 20);
                            setBoundingBoxes(prev => prev.map(b => 
                              b.id === box.id ? { ...b, height: newHeight } : b
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (selectedElement.type === 'image') {
                const img = collageImages.find(i => i.id === selectedElement.id);
                if (!img) return null;
                
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <Label className="text-slate-300">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(img.width)}
                          onChange={(e) => {
                            const newWidth = Math.max(50, parseInt(e.target.value) || img.width);
                            const newHeight = newWidth / img.aspectRatio;
                            setCollageImages(prev => prev.map(i => 
                              i.id === img.id ? { ...i, width: newWidth, height: newHeight } : i
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Height</Label>
                        <Input
                          type="number"
                          value={Math.round(img.height)}
                          onChange={(e) => {
                            const newHeight = Math.max(50, parseInt(e.target.value) || img.height);
                            const newWidth = newHeight * img.aspectRatio;
                            setCollageImages(prev => prev.map(i => 
                              i.id === img.id ? { ...i, width: newWidth, height: newHeight } : i
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">X</Label>
                        <Input
                          type="number"
                          value={Math.round(img.x)}
                          onChange={(e) => {
                            const newX = Math.max(0, parseInt(e.target.value) || 0);
                            setCollageImages(prev => prev.map(i => 
                              i.id === img.id ? { ...i, x: newX } : i
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Y</Label>
                        <Input
                          type="number"
                          value={Math.round(img.y)}
                          onChange={(e) => {
                            const newY = Math.max(0, parseInt(e.target.value) || 0);
                            setCollageImages(prev => prev.map(i => 
                              i.id === img.id ? { ...i, y: newY } : i
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (selectedElement.type === 'text') {
                const text = independentTexts.find(t => t.id === selectedElement.id);
                if (!text) return null;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-sm">Text Content</Label>
                      <Textarea
                        value={text.text}
                        onChange={(e) => {
                          setIndependentTexts(prev => prev.map(t => 
                            t.id === text.id ? { ...t, text: e.target.value } : t
                          ));
                        }}
                        className="bg-slate-800 border-slate-600 text-white"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-slate-300">Size</Label>
                        <Input
                          type="number"
                          value={text.fontSize}
                          onChange={(e) => {
                            const newSize = Math.max(12, parseInt(e.target.value) || 24);
                            setIndependentTexts(prev => prev.map(t => 
                              t.id === text.id ? { ...t, fontSize: newSize } : t
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Color</Label>
                        <Input
                          type="color"
                          value={text.color}
                          onChange={(e) => {
                            setIndependentTexts(prev => prev.map(t => 
                              t.id === text.id ? { ...t, color: e.target.value } : t
                            ));
                          }}
                          className="bg-slate-800 border-slate-600 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Weight</Label>
                        <Select 
                          value={text.fontWeight} 
                          onValueChange={(value: any) => {
                            setIndependentTexts(prev => prev.map(t => 
                              t.id === text.id ? { ...t, fontWeight: value } : t
                            ));
                          }}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p>Select an element to edit its properties</p>
              <p className="text-xs mt-2">• Click to select • Double-click boxes to edit text • Drag to move • Use resize handles</p>
            </div>
          )}
        </CardContent>
      </Card>

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