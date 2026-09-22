import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useDrawingStore, TrendLineDrawing, DrawingPoint } from '../../stores/drawingStore';
import { useChartStore } from '../../stores/chartStore';
import { FloatingLineToolbar } from './FloatingLineToolbar';
import { DrawingSettingsModal } from './DrawingSettingsModal';
import { ChartAlertModal } from './ChartAlertModal';
import { UndoToastNotification } from './UndoToastNotification';

interface DrawingCanvasOverlayProps {
  chartApi: IChartApi | null;
  chartSeries: ISeriesApi<"Candlestick"> | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface PixelPoint {
  x: number;
  y: number;
}

export const DrawingCanvasOverlay: React.FC<DrawingCanvasOverlayProps> = ({
  chartApi,
  chartSeries,
  containerRef,
}) => {
  const activeSymbol = useChartStore(state => state.activeSymbol) || 'BTC/USDT';

  // Drawing Store states
  const activeDrawingTool = useDrawingStore(state => state.activeDrawingTool);
  const drawings = useDrawingStore(state => state.drawings);
  const selectedDrawingId = useDrawingStore(state => state.selectedDrawingId);
  const isDrawing = useDrawingStore(state => state.isDrawing);
  const p1Temp = useDrawingStore(state => state.p1Temp);
  const p2Temp = useDrawingStore(state => state.p2Temp);
  const recentlyDeleted = useDrawingStore(state => state.recentlyDeleted);

  // Drawing Store actions
  const setSelectedDrawingId = useDrawingStore(state => state.setSelectedDrawingId);
  const startDrawing = useDrawingStore(state => state.startDrawing);
  const updatePendingPoint = useDrawingStore(state => state.updatePendingPoint);
  const finishDrawing = useDrawingStore(state => state.finishDrawing);
  const cancelDrawing = useDrawingStore(state => state.cancelDrawing);
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const undoDelete = useDrawingStore(state => state.undoDelete);
  const clearRecentlyDeleted = useDrawingStore(state => state.clearRecentlyDeleted);
  const undo = useDrawingStore(state => state.undo);
  const redo = useDrawingStore(state => state.redo);
  const loadDrawingsForSymbol = useDrawingStore(state => state.loadDrawingsForSymbol);

  // Local interaction states
  const [, setRerenderTrigger] = useState(0);
  const [draggingHandle, setDraggingHandle] = useState<'p1' | 'p2' | 'body' | null>(null);
  const [activeSettingsDrawing, setActiveSettingsDrawing] = useState<TrendLineDrawing | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(0);
  const [mousePos, setMousePos] = useState<PixelPoint | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const overlayDivRef = useRef<HTMLDivElement>(null);
  const dragContextRef = useRef<{
    drawingId: string;
    handle: 'p1' | 'p2' | 'body';
    startX: number;
    startY: number;
    initialP1: DrawingPoint;
    initialP2: DrawingPoint;
    initialP1Px: PixelPoint;
    initialP2Px: PixelPoint;
  } | null>(null);

  // Load drawings on mount and symbol change
  useEffect(() => {
    loadDrawingsForSymbol(activeSymbol);
  }, [activeSymbol, loadDrawingsForSymbol]);

  // Subscribe to chart zoom, pan, and range change to update SVG projections
  useEffect(() => {
    if (!chartApi) return;

    const handleRangeChange = () => {
      setRerenderTrigger(prev => prev + 1);
    };

    const timeScale = chartApi.timeScale();
    timeScale.subscribeVisibleTimeRangeChange(handleRangeChange);
    timeScale.subscribeVisibleLogicalRangeChange(handleRangeChange);

    return () => {
      timeScale.unsubscribeVisibleTimeRangeChange(handleRangeChange);
      timeScale.unsubscribeVisibleLogicalRangeChange(handleRangeChange);
    };
  }, [chartApi]);

  // Deselect line and hide floating toolbar when clicking anywhere on the screen/chart outside the line
  useEffect(() => {
    if (!selectedDrawingId) return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Keep toolbar open if clicking inside toolbar or popovers
      if (target.closest('.floating-line-toolbar')) {
        return;
      }
      // Keep open if clicking inside modals
      if (target.closest('.drawing-settings-modal') || target.closest('.chart-alert-modal')) {
        return;
      }
      // Keep open or let line handle selection if clicking a line or handle
      if (target.closest('.drawing-line-hit') || target.closest('.drawing-handle')) {
        return;
      }

      // User clicked outside: deselect line and hide floating toolbar
      setSelectedDrawingId(null);
    };

    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', handleGlobalPointerDown);
    }, 60);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
  }, [selectedDrawingId, setSelectedDrawingId]);

  // Keyboard Shortcuts: Undo (Ctrl+Z), Redo (Ctrl+Y / Ctrl+Shift+Z), Escape (Cancel), Delete (Del)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        if (activeDrawingTool) {
          cancelDrawing();
        } else if (selectedDrawingId) {
          setSelectedDrawingId(null);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDrawingId) {
          e.preventDefault();
          deleteDrawing(selectedDrawingId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDrawingTool, isDrawing, selectedDrawingId, undo, redo, cancelDrawing, setSelectedDrawingId, deleteDrawing]);

  // Convert Time / Logical & Price -> Pixel X & Y (100% robust)
  const toPixel = useCallback((point: DrawingPoint): PixelPoint | null => {
    if (!chartApi || !chartSeries) return null;
    try {
      const timeScale = chartApi.timeScale();

      // 1. Try logical first (continuous bar index, works anywhere on chart)
      let x: number | null = null;
      if (point.logical !== undefined && typeof timeScale.logicalToCoordinate === 'function') {
        const coord = timeScale.logicalToCoordinate(point.logical as any);
        if (coord !== null && !isNaN(coord)) {
          x = Number(coord);
        }
      }

      // 2. Fallback to timeToCoordinate
      if (x === null) {
        const coord = timeScale.timeToCoordinate(point.time as unknown as Time);
        if (coord !== null && !isNaN(coord)) {
          x = Number(coord);
        }
      }

      // 3. Price to Y
      const yCoord = chartSeries.priceToCoordinate(point.price);
      let y: number | null = null;
      if (yCoord !== null && !isNaN(yCoord)) {
        y = Number(yCoord);
      }

      if (x !== null && y !== null) {
        return { x, y };
      }
    } catch (e) {
      console.warn('toPixel error:', e);
    }
    return null;
  }, [chartApi, chartSeries]);

  // Convert Pixel X & Y -> Time, Logical & Price (100% robust)
  const toDataPoint = useCallback((pixelX: number, pixelY: number): DrawingPoint | null => {
    if (!chartApi || !chartSeries) return null;
    try {
      const timeScale = chartApi.timeScale();

      // 1. Price
      const priceVal = chartSeries.coordinateToPrice(pixelY);
      const price = priceVal !== null && !isNaN(priceVal as number) ? Number(priceVal) : 0;

      // 2. Logical index (continuous bar position)
      const logicalVal = timeScale.coordinateToLogical(pixelX);
      const logical = logicalVal !== null && !isNaN(logicalVal as number) ? Number(logicalVal) : 0;

      // 3. Time (exact bar timestamp, or extrapolated if in blank space)
      let time = timeScale.coordinateToTime(pixelX);
      let timeSec: number;

      if (time !== null) {
        timeSec = typeof time === 'number' ? time : Math.floor(new Date(time as any).getTime() / 1000);
      } else {
        const visibleRange = timeScale.getVisibleRange();
        const visibleLogical = timeScale.getVisibleLogicalRange();
        if (
          visibleRange &&
          visibleLogical &&
          typeof visibleRange.from === 'number' &&
          typeof visibleRange.to === 'number' &&
          visibleLogical.to !== visibleLogical.from
        ) {
          const timePerBar = (visibleRange.to - visibleRange.from) / (visibleLogical.to - visibleLogical.from);
          timeSec = Math.floor(visibleRange.from + (logical - visibleLogical.from) * timePerBar);
        } else {
          timeSec = Math.floor(Date.now() / 1000);
        }
      }

      return {
        time: timeSec,
        price,
        logical,
      };
    } catch (e) {
      console.warn('toDataPoint error:', e);
      return null;
    }
  }, [chartApi, chartSeries]);

  // Global Pointer Events for Drawing & Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    // 1. Drawing Mode: Place P1 or P2
    if (activeDrawingTool) {
      const point = toDataPoint(pixelX, pixelY);
      if (!point) return;

      // Single-click immediate placement tools:
      if (activeDrawingTool === 'horizLine' || activeDrawingTool === 'vertLine' || activeDrawingTool === 'crossLine') {
        startDrawing(point);
        updatePendingPoint({
          ...point,
          price: point.price,
          time: point.time + 3600,
          logical: (point.logical || 0) + 10,
        });
        finishDrawing(activeSymbol);
        return;
      }

      // Two-click tools (Trend Line, Ray, Extended Line, Info Line, Channels, etc.)
      if (!isDrawing) {
        // First click: P1
        startDrawing(point);
      } else {
        // Second click: P2 -> Complete drawing
        updatePendingPoint(point);
        finishDrawing(activeSymbol);
      }
      return;
    }

    // 2. Click on empty space: Deselect line
    if (!draggingHandle) {
      setSelectedDrawingId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    setMousePos({ x: pixelX, y: pixelY });

    // Drawing preview update
    if (isDrawing && activeDrawingTool) {
      const point = toDataPoint(pixelX, pixelY);
      if (point) {
        updatePendingPoint(point);
      }
    }
  };

  // Start dragging a control handle (P1, P2) or the line body
  const startDrag = (
    e: React.PointerEvent,
    drawing: TrendLineDrawing,
    handle: 'p1' | 'p2' | 'body'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (drawing.locked) {
      setSelectedDrawingId(drawing.id);
      return;
    }

    setSelectedDrawingId(drawing.id);
    setDraggingHandle(handle);

    // Disable chart scroll/scale during drag
    if (chartApi) {
      chartApi.applyOptions({
        handleScroll: false,
        handleScale: false,
      });
    }

    const p1Px = toPixel(drawing.point1) || { x: 0, y: 0 };
    const p2Px = toPixel(drawing.point2) || { x: 0, y: 0 };

    dragContextRef.current = {
      drawingId: drawing.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialP1: { ...drawing.point1 },
      initialP2: { ...drawing.point2 },
      initialP1Px: p1Px,
      initialP2Px: p2Px,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const ctx = dragContextRef.current;
      if (!ctx || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const currentPixelX = moveEvent.clientX - rect.left;
      const currentPixelY = moveEvent.clientY - rect.top;

      const currentPoint = toDataPoint(currentPixelX, currentPixelY);
      if (!currentPoint) return;

      if (ctx.handle === 'p1') {
        updateDrawing(ctx.drawingId, { point1: currentPoint }, false);
      } else if (ctx.handle === 'p2') {
        updateDrawing(ctx.drawingId, { point2: currentPoint }, false);
      } else if (ctx.handle === 'body') {
        const dx = moveEvent.clientX - ctx.startX;
        const dy = moveEvent.clientY - ctx.startY;

        const newP1 = toDataPoint(ctx.initialP1Px.x + dx, ctx.initialP1Px.y + dy);
        const newP2 = toDataPoint(ctx.initialP2Px.x + dx, ctx.initialP2Px.y + dy);

        if (newP1 && newP2) {
          updateDrawing(ctx.drawingId, { point1: newP1, point2: newP2 }, false);
        }
      }
    };

    const handleWindowPointerUp = () => {
      // Re-enable chart scroll/scale
      if (chartApi) {
        chartApi.applyOptions({
          handleScroll: true,
          handleScale: true,
        });
      }

      // Record final step in undo stack
      const ctx = dragContextRef.current;
      if (ctx) {
        const current = useDrawingStore.getState().drawings.find(d => d.id === ctx.drawingId);
        if (current) {
          updateDrawing(ctx.drawingId, { point1: current.point1, point2: current.point2 }, true);
        }
      }

      setDraggingHandle(null);
      dragContextRef.current = null;
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
  };

  // Helper: Extend line coordinates to viewport edges if extendLeft or extendRight is enabled
  const calculateExtendedPoints = (
    p1: PixelPoint,
    p2: PixelPoint,
    toolType: string,
    extendLeft: boolean,
    extendRight: boolean,
    containerWidth: number,
    containerHeight: number
  ): { x1: number; y1: number; x2: number; y2: number } => {
    let { x: x1, y: y1 } = p1;
    let { x: x2, y: y2 } = p2;

    // Horizontal line
    if (toolType === 'horizLine') {
      return { x1: 0, y1, x2: containerWidth, y2: y1 };
    }

    // Horizontal Ray
    if (toolType === 'horizRay') {
      return { x1, y1, x2: containerWidth, y2: y1 };
    }

    // Vertical line
    if (toolType === 'vertLine') {
      return { x1, y1: 0, x2: x1, y2: containerHeight };
    }

    // Regular line / Ray / Extended Line
    const isRay = toolType === 'ray' || extendRight;
    const isExtended = toolType === 'extendedLine' || (extendLeft && extendRight);
    const isExtendLeft = toolType === 'extendedLine' || extendLeft;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dx) > 0.001) {
      const slope = dy / dx;
      if (isExtendLeft) {
        const targetX = 0;
        y1 = y1 - slope * (x1 - targetX);
        x1 = targetX;
      }
      if (isRay || isExtended) {
        const targetX = containerWidth;
        y2 = y2 + slope * (targetX - x2);
        x2 = targetX;
      }
    }

    return { x1, y1, x2, y2 };
  };

  const selectedDrawing = drawings.find(d => d.id === selectedDrawingId) || null;
  const containerWidth = containerRef.current?.clientWidth || 800;
  const containerHeight = containerRef.current?.clientHeight || 500;

  // Compute screen coordinates for floating toolbar
  const floatingToolbarPos = React.useMemo(() => {
    if (!selectedDrawing) return null;
    const p1 = toPixel(selectedDrawing.point1);
    const p2 = toPixel(selectedDrawing.point2);
    if (!p1 || !p2) return null;

    return {
      x: (p1.x + p2.x) / 2,
      y: Math.min(p1.y, p2.y),
    };
  }, [selectedDrawing, toPixel]);

  const isDrawingActive = Boolean(activeDrawingTool);

  return (
    <div
      ref={overlayDivRef}
      className={`w-full h-full absolute inset-0 select-none notranslate overflow-hidden z-20 ${
        isDrawingActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{ touchAction: 'none' }}
      translate="no"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* ─── Top Active Drawing Mode Banner ─── */}
      {isDrawingActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-[#1E222D]/95 border border-[#2962FF] text-white px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2962FF] animate-ping" />
          <span className="font-semibold text-[#5C93FF]">وضع الرسم مفعّل:</span>
          <span>
            {isDrawing
              ? 'انقر لتحديد النقطة الثانية وإنهاء الرسم'
              : 'انقر على الشموع لتحديد نقطة البداية (P1)'}
          </span>
          <button
            onClick={cancelDrawing}
            className="ml-2 text-[10px] bg-[#2A2E39] hover:bg-[#363C4E] px-2 py-0.5 rounded text-[#8F9CAE] hover:text-white transition-colors"
          >
            إلغاء (Esc)
          </button>
        </div>
      )}

      {/* ─── Floating Cursor Helper Badge ─── */}
      {isDrawingActive && mousePos && (
        <div
          className="fixed pointer-events-none z-50 text-[10px] bg-[#1E222D]/90 text-white border border-[#2962FF]/60 rounded px-2 py-1 shadow-lg transform translate-x-3 translate-y-3"
          style={{ left: mousePos.x + (containerRef.current?.getBoundingClientRect().left || 0), top: mousePos.y + (containerRef.current?.getBoundingClientRect().top || 0) }}
        >
          {isDrawing ? 'النقطة الثانية (P2)' : 'النقطة الأولى (P1)'}
        </div>
      )}

      {/* ─── SVG Canvas Layer ─── */}
      <svg
        ref={svgRef}
        className="w-full h-full absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Render Saved Drawings */}
        {drawings.map(drawing => {
          const p1 = toPixel(drawing.point1);
          const p2 = toPixel(drawing.point2);
          if (!p1 || !p2) return null;

          const isSelected = drawing.id === selectedDrawingId;
          const { style, text, locked, toolType } = drawing;

          // Extended line geometry
          const { x1, y1, x2, y2 } = calculateExtendedPoints(
            p1,
            p2,
            toolType,
            style.extendLeft,
            style.extendRight,
            containerWidth,
            containerHeight
          );

          const strokeDash =
            style.lineStyle === 'dashed' ? '6 4' : style.lineStyle === 'dotted' ? '2 3' : undefined;

          // Midpoint
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          // Price & Percent difference calculation for infoLine
          const priceDiff = drawing.point2.price - drawing.point1.price;
          const percentDiff = drawing.point1.price ? (priceDiff / drawing.point1.price) * 100 : 0;
          const isUp = priceDiff >= 0;

          return (
            <g key={drawing.id} className="pointer-events-auto">
              {/* Invisible wide stroke for hit-testing */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={18}
                className="cursor-pointer drawing-line-hit"
                onPointerDown={e => startDrag(e, drawing, 'body')}
                onDoubleClick={() => setActiveSettingsDrawing(drawing)}
              />

              {/* Cross Line Vertical counterpart if crossLine */}
              {toolType === 'crossLine' && (
                <line
                  x1={p1.x}
                  y1={0}
                  x2={p1.x}
                  y2={containerHeight}
                  stroke={style.lineColor}
                  strokeWidth={style.lineWidth}
                  strokeDasharray={strokeDash}
                  strokeOpacity={style.opacity}
                  className="pointer-events-none"
                />
              )}

              {/* Parallel Channel Secondary Line */}
              {toolType === 'parallelChannel' && (() => {
                const channelOffset = 30;
                return (
                  <>
                    <line
                      x1={x1}
                      y1={y1 + channelOffset}
                      x2={x2}
                      y2={y2 + channelOffset}
                      stroke={style.lineColor}
                      strokeWidth={style.lineWidth}
                      strokeDasharray={strokeDash}
                      strokeOpacity={style.opacity}
                      className="pointer-events-none"
                    />
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + channelOffset} ${x1},${y1 + channelOffset}`}
                      fill={style.lineColor}
                      fillOpacity={0.08}
                      className="pointer-events-none"
                    />
                  </>
                );
              })()}

              {/* Visible Main Trend Line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={style.lineColor}
                strokeWidth={style.lineWidth}
                strokeDasharray={strokeDash}
                strokeOpacity={style.opacity}
                strokeLinecap="round"
                className="transition-colors pointer-events-none"
              />

              {/* Midpoint marker if enabled */}
              {style.showMidpoint && (
                <circle
                  cx={midX}
                  cy={midY}
                  r={3.5}
                  fill={style.lineColor}
                  fillOpacity={style.opacity}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                />
              )}

              {/* Info Line Information Badge */}
              {toolType === 'infoLine' && (
                <g className="pointer-events-none select-none" transform={`translate(${midX}, ${midY + 12})`}>
                  <rect
                    x={-55}
                    y={-10}
                    width={110}
                    height={20}
                    rx={4}
                    fill="#1E222D"
                    stroke="#363C4E"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={isUp ? '#00C087' : '#F23645'}
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isUp ? '+' : ''}{priceDiff.toFixed(2)} ({isUp ? '+' : ''}{percentDiff.toFixed(2)}%)
                  </text>
                </g>
              )}

              {/* Trend Angle Indicator */}
              {toolType === 'trendAngle' && (() => {
                const angleDeg = Math.round(
                  Math.atan2(p1.y - p2.y, p2.x - p1.x) * (180 / Math.PI)
                );
                return (
                  <g className="pointer-events-none select-none" transform={`translate(${p1.x + 15}, ${p1.y - 12})`}>
                    <rect x={-15} y={-8} width={30} height={16} rx={3} fill="#1E222D" stroke="#363C4E" />
                    <text x={0} y={3} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontFamily="monospace">
                      {angleDeg}°
                    </text>
                  </g>
                );
              })()}

              {/* Text Label Annotation */}
              {text?.content && (
                <text
                  x={midX}
                  y={text.alignment === 'above' ? midY - 8 : text.alignment === 'below' ? midY + 16 : midY + 4}
                  fill={text.color || style.lineColor}
                  fontSize={text.fontSize || 12}
                  fontWeight={text.bold ? 'bold' : 'normal'}
                  fontStyle={text.italic ? 'italic' : 'normal'}
                  textAnchor="middle"
                  className="pointer-events-none select-none font-sans"
                >
                  {text.content}
                </text>
              )}

              {/* Control Handles (P1 & P2) when Selected */}
              {isSelected && (
                <>
                  {/* Point 1 Handle */}
                  <circle
                    cx={p1.x}
                    cy={p1.y}
                    r={5.5}
                    fill="#FFFFFF"
                    stroke={locked ? '#FF9800' : '#2962FF'}
                    strokeWidth={2}
                    className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform drawing-handle"
                    onPointerDown={e => startDrag(e, drawing, 'p1')}
                  />

                  {/* Point 2 Handle (for 2-point tools) */}
                  {toolType !== 'horizLine' && toolType !== 'vertLine' && toolType !== 'crossLine' && (
                    <circle
                      cx={p2.x}
                      cy={p2.y}
                      r={5.5}
                      fill="#FFFFFF"
                      stroke={locked ? '#FF9800' : '#2962FF'}
                      strokeWidth={2}
                      className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform drawing-handle"
                      onPointerDown={e => startDrag(e, drawing, 'p2')}
                    />
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* ─── Live Drawing Preview ─── */}
        {isDrawing && p1Temp && p2Temp && (() => {
          const p1 = toPixel(p1Temp);
          const p2 = toPixel(p2Temp);
          if (!p1 || !p2) return null;

          return (
            <g className="pointer-events-none">
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#2962FF"
                strokeWidth={2}
                strokeDasharray="4 4"
                strokeOpacity={0.9}
              />
              <circle cx={p1.x} cy={p1.y} r={4.5} fill="#FFFFFF" stroke="#2962FF" strokeWidth={2} />
              <circle cx={p2.x} cy={p2.y} r={4.5} fill="#FFFFFF" stroke="#2962FF" strokeWidth={2} />
            </g>
          );
        })()}
      </svg>

      {/* ─── Floating Modification Toolbar when a Line is Selected ─── */}
      {selectedDrawing && floatingToolbarPos && (
        <FloatingLineToolbar
          drawing={selectedDrawing}
          pixelPosition={floatingToolbarPos}
          containerRect={containerRef.current?.getBoundingClientRect() ?? null}
          onOpenSettings={() => setActiveSettingsDrawing(selectedDrawing)}
          onOpenAlert={() => {
            setAlertTargetPrice(selectedDrawing.point2.price);
            setIsAlertModalOpen(true);
          }}
        />
      )}

      {/* ─── 5-Second Undo Toast Notification on Deletion ─── */}
      {recentlyDeleted && (
        <UndoToastNotification
          message="تم حذف الرسم بنجاح"
          onUndo={undoDelete}
          onClose={clearRecentlyDeleted}
          duration={5000}
        />
      )}

      {/* ─── Advanced Settings Modal ─── */}
      <DrawingSettingsModal
        isOpen={Boolean(activeSettingsDrawing)}
        onClose={() => setActiveSettingsDrawing(null)}
        drawing={activeSettingsDrawing}
      />

      {/* ─── Alert Creation Modal ─── */}
      <ChartAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        symbol={activeSymbol.replace('/', '')}
        initialPrice={alertTargetPrice}
        onAlertCreated={alertData => {
          if (selectedDrawingId) {
            updateDrawing(selectedDrawingId, {
              alert: {
                enabled: true,
                condition: alertData.condition as any,
                frequency: alertData.frequency as any,
              },
            });
          }
        }}
      />
    </div>
  );
};
