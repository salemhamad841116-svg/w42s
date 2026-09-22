import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { useChartStore } from '../../stores/chartStore';
import { useMarketStore } from '../../stores/marketStore';
import { ChartAlertModal } from './ChartAlertModal';
import { ChartOrderTicketModal } from './ChartOrderTicketModal';
import type { IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';
import {
  Bell,
  BarChart2,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  PlusSquare,
  Minus,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react';

interface PriceScaleActionsProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  chartApi: IChartApi | null;
  chartSeries: ISeriesApi<'Candlestick'> | null;
  onChartModified?: () => void;
}

export const PriceScaleActions = React.memo(({
  containerRef,
  chartApi,
  chartSeries,
  onChartModified,
}: PriceScaleActionsProps) => {
  const activeSymbol = useChartStore((state) => state.activeSymbol) || 'EUR/USD';
  const cleanSymbol = activeSymbol.replace('/', '');
  const storeIndicators = useChartStore((state) => state.indicators) || [];
  const currentMarketPrice = useMarketStore((state) => state.ticker?.currentPrice ?? 67285.50);

  // Active indicators list (user active indicators or standard Pro studies)
  const activeStudies = storeIndicators.length > 0
    ? storeIndicators
    : ['RSI Oscillator', 'EMA (20/50)', 'Bollinger Bands'];

  const activeStrategies = [
    'Camarilla Pivot Strategy [Pro]',
    'Price Action Breakout Strategy',
  ];

  // Hover & Paused tracking states
  const [hoverY, setHoverY] = useState<number | null>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [priceScaleWidth, setPriceScaleWidth] = useState(65);

  // Fix Hover Jitter Ref: tracks when mouse is directly inside the (+) button hit-area
  const isMouseOverBadgeRef = useRef(false);

  // Quick Action Panel State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIndicatorsSubmenu, setShowIndicatorsSubmenu] = useState(false);
  const [showStrategiesSubmenu, setShowStrategiesSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Alert Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalPrice, setAlertModalPrice] = useState<number>(0);
  const [alertModalIndicator, setAlertModalIndicator] = useState<string | undefined>(undefined);

  // Order Ticket Modal State (Explicit Confirmation Required)
  const [isOrderTicketOpen, setIsOrderTicketOpen] = useState(false);
  const [ticketSide, setTicketSide] = useState<'BUY' | 'SELL'>('BUY');
  const [ticketType, setTicketType] = useState<'LIMIT' | 'STOP' | 'MARKET'>('LIMIT');
  const [ticketPrice, setTicketPrice] = useState<number>(0);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'buy' | 'sell' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Persistent reference lines
  const referenceLinesRef = useRef<IPriceLine[]>([]);

  // Apply TradingView overrides if available
  useEffect(() => {
    const win = window as any;
    if (win.tvWidget && typeof win.tvWidget.applyOverrides === 'function') {
      try {
        win.tvWidget.applyOverrides({
          'scalesProperties.showSeriesLastValue': true,
          'mainSeriesProperties.priceAxisProperties.plusButtonEnabled': true,
        });
      } catch (e) {}
    }
  }, []);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'buy' | 'sell' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Format price based on symbol and value
  const formatPrice = useCallback((p: number): string => {
    if (p < 2) return p.toFixed(5);
    if (p < 50) return p.toFixed(4);
    if (p < 1000) return p.toFixed(2);
    return p.toFixed(2);
  }, []);

  // Measure right price scale width dynamically from lightweight-charts DOM
  const updatePriceScaleWidth = useCallback(() => {
    if (!containerRef?.current) return;
    const table = containerRef.current.querySelector('table');
    if (table) {
      const priceTd = table.querySelector('tr:first-child td:last-child') as HTMLElement | null;
      if (priceTd && priceTd.offsetWidth > 20) {
        setPriceScaleWidth(priceTd.offsetWidth);
      }
    }
  }, [containerRef]);

  // Convert pixel Y relative to chart series area into price
  const yToPrice = useCallback((y: number): number | null => {
    if (!chartSeries) return null;
    try {
      const price = chartSeries.coordinateToPrice(y);
      if (price !== null && isFinite(price as number)) {
        return price as number;
      }
    } catch {
      // safely catch if coordinate is out of bounds
    }
    return null;
  }, [chartSeries]);

  // Handle Mouse movement across the chart container
  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !chartSeries) return;

    updatePriceScaleWidth();

    const handleMouseMove = (e: MouseEvent) => {
      // Jitter Fix: If mouse is inside (+) button, freeze coordinates to prevent shaking
      if (isPaused || isMouseOverBadgeRef.current) return;

      const rect = container.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      if (relativeY >= 0 && relativeY <= rect.height - 28) {
        const price = yToPrice(relativeY);
        if (price !== null) {
          setIsHovered(true);
          setHoverY(relativeY);
          setHoverPrice(price);
        }
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseEnter = () => {
      if (!isPaused && !isMouseOverBadgeRef.current) {
        setIsHovered(true);
        updatePriceScaleWidth();
      }
    };

    const handleMouseLeave = () => {
      if (!isPaused && !isMouseOverBadgeRef.current) {
        setIsHovered(false);
        setHoverY(null);
        setHoverPrice(null);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, chartSeries, isPaused, yToPrice, updatePriceScaleWidth]);

  // Close context menu & resume tracking when clicking outside or Esc
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        (!mobileMenuRef.current || !mobileMenuRef.current.contains(target)) &&
        badgeRef.current &&
        !badgeRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
        setIsPaused(false);
        setShowIndicatorsSubmenu(false);
        setShowStrategiesSubmenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsPaused(false);
        setShowIndicatorsSubmenu(false);
        setShowStrategiesSubmenu(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 40);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Vertical Price Scale Drag-to-Zoom (Y-Axis Rescaling)
  const handleScaleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!chartApi) return;

    e.preventDefault();
    const startY = e.clientY;
    const baseMarginTop = 0.08;
    const baseMarginBottom = 0.08;

    chartApi.priceScale('right').applyOptions({
      autoScale: false,
      scaleMargins: {
        top: baseMarginTop,
        bottom: baseMarginBottom,
      },
    });

    onChartModified?.();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const factor = 1 + deltaY / 180;
      const newTop = Math.max(0.01, Math.min(0.48, baseMarginTop * factor));
      const newBottom = Math.max(0.01, Math.min(0.48, baseMarginBottom * factor));

      chartApi.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: {
          top: newTop,
          bottom: newBottom,
        },
      });

      onChartModified?.();
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Reset Price Scale on Double Click
  const handleScaleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chartApi) return;

    chartApi.priceScale('right').applyOptions({
      autoScale: true,
      scaleMargins: {
        top: 0.08,
        bottom: 0.08,
      },
    });

    showToast('تمت استعادة التكبير التلقائي للمحور (Auto-Scale)', 'info');
    onChartModified?.();
  };

  // Toggle Quick Action Panel on (+) Click
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isMenuOpen) {
      // Clicking (+) again toggles the panel closed
      setIsMenuOpen(false);
      setIsPaused(false);
      setShowIndicatorsSubmenu(false);
      setShowStrategiesSubmenu(false);
      return;
    }

    if (hoverPrice !== null && hoverY !== null) {
      setIsPaused(true);
      setIsMenuOpen(true);
      setShowIndicatorsSubmenu(false);
      setShowStrategiesSubmenu(false);
    }
  };

  // Close menu and unpause cursor
  const closeMenuAndResume = useCallback(() => {
    setIsMenuOpen(false);
    setIsPaused(false);
    setShowIndicatorsSubmenu(false);
    setShowStrategiesSubmenu(false);
  }, []);

  // Action 1: Open Alert Modal on Symbol
  const handleOpenAlert = useCallback(() => {
    if (hoverPrice !== null) {
      setAlertModalPrice(hoverPrice);
      setAlertModalIndicator(undefined);
      setIsAlertModalOpen(true);
      closeMenuAndResume();
    }
  }, [hoverPrice, closeMenuAndResume]);

  // Action 2: Open Alert Modal on Indicator
  const handleOpenIndicatorAlert = useCallback((indicatorName: string) => {
    if (hoverPrice !== null) {
      setAlertModalPrice(hoverPrice);
      setAlertModalIndicator(indicatorName);
      setIsAlertModalOpen(true);
      closeMenuAndResume();
    }
  }, [hoverPrice, closeMenuAndResume]);

  // Action 3: Open Order Ticket (User Confirmation Required)
  const handleOpenOrderTicket = useCallback((side: 'BUY' | 'SELL', type: 'LIMIT' | 'STOP' | 'MARKET') => {
    if (hoverPrice !== null) {
      setTicketSide(side);
      setTicketType(type);
      setTicketPrice(hoverPrice);
      setIsOrderTicketOpen(true);
      closeMenuAndResume();
    }
  }, [hoverPrice, closeMenuAndResume]);

  // Action 4: Draw Horizontal Line at selected price
  const handleDrawHorizontalLine = useCallback(() => {
    if (hoverPrice !== null && chartSeries) {
      const formatted = formatPrice(hoverPrice);
      try {
        const line = chartSeries.createPriceLine({
          price: Number(formatted),
          color: '#2962FF',
          lineWidth: 1.5,
          lineStyle: 0, // Solid line
          axisLabelVisible: true,
          title: `H-Line @ ${formatted}`,
        });
        if (line) {
          referenceLinesRef.current.push(line);
        }
        showToast(`تم رسم خط أفقي عند ${formatted}`, 'success');
      } catch (e) {
        console.warn('Failed to add reference line:', e);
      }
      closeMenuAndResume();
    }
  }, [hoverPrice, chartSeries, formatPrice, showToast, closeMenuAndResume]);

  // Keyboard Shortcuts Listener (Alt+A, Shift+B, Shift+S, Alt+O, Alt+H)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;
      if (!isHovered && !isMenuOpen) return;
      if (hoverPrice === null) return;

      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
        e.preventDefault();
        handleOpenAlert();
      } else if (e.shiftKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
        e.preventDefault();
        handleOpenOrderTicket('BUY', hoverPrice > currentMarketPrice ? 'STOP' : 'LIMIT');
      } else if (e.shiftKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        handleOpenOrderTicket('SELL', hoverPrice > currentMarketPrice ? 'LIMIT' : 'STOP');
      } else if (e.altKey && (e.key === 'o' || e.key === 'O' || e.code === 'KeyO')) {
        e.preventDefault();
        handleOpenOrderTicket('BUY', 'LIMIT');
      } else if (e.altKey && (e.key === 'h' || e.key === 'H' || e.code === 'KeyH')) {
        e.preventDefault();
        handleDrawHorizontalLine();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isHovered, isMenuOpen, hoverPrice, currentMarketPrice, handleOpenAlert, handleOpenOrderTicket, handleDrawHorizontalLine]);

  // Handle alert created from modal
  const handleAlertCreated = useCallback((alert: any) => {
    if (chartSeries) {
      try {
        const alertLine = chartSeries.createPriceLine({
          price: alert.targetPrice,
          color: '#FF9800',
          lineWidth: 1.5,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `🔔 ${formatPrice(alert.targetPrice)}`,
        });
        if (alertLine) referenceLinesRef.current.push(alertLine);
      } catch (e) {}
    }
    showToast(`تم إنشاء التنبيه بنجاح: ${alert.name}`, 'success');
  }, [chartSeries, formatPrice, showToast]);

  if (!chartApi || !chartSeries) return null;

  const currentY = hoverY ?? 0;
  const currentPriceFormatted = hoverPrice !== null ? formatPrice(hoverPrice) : '0.00';
  const showBadge = (isHovered || isPaused) && hoverY !== null && hoverPrice !== null;
  const isAboveMarket = hoverPrice !== null ? hoverPrice > currentMarketPrice : false;
  const containerHeight = containerRef?.current?.clientHeight || 500;

  // Render Action Panel content (shared between desktop popover & mobile bottom sheet)
  const renderPanelContent = () => (
    <div className="py-1 text-[#D1D4DC] font-sans text-xs select-none">
      {/* Context Badge Header */}
      <div className="px-3.5 py-2 border-b border-[#2A2E39] bg-[#151924]/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2962FF]" />
          <span className="font-bold text-white text-xs">{cleanSymbol}</span>
        </div>
        <span className="font-mono text-cyan-400 font-bold text-xs">
          {currentPriceFormatted}
        </span>
      </div>

      {/* ════ SECTION 1: Alerts & Studies ════ */}
      <div className="py-1">
        {/* 1. Add Alert at this Price */}
        <button
          onClick={handleOpenAlert}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#5C93FF] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <Bell size={14} className="text-[#5C93FF] shrink-0" />
            <span>إضافة تنبيه عند هذا السعر ({currentPriceFormatted})</span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#5C93FF] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            Alt + A
          </span>
        </button>

        {/* 2. Add Alert on Active Indicators */}
        <div className="relative">
          <button
            onClick={() => {
              setShowIndicatorsSubmenu(!showIndicatorsSubmenu);
              setShowStrategiesSubmenu(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
          >
            <div className="flex items-center gap-2.5">
              <BarChart2 size={14} className="text-amber-400 shrink-0" />
              <span>إضافة تنبيه للمؤشر...</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#787B86]">
              <ChevronRight size={13} className={showIndicatorsSubmenu ? 'rotate-90' : ''} />
              <span>({activeStudies.length})</span>
            </div>
          </button>

          {showIndicatorsSubmenu && (
            <div className="bg-[#141720] border-y border-[#2A2E39] px-2 py-1 space-y-0.5">
              {activeStudies.map((study) => (
                <button
                  key={study}
                  onClick={() => handleOpenIndicatorAlert(study)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#2A2E39] text-xs text-gray-300 hover:text-white transition-colors cursor-pointer text-right group"
                >
                  <span className="truncate group-hover:text-[#2962FF]">{study}</span>
                  <span className="text-[10px] text-gray-500 font-mono">@{currentPriceFormatted}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Add Alert on Active Strategy */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStrategiesSubmenu(!showStrategiesSubmenu);
              setShowIndicatorsSubmenu(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp size={14} className="text-[#00C087] shrink-0" />
              <span>إضافة تنبيه للاستراتيجية...</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#787B86]">
              <ChevronRight size={13} className={showStrategiesSubmenu ? 'rotate-90' : ''} />
              <span>({activeStrategies.length})</span>
            </div>
          </button>

          {showStrategiesSubmenu && (
            <div className="bg-[#141720] border-y border-[#2A2E39] px-2 py-1 space-y-0.5">
              {activeStrategies.map((strat) => (
                <button
                  key={strat}
                  onClick={() => handleOpenIndicatorAlert(strat)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#2A2E39] text-xs text-gray-300 hover:text-white transition-colors cursor-pointer text-right group"
                >
                  <span className="truncate group-hover:text-[#00C087]">{strat}</span>
                  <span className="text-[10px] text-gray-500 font-mono">إشارة فورية</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-[#2A2E39] my-0.5" />

      {/* ════ SECTION 2: Trading Orders (Context-Aware) ════ */}
      <div className="py-1">
        {/* ▲ Buy at this price */}
        <button
          onClick={() => handleOpenOrderTicket('BUY', isAboveMarket ? 'STOP' : 'LIMIT')}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#00C087]/15 hover:text-[#00C087] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <ArrowUp size={14} className="text-[#00C087] font-bold shrink-0" />
            <span className="font-semibold text-white group-hover:text-[#00C087]">
              ▲ شراء عند هذا السعر ({isAboveMarket ? 'Buy Stop' : 'Buy Limit'})
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#00C087] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            Shift + B
          </span>
        </button>

        {/* ▼ Sell at this price */}
        <button
          onClick={() => handleOpenOrderTicket('SELL', isAboveMarket ? 'LIMIT' : 'STOP')}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#F23645]/15 hover:text-[#F23645] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <ArrowDown size={14} className="text-[#F23645] font-bold shrink-0" />
            <span className="font-semibold text-white group-hover:text-[#F23645]">
              ▼ بيع عند هذا السعر ({isAboveMarket ? 'Sell Limit' : 'Sell Stop'})
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#F23645] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            Shift + S
          </span>
        </button>

        {/* ↑ Buy Stop */}
        <button
          onClick={() => handleOpenOrderTicket('BUY', 'STOP')}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#00C087] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 text-center font-bold text-[#00C087]">↑</span>
            <span>أمر شراء موقوف (Buy Stop)</span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86]">@ {currentPriceFormatted}</span>
        </button>

        {/* ↓ Sell Stop */}
        <button
          onClick={() => handleOpenOrderTicket('SELL', 'STOP')}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#F23645] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 text-center font-bold text-[#F23645]">↓</span>
            <span>أمر بيع موقوف (Sell Stop)</span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86]">@ {currentPriceFormatted}</span>
        </button>
      </div>

      <div className="h-px bg-[#2A2E39] my-0.5" />

      {/* ════ SECTION 3: Add Order & Horizontal Line ════ */}
      <div className="py-1">
        {/* ⊞ Add custom order at this price */}
        <button
          onClick={() => handleOpenOrderTicket('BUY', 'LIMIT')}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-white transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <PlusSquare size={14} className="text-[#8F9CAE] group-hover:text-white shrink-0" />
            <span>⊞ إضافة أمر عند هذا السعر...</span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86] group-hover:text-white bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            Alt + O
          </span>
        </button>

        {/* ─ Draw Horizontal Line */}
        <button
          onClick={handleDrawHorizontalLine}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#2A2E39] hover:text-[#2962FF] transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <Minus size={14} className="text-[#2962FF] font-bold shrink-0" />
            <span>─ رسم خط أفقي عند هذا السعر</span>
          </div>
          <span className="text-[10px] font-mono text-[#787B86] group-hover:text-[#2962FF] bg-[#141720] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            Alt + H
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Transparent Price Scale Drag-to-Zoom Interaction Strip ─── */}
      <div
        onMouseDown={handleScaleMouseDown}
        onDoubleClick={handleScaleDoubleClick}
        className="absolute right-0 top-0 bottom-[28px] z-10 select-none cursor-ns-resize"
        style={{ width: priceScaleWidth }}
        title="انقر واسحب للتكبير والتصغير الرأسي (نقرتان لإعادة الضبط التلقائي)"
      />

      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200"
          dir="rtl"
        >
          <div className={`px-4 py-2 rounded-xl text-xs font-bold shadow-2xl border flex items-center gap-2 backdrop-blur-md ${
            toastMessage.type === 'buy' 
              ? 'bg-[#00C087]/20 border-[#00C087]/50 text-[#00C087]'
              : toastMessage.type === 'sell'
              ? 'bg-[#F23645]/20 border-[#F23645]/50 text-[#F23645]'
              : toastMessage.type === 'success'
              ? 'bg-[#2962FF]/20 border-[#2962FF]/50 text-[#5C93FF]'
              : 'bg-[#1C2030]/90 border-[#2A3050] text-white'
          }`}>
            <span className="w-2 h-2 rounded-full animate-ping bg-current" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Crosshair Horizontal Dashed Line (stops at right price scale edge) */}
      {showBadge && (
        <div
          className="absolute left-0 pointer-events-none z-20 border-t border-dashed border-[#787B86]/60"
          style={{
            top: currentY,
            right: priceScaleWidth + 42,
          }}
        />
      )}

      {/* 
        ─── Solid, Non-Jittering Circular (+) Button Inside Chart Area ───
        • Size: 36px × 36px desktop (box-sizing: border-box)
        • Mobile touch area >= 44px
        • Clamped inside chart container
        • Zero translateY or reflow on hover
      */}
      {showBadge && (
        <div
          ref={badgeRef}
          onMouseEnter={() => {
            isMouseOverBadgeRef.current = true;
          }}
          onMouseLeave={() => {
            isMouseOverBadgeRef.current = false;
          }}
          className="absolute z-30 pointer-events-auto select-none notranslate flex items-center justify-center"
          translate="no"
          dir="ltr"
          style={{
            right: priceScaleWidth + 6,
            top: containerRef?.current 
              ? Math.max(18, Math.min(currentY - 18, containerHeight - 54))
              : Math.max(18, currentY - 18),
            // NO CSS position transitions to eliminate lag & bouncing
          }}
        >
          {/* Circular Button with 44px mobile touch zone */}
          <button
            onClick={handlePlusClick}
            type="button"
            className={`w-9 h-9 min-w-[36px] min-h-[36px] sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer shadow-xl box-border p-0 m-0 border ${
              isMenuOpen
                ? 'bg-[#2962FF] border-[#2962FF] text-white shadow-[0_0_12px_rgba(41,98,255,0.6)]'
                : 'bg-[#131722] hover:bg-[#2962FF] border-[#363C4E] hover:border-[#2962FF] text-[#D1D4DC] hover:text-white'
            }`}
            title={`إجراءات سريعة عند ${currentPriceFormatted} (انقر للفتح/الإغلاق)`}
            aria-label="إجراءات سريعة"
          >
            {/* Thick & Clear Plus Icon (18px × 18px, Stroke 2.4) */}
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none"
            >
              <line x1="9" y1="3.5" x2="9" y2="14.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="3.5" y1="9" x2="14.5" y2="9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* 
        ─── Desktop: Context-Aware Quick Action Panel (Popover) ───
      */}
      {isMenuOpen && hoverPrice !== null && (
        <div
          ref={menuRef}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="hidden sm:block absolute z-50 pointer-events-auto notranslate animate-in fade-in zoom-in-95 duration-150"
          translate="no"
          style={{
            right: priceScaleWidth + 48,
            top: Math.max(12, Math.min(currentY - 60, containerHeight - 420)),
          }}
          dir="rtl"
        >
          <div className="w-[340px] bg-[#1E222D] border border-[#2A2E39] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden backdrop-blur-md">
            {renderPanelContent()}
          </div>
        </div>
      )}

      {/* 
        ─── Mobile: Bottom Sheet Quick Action Panel ───
        When screen is small (sm:hidden), open as a smooth bottom sheet
      */}
      {isMenuOpen && hoverPrice !== null && (
        <div 
          className="sm:hidden fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
          onClick={closeMenuAndResume}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1E222D] border-t border-[#2A2E39] rounded-t-3xl max-h-[82vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            dir="rtl"
          >
            {/* Top Drag Handle */}
            <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto my-2.5" />
            {renderPanelContent()}
          </div>
        </div>
      )}

      {/* Alert Creation Modal */}
      <ChartAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        symbol={cleanSymbol}
        initialPrice={alertModalPrice}
        initialIndicator={alertModalIndicator}
        onAlertCreated={handleAlertCreated}
      />

      {/* Order Ticket Modal (Explicit User Confirmation) */}
      <ChartOrderTicketModal
        isOpen={isOrderTicketOpen}
        onClose={() => setIsOrderTicketOpen(false)}
        symbol={cleanSymbol}
        initialSide={ticketSide}
        initialType={ticketType}
        initialPrice={ticketPrice}
        marketPrice={currentMarketPrice}
        onOrderConfirmed={(order) => {
          showToast(
            `تم إرسال أمر ${order.side === 'BUY' ? 'شراء' : 'بيع'} ${order.amount} ${cleanSymbol} @ ${formatPrice(order.price)} بنجاح`,
            order.side === 'BUY' ? 'buy' : 'sell'
          );
        }}
      />
    </>
  );
});

export default PriceScaleActions;
