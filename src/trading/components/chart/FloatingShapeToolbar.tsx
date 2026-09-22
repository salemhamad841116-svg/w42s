import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Trash2, Lock, Unlock, Settings, MoreHorizontal, 
  Copy, ArrowUp, ArrowDown, RotateCcw, Droplet,
  GripVertical, Check, ArrowRight, ArrowLeft
} from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';

interface FloatingShapeToolbarProps {
  drawing: TrendLineDrawing;
  pixelPosition: { x: number; y: number };
  containerRect: DOMRect | null;
  onOpenSettings: () => void;
  onOpenAlert: () => void;
}

const PRESET_COLORS = [
  '#2962FF', '#00BCD4', '#00C087', '#FF9800', '#F23645', 
  '#E040FB', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

const THICKNESS_OPTIONS = [1, 2, 3, 4, 5];

export const FloatingShapeToolbar: React.FC<FloatingShapeToolbarProps> = ({
  drawing,
  pixelPosition,
  containerRect,
  onOpenSettings,
  onOpenAlert,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const toggleLock = useDrawingStore(state => state.toggleLock);
  const toggleFill = useDrawingStore(state => state.toggleFill);
  const setFillOpacity = useDrawingStore(state => state.setFillOpacity);
  const updateArrowSettings = useDrawingStore(state => state.updateArrowSettings);
  const duplicateDrawing = useDrawingStore(state => state.duplicateDrawing);
  const bringToFront = useDrawingStore(state => state.bringToFront);
  const sendToBack = useDrawingStore(state => state.sendToBack);
  const resetDrawingStyle = useDrawingStore(state => state.resetDrawingStyle);

  // Dragging the toolbar itself
  const [customOffset, setCustomOffset] = useState<{ x: number; y: number } | null>(null);
  const isDraggingToolbar = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0, mouseY: 0, initialX: 0, initialY: 0
  });

  const [activePopover, setActivePopover] = useState<'color' | 'thickness' | 'style' | 'fill' | 'arrow' | 'more' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const toolType = drawing.toolType;
  const isArrowTool = ['arrowMarker', 'arrow', 'arrowUp', 'arrowDown'].includes(toolType);
  const isFreehand = ['brush', 'highlighter'].includes(toolType);
  const isClosedShape = ['rectangle', 'rotatedRectangle', 'circle', 'ellipse', 'triangle'].includes(toolType);
  const hasFill = isClosedShape || ['path', 'polyline'].includes(toolType);

  // Docked position computation
  const computedPos = useMemo(() => {
    if (customOffset) return customOffset;
    if (!containerRect) return { x: pixelPosition.x, y: pixelPosition.y };

    const toolbarWidth = 420;
    const toolbarHeight = 44;

    let x = pixelPosition.x - toolbarWidth / 2;
    let y = pixelPosition.y - toolbarHeight - 16;

    if (x < 10) x = 10;
    if (x + toolbarWidth > containerRect.width - 10) {
      x = Math.max(10, containerRect.width - toolbarWidth - 10);
    }
    if (y < 10) {
      y = pixelPosition.y + 24;
    }
    if (y + toolbarHeight > containerRect.height - 10) {
      y = Math.max(10, containerRect.height - toolbarHeight - 10);
    }

    return { x, y };
  }, [pixelPosition, customOffset, containerRect]);

  // Toolbar dragging listeners
  const handleDragPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingToolbar.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: computedPos.x,
      initialY: computedPos.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingToolbar.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;
      setCustomOffset({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    };

    const handlePointerUp = () => {
      isDraggingToolbar.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const strokeColor = drawing.style?.lineColor || '#2962FF';
  const strokeWidth = drawing.style?.lineWidth || 2;
  const strokeStyle = drawing.style?.lineStyle || 'solid';
  const fillColor = drawing.fillColor || strokeColor;
  const fillOpacity = drawing.fillOpacity ?? 0.2;
  const fillBackground = drawing.fillBackground !== false;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 flex items-center bg-[#1E222D] border border-[#2A2E39] rounded-md shadow-2xl px-1.5 py-1 text-gray-200 select-none backdrop-blur-sm"
      style={{
        left: `${computedPos.x}px`,
        top: `${computedPos.y}px`,
        direction: 'ltr',
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={handleDragPointerDown}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-200"
        title="سحب الشريط"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="w-[1px] h-4 bg-[#2A2E39] mx-1" />

      {/* Stroke Color Button */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'color' ? null : 'color')}
          className="p-1.5 hover:bg-[#2A2E39] rounded transition flex items-center gap-1"
          title="لون الخط"
        >
          <div 
            className="w-4 h-4 rounded-full border border-gray-500 shadow-sm"
            style={{ backgroundColor: strokeColor }}
          />
        </button>

        {activePopover === 'color' && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl grid grid-cols-5 gap-1.5 z-50">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => {
                  updateDrawing(drawing.id, {
                    style: { ...drawing.style, lineColor: c }
                  });
                  setActivePopover(null);
                }}
                className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition flex items-center justify-center"
                style={{ backgroundColor: c }}
              >
                {strokeColor === c && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stroke Width / Thickness Button */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'thickness' ? null : 'thickness')}
          className="px-1.5 py-1 hover:bg-[#2A2E39] rounded text-xs font-semibold text-gray-300 flex items-center gap-0.5"
          title="سمك الخط"
        >
          <span>{strokeWidth}px</span>
        </button>

        {activePopover === 'thickness' && (
          <div className="absolute top-full left-0 mt-2 p-1.5 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl flex flex-col gap-1 z-50 min-w-[70px]">
            {THICKNESS_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => {
                  updateDrawing(drawing.id, {
                    style: { ...drawing.style, lineWidth: w }
                  });
                  setActivePopover(null);
                }}
                className={`flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-[#2A2E39] transition ${
                  strokeWidth === w ? 'text-blue-400 font-bold bg-[#2A2E39]/50' : 'text-gray-300'
                }`}
              >
                <span>{w}px</span>
                <div 
                  className="h-[2px] bg-gray-300 rounded ml-2" 
                  style={{ width: `${w * 6}px`, height: `${w}px` }} 
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stroke Style (Solid / Dashed / Dotted) */}
      {!isFreehand && (
        <div className="relative">
          <button
            onClick={() => setActivePopover(activePopover === 'style' ? null : 'style')}
            className="p-1.5 hover:bg-[#2A2E39] rounded text-gray-300 transition"
            title="نمط الخط"
          >
            <div className="w-4 flex flex-col gap-[3px] items-center">
              {strokeStyle === 'solid' && <div className="w-full h-[2px] bg-gray-200" />}
              {strokeStyle === 'dashed' && <div className="w-full h-[2px] border-b border-dashed border-gray-200" />}
              {strokeStyle === 'dotted' && <div className="w-full h-[2px] border-b border-dotted border-gray-200" />}
            </div>
          </button>

          {activePopover === 'style' && (
            <div className="absolute top-full left-0 mt-2 p-1.5 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl flex flex-col gap-1 z-50 min-w-[85px]">
              {(['solid', 'dashed', 'dotted'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    updateDrawing(drawing.id, {
                      style: { ...drawing.style, lineStyle: s }
                    });
                    setActivePopover(null);
                  }}
                  className={`flex items-center px-2 py-1.5 text-xs rounded hover:bg-[#2A2E39] transition ${
                    strokeStyle === s ? 'text-blue-400 font-bold bg-[#2A2E39]/50' : 'text-gray-300'
                  }`}
                >
                  <span className="capitalize">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fill Color & Opacity (For closed shapes and paths) */}
      {hasFill && (
        <div className="relative">
          <button
            onClick={() => setActivePopover(activePopover === 'fill' ? null : 'fill')}
            className={`p-1.5 hover:bg-[#2A2E39] rounded transition flex items-center gap-1 ${
              fillBackground ? 'text-gray-200' : 'text-gray-500 line-through'
            }`}
            title="تعبئة الشكل والشفافية"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-500 shadow-sm flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: fillBackground ? fillColor : 'transparent' }}
            >
              <Droplet className="w-2.5 h-2.5 text-white drop-shadow" />
            </div>
          </button>

          {activePopover === 'fill' && (
            <div className="absolute top-full left-0 mt-2 p-2.5 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl z-50 flex flex-col gap-2 min-w-[170px]">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>تفعيل التعبئة</span>
                <input
                  type="checkbox"
                  checked={fillBackground}
                  onChange={() => toggleFill(drawing.id)}
                  className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {fillBackground && (
                <>
                  <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-[#2A2E39]">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => updateDrawing(drawing.id, { fillColor: c })}
                        className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition flex items-center justify-center"
                        style={{ backgroundColor: c }}
                      >
                        {fillColor === c && <Check className="w-3 h-3 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#2A2E39]">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>الشفافية</span>
                      <span>{Math.round(fillOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(fillOpacity * 100)}
                      onChange={e => setFillOpacity(drawing.id, Number(e.target.value) / 100)}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Arrow Specific Controls */}
      {isArrowTool && (
        <div className="relative">
          <button
            onClick={() => setActivePopover(activePopover === 'arrow' ? null : 'arrow')}
            className="p-1.5 hover:bg-[#2A2E39] rounded text-gray-300 transition flex items-center gap-1"
            title="إعدادات السهم"
          >
            {toolType === 'arrowDown' ? (
              <ArrowDown className="w-4 h-4 text-red-400" />
            ) : toolType === 'arrowUp' ? (
              <ArrowUp className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {activePopover === 'arrow' && (
            <div className="absolute top-full left-0 mt-2 p-2.5 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl z-50 flex flex-col gap-2 min-w-[180px]">
              <div className="text-xs font-semibold text-gray-400 border-b border-[#2A2E39] pb-1">
                إعدادات السهم
              </div>

              {toolType === 'arrowMarker' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-300">الاتجاه</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['up', 'down', 'left', 'right'] as const).map(dir => (
                      <button
                        key={dir}
                        onClick={() => updateArrowSettings(drawing.id, { arrowDirection: dir })}
                        className={`p-1 flex items-center justify-center rounded border ${
                          drawing.arrowSettings?.arrowDirection === dir 
                            ? 'bg-blue-600 border-blue-400 text-white' 
                            : 'border-[#2A2E39] text-gray-400 hover:bg-[#2A2E39]'
                        }`}
                      >
                        {dir === 'up' && <ArrowUp className="w-3.5 h-3.5" />}
                        {dir === 'down' && <ArrowDown className="w-3.5 h-3.5" />}
                        {dir === 'left' && <ArrowLeft className="w-3.5 h-3.5" />}
                        {dir === 'right' && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {toolType === 'arrow' && (
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                    <span>رأس البداية</span>
                    <input
                      type="checkbox"
                      checked={drawing.arrowSettings?.arrowheadStart || false}
                      onChange={e => updateArrowSettings(drawing.id, { arrowheadStart: e.target.checked })}
                      className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                    <span>رأس النهاية</span>
                    <input
                      type="checkbox"
                      checked={drawing.arrowSettings?.arrowheadEnd !== false}
                      onChange={e => updateArrowSettings(drawing.id, { arrowheadEnd: e.target.checked })}
                      className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              )}

              {/* Arrow Size */}
              <div className="pt-1 border-t border-[#2A2E39]">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>الحجم</span>
                  <span>{drawing.arrowSettings?.arrowSize || 20}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={drawing.arrowSettings?.arrowSize || 20}
                  onChange={e => updateArrowSettings(drawing.id, { arrowSize: Number(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-[1px] h-4 bg-[#2A2E39] mx-1" />

      {/* Lock / Unlock */}
      <button
        onClick={() => toggleLock(drawing.id)}
        className="p-1.5 hover:bg-[#2A2E39] rounded text-gray-400 hover:text-gray-200 transition"
        title={drawing.locked ? 'إلغاء القفل' : 'قفل الأداة'}
      >
        {drawing.locked ? (
          <Lock className="w-4 h-4 text-amber-400" />
        ) : (
          <Unlock className="w-4 h-4" />
        )}
      </button>

      {/* Settings Dialog */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 hover:bg-[#2A2E39] rounded text-gray-400 hover:text-gray-200 transition"
        title="إعدادات الأداة"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Delete with Undo */}
      <button
        onClick={() => deleteDrawing(drawing.id)}
        className="p-1.5 hover:bg-[#2A2E39] hover:text-red-400 rounded text-gray-400 transition"
        title="حذف الأداة"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* More Options */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'more' ? null : 'more')}
          className="p-1.5 hover:bg-[#2A2E39] rounded text-gray-400 hover:text-gray-200 transition"
          title="خيارات إضافية"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {activePopover === 'more' && (
          <div className="absolute top-full right-0 mt-2 p-1.5 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl flex flex-col gap-1 z-50 min-w-[140px] text-xs">
            <button
              onClick={() => {
                duplicateDrawing(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#2A2E39] text-gray-300 rounded text-right transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ متطابق</span>
            </button>
            <button
              onClick={() => {
                bringToFront(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#2A2E39] text-gray-300 rounded text-right transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>إحضار للأمام</span>
            </button>
            <button
              onClick={() => {
                sendToBack(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#2A2E39] text-gray-300 rounded text-right transition"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>إرسال للخلف</span>
            </button>
            <div className="h-[1px] bg-[#2A2E39] my-0.5" />
            <button
              onClick={() => {
                resetDrawingStyle(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#2A2E39] text-amber-400 rounded text-right transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط المظهر</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
