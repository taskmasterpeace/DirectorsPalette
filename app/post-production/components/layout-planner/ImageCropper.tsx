"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crop, Check, X, RotateCw, FlipHorizontal, FlipVertical, Maximize } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  imageId: string;
  originalWidth: number;
  originalHeight: number;
  onCropComplete: (croppedImageUrl: string, cropArea: CropArea) => void;
  onCancel: () => void;
}

type AspectRatioPreset = "free" | "1:1" | "4:3" | "16:9" | "9:16" | "2:3" | "3:2";

const ASPECT_RATIOS: Record<AspectRatioPreset, number | null> = {
  "free": null,
  "1:1": 1,
  "4:3": 4/3,
  "16:9": 16/9,
  "9:16": 9/16,
  "2:3": 2/3,
  "3:2": 3/2,
};

export function ImageCropper({
  imageSrc,
  imageId,
  originalWidth,
  originalHeight,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: originalWidth,
    height: originalHeight,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("free");
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "resize" | null>(null);
  const [dragHandle, setDragHandle] = useState<string>("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image and initialize
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Initialize crop area to center 80% of image
      const initialWidth = originalWidth * 0.8;
      const initialHeight = originalHeight * 0.8;
      setCropArea({
        x: (originalWidth - initialWidth) / 2,
        y: (originalHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
      drawPreview();
    };
    img.src = imageSrc;
  }, [imageSrc, originalWidth, originalHeight]);

  // Draw preview whenever crop area changes
  useEffect(() => {
    drawPreview();
  }, [cropArea, rotation, flipH, flipV, zoom]);

  const drawPreview = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    if (!container) return;

    const maxWidth = container.clientWidth - 40;
    const maxHeight = 400;

    const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);
    canvas.width = originalWidth * scale;
    canvas.height = originalHeight * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw full image with darkened overlay
    ctx.save();
    ctx.scale(scale, scale);

    // Apply transforms
    ctx.translate(originalWidth / 2, originalHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);
    ctx.translate(-originalWidth / 2, -originalHeight / 2);

    ctx.globalAlpha = 0.3;
    ctx.drawImage(imageRef.current, 0, 0, originalWidth, originalHeight);
    ctx.restore();

    // Draw cropped area at full opacity
    ctx.save();
    ctx.scale(scale, scale);

    // Apply transforms for crop preview
    ctx.translate(originalWidth / 2, originalHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);
    ctx.translate(-originalWidth / 2, -originalHeight / 2);

    // Set clipping region
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();

    ctx.drawImage(imageRef.current, 0, 0, originalWidth, originalHeight);
    ctx.restore();

    // Draw crop border and handles
    ctx.save();
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 8;
    const handles = [
      { x: cropArea.x, y: cropArea.y, cursor: "nw" },
      { x: cropArea.x + cropArea.width, y: cropArea.y, cursor: "ne" },
      { x: cropArea.x, y: cropArea.y + cropArea.height, cursor: "sw" },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, cursor: "se" },
    ];

    ctx.fillStyle = "#ffffff";
    handles.forEach(handle => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    // Rule of thirds grid
    const thirdWidth = cropArea.width / 3;
    const thirdHeight = cropArea.height / 3;

    for (let i = 1; i <= 2; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(cropArea.x + thirdWidth * i, cropArea.y);
      ctx.lineTo(cropArea.x + thirdWidth * i, cropArea.y + cropArea.height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(cropArea.x, cropArea.y + thirdHeight * i);
      ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdHeight * i);
      ctx.stroke();
    }

    ctx.restore();
  }, [cropArea, originalWidth, originalHeight, rotation, flipH, flipV, zoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / originalWidth;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check if clicking on a resize handle
    const handleSize = 16;
    const handles = [
      { x: cropArea.x, y: cropArea.y, type: "nw" },
      { x: cropArea.x + cropArea.width, y: cropArea.y, type: "ne" },
      { x: cropArea.x, y: cropArea.y + cropArea.height, type: "sw" },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, type: "se" },
    ];

    for (const handle of handles) {
      if (
        Math.abs(x - handle.x) < handleSize &&
        Math.abs(y - handle.y) < handleSize
      ) {
        setIsDragging(true);
        setDragType("resize");
        setDragHandle(handle.type);
        setDragStart({ x, y });
        return;
      }
    }

    // Check if clicking inside crop area (for moving)
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragType("move");
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / originalWidth;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (dragType === "move") {
      const newX = Math.max(0, Math.min(x - dragStart.x, originalWidth - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, originalHeight - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (dragType === "resize") {
      const ratio = ASPECT_RATIOS[aspectRatio];
      let newCrop = { ...cropArea };

      switch (dragHandle) {
        case "nw":
          newCrop.width = cropArea.x + cropArea.width - x;
          newCrop.height = ratio ? newCrop.width / ratio : cropArea.y + cropArea.height - y;
          newCrop.x = cropArea.x + cropArea.width - newCrop.width;
          newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          break;
        case "ne":
          newCrop.width = x - cropArea.x;
          newCrop.height = ratio ? newCrop.width / ratio : cropArea.y + cropArea.height - y;
          newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          break;
        case "sw":
          newCrop.width = cropArea.x + cropArea.width - x;
          newCrop.height = ratio ? newCrop.width / ratio : y - cropArea.y;
          newCrop.x = cropArea.x + cropArea.width - newCrop.width;
          break;
        case "se":
          newCrop.width = x - cropArea.x;
          newCrop.height = ratio ? newCrop.width / ratio : y - cropArea.y;
          break;
      }

      // Ensure minimum size and bounds
      newCrop.width = Math.max(50, Math.min(newCrop.width, originalWidth - newCrop.x));
      newCrop.height = Math.max(50, Math.min(newCrop.height, originalHeight - newCrop.y));
      newCrop.x = Math.max(0, Math.min(newCrop.x, originalWidth - 50));
      newCrop.y = Math.max(0, Math.min(newCrop.y, originalHeight - 50));

      setCropArea(newCrop);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    setDragHandle("");
  };

  const handleAspectRatioChange = (value: AspectRatioPreset) => {
    setAspectRatio(value);
    const ratio = ASPECT_RATIOS[value];

    if (ratio) {
      // Adjust crop area to match aspect ratio
      const currentRatio = cropArea.width / cropArea.height;
      let newCrop = { ...cropArea };

      if (currentRatio > ratio) {
        // Too wide, adjust width
        newCrop.width = cropArea.height * ratio;
      } else {
        // Too tall, adjust height
        newCrop.height = cropArea.width / ratio;
      }

      // Center the crop area
      newCrop.x = (originalWidth - newCrop.width) / 2;
      newCrop.y = (originalHeight - newCrop.height) / 2;

      setCropArea(newCrop);
    }
  };

  const handleCropComplete = async () => {
    if (!imageRef.current) return;

    // Create a canvas for the cropped image
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;
    const ctx = cropCanvas.getContext("2d");

    if (!ctx) return;

    // Apply transformations and draw cropped image
    ctx.save();

    // Move to center for rotation
    ctx.translate(cropCanvas.width / 2, cropCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);

    // Draw the cropped portion
    ctx.drawImage(
      imageRef.current,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      -cropArea.width / 2,
      -cropArea.height / 2,
      cropArea.width,
      cropArea.height
    );

    ctx.restore();

    // Convert to data URL and pass to parent
    const croppedImageUrl = cropCanvas.toDataURL("image/png");
    onCropComplete(croppedImageUrl, cropArea);
    toast({ title: "Image Cropped", description: "Image has been cropped successfully" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Crop Image</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleCropComplete}>
                <Check className="w-4 h-4 mr-1" /> Apply Crop
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Canvas Container */}
            <div className="flex-1" ref={containerRef}>
              <canvas
                ref={canvasRef}
                className="border border-slate-600 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Controls */}
            <div className="w-64 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Aspect Ratio
                </label>
                <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="2:3">Photo (2:3)</SelectItem>
                    <SelectItem value="3:2">Photo (3:2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Rotation: {rotation}°
                </label>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation(prev => prev + 90)}
                  className="flex-1"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFlipH(!flipH)}
                  className="flex-1"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFlipV(!flipV)}
                  className="flex-1"
                >
                  <FlipVertical className="w-4 h-4" />
                </Button>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCropArea({
                    x: 0,
                    y: 0,
                    width: originalWidth,
                    height: originalHeight,
                  });
                  setZoom(1);
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                }}
                className="w-full"
              >
                <Maximize className="w-4 h-4 mr-2" /> Reset
              </Button>

              <div className="text-xs text-slate-400 space-y-1">
                <p>X: {Math.round(cropArea.x)}px</p>
                <p>Y: {Math.round(cropArea.y)}px</p>
                <p>Width: {Math.round(cropArea.width)}px</p>
                <p>Height: {Math.round(cropArea.height)}px</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}