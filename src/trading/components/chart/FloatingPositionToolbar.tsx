import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Lock, Unlock, Settings, Bell, MoreHorizontal, 
  Copy, ArrowUp, ArrowDown, RotateCcw, Droplet,
  Tag, GripVertical, Check, TrendingUp, TrendingDown
} from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';
import { calculatePositionMetrics } from './forecastingData';
import { useChartStore } from '../../stores/chartStore';

interface FloatingPositionToolbarProps {
  drawing: TrendLineDrawing;
  pixelPosition: { x: number; y: number };
  containerRect: DOMRect | null;
  onOpenSettings: () => void;
  onOpenAlert: () => void;
}

const PRESET_COLORS = [
  '#00C087', '#2962FF', '#00BCD4', '#FF9800', '#F23645', 
  '#E040FB', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

const THICKNESS_OPTIONS = [1, 2, 3, 4];

export const FloatingPositionToolbar: React.FC<FloatingPositionToolbarProps> = ({
  drawing,
  pixelPosition,
  containerRect,
  onOpenSettings,
  onOpenAlert,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const toggleLock = useDrawingStore(state => state.toggleLock);
  const duplicateDrawing = useDrawingStore(state => state.duplicateDrawing);
  const bringToFront = useDrawingStore(state => state.bringToFront);
  const sendToBack = useDrawingStore(state => state.sendToBack);
  const resetDrawingStyle = useDrawingStore(state => state.resetDrawingStyle);
  const activeSymbol = useChartStore(state => state.activeSymbol) || 'BTC/USDT';

  const positionData = drawing.positionData || {
    entryPrice: drawing.point1.price,
    targetPrice: drawing.point2.price,
    stopLossPrice: drawing.point1.price - (drawing.point2.price - drawing.point1.price) * 0.5,
    riskRewardRatio: 2.0,
    profitColor: '#00C087',
    lossColor: '#F23645',
    entryLineColor: '#2962FF',
    profitOpacity: 0.22,
    lossOpacity: 0.22,
    showMetrics: true,
  };

  // Dragging the toolbar itself
  const [customOffset, setCustomOffset] = useState<{ x: number; y: number } | null>(null);
  const isDraggingToolbar = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0, mouseY: 0, initialX: 0, initialY: 0
  });

  const [activePopover, setActivePopover] = useState<'profitColor' | 'lossColor' | 'entryLine' | 'more' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Computed docked position
  const computedPos = React.useMemo(() => {
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

  // Handle toolbar drag
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

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const updatePosData = (updates: Partial<typeof positionData>) => {
    const newPos = { ...positionData, ...updates };
    updateDrawing(drawing.id, { positionData: newPos });
  };

  const isLong = drawing.toolType === 'longPosition';
  const rr = positionData.riskRewardRatio ?? 0;
  const rrBadgeColor = rr >= 2 ? 'bg-[#00C087]/20 text-[#00C087] border-[#00C087]/40' :
                       rr >= 1 ? 'bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/40' :
                       'bg-[#F23645]/20 text-[#F23645] border-[#F23645]/40';

  return (
    <div
      ref={toolbarRef}
      className="floating-line-toolbar absolute z-40 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#1E222D]/95 backdrop-blur-md border border-[#2A3050] shadow-2xl text-[#D1D4DC] text-xs select-none pointer-events-auto"
      style={{
        left: `${computedPos.x}px`,
        top: `${computedPos.y}px`,
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Drag handle */}
      <div
        onPointerDown={handleDragPointerDown}
        className="cursor-grab active:cursor-grabbing p-1 text-[#5E6673] hover:text-[#D1D4DC] rounded transition-colors"
        title="سحب الشريط"
      >
        <GripVertical size={14} />
      </div>

      {/* R:R Ratio Status Badge */}
      <div 
        className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${rrBadgeColor}`}
        title={`نسبة العائد إلى المخاطرة: 1:${rr}`}
      >
        {isLong ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>R:R {rr.toFixed(2)}</span>
      </div>

      <div className="w-px h-4 bg-[#2A3050] mx-0.5" />

      {/* Profit Zone Color & Opacity */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'profitColor' ? null : 'profitColor')}
          className={`flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#2A3050] transition-colors ${
            activePopover === 'profitColor' ? 'bg-[#2A3050]' : ''
          }`}
          title="لون الهدف والربح (Profit Area)"
        >
          <div 
            className="w-3.5 h-3.5 rounded border border-white/20" 
            style={{ backgroundColor: positionData.profitColor || '#00C087' }} 
          />
          <Droplet size={11} className="text-[#00C087]" />
        </button>

        {activePopover === 'profitColor' && (
          <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-[#1E222D] border border-[#2A3050] rounded-lg shadow-xl flex flex-col gap-2 min-w-[170px] z-50">
            <div className="text-[10px] text-[#787B86] font-semibold">منطقة الهدف (الربح)</div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => updatePosData({ profitColor: c })}
                  className="w-5 h-5 rounded flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                >
                  {positionData.profitColor === c && <Check size={10} className="text-black drop-shadow" />}
                </button>
              ))}
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-[10px] text-[#787B86] mb-1">
                <span>الشفافية</span>
                <span>{Math.round((positionData.profitOpacity ?? 0.22) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={positionData.profitOpacity ?? 0.22}
                onChange={e => updatePosData({ profitOpacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A3050] rounded-lg appearance-none cursor-pointer accent-[#00C087]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loss Zone Color & Opacity */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'lossColor' ? null : 'lossColor')}
          className={`flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#2A3050] transition-colors ${
            activePopover === 'lossColor' ? 'bg-[#2A3050]' : ''
          }`}
          title="لون وقف الخسارة (Stop Loss Area)"
        >
          <div 
            className="w-3.5 h-3.5 rounded border border-white/20" 
            style={{ backgroundColor: positionData.lossColor || '#F23645' }} 
          />
          <Droplet size={11} className="text-[#F23645]" />
        </button>

        {activePopover === 'lossColor' && (
          <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-[#1E222D] border border-[#2A3050] rounded-lg shadow-xl flex flex-col gap-2 min-w-[170px] z-50">
            <div className="text-[10px] text-[#787B86] font-semibold">منطقة وقف الخسارة</div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => updatePosData({ lossColor: c })}
                  className="w-5 h-5 rounded flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                >
                  {positionData.lossColor === c && <Check size={10} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-[10px] text-[#787B86] mb-1">
                <span>الشفافية</span>
                <span>{Math.round((positionData.lossOpacity ?? 0.22) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={positionData.lossOpacity ?? 0.22}
                onChange={e => updatePosData({ lossOpacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A3050] rounded-lg appearance-none cursor-pointer accent-[#F23645]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Entry Line Popover */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'entryLine' ? null : 'entryLine')}
          className={`flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#2A3050] transition-colors ${
            activePopover === 'entryLine' ? 'bg-[#2A3050]' : ''
          }`}
          title="خط الدخول (Entry Line)"
        >
          <div 
            className="w-3.5 h-1 rounded" 
            style={{ backgroundColor: positionData.entryLineColor || '#2962FF' }} 
          />
        </button>

        {activePopover === 'entryLine' && (
          <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-[#1E222D] border border-[#2A3050] rounded-lg shadow-xl flex flex-col gap-2 min-w-[170px] z-50">
            <div className="text-[10px] text-[#787B86] font-semibold">خط الدخول (سعر الأساس)</div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => updatePosData({ entryLineColor: c })}
                  className="w-5 h-5 rounded flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                >
                  {positionData.entryLineColor === c && <Check size={10} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Metrics Badge on Chart */}
      <button
        onClick={() => updatePosData({ showMetrics: !positionData.showMetrics })}
        className={`p-1.5 rounded transition-colors ${
          positionData.showMetrics !== false 
            ? 'text-[#2962FF] bg-[#2962FF]/10' 
            : 'text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A3050]'
        }`}
        title="إظهار / إخفاء تفاصيل الصفقة واللوت (Metrics)"
      >
        <Tag size={14} />
      </button>

      <div className="w-px h-4 bg-[#2A3050] mx-0.5" />

      {/* Settings Modal Button */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A3050] rounded transition-colors"
        title="إعدادات الصفقة وإدارة المخاطر (Settings)"
      >
        <Settings size={14} />
      </button>

      {/* Price Alert Button */}
      <button
        onClick={onOpenAlert}
        className="p-1.5 text-[#787B86] hover:text-[#FF9800] hover:bg-[#2A3050] rounded transition-colors"
        title="إضافة تنبيه عند الوصول للمستويات (Alert)"
      >
        <Bell size={14} />
      </button>

      {/* Lock / Unlock */}
      <button
        onClick={() => toggleLock(drawing.id)}
        className={`p-1.5 rounded transition-colors ${
          drawing.locked 
            ? 'text-[#FF9800] bg-[#FF9800]/10' 
            : 'text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A3050]'
        }`}
        title={drawing.locked ? 'إلغاء قفل الرسم' : 'قفل الرسم (منع التعديل)'}
      >
        {drawing.locked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>

      {/* Delete Drawing */}
      <button
        onClick={() => deleteDrawing(drawing.id)}
        className="p-1.5 text-[#787B86] hover:text-[#F23645] hover:bg-[#2A3050] rounded transition-colors"
        title="حذف مركز التداول (Del)"
      >
        <Trash2 size={14} />
      </button>

      {/* More Options Popover */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'more' ? null : 'more')}
          className={`p-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A3050] rounded transition-colors ${
            activePopover === 'more' ? 'bg-[#2A3050] text-[#D1D4DC]' : ''
          }`}
          title="خيارات إضافية"
        >
          <MoreHorizontal size={14} />
        </button>

        {activePopover === 'more' && (
          <div className="absolute bottom-full right-0 mb-2 py-1.5 bg-[#1E222D] border border-[#2A3050] rounded-lg shadow-2xl min-w-[150px] z-50 flex flex-col text-xs">
            <button
              onClick={() => {
                duplicateDrawing(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2A3050] text-[#D1D4DC] transition-colors text-right"
            >
              <Copy size={13} />
              <span>نسخ متطابق (Clone)</span>
            </button>
            <button
              onClick={() => {
                bringToFront(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2A3050] text-[#D1D4DC] transition-colors text-right"
            >
              <ArrowUp size={13} />
              <span>إحضار للمقدمة</span>
            </button>
            <button
              onClick={() => {
                sendToBack(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2A3050] text-[#D1D4DC] transition-colors text-right"
            >
              <ArrowDown size={13} />
              <span>إرسال للخلف</span>
            </button>
            <div className="h-px bg-[#2A3050] my-1" />
            <button
              onClick={() => {
                resetDrawingStyle(drawing.id);
                setActivePopover(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2A3050] text-[#F23645] transition-colors text-right"
            >
              <RotateCcw size={13} />
              <span>إعادة تعيين للتلقائي</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
