"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import type { 
  LayoutImage, 
  LayoutText, 
  LayoutArrow, 
  CanvasSize, 
  AspectRatio, 
  DragState 
} from "./LayoutPlannerTypes";

export function useLayoutPlanner() {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [images, setImages] = useState<LayoutImage[]>([]);
  const [texts, setTexts] = useState<LayoutText[]>([]);
  const [arrows, setArrows] = useState<LayoutArrow[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isAddingArrow, setIsAddingArrow] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [croppingImageId, setCroppingImageId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    resizeHandle: '',
    dragStart: { x: 0, y: 0 },
    elementStart: { x: 0, y: 0, width: 0, height: 0 }
  });

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

  const handleAddImage = useCallback(async (file: File) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newImage: LayoutImage = {
            id: `img_${Date.now()}`,
            src: e.target?.result as string,
            x: 50,
            y: 50,
            width: Math.min(200, img.naturalWidth),
            height: Math.min(200, img.naturalHeight * (Math.min(200, img.naturalWidth) / img.naturalWidth)),
            rotation: 0,
            zIndex: images.length + texts.length + arrows.length + 1,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
          };
          setImages(prev => [...prev, newImage]);
          toast({ title: "Image Added", description: "Image added to layout" });
          resolve();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, [images.length, texts.length, arrows.length]);

  const handleAddText = useCallback(() => {
    const newText: LayoutText = {
      id: `text_${Date.now()}`,
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 'normal',
      zIndex: images.length + texts.length + arrows.length + 1,
    };
    setTexts(prev => [...prev, newText]);
    setSelectedElement(newText.id);
    setIsAddingText(false);
    toast({ title: "Text Added", description: "Text element added to layout" });
  }, [images.length, texts.length, arrows.length]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;

    setImages(prev => prev.filter(img => img.id !== selectedElement));
    setTexts(prev => prev.filter(text => text.id !== selectedElement));
    setArrows(prev => prev.filter(arrow => arrow.id !== selectedElement));
    setSelectedElement(null);
    toast({ title: "Element Deleted", description: "Element removed from layout" });
  }, [selectedElement]);

  const clearAll = useCallback(() => {
    setImages([]);
    setTexts([]);
    setArrows([]);
    setSelectedElement(null);
    toast({ title: "Layout Cleared", description: "All elements removed" });
  }, []);

  const exportLayout = useCallback(() => {
    const layout = {
      canvasSize,
      aspectRatio,
      images,
      texts,
      arrows,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Layout Exported", description: "Layout saved as JSON file" });
  }, [canvasSize, aspectRatio, images, texts, arrows]);

  const startCropImage = useCallback((imageId: string) => {
    setIsCropping(true);
    setCroppingImageId(imageId);
    setSelectedElement(null);
  }, []);

  const handleCropComplete = useCallback((imageId: string, croppedImageUrl: string, cropData: any) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return {
          ...img,
          src: croppedImageUrl,
          cropData: cropData,
          // Update dimensions to match cropped size
          width: Math.min(200, cropData.width),
          height: Math.min(200, cropData.height * (Math.min(200, cropData.width) / cropData.width)),
        };
      }
      return img;
    }));
    setIsCropping(false);
    setCroppingImageId(null);
    toast({ title: "Image Cropped", description: "Image has been cropped and updated" });
  }, []);

  const cancelCrop = useCallback(() => {
    setIsCropping(false);
    setCroppingImageId(null);
  }, []);

  return {
    // State
    canvasSize,
    aspectRatio,
    images,
    texts,
    arrows,
    selectedElement,
    isAddingText,
    isAddingArrow,
    dragState,
    isCropping,
    croppingImageId,

    // Refs
    canvasRef,
    fileInputRef,

    // Setters
    setAspectRatio,
    setImages,
    setTexts,
    setArrows,
    setSelectedElement,
    setIsAddingText,
    setIsAddingArrow,
    setDragState,

    // Actions
    handleAddImage,
    handleAddText,
    deleteSelectedElement,
    clearAll,
    exportLayout,
    startCropImage,
    handleCropComplete,
    cancelCrop
  };
}