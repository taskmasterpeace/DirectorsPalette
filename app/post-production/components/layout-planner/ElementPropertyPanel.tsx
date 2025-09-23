"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trash,
  Copy,
  ArrowUp,
  ArrowDown,
  Crop
} from "lucide-react";
import type { LayoutImage, LayoutText, LayoutArrow, LayoutElement } from "./LayoutPlannerTypes";

interface ElementPropertyPanelProps {
  selectedElement: string | null;
  images: LayoutImage[];
  texts: LayoutText[];
  arrows: LayoutArrow[];
  onUpdateImage: (id: string, updates: Partial<LayoutImage>) => void;
  onUpdateText: (id: string, updates: Partial<LayoutText>) => void;
  onUpdateArrow: (id: string, updates: Partial<LayoutArrow>) => void;
  onDeleteElement: () => void;
  onBringForward: () => void;
  onSendBack: () => void;
  onCropImage?: (imageId: string) => void;
}

export function ElementPropertyPanel({
  selectedElement,
  images,
  texts,
  arrows,
  onUpdateImage,
  onUpdateText,
  onUpdateArrow,
  onDeleteElement,
  onBringForward,
  onSendBack,
  onCropImage
}: ElementPropertyPanelProps) {
  if (!selectedElement) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400 text-sm">
            Select an element to edit properties
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedImage = images.find(img => img.id === selectedElement);
  const selectedText = texts.find(text => text.id === selectedElement);
  const selectedArrow = arrows.find(arrow => arrow.id === selectedElement);

  const allElements: LayoutElement[] = [...images, ...texts, ...arrows];

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteElement}
            className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <Trash className="w-3 h-3 mr-1" />
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onBringForward}
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <ArrowUp className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSendBack}
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <ArrowDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Image Properties */}
        {selectedImage && (
          <div className="space-y-3">
            {/* Crop Button for Images */}
            {onCropImage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCropImage(selectedElement)}
                className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
              >
                <Crop className="w-3 h-3 mr-1" />
                Crop Image
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">X Position</Label>
                <Input
                  type="number"
                  value={selectedImage.x}
                  onChange={(e) => onUpdateImage(selectedElement, { x: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={selectedImage.y}
                  onChange={(e) => onUpdateImage(selectedElement, { y: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Width</Label>
                <Input
                  type="number"
                  value={selectedImage.width}
                  onChange={(e) => onUpdateImage(selectedElement, { width: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Height</Label>
                <Input
                  type="number"
                  value={selectedImage.height}
                  onChange={(e) => onUpdateImage(selectedElement, { height: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 text-xs">Rotation (degrees)</Label>
              <Input
                type="number"
                value={selectedImage.rotation}
                onChange={(e) => onUpdateImage(selectedElement, { rotation: parseInt(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-600 text-white text-xs"
              />
            </div>
          </div>
        )}

        {/* Text Properties */}
        {selectedText && (
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300 text-xs">Text Content</Label>
              <Textarea
                value={selectedText.text}
                onChange={(e) => onUpdateText(selectedElement, { text: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white text-xs"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">X Position</Label>
                <Input
                  type="number"
                  value={selectedText.x}
                  onChange={(e) => onUpdateText(selectedElement, { x: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={selectedText.y}
                  onChange={(e) => onUpdateText(selectedElement, { y: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Font Size</Label>
                <Input
                  type="number"
                  value={selectedText.fontSize}
                  onChange={(e) => onUpdateText(selectedElement, { fontSize: parseInt(e.target.value) || 16 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Color</Label>
                <Input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => onUpdateText(selectedElement, { color: e.target.value })}
                  className="bg-slate-800 border-slate-600 h-8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Arrow Properties */}
        {selectedArrow && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Start X</Label>
                <Input
                  type="number"
                  value={selectedArrow.startX}
                  onChange={(e) => onUpdateArrow(selectedElement, { startX: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Start Y</Label>
                <Input
                  type="number"
                  value={selectedArrow.startY}
                  onChange={(e) => onUpdateArrow(selectedElement, { startY: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">End X</Label>
                <Input
                  type="number"
                  value={selectedArrow.endX}
                  onChange={(e) => onUpdateArrow(selectedElement, { endX: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">End Y</Label>
                <Input
                  type="number"
                  value={selectedArrow.endY}
                  onChange={(e) => onUpdateArrow(selectedElement, { endY: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Color</Label>
                <Input
                  type="color"
                  value={selectedArrow.color}
                  onChange={(e) => onUpdateArrow(selectedElement, { color: e.target.value })}
                  className="bg-slate-800 border-slate-600 h-8"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Thickness</Label>
                <Input
                  type="number"
                  value={selectedArrow.thickness}
                  onChange={(e) => onUpdateArrow(selectedElement, { thickness: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border-slate-600 text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}