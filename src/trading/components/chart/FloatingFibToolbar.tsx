import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Lock, Unlock, Settings, Bell, MoreHorizontal, 
  Copy, ArrowUp, ArrowDown, RotateCcw, ArrowUpDown, Droplet,
  Tag, GripVertical, Check
} from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';

interface FloatingFibToolbarProps {
  drawing: TrendLineDrawing;
  pixelPosition: { x: number; y: number };
  containerRect: DOMRect | null;
  onOpenSettings: () => void;
  onOpenAlert: () => void;
}

const PRESET_COLORS = [
  '#2962FF', '#00C087', '#F23645', '#FF9800', '#E040FB', 
  '#00BCD4', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

const THICKNESS_OPTIONS = [1, 2, 3, 4, 5];

export const FloatingFibToolbar: React.FC<FloatingFibToolbarProps> = ({
  drawing,
  pixelPosition,
  containerRect,
  onOpenSettings,
  onOpenAlert,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const toggleLock = useDrawingStore(state => state.toggleLock);
  const toggleReverse = useDrawingStore(state => state.toggleReverse);
  const toggleLabels = useDrawingStore(state => state.toggleLabels);
  const toggleFill = useDrawingStore(state => state.toggleFill);
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

  const [activePopover, setActivePopover] = useState<'color' | 'thickness' | 'style' | 'fill' | 'more' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Compute docked position
  const computedPos = React.useMemo(() => {
    if (customOffset) return customOffset;
    if (!containerRect) return { x: pixelPosition.x, y: pixelPosition.y };

    const toolbarWidth = 440;
    const toolbarHeight = 44;

    let x = pixelPosition.x - toolbarWidth / 2;
    let y = pixelPosition.y - toolbarHeight - 16;

    // Viewport clamping
    if (x < 10) x = 10;
    if (x + toolbarWidth > containerRect.width - 10) {
      x = Math.max(10, containerRect.width - toolbarWidth - 10);
    }
    if (y < 10) {
      y = pixelPosition.y + 24; // flip below
    }
    if (y + toolbarHeight > containerRect.height - 10) {
      y = Math.max(10, containerRect.height - toolbarHeight - 10);
    }

    return { x, y };
  }, [pixelPosition, customOffset, containerRect]);

  // Handle toolbar dragging
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

  // Close popover when clicking outside toolbar
  useEffect(() => {
    if (!activePopover) return;

    const handleOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopover]);

  return (
    <div
      ref={toolbarRef}
      className="floating-line-toolbar absolute z-50 pointer-events-auto select-none notranslate animate-in fade-in zoom-in-95 duration-100"
      translate="no"
      style={{
        left: computedPos.x,
        top: computedPos.y,
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 bg-[#1E222D]/95 backdrop-blur-md border border-[#363C4E] rounded-lg shadow-2xl px-1.5 py-1 text-white">
        
        {/* 1. Drag Handle :: */}
        <div
          onPointerDown={handleDragPointerDown}
          className="p-1.5 text-[#6B788E] hover:text-white cursor-grab active:cursor-grabbing hover:bg-[#2A2E39] rounded transition-colors"
          title="سحب شريط الأدوات"
        >
          <GripVertical size={16} />
        </div>

        <div className="w-px h-5 bg-[#2A2E39] mx-0.5" />

        {/* 2. Reverse Levels Button (⇅) */}
        <button
          onClick={() => toggleReverse(drawing.id)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
            drawing.reversed ? 'bg-[#2962FF]/20 text-[#2962FF] font-semibold' : 'text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39]'
          }`}
          title={drawing.reversed ? 'عكس المستويات (مفعّل)' : 'عكس اتجاه المستويات (Reverse)'}
        >
          <ArrowUpDown size={15} />
          <span className="text-[10px]">عكس</span>
        </button>

        {/* 3. Fill Background & Opacity Toggle */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'fill' ? null : 'fill'))}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              drawing.fillBackground ? 'text-[#2962FF]' : 'text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39]'
            }`}
            title="تعبئة الخلفية الملونة والشفافية"
          >
            <Droplet size={15} />
          </button>

          {activePopover === 'fill' && (
            <div className="absolute top-full mt-1.5 left-0 w-48 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-2.5 z-50 text-xs" dir="rtl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-[11px]">تعبئة المساحات</span>
                <input
                  type="checkbox"
                  checked={drawing.fillBackground ?? true}
                  onChange={() => toggleFill(drawing.id)}
                  className="rounded bg-[#131722] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#8F9CAE] mb-1">
                <span>شفافية التعبئة</span>
                <span>{Math.round((drawing.fillOpacity ?? 0.12) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.6"
                step="0.02"
                value={drawing.fillOpacity ?? 0.12}
                onChange={e => updateDrawing(drawing.id, { fillOpacity: parseFloat(e.target.value) })}
                className="w-full accent-[#2962FF] h-1.5 bg-[#131722] rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 4. Labels & Prices Toggle (Tag) */}
        <button
          onClick={() => toggleLabels(drawing.id)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
            drawing.showLabels !== false ? 'text-[#2962FF]' : 'text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39]'
          }`}
          title={drawing.showLabels !== false ? 'إخفاء الأسعار والنسب' : 'إظهار الأسعار والنسب'}
        >
          <Tag size={15} />
        </button>

        {/* 5. Color Picker */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'color' ? null : 'color'))}
            className="p-1.5 rounded hover:bg-[#2A2E39] transition-colors flex flex-col items-center justify-center gap-0.5"
            title="لون الخط الأساسي"
          >
            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: drawing.style.lineColor }} />
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: drawing.style.lineColor }} />
          </button>

          {activePopover === 'color' && (
            <div className="absolute top-full mt-1.5 left-0 w-48 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-2.5 z-50">
              <div className="text-[10px] text-[#8F9CAE] font-medium mb-1.5">اللون الرئيسي</div>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => updateDrawing(drawing.id, { style: { ...drawing.style, lineColor: c } })}
                    className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {drawing.style.lineColor === c && <Check size={12} className="text-black/80 font-bold" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. Line Thickness */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'thickness' ? null : 'thickness'))}
            className="px-2 py-1 rounded hover:bg-[#2A2E39] transition-colors text-xs font-mono font-medium text-[#8F9CAE] hover:text-white"
            title="سماكة الخط"
          >
            {drawing.style.lineWidth}px
          </button>

          {activePopover === 'thickness' && (
            <div className="absolute top-full mt-1.5 left-0 w-28 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1.5 z-50 flex flex-col gap-1">
              {THICKNESS_OPTIONS.map(width => (
                <button
                  key={width}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineWidth: width } });
                    setActivePopover(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    drawing.style.lineWidth === width ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#8F9CAE] hover:bg-[#262B3D] hover:text-white'
                  }`}
                >
                  <span>{width}px</span>
                  <div className="w-10 bg-current rounded" style={{ height: width }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 7. Line Style */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'style' ? null : 'style'))}
            className="p-1.5 rounded hover:bg-[#2A2E39] transition-colors text-[#8F9CAE] hover:text-white"
            title="نمط الخط"
          >
            {drawing.style.lineStyle === 'solid' && <span className="font-mono text-sm leading-none">—</span>}
            {drawing.style.lineStyle === 'dashed' && <span className="font-mono text-sm leading-none">- -</span>}
            {drawing.style.lineStyle === 'dotted' && <span className="font-mono text-sm leading-none">···</span>}
          </button>

          {activePopover === 'style' && (
            <div className="absolute top-full mt-1.5 left-0 w-32 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1.5 z-50 flex flex-col gap-1" dir="rtl">
              {[
                { id: 'solid', label: 'متصل', preview: '————' },
                { id: 'dashed', label: 'متقطع', preview: '- - - -' },
                { id: 'dotted', label: 'منقط', preview: '· · · ·' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineStyle: s.id as any } });
                    setActivePopover(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    drawing.style.lineStyle === s.id ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#8F9CAE] hover:bg-[#262B3D] hover:text-white'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="font-mono">{s.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#2A2E39] mx-0.5" />

        {/* 8. Settings Icon (⚙) */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          title="إعدادات المستويات والنمط (Settings)"
        >
          <Settings size={16} />
        </button>

        {/* 9. Add Alert Icon (⏰+) */}
        <button
          onClick={onOpenAlert}
          className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
            drawing.alert?.enabled ? 'text-[#FF9800]' : 'text-[#8F9CAE] hover:text-white'
          }`}
          title="إنشاء تنبيه على مستويات فيبوناتشي"
        >
          <Bell size={16} />
        </button>

        {/* 10. Lock/Unlock (🔒) */}
        <button
          onClick={() => toggleLock(drawing.id)}
          className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
            drawing.locked ? 'text-[#FF9800] bg-[#FF9800]/10' : 'text-[#8F9CAE] hover:text-white'
          }`}
          title={drawing.locked ? 'إلغاء قفل الأداة' : 'قفل الأداة'}
        >
          {drawing.locked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        {/* 11. Delete (🗑) */}
        <button
          onClick={() => deleteDrawing(drawing.id)}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-[#F23645] hover:bg-[#F23645]/10 transition-colors"
          title="حذف الأداة"
        >
          <Trash2 size={16} />
        </button>

        {/* 12. More (...) Menu */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'more' ? null : 'more'))}
            className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
              activePopover === 'more' ? 'bg-[#2A2E39] text-white' : 'text-[#8F9CAE] hover:text-white'
            }`}
            title="المزيد من الخيارات"
          >
            <MoreHorizontal size={16} />
          </button>

          {activePopover === 'more' && (
            <div className="absolute top-full mt-1.5 right-0 w-44 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1 z-50 text-xs" dir="rtl">
              <button
                onClick={() => {
                  duplicateDrawing(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <Copy size={14} />
                <span>استنساخ (Clone)</span>
              </button>

              <button
                onClick={() => {
                  bringToFront(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <ArrowUp size={14} />
                <span>إلى الأمام (Bring to Front)</span>
              </button>

              <button
                onClick={() => {
                  sendToBack(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <ArrowDown size={14} />
                <span>إلى الخلف (Send to Back)</span>
              </button>

              <div className="w-full h-px bg-[#262B3D] my-1" />

              <button
                onClick={() => {
                  resetDrawingStyle(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط المستويات</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
