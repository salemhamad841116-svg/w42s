import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Lock, Unlock, Settings, Bell, MoreHorizontal, 
  Copy, ArrowUp, ArrowDown, RotateCcw, Droplet,
  Tag, Percent, CheckCircle2, GripVertical, Check
} from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';

interface FloatingPatternToolbarProps {
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

export const FloatingPatternToolbar: React.FC<FloatingPatternToolbarProps> = ({
  drawing,
  pixelPosition,
  containerRect,
  onOpenSettings,
  onOpenAlert,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const toggleLock = useDrawingStore(state => state.toggleLock);
  const toggleShowRatios = useDrawingStore(state => state.toggleShowRatios);
  const toggleShowPointLabels = useDrawingStore(state => state.toggleShowPointLabels);
  const toggleValidatePattern = useDrawingStore(state => state.toggleValidatePattern);
  const setPatternFill = useDrawingStore(state => state.setPatternFill);
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

  // Docked position computation
  const computedPos = React.useMemo(() => {
    if (customOffset) return customOffset;
    if (!containerRect) return { x: pixelPosition.x, y: pixelPosition.y };

    const toolbarWidth = 470;
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

  const isHarmonic = drawing.toolType === 'xabcd' || drawing.toolType === 'cypher' || drawing.toolType === 'abcd';

  return (
    <div
      ref={toolbarRef}
      className="floating-line-toolbar fixed z-40 select-none notranslate animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: computedPos.x,
        top: computedPos.y,
      }}
      translate="no"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-2xl shadow-black/80 px-1.5 py-1 flex items-center gap-1 text-[#D1D4DC]">
        {/* Drag Handle */}
        <div
          onPointerDown={handleDragPointerDown}
          className="cursor-grab active:cursor-grabbing p-1 text-[#5A6478] hover:text-[#D1D4DC] rounded hover:bg-[#2A2E39] transition-colors"
          title="سحب شريط الأدوات"
        >
          <GripVertical size={14} />
        </div>

        <div className="w-px h-4 bg-[#2A2E39] mx-0.5" />

        {/* Harmonic Pattern Validation Badge & Toggle (if harmonic) */}
        {isHarmonic && (
          <button
            onClick={() => toggleValidatePattern(drawing.id)}
            className={`p-1.5 rounded flex items-center gap-1 transition-colors text-xs font-semibold ${
              drawing.validatePattern !== false
                ? drawing.patternStatus === 'valid'
                  ? 'bg-[#00C087]/20 text-[#00C087] hover:bg-[#00C087]/30'
                  : drawing.patternStatus === 'warning'
                  ? 'bg-[#FF9800]/20 text-[#FF9800] hover:bg-[#FF9800]/30'
                  : 'bg-[#F23645]/20 text-[#F23645] hover:bg-[#F23645]/30'
                : 'text-[#8F9CAE] hover:bg-[#2A2E39] hover:text-white'
            }`}
            title="التحقق البصري من نسب النموذج (أخضر / برتقالي / أحمر)"
          >
            <CheckCircle2 size={15} />
            <span className="text-[10px] hidden sm:inline">
              {drawing.patternStatus === 'valid' ? 'مطابق' : drawing.patternStatus === 'warning' ? 'قريب' : 'تحقق'}
            </span>
          </button>
        )}

        {/* Toggle Ratios (%) */}
        {isHarmonic && (
          <button
            onClick={() => toggleShowRatios(drawing.id)}
            className={`p-1.5 rounded transition-colors ${
              drawing.showRatios !== false
                ? 'bg-[#2962FF]/20 text-[#2962FF]'
                : 'text-[#8F9CAE] hover:bg-[#2A2E39] hover:text-white'
            }`}
            title={drawing.showRatios !== false ? 'إخفاء نسب فيبوناتشي' : 'إظهار نسب فيبوناتشي'}
          >
            <Percent size={15} />
          </button>
        )}

        {/* Toggle Point Labels (🏷) */}
        <button
          onClick={() => toggleShowPointLabels(drawing.id)}
          className={`p-1.5 rounded transition-colors ${
            drawing.showPointLabels !== false
              ? 'bg-[#2962FF]/20 text-[#2962FF]'
              : 'text-[#8F9CAE] hover:bg-[#2A2E39] hover:text-white'
          }`}
          title={drawing.showPointLabels !== false ? 'إخفاء أسماء النقاط' : 'إظهار أسماء النقاط'}
        >
          <Tag size={15} />
        </button>

        {/* Fill Background Color & Opacity (💧) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => prev === 'fill' ? null : 'fill')}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              drawing.fillBackground !== false
                ? 'bg-[#2A2E39] text-[#2962FF]'
                : 'text-[#8F9CAE] hover:bg-[#2A2E39] hover:text-white'
            }`}
            title="تعبئة خلفية النموذج والشفافية"
          >
            <Droplet size={15} />
            <span className="text-[9px] font-mono font-bold text-[#8F9CAE]">
              {Math.round((drawing.fillOpacity ?? 0.15) * 100)}%
            </span>
          </button>

          {activePopover === 'fill' && (
            <div className="absolute left-0 top-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg p-3 shadow-2xl z-50 w-52 text-right notranslate" dir="rtl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-medium">تعبئة المضلعات</span>
                <input
                  type="checkbox"
                  checked={drawing.fillBackground !== false}
                  onChange={(e) => updateDrawing(drawing.id, { fillBackground: e.target.checked })}
                  className="rounded border-[#363C4E] bg-[#151924] text-[#2962FF]"
                />
              </div>

              <div className="mb-2">
                <span className="text-[10px] text-[#8F9CAE]">لون التعبئة</span>
                <div className="grid grid-cols-5 gap-1.5 mt-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setPatternFill(drawing.id, c, drawing.fillOpacity ?? 0.15)}
                      className={`w-6 h-6 rounded-md border transition-transform ${
                        drawing.fillColor === c ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-[#8F9CAE] mb-1">
                  <span>الشفافية</span>
                  <span className="font-mono">{Math.round((drawing.fillOpacity ?? 0.15) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={drawing.fillOpacity ?? 0.15}
                  onChange={(e) => setPatternFill(drawing.id, drawing.fillColor || '#2962FF', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2A2E39] rounded-lg appearance-none cursor-pointer accent-[#2962FF]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#2A2E39] mx-0.5" />

        {/* Border Line Color Picker */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => prev === 'color' ? null : 'color')}
            className="w-6 h-6 rounded flex items-center justify-center p-0.5 hover:bg-[#2A2E39] transition-colors"
            title="لون الحدود"
          >
            <div 
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: drawing.style.lineColor }}
            />
          </button>

          {activePopover === 'color' && (
            <div className="absolute left-0 top-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg p-2.5 shadow-2xl z-50 grid grid-cols-5 gap-1.5 w-44 notranslate">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineColor: c } });
                    setActivePopover(null);
                  }}
                  className={`w-6 h-6 rounded-md border transition-transform ${
                    drawing.style.lineColor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Line Thickness */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => prev === 'thickness' ? null : 'thickness')}
            className="p-1.5 rounded text-xs font-mono font-bold text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors flex items-center gap-0.5"
            title="سماكة الخط"
          >
            <span>{drawing.style.lineWidth}px</span>
          </button>

          {activePopover === 'thickness' && (
            <div className="absolute left-0 top-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg py-1 shadow-2xl z-50 flex flex-col w-24 notranslate">
              {THICKNESS_OPTIONS.map(px => (
                <button
                  key={px}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineWidth: px } });
                    setActivePopover(null);
                  }}
                  className={`px-3 py-1.5 text-xs text-right flex items-center justify-between hover:bg-[#2A2E39] ${
                    drawing.style.lineWidth === px ? 'text-[#2962FF] font-bold' : 'text-[#D1D4DC]'
                  }`}
                >
                  <div className="w-10 bg-current rounded-full" style={{ height: px }} />
                  <span>{px}px</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Line Style (Solid, Dashed, Dotted) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => prev === 'style' ? null : 'style')}
            className="p-1.5 rounded text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
            title="نمط الخط"
          >
            <div className="w-4 h-0.5 bg-current my-1" />
          </button>

          {activePopover === 'style' && (
            <div className="absolute left-0 top-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg py-1 shadow-2xl z-50 flex flex-col w-28 notranslate">
              {(['solid', 'dashed', 'dotted'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineStyle: style } });
                    setActivePopover(null);
                  }}
                  className={`px-3 py-1.5 text-xs text-right flex items-center justify-between hover:bg-[#2A2E39] ${
                    drawing.style.lineStyle === style ? 'text-[#2962FF] font-bold' : 'text-[#D1D4DC]'
                  }`}
                >
                  <span className="capitalize">{style === 'solid' ? 'متصل' : style === 'dashed' ? 'متقطع' : 'منقط'}</span>
                  {drawing.style.lineStyle === style && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#2A2E39] mx-0.5" />

        {/* Settings Gear */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          title="الإعدادات المتقدمة"
        >
          <Settings size={15} />
        </button>

        {/* Alert Bell */}
        <button
          onClick={onOpenAlert}
          className={`p-1.5 rounded transition-colors ${
            drawing.alert?.enabled
              ? 'text-[#FF9800] bg-[#FF9800]/10 hover:bg-[#FF9800]/20'
              : 'text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39]'
          }`}
          title="إنشاء تنبيه سعري على النموذج"
        >
          <Bell size={15} />
        </button>

        {/* Lock / Unlock */}
        <button
          onClick={() => toggleLock(drawing.id)}
          className={`p-1.5 rounded transition-colors ${
            drawing.locked
              ? 'text-[#FF9800] bg-[#FF9800]/10 hover:bg-[#FF9800]/20'
              : 'text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39]'
          }`}
          title={drawing.locked ? 'إلغاء قفل النموذج' : 'قفل النموذج لمنع التعديل'}
        >
          {drawing.locked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>

        {/* Delete with 5s undo */}
        <button
          onClick={() => deleteDrawing(drawing.id)}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-[#F23645] hover:bg-[#F23645]/10 transition-colors"
          title="حذف النموذج (مع إمكانية التراجع)"
        >
          <Trash2 size={15} />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => prev === 'more' ? null : 'more')}
            className="p-1.5 rounded text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
            title="المزيد من الخيارات"
          >
            <MoreHorizontal size={15} />
          </button>

          {activePopover === 'more' && (
            <div className="absolute right-0 top-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg py-1 shadow-2xl z-50 flex flex-col w-44 text-right notranslate" dir="rtl">
              <button
                onClick={() => {
                  duplicateDrawing(drawing.id);
                  setActivePopover(null);
                }}
                className="px-3 py-1.5 text-xs text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center justify-between"
              >
                <span>استنساخ (Duplicate)</span>
                <Copy size={13} className="text-[#8F9CAE]" />
              </button>

              <button
                onClick={() => {
                  bringToFront(drawing.id);
                  setActivePopover(null);
                }}
                className="px-3 py-1.5 text-xs text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center justify-between"
              >
                <span>إلى الأمام (Bring to Front)</span>
                <ArrowUp size={13} className="text-[#8F9CAE]" />
              </button>

              <button
                onClick={() => {
                  sendToBack(drawing.id);
                  setActivePopover(null);
                }}
                className="px-3 py-1.5 text-xs text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center justify-between"
              >
                <span>إلى الخلف (Send to Back)</span>
                <ArrowDown size={13} className="text-[#8F9CAE]" />
              </button>

              <div className="h-px bg-[#2A2E39] my-1" />

              <button
                onClick={() => {
                  resetDrawingStyle(drawing.id);
                  setActivePopover(null);
                }}
                className="px-3 py-1.5 text-xs text-[#F23645] hover:bg-[#F23645]/10 flex items-center justify-between"
              >
                <span>إعادة ضبط المظهر</span>
                <RotateCcw size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
