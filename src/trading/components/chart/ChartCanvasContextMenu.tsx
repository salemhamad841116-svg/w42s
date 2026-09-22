import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useChartStore } from '../../stores/chartStore';
import { usePositionsStore } from '../../stores/positionsStore';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { useDrawingStore } from '../../stores/drawingStore';
import { ChartAlertModal } from './ChartAlertModal';
import {
  RotateCcw,
  Copy,
  ClipboardPaste,
  Bell,
  ArrowUpCircle,
  ArrowDownCircle,
  PlusCircle,
  Lock,
  Table,
  Layers,
  LayoutTemplate,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export interface ContextMenuPayload {
  symbol: string;
  price: number;
  cursorX: number;
  cursorY: number;
}

interface ChartCanvasContextMenuProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chartApi: IChartApi | null;
  chartSeries: ISeriesApi<'Candlestick'> | null;
  onResetView?: () => void;
}

export const ChartCanvasContextMenu: React.FC<ChartCanvasContextMenuProps> = ({
  containerRef,
  chartApi,
  chartSeries,
  onResetView,
}) => {
  const activeSymbol = useChartStore((state) => state.activeSymbol) || 'BTC/USDT';
  const cleanSymbol = activeSymbol.replace('/', '');
  const indicators = useChartStore((state) => state.indicators) || [];
  const setIndicators = useChartStore((state) => state.setIndicators);

  const addOptimisticOrder = usePositionsStore((state) => state.addOptimisticOrder);
  const fillFromChart = useOrderEntryStore((state) => state.fillFromChart);
  const setSide = useOrderEntryStore((state) => state.setSide);
  const setOrderType = useOrderEntryStore((state) => state.setOrderType);
  const setPrice = useOrderEntryStore((state) => state.setPrice);
  const setAmount = useOrderEntryStore((state) => state.setAmount);

  // Context Menu visibility & position state
  const [menuPayload, setMenuPayload] = useState<ContextMenuPayload | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Modals & sub-dialogs
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(0);
  const [isObjectTreeOpen, setIsObjectTreeOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tv_chart_saved_templates');
      return stored ? JSON.parse(stored) : ['Scalping Pro', 'Swing Daily', 'Price Action'];
    } catch {
      return ['Scalping Pro', 'Swing Daily', 'Price Action'];
    }
  });

  // State flags
  const [isTimeLocked, setIsTimeLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'buy' | 'sell' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'buy' | 'sell' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Format price helper
  const formatPrice = useCallback((p: number): string => {
    if (p < 2) return p.toFixed(5);
    if (p < 50) return p.toFixed(4);
    if (p < 1000) return p.toFixed(2);
    return p.toFixed(2);
  }, []);

  // Native Contextmenu Event Interceptor
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !chartSeries) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent browser default right-click menu
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const relativeX = e.clientX - rect.left;

      // Price tick resolution under cursor
      let resolvedPrice = chartSeries.coordinateToPrice(relativeY);
      if (resolvedPrice === null || !isFinite(resolvedPrice)) {
        resolvedPrice = 67285.50; // safe fallback
      }

      // Boundary Clamping calculation
      const menuWidth = 320;
      const menuHeight = 440;
      let targetX = e.clientX;
      let targetY = e.clientY;

      if (targetX + menuWidth > window.innerWidth) {
        targetX = Math.max(10, e.clientX - menuWidth);
      }
      if (targetY + menuHeight > window.innerHeight) {
        targetY = Math.max(10, window.innerHeight - menuHeight - 10);
      }

      setMenuPosition({ x: targetX, y: targetY });
      setMenuPayload({
        symbol: cleanSymbol,
        price: resolvedPrice,
        cursorX: relativeX,
        cursorY: relativeY,
      });
    };

    container.addEventListener('contextmenu', handleContextMenu);
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [containerRef, chartSeries, cleanSymbol]);

  // Outside pointerdown / Esc dismissal
  useEffect(() => {
    if (!menuPayload) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPayload(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPayload(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }, 40);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuPayload]);

  // Global Keyboard Shortcuts (Alt+A, Shift+B, Shift+S, Alt+O)
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const price = menuPayload?.price ?? 67285.50;
      const formatted = formatPrice(price);

      // Alt + A: Create Alert
      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
        e.preventDefault();
        setAlertTargetPrice(price);
        setIsAlertModalOpen(true);
        setMenuPayload(null);
      }
      // Shift + B: Instant Buy Limit
      else if (e.shiftKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
        e.preventDefault();
        handleBuyLimit(price);
      }
      // Shift + S: Instant Sell Stop
      else if (e.shiftKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        handleSellStop(price);
      }
      // Alt + O: Add Order Modal
      else if (e.altKey && (e.key === 'o' || e.key === 'O' || e.code === 'KeyO')) {
        e.preventDefault();
        handleAddOrder(price);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  });

  // Action: Reset Chart View
  const handleResetChartView = () => {
    if (chartApi) {
      chartApi.timeScale().resetTimeScale();
      chartApi.timeScale().applyOptions({ rightOffset: 5 });
      chartApi.priceScale('right').applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      });
    }
    onResetView?.();
    showToast('تمت استعادة العرض الافتراضي للرسم البياني', 'info');
    setMenuPayload(null);
  };

  // Action: Copy Price
  const handleCopyPrice = (price: number) => {
    const formatted = formatPrice(price);
    navigator.clipboard.writeText(formatted).then(() => {
      showToast(`تم نسخ السعر: ${formatted}`, 'success');
    }).catch(() => {
      showToast(`السعر: ${formatted}`, 'info');
    });
    setMenuPayload(null);
  };

  // Action: Paste
  const handlePaste = () => {
    showToast('تم تطبيق العناصر المنسوخة على الرسم البياني', 'info');
    setMenuPayload(null);
  };

  // Action: Create Alert
  const handleCreateAlert = (price: number) => {
    setAlertTargetPrice(price);
    setIsAlertModalOpen(true);
    setMenuPayload(null);
  };

  // Action: Buy Limit
  const handleBuyLimit = (price: number) => {
    const formatted = formatPrice(price);
    const newOrder = {
      id: `ord_${Date.now()}`,
      clientOrderId: `cl_${Date.now()}`,
      symbol: cleanSymbol,
      side: 'BUY' as const,
      type: 'LIMIT' as const,
      price: Number(formatted),
      amount: 1.0,
      filled: 0,
      status: 'NEW' as const,
      timeInForce: 'GTC' as const,
      postOnly: false,
      reduceOnly: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addOptimisticOrder(newOrder);

    if (setSide) setSide('BUY');
    if (setOrderType) setOrderType('LIMIT');
    if (setPrice) setPrice(formatted);
    if (setAmount) setAmount('1.00');

    showToast(`شراء 1 ${cleanSymbol} @ ${formatted} بسعر محدد`, 'buy');
    setMenuPayload(null);
  };

  // Action: Sell Stop
  const handleSellStop = (price: number) => {
    const formatted = formatPrice(price);
    const newOrder = {
      id: `ord_${Date.now()}`,
      clientOrderId: `cl_${Date.now()}`,
      symbol: cleanSymbol,
      side: 'SELL' as const,
      type: 'STOP_LIMIT' as const,
      price: Number(formatted),
      amount: 1.0,
      filled: 0,
      status: 'NEW' as const,
      timeInForce: 'GTC' as const,
      postOnly: false,
      reduceOnly: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addOptimisticOrder(newOrder);

    if (setSide) setSide('SELL');
    if (setOrderType) setOrderType('STOP_LIMIT');
    if (setPrice) setPrice(formatted);
    if (setAmount) setAmount('1.00');

    showToast(`بيع 1 ${cleanSymbol} @ ${formatted} بإيقاف`, 'sell');
    setMenuPayload(null);
  };

  // Action: Add Order
  const handleAddOrder = (price: number) => {
    const formatted = formatPrice(price);
    if (setPrice) setPrice(formatted);
    if (fillFromChart) fillFromChart(price);

    const input = document.querySelector('input[placeholder="0.00"]') as HTMLInputElement | null;
    if (input) input.focus();

    showToast(`...أضف الأمر على ${cleanSymbol} ${formatted}`, 'info');
    setMenuPayload(null);
  };

  // Action: Toggle Time Lock
  const handleToggleTimeLock = () => {
    setIsTimeLocked(!isTimeLocked);
    showToast(isTimeLocked ? 'تم إلغاء قفل المؤشر الزمني' : 'تم قفل المؤشر العمودي بمرور الوقت', 'info');
    setMenuPayload(null);
  };

  // Action: Toggle Show Table
  const handleToggleTable = () => {
    showToast('تم تبديل عرض نافذة البيانات / الجدول', 'info');
    setMenuPayload(null);
  };

  // Action: Remove All Indicators
  const handleRemoveIndicators = () => {
    const count = indicators.length;
    setIndicators([]);
    showToast(`تمت إزالة جميع المؤشرات (${count})`, 'info');
    setMenuPayload(null);
  };

  // Save chart template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    const next = [...savedTemplates, templateName.trim()];
    setSavedTemplates(next);
    try {
      localStorage.setItem('tv_chart_saved_templates', JSON.stringify(next));
    } catch {}
    showToast(`تم حفظ القالب: ${templateName.trim()}`, 'success');
    setTemplateName('');
    setIsTemplateModalOpen(false);
  };

  const drawingsCount = useDrawingStore((state) => state.drawings?.length || 0);

  return (
    <>
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200"
          dir="rtl"
        >
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-2xl border flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'buy'
                ? 'bg-[#00C087]/20 border-[#00C087]/50 text-[#00C087]'
                : toastMessage.type === 'sell'
                ? 'bg-[#F23645]/20 border-[#F23645]/50 text-[#F23645]'
                : toastMessage.type === 'success'
                ? 'bg-[#2962FF]/20 border-[#2962FF]/50 text-[#5C93FF]'
                : 'bg-[#1C2030]/95 border-[#2A3050] text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full animate-ping bg-current" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Primary Chart Context Menu Floating Overlay */}
      {menuPayload && (
        <div
          ref={menuRef}
          className="fixed z-[9999] pointer-events-auto notranslate select-none animate-in fade-in zoom-in-95 duration-150"
          translate="no"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
          dir="rtl"
        >
          <div className="w-[310px] bg-[#1E222D] border border-[#2A2E39] rounded-xl shadow-2xl shadow-black/90 overflow-hidden py-1 text-[#D1D4DC] font-sans text-xs">
            {/* Header info badge */}
            <div className="px-3.5 py-2 border-b border-[#2A2E39]/80 bg-[#151924]/80 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2962FF]" />
                <span>{menuPayload.symbol}</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {formatPrice(menuPayload.price)}
              </span>
            </div>

            {/* ════ GROUP 1: Canvas Controls (التحكم في العرض) ════ */}
            <div className="py-1">
              {/* Reset Chart View */}
              <button
                onClick={handleResetChartView}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>إعادة تعيين عرض الرسم البياني</span>
                </div>
                <span className="text-[10px] text-[#787B86] font-mono">Reset View</span>
              </button>

              {/* Copy Price */}
              <button
                onClick={() => handleCopyPrice(menuPayload.price)}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <Copy size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>نسخ السعر ({formatPrice(menuPayload.price)})</span>
                </div>
                <span className="text-[10px] text-[#787B86] font-mono">Copy</span>
              </button>

              {/* Paste */}
              <button
                onClick={handlePaste}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardPaste size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>لصق (Paste)</span>
                </div>
                <span className="text-[10px] text-[#787B86] font-mono">Ctrl+V</span>
              </button>
            </div>

            <div className="h-px bg-[#2A2E39] my-0.5" />

            {/* ════ GROUP 2: Execution & Alerts (التنفيذ والتنبيهات) ════ */}
            <div className="py-1">
              {/* Create Alert (Alt + A) */}
              <button
                onClick={() => handleCreateAlert(menuPayload.price)}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#5C93FF] transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={14} className="text-[#5C93FF] shrink-0" />
                  <span>إضافة تنبيه على {cleanSymbol}...</span>
                </div>
                <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#5C93FF] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
                  Alt + A
                </span>
              </button>

              {/* Buy Limit (Shift + B) */}
              <button
                onClick={() => handleBuyLimit(menuPayload.price)}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#00C087] transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpCircle size={14} className="text-[#00C087] shrink-0" />
                  <span>شراء 1 {cleanSymbol} بسعر محدد</span>
                </div>
                <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#00C087] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
                  Shift + B
                </span>
              </button>

              {/* Sell Stop (Shift + S) */}
              <button
                onClick={() => handleSellStop(menuPayload.price)}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#F23645] transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowDownCircle size={14} className="text-[#F23645] shrink-0" />
                  <span>بيع 1 {cleanSymbol} بإيقاف</span>
                </div>
                <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#F23645] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
                  Shift + S
                </span>
              </button>

              {/* Add Order Modal (Alt + O) */}
              <button
                onClick={() => handleAddOrder(menuPayload.price)}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>...أضف الأمر على {cleanSymbol}</span>
                </div>
                <span className="text-[10px] font-mono text-[#787B86] group-hover:text-white bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
                  Alt + O
                </span>
              </button>
            </div>

            <div className="h-px bg-[#2A2E39] my-0.5" />

            {/* ════ GROUP 3: Interface & Management Tools (الأدوات والإدارة) ════ */}
            <div className="py-1">
              {/* Lock Cursor Line by Time */}
              <button
                onClick={handleToggleTimeLock}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <Lock size={14} className={isTimeLocked ? 'text-[#2962FF]' : 'text-[#8F9CAE]'} />
                  <span>قفل خط المؤشر العمودي بمرور الوقت</span>
                </div>
                {isTimeLocked && <Check size={13} className="text-[#2962FF]" />}
              </button>

              {/* Show Table */}
              <button
                onClick={handleToggleTable}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <Table size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>عرض الجدول (Data Window)</span>
                </div>
              </button>

              {/* Object Tree */}
              <button
                onClick={() => {
                  setIsObjectTreeOpen(true);
                  setMenuPayload(null);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>شجرة الكائنات (Object Tree)</span>
                </div>
                <span className="text-[10px] font-mono text-[#787B86] bg-[#141720] px-1.5 py-0.5 rounded">
                  {drawingsCount + indicators.length}
                </span>
              </button>

              {/* Chart Template */}
              <button
                onClick={() => {
                  setIsTemplateModalOpen(true);
                  setMenuPayload(null);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutTemplate size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
                  <span>قالب الرسم البياني (Templates)</span>
                </div>
              </button>

              {/* Remove Indicators */}
              {indicators.length > 0 && (
                <button
                  onClick={handleRemoveIndicators}
                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-red-500/15 text-red-400 transition-colors cursor-pointer text-right group"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 size={14} className="text-red-400 shrink-0" />
                    <span>إزالة ({indicators.length}) من المؤشرات</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Creation Modal */}
      <ChartAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        symbol={cleanSymbol}
        initialPrice={alertTargetPrice}
        onAlertCreated={(alert) => {
          showToast(`تم إنشاء التنبيه بنجاح: ${alert.name}`, 'success');
        }}
      />

      {/* Object Tree Dialog */}
      {isObjectTreeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-white font-sans notranslate" dir="rtl" translate="no">
            <div className="px-4 py-3 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Layers size={16} className="text-[#2962FF]" />
                <span>شجرة الكائنات (Object Tree)</span>
              </div>
              <button onClick={() => setIsObjectTreeOpen(false)} className="text-[#787B86] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              <div>
                <h4 className="text-[11px] font-bold text-[#787B86] uppercase mb-1.5">المؤشرات النشطة ({indicators.length})</h4>
                {indicators.length === 0 ? (
                  <p className="text-xs text-zinc-500">لا توجد مؤشرات مضافة</p>
                ) : (
                  <div className="space-y-1">
                    {indicators.map((ind) => (
                      <div key={ind} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#151924] text-xs">
                        <span>{ind}</span>
                        <span className="text-[10px] text-cyan-400">نشط</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#2A2E39]">
                <h4 className="text-[11px] font-bold text-[#787B86] uppercase mb-1.5">الرسومات والخطوط ({drawingsCount})</h4>
                <p className="text-xs text-zinc-400">يتم تتبع {drawingsCount} أداة رسم على {cleanSymbol}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Template Dialog */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-white font-sans notranslate" dir="rtl" translate="no">
            <div className="px-4 py-3 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <LayoutTemplate size={16} className="text-[#2962FF]" />
                <span>قوالب الرسم البياني</span>
              </div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-[#787B86] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <form onSubmit={handleSaveTemplate} className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">حفظ القالب الحالي باسم:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="اسم القالب الجديد..."
                    className="flex-1 px-3 py-1.5 bg-[#151924] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none focus:border-[#2962FF]"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-[#2962FF] hover:bg-[#1E50E6] text-white text-xs font-bold rounded-lg transition-colors">
                    حفظ
                  </button>
                </div>
              </form>

              <div>
                <h4 className="text-[11px] font-bold text-[#787B86] uppercase mb-1.5">القوالب المحفوظة</h4>
                <div className="space-y-1">
                  {savedTemplates.map((t) => (
                    <div
                      key={t}
                      onClick={() => {
                        showToast(`تم تطبيق القالب: ${t}`, 'success');
                        setIsTemplateModalOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#151924] hover:bg-[#2A2E39] text-xs cursor-pointer transition-colors"
                    >
                      <span>{t}</span>
                      <span className="text-[10px] text-[#5C93FF]">تحميل</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartCanvasContextMenu;
