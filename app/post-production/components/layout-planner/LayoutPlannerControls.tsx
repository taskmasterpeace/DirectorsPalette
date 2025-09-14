"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  RotateCcw,
  Save
} from "lucide-react";
import type { AspectRatio } from "./LayoutPlannerTypes";

interface LayoutPlannerControlsProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onAddImage: () => void;
  onAddText: () => void;
  onClearAll: () => void;
  onExport: () => void;
  hasElements: boolean;
}

export function LayoutPlannerControls({
  aspectRatio,
  onAspectRatioChange,
  onAddImage,
  onAddText,
  onClearAll,
  onExport,
  hasElements
}: LayoutPlannerControlsProps) {
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Layout Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas Settings */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Canvas Aspect Ratio</Label>
          <Select 
            value={aspectRatio} 
            onValueChange={(value) => onAspectRatioChange(value as AspectRatio)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="16:9" className="text-white">16:9 (Widescreen)</SelectItem>
              <SelectItem value="9:16" className="text-white">9:16 (Portrait)</SelectItem>
              <SelectItem value="1:1" className="text-white">1:1 (Square)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Elements */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Add Elements</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onAddImage}
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onAddText}
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </Button>
          </div>
        </div>

        {/* Canvas Actions */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Canvas Actions</Label>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              disabled={!hasElements}
              className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Layout
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClearAll}
              disabled={!hasElements}
              className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Instructions:</strong><br />
            • Click elements to select and edit<br />
            • Drag elements to move them<br />
            • Use corner handles to resize<br />
            • Properties panel shows when selected
          </p>
        </div>
      </CardContent>
    </Card>
  );
}