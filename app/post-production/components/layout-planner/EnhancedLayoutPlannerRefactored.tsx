"use client";

import { useCallback } from "react";
import { LayoutPlannerControls } from "./LayoutPlannerControls";
import { LayoutCanvas } from "./LayoutCanvas";
import { ElementPropertyPanel } from "./ElementPropertyPanel";
import { useLayoutPlanner } from "./LayoutPlannerHooks";
import { ImageCropper } from "./ImageCropper";
import type { LayoutImage, LayoutText, LayoutArrow } from "./LayoutPlannerTypes";

export default function EnhancedLayoutPlannerRefactored() {
  const {
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
  } = useLayoutPlanner();

  const hasElements = images.length > 0 || texts.length > 0 || arrows.length > 0;

  // Element update handlers
  const handleUpdateImage = useCallback((id: string, updates: Partial<LayoutImage>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  }, [setImages]);

  const handleUpdateText = useCallback((id: string, updates: Partial<LayoutText>) => {
    setTexts(prev => prev.map(text => text.id === id ? { ...text, ...updates } : text));
  }, [setTexts]);

  const handleUpdateArrow = useCallback((id: string, updates: Partial<LayoutArrow>) => {
    setArrows(prev => prev.map(arrow => arrow.id === id ? { ...arrow, ...updates } : arrow));
  }, [setArrows]);

  // Layer management
  const handleBringForward = useCallback(() => {
    if (!selectedElement) return;
    const allElements = [...images, ...texts, ...arrows];
    const maxZ = Math.max(...allElements.map(el => el.zIndex));
    
    setImages(prev => prev.map(img => 
      img.id === selectedElement ? { ...img, zIndex: maxZ + 1 } : img
    ));
    setTexts(prev => prev.map(text => 
      text.id === selectedElement ? { ...text, zIndex: maxZ + 1 } : text
    ));
    setArrows(prev => prev.map(arrow => 
      arrow.id === selectedElement ? { ...arrow, zIndex: maxZ + 1 } : arrow
    ));
  }, [selectedElement, images, texts, arrows, setImages, setTexts, setArrows]);

  const handleSendBack = useCallback(() => {
    if (!selectedElement) return;
    const allElements = [...images, ...texts, ...arrows];
    const minZ = Math.min(...allElements.map(el => el.zIndex));
    
    setImages(prev => prev.map(img => 
      img.id === selectedElement ? { ...img, zIndex: minZ - 1 } : img
    ));
    setTexts(prev => prev.map(text => 
      text.id === selectedElement ? { ...text, zIndex: minZ - 1 } : text
    ));
    setArrows(prev => prev.map(arrow => 
      arrow.id === selectedElement ? { ...arrow, zIndex: minZ - 1 } : arrow
    ));
  }, [selectedElement, images, texts, arrows, setImages, setTexts, setArrows]);

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, elementType: 'image' | 'text' | 'arrow') => {
    e.preventDefault();
    setSelectedElement(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      isDragging: true,
      isResizing: false,
      resizeHandle: '',
      dragStart: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      elementStart: { x: 0, y: 0, width: 0, height: 0 }
    });
  }, [canvasRef, setSelectedElement, setDragState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragState.dragStart.x;
    const deltaY = currentY - dragState.dragStart.y;

    // Update element position
    setImages(prev => prev.map(img => 
      img.id === selectedElement ? { ...img, x: Math.max(0, img.x + deltaX), y: Math.max(0, img.y + deltaY) } : img
    ));
    setTexts(prev => prev.map(text => 
      text.id === selectedElement ? { ...text, x: Math.max(0, text.x + deltaX), y: Math.max(0, text.y + deltaY) } : text
    ));

    setDragState(prev => ({
      ...prev,
      dragStart: { x: currentX, y: currentY }
    }));
  }, [dragState, selectedElement, canvasRef, setImages, setTexts, setDragState]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      isResizing: false
    }));
  }, [setDragState]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  const handleAddImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  return (
    <div className="h-full flex gap-4">
      {/* Left Sidebar - Controls */}
      <div className="w-80 flex-shrink-0">
        <LayoutPlannerControls
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          onAddImage={handleAddImageClick}
          onAddText={handleAddText}
          onClearAll={clearAll}
          onExport={exportLayout}
          hasElements={hasElements}
        />
      </div>

      {/* Main Canvas */}
      <LayoutCanvas
        canvasSize={canvasSize}
        canvasRef={canvasRef}
        images={images}
        texts={texts}
        arrows={arrows}
        selectedElement={selectedElement}
        dragState={dragState}
        onElementSelect={setSelectedElement}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onCanvasClick={handleCanvasClick}
      />

      {/* Right Sidebar - Properties */}
      <div className="w-80 flex-shrink-0">
        <ElementPropertyPanel
          selectedElement={selectedElement}
          images={images}
          texts={texts}
          arrows={arrows}
          onUpdateImage={handleUpdateImage}
          onUpdateText={handleUpdateText}
          onUpdateArrow={handleUpdateArrow}
          onDeleteElement={deleteSelectedElement}
          onBringForward={handleBringForward}
          onSendBack={handleSendBack}
          onCropImage={startCropImage}
        />
      </div>

      {/* Image Cropper Modal */}
      {isCropping && croppingImageId && (() => {
        const image = images.find(img => img.id === croppingImageId);
        if (!image) return null;
        return (
          <ImageCropper
            imageSrc={image.src}
            imageId={image.id}
            originalWidth={image.originalWidth || image.width}
            originalHeight={image.originalHeight || image.height}
            onCropComplete={(croppedImageUrl, cropArea) =>
              handleCropComplete(image.id, croppedImageUrl, cropArea)
            }
            onCancel={cancelCrop}
          />
        );
      })()}

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