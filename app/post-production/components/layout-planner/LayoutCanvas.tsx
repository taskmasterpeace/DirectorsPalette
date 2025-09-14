"use client";

import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { 
  LayoutImage, 
  LayoutText, 
  LayoutArrow, 
  CanvasSize, 
  DragState 
} from "./LayoutPlannerTypes";

interface LayoutCanvasProps {
  canvasSize: CanvasSize;
  canvasRef: React.RefObject<HTMLDivElement>;
  images: LayoutImage[];
  texts: LayoutText[];
  arrows: LayoutArrow[];
  selectedElement: string | null;
  dragState: DragState;
  onElementSelect: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, elementId: string, elementType: 'image' | 'text' | 'arrow') => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onCanvasClick: (e: React.MouseEvent) => void;
}

export function LayoutCanvas({
  canvasSize,
  canvasRef,
  images,
  texts,
  arrows,
  selectedElement,
  dragState,
  onElementSelect,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onCanvasClick
}: LayoutCanvasProps) {
  
  const renderResizeHandles = useCallback((element: { id: string; x: number; y: number; width: number; height: number }) => {
    if (selectedElement !== element.id) return null;

    const handles = [
      { pos: 'nw', x: element.x - 4, y: element.y - 4 },
      { pos: 'ne', x: element.x + element.width - 4, y: element.y - 4 },
      { pos: 'sw', x: element.x - 4, y: element.y + element.height - 4 },
      { pos: 'se', x: element.x + element.width - 4, y: element.y + element.height - 4 },
    ];

    return (
      <>
        {handles.map(handle => (
          <div
            key={handle.pos}
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-pointer z-50"
            style={{
              left: handle.x,
              top: handle.y,
              cursor: `${handle.pos}-resize`
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle resize start
            }}
          />
        ))}
      </>
    );
  }, [selectedElement]);

  return (
    <div className="flex-1">
      <Card className="bg-slate-900 border-slate-700 h-full">
        <CardContent className="p-4 h-full">
          <div className="h-full flex items-center justify-center">
            <div
              ref={canvasRef}
              className="relative border border-slate-600 bg-slate-800 overflow-hidden"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                cursor: dragState.isDragging ? 'grabbing' : 'default'
              }}
              onClick={onCanvasClick}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            >
              {/* Render Images */}
              {images.map((image) => (
                <div key={image.id} className="absolute">
                  <img
                    src={image.src}
                    alt="Layout element"
                    className={`absolute select-none cursor-move ${
                      selectedElement === image.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: image.x,
                      top: image.y,
                      width: image.width,
                      height: image.height,
                      transform: `rotate(${image.rotation}deg)`,
                      zIndex: image.zIndex,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onElementSelect(image.id);
                    }}
                    onMouseDown={(e) => onMouseDown(e, image.id, 'image')}
                    draggable={false}
                  />
                  {renderResizeHandles(image)}
                </div>
              ))}

              {/* Render Text Elements */}
              {texts.map((text) => (
                <div key={text.id} className="absolute">
                  <div
                    className={`absolute select-none cursor-move ${
                      selectedElement === text.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: text.x,
                      top: text.y,
                      fontSize: text.fontSize,
                      color: text.color,
                      fontWeight: text.fontWeight,
                      zIndex: text.zIndex,
                      minWidth: '50px',
                      minHeight: '20px',
                      padding: '2px 4px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onElementSelect(text.id);
                    }}
                    onMouseDown={(e) => onMouseDown(e, text.id, 'text')}
                  >
                    {text.text}
                  </div>
                  {renderResizeHandles({
                    id: text.id,
                    x: text.x,
                    y: text.y,
                    width: Math.max(50, text.text.length * (text.fontSize * 0.6)),
                    height: text.fontSize + 4
                  })}
                </div>
              ))}

              {/* Render Arrows */}
              {arrows.map((arrow) => (
                <svg
                  key={arrow.id}
                  className={`absolute pointer-events-none ${
                    selectedElement === arrow.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: Math.min(arrow.startX, arrow.endX) - 10,
                    top: Math.min(arrow.startY, arrow.endY) - 10,
                    width: Math.abs(arrow.endX - arrow.startX) + 20,
                    height: Math.abs(arrow.endY - arrow.startY) + 20,
                    zIndex: arrow.zIndex,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementSelect(arrow.id);
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
                    x1={arrow.startX - Math.min(arrow.startX, arrow.endX) + 10}
                    y1={arrow.startY - Math.min(arrow.startY, arrow.endY) + 10}
                    x2={arrow.endX - Math.min(arrow.startX, arrow.endX) + 10}
                    y2={arrow.endY - Math.min(arrow.startY, arrow.endY) + 10}
                    stroke={arrow.color}
                    strokeWidth={arrow.thickness}
                    markerEnd={`url(#arrowhead-${arrow.id})`}
                    className="pointer-events-auto cursor-pointer"
                    onMouseDown={(e) => onMouseDown(e as any, arrow.id, 'arrow')}
                  />
                </svg>
              ))}

              {/* Canvas Grid (optional) */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#666" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}