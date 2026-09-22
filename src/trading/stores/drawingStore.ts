import { create } from 'zustand';

export interface DrawingPoint {
  time: number; // Unix timestamp in seconds
  price: number;
  logical?: number; // Continuous bar index from timeScale
}

export interface DrawingStyle {
  lineColor: string;
  lineWidth: number; // 1 to 5
  lineStyle: 'solid' | 'dashed' | 'dotted';
  opacity: number; // 0 to 1
  extendLeft: boolean;
  extendRight: boolean;
  showMidpoint: boolean;
  startCap: 'none' | 'arrow' | 'circle';
  endCap: 'none' | 'arrow' | 'circle';
}

export interface DrawingText {
  content: string;
  color: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  alignment: 'above' | 'below' | 'center';
}

import { DEFAULT_FIB_LEVELS, DEFAULT_GANN_RATIOS, FibLevelConfig, GannRatioConfig } from '../components/chart/fibGannData';

export interface DrawingAlert {
  enabled: boolean;
  condition: 'CROSS' | 'CROSS_UP' | 'CROSS_DOWN';
  frequency: 'ONCE' | 'EVERY_TIME';
  levelValue?: number;
}

export interface TrendLineDrawing {
  id: string;
  toolType: string;
  symbol: string;
  paneId: string;
  point1: DrawingPoint;
  point2: DrawingPoint;
  point3?: DrawingPoint; // For 3-point tools (Trend-based Fib Extension, Fib Channel, Wedge, Pitchfan)
  style: DrawingStyle;
  text?: DrawingText;
  levels?: FibLevelConfig[]; // 14 default Fibonacci levels
  gannRatios?: GannRatioConfig[]; // 9 Gann ratios
  reversed?: boolean; // Reverse 0% and 100%
  showLabels?: boolean; // Show price and percentage labels
  labelsPosition?: 'left' | 'right';
  fillBackground?: boolean; // Gradient fill between Fib levels
  fillOpacity?: number; // 0.05 to 0.8
  extendLeft?: boolean;
  extendRight?: boolean;
  logarithmic?: boolean;
  locked: boolean;
  visibleIntervals: string[];
  alert?: DrawingAlert;
  zIndex: number;
}

export const DEFAULT_DRAWING_STYLE: DrawingStyle = {
  lineColor: '#2962FF',
  lineWidth: 2,
  lineStyle: 'solid',
  opacity: 1,
  extendLeft: false,
  extendRight: false,
  showMidpoint: false,
  startCap: 'none',
  endCap: 'none',
};

interface DrawingState {
  activeDrawingTool: string | null;
  drawings: TrendLineDrawing[];
  selectedDrawingId: string | null;
  isDrawing: boolean;
  drawingStep: number; // 0: idle, 1: P1 placed, 2: P2 placed
  p1Temp: DrawingPoint | null;
  p2Temp: DrawingPoint | null;
  p3Temp: DrawingPoint | null;
  undoStack: TrendLineDrawing[][];
  redoStack: TrendLineDrawing[][];
  recentlyDeleted: TrendLineDrawing | null;
  savedTemplates: Record<string, { style: DrawingStyle; text?: DrawingText; levels?: FibLevelConfig[] }>;
}

interface DrawingActions {
  setActiveDrawingTool: (toolId: string | null) => void;
  setSelectedDrawingId: (id: string | null) => void;
  startDrawing: (p1: DrawingPoint) => void;
  updatePendingPoint: (point: DrawingPoint) => void;
  confirmPoint: (point: DrawingPoint, symbol: string) => boolean;
  finishDrawing: (symbol: string) => TrendLineDrawing | null;
  cancelDrawing: () => void;
  updateDrawing: (id: string, updates: Partial<TrendLineDrawing>, recordUndo?: boolean) => void;
  deleteDrawing: (id: string) => void;
  undoDelete: () => void;
  clearRecentlyDeleted: () => void;
  toggleLock: (id: string) => void;
  toggleReverse: (id: string) => void;
  toggleLabels: (id: string) => void;
  toggleFill: (id: string) => void;
  setFillOpacity: (id: string, opacity: number) => void;
  updateLevel: (id: string, levelIdx: number, updates: Partial<FibLevelConfig>) => void;
  duplicateDrawing: (id: string) => TrendLineDrawing | null;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  resetDrawingStyle: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveTemplate: (name: string, style: DrawingStyle, text?: DrawingText, levels?: FibLevelConfig[]) => void;
  applyTemplate: (id: string, templateName: string) => void;
  loadDrawingsForSymbol: (symbol: string) => void;
  clearAllForSymbol: (symbol: string) => void;
}

type DrawingStore = DrawingState & DrawingActions;

const STORAGE_KEY_PREFIX = 'tv_drawings_';
const TEMPLATES_STORAGE_KEY = 'tv_drawing_templates';

const loadSavedDrawings = (symbol: string): TrendLineDrawing[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${symbol.replace('/', '')}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveDrawingsToStorage = (symbol: string, drawings: TrendLineDrawing[]) => {
  try {
    const symbolKey = symbol.replace('/', '');
    const symbolDrawings = drawings.filter(d => d.symbol.replace('/', '') === symbolKey);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${symbolKey}`, JSON.stringify(symbolDrawings));
  } catch (e) {
    console.warn('Failed to persist drawings:', e);
  }
};

const loadTemplates = (): Record<string, { style: DrawingStyle; text?: DrawingText }> => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  activeDrawingTool: null,
  drawings: [],
  selectedDrawingId: null,
  isDrawing: false,
  drawingStep: 0,
  p1Temp: null,
  p2Temp: null,
  p3Temp: null,
  undoStack: [],
  redoStack: [],
  recentlyDeleted: null,
  savedTemplates: loadTemplates(),

  setActiveDrawingTool: (toolId) => {
    set({
      activeDrawingTool: toolId,
      isDrawing: false,
      drawingStep: 0,
      p1Temp: null,
      p2Temp: null,
      p3Temp: null,
    });
  },

  setSelectedDrawingId: (id) => {
    set({ selectedDrawingId: id });
  },

  startDrawing: (p1) => {
    set({
      isDrawing: true,
      drawingStep: 1,
      p1Temp: p1,
      p2Temp: p1,
      p3Temp: null,
    });
  },

  updatePendingPoint: (point) => {
    const { isDrawing, drawingStep } = get();
    if (!isDrawing) return;

    if (drawingStep === 1) {
      set({ p2Temp: point });
    } else if (drawingStep === 2) {
      set({ p3Temp: point });
    }
  },

  confirmPoint: (point, symbol) => {
    const { isDrawing, drawingStep, activeDrawingTool } = get();
    const tool = activeDrawingTool || 'trendLine';
    const is3PointTool = ['fibExtension', 'fibChannel', 'fibWedge', 'pitchfan', 'trendFibTime'].includes(tool);

    if (!isDrawing) {
      // Step 1: Set P1
      get().startDrawing(point);
      return false;
    }

    if (is3PointTool) {
      if (drawingStep === 1) {
        // Step 2: Set P2 and start waiting for P3
        set({
          p2Temp: point,
          p3Temp: point,
          drawingStep: 2,
        });
        return false;
      } else if (drawingStep === 2) {
        // Step 3: Set P3 and finish!
        set({ p3Temp: point });
        get().finishDrawing(symbol);
        return true;
      }
    } else {
      // 2-point tools (or 1-point tools):
      set({ p2Temp: point });
      get().finishDrawing(symbol);
      return true;
    }

    return false;
  },

  finishDrawing: (symbol) => {
    const { p1Temp, p2Temp, p3Temp, activeDrawingTool, drawings, undoStack } = get();
    if (!p1Temp) {
      set({ isDrawing: false, drawingStep: 0, p1Temp: null, p2Temp: null, p3Temp: null });
      return null;
    }

    const tool = activeDrawingTool || 'trendLine';
    const effectiveP2 = p2Temp || { ...p1Temp, time: p1Temp.time + 3600 };
    const isFib = tool.toLowerCase().includes('fib') || tool === 'pitchfan';
    const isGann = tool.toLowerCase().includes('gann');

    const style: DrawingStyle = {
      ...DEFAULT_DRAWING_STYLE,
      extendLeft: tool === 'extendedLine',
      extendRight: tool === 'ray' || tool === 'extendedLine' || tool === 'horizRay',
      showMidpoint: tool === 'infoLine' || tool === 'parallelChannel',
    };

    const newDrawing: TrendLineDrawing = {
      id: `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      toolType: tool,
      symbol,
      paneId: 'main',
      point1: { ...p1Temp },
      point2: { ...effectiveP2 },
      point3: p3Temp ? { ...p3Temp } : undefined,
      style,
      levels: isFib ? DEFAULT_FIB_LEVELS.map(l => ({ ...l })) : undefined,
      gannRatios: isGann ? DEFAULT_GANN_RATIOS.map(r => ({ ...r })) : undefined,
      reversed: false,
      showLabels: true,
      labelsPosition: 'right',
      fillBackground: true,
      fillOpacity: 0.12,
      locked: false,
      visibleIntervals: ['all'],
      zIndex: drawings.length + 1,
    };

    const nextDrawings = [...drawings, newDrawing];
    saveDrawingsToStorage(symbol, nextDrawings);

    set({
      drawings: nextDrawings,
      isDrawing: false,
      drawingStep: 0,
      p1Temp: null,
      p2Temp: null,
      p3Temp: null,
      activeDrawingTool: null,
      selectedDrawingId: newDrawing.id,
      undoStack: [...undoStack, drawings],
      redoStack: [],
    });

    return newDrawing;
  },

  cancelDrawing: () => {
    set({
      isDrawing: false,
      drawingStep: 0,
      p1Temp: null,
      p2Temp: null,
      p3Temp: null,
      activeDrawingTool: null,
    });
  },

  toggleReverse: (id) => {
    const drawing = get().drawings.find(d => d.id === id);
    if (!drawing) return;
    get().updateDrawing(id, { reversed: !drawing.reversed });
  },

  toggleLabels: (id) => {
    const drawing = get().drawings.find(d => d.id === id);
    if (!drawing) return;
    get().updateDrawing(id, { showLabels: !drawing.showLabels });
  },

  toggleFill: (id) => {
    const drawing = get().drawings.find(d => d.id === id);
    if (!drawing) return;
    get().updateDrawing(id, { fillBackground: !drawing.fillBackground });
  },

  setFillOpacity: (id, opacity) => {
    get().updateDrawing(id, { fillOpacity: opacity });
  },

  updateLevel: (id, levelIdx, updates) => {
    const drawing = get().drawings.find(d => d.id === id);
    if (!drawing || !drawing.levels) return;
    const nextLevels = [...drawing.levels];
    nextLevels[levelIdx] = { ...nextLevels[levelIdx], ...updates };
    get().updateDrawing(id, { levels: nextLevels });
  },

  updateDrawing: (id, updates, recordUndo = true) => {
    const { drawings, undoStack } = get();
    const current = drawings.find(d => d.id === id);
    if (!current) return;

    const nextDrawings = drawings.map(d => (d.id === id ? { ...d, ...updates } : d));
    saveDrawingsToStorage(current.symbol, nextDrawings);

    set({
      drawings: nextDrawings,
      undoStack: recordUndo ? [...undoStack, drawings] : undoStack,
      redoStack: recordUndo ? [] : get().redoStack,
    });
  },

  deleteDrawing: (id) => {
    const { drawings, undoStack } = get();
    const target = drawings.find(d => d.id === id);
    if (!target) return;

    const nextDrawings = drawings.filter(d => d.id !== id);
    saveDrawingsToStorage(target.symbol, nextDrawings);

    set({
      drawings: nextDrawings,
      selectedDrawingId: null,
      recentlyDeleted: target,
      undoStack: [...undoStack, drawings],
      redoStack: [],
    });
  },

  undoDelete: () => {
    const { recentlyDeleted, drawings } = get();
    if (!recentlyDeleted) return;

    const nextDrawings = [...drawings, recentlyDeleted];
    saveDrawingsToStorage(recentlyDeleted.symbol, nextDrawings);

    set({
      drawings: nextDrawings,
      selectedDrawingId: recentlyDeleted.id,
      recentlyDeleted: null,
    });
  },

  clearRecentlyDeleted: () => {
    set({ recentlyDeleted: null });
  },

  toggleLock: (id) => {
    const { drawings } = get();
    const target = drawings.find(d => d.id === id);
    if (!target) return;

    get().updateDrawing(id, { locked: !target.locked });
  },

  duplicateDrawing: (id) => {
    const { drawings } = get();
    const target = drawings.find(d => d.id === id);
    if (!target) return null;

    // Shift clone slightly in price
    const priceDelta = (target.point2.price - target.point1.price) * 0.1 || (target.point1.price * 0.002);

    const cloned: TrendLineDrawing = {
      ...target,
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      point1: { time: target.point1.time, price: target.point1.price + priceDelta },
      point2: { time: target.point2.time, price: target.point2.price + priceDelta },
      zIndex: drawings.length + 1,
    };

    const nextDrawings = [...drawings, cloned];
    saveDrawingsToStorage(target.symbol, nextDrawings);

    set({
      drawings: nextDrawings,
      selectedDrawingId: cloned.id,
      undoStack: [...get().undoStack, drawings],
      redoStack: [],
    });

    return cloned;
  },

  bringToFront: (id) => {
    const { drawings } = get();
    const maxZ = Math.max(...drawings.map(d => d.zIndex), 0);
    get().updateDrawing(id, { zIndex: maxZ + 1 });
  },

  sendToBack: (id) => {
    const { drawings } = get();
    const minZ = Math.min(...drawings.map(d => d.zIndex), 0);
    get().updateDrawing(id, { zIndex: Math.max(minZ - 1, 1) });
  },

  resetDrawingStyle: (id) => {
    get().updateDrawing(id, { style: { ...DEFAULT_DRAWING_STYLE }, text: undefined });
  },

  undo: () => {
    const { undoStack, redoStack, drawings } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      drawings: previous,
      undoStack: newUndoStack,
      redoStack: [...redoStack, drawings],
      selectedDrawingId: null,
    });
  },

  redo: () => {
    const { undoStack, redoStack, drawings } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      drawings: next,
      undoStack: [...undoStack, drawings],
      redoStack: newRedoStack,
      selectedDrawingId: null,
    });
  },

  saveTemplate: (name, style, text) => {
    const updated = { ...get().savedTemplates, [name]: { style, text } };
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ savedTemplates: updated });
  },

  applyTemplate: (id, templateName) => {
    const template = get().savedTemplates[templateName];
    if (!template) return;
    get().updateDrawing(id, { style: { ...template.style }, text: template.text ? { ...template.text } : undefined });
  },

  loadDrawingsForSymbol: (symbol) => {
    const loaded = loadSavedDrawings(symbol);
    set({ drawings: loaded, selectedDrawingId: null });
  },

  clearAllForSymbol: (symbol) => {
    const symbolKey = symbol.replace('/', '');
    const nextDrawings = get().drawings.filter(d => d.symbol.replace('/', '') !== symbolKey);
    saveDrawingsToStorage(symbol, nextDrawings);
    set({ drawings: nextDrawings, selectedDrawingId: null });
  },
}));
