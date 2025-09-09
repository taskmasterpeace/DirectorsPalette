export interface LayoutImage {
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

export interface LayoutText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  zIndex: number;
}

export interface LayoutArrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness: number;
  zIndex: number;
}

export type LayoutElement = LayoutImage | LayoutText | LayoutArrow;

export interface CanvasSize {
  width: number;
  height: number;
}

export type AspectRatio = "16:9" | "9:16" | "1:1";

export interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string;
  dragStart: { x: number; y: number };
  elementStart: { x: number; y: number; width: number; height: number };
}