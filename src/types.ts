export type Category = {
  id: string;
  title: string;
  items: Array<{ name: string; price?: string }>;
};

export type CanvasElementType = 'section' | 'item' | 'sticker' | 'text' | 'image' | 'line';

export type CanvasElement = {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  title?: string;
  subtitle?: string;
  chipLabel?: string;
  chipFontSize?: number;
  chipTextColor?: string;
  titleFontSize?: number;
  titleTextColor?: string;
  subtitleFontSize?: number;
  subtitleTextColor?: string;
  price?: string;
  accent?: string;
  textColor?: string;
  fontFamily?: string;
  text?: string;
  emoji?: string;
  src?: string;
  fontSize?: number;
  backgroundImage?: string | null;
  groupId?: string | null;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type CanvasBackground = {
  presetId: string;
  imageUrl: string | null;
};

export type EditorSnapshot = {
  elements: CanvasElement[];
  background: CanvasBackground;
};

export type DragState = {
  ids: string[];
  startX: number;
  startY: number;
  initialPositions: Record<string, { x: number; y: number }>;
};

export type ResizeState = {
  id: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

export type MarqueeState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};