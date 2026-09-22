import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LinesAndChannelsFlyout } from './LinesAndChannelsFlyout';
import { FibGannFlyout } from './FibGannFlyout';
import { PatternsFlyout } from './PatternsFlyout';
import { ForecastingFlyout } from './ForecastingFlyout';
import { ShapesFlyout } from './ShapesFlyout';
import { LINES_AND_CHANNELS_GROUPS, DrawingSubTool } from './drawingToolsData';
import { useDrawingStore } from '../../stores/drawingStore';
import { useChartStore } from '../../stores/chartStore';
import { UserActionPanel } from '../user/UserActionPanel';

// ─── Tool Definition Types ───────────────────────────────────────────────────

type ToolBehavior = 'category' | 'single' | 'toggle' | 'click';

interface ToolSlot {
  id: string;
  label: string;
  shortcut?: string;
  behavior: ToolBehavior;
  tvIdentifier: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

// ─── TradingView-Standard SVG Icons (20px × 20px, Stroke 1.6px) ──────────────

/** 1. tv-icon-crosshair: Reticle / dashed crosshair with center gap */
const CrosshairIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    <line x1="10" y1="2" x2="10" y2="6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="10" y1="13.5" x2="10" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="2" y1="10" x2="6.5" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="13.5" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** 2. tv-icon-trend-line: Diagonal segment with endpoint node circles */
const TrendLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <line x1="4.5" y1="15.5" x2="15.5" y2="4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="4" cy="16" r="2" fill="currentColor" />
    <circle cx="16" cy="4" r="2" fill="currentColor" />
  </svg>
);

/** 3. tv-icon-fib-retracement: 3 parallel horizontal lines with diagonal anchor */
const FibonacciIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <line x1="2.5" y1="4" x2="17.5" y2="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="2.5" y1="16" x2="17.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 2" />
    <circle cx="4" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="4" r="1.5" fill="currentColor" />
  </svg>
);

/** 4. tv-icon-xabcd: Connected polygonal nodes (XABCD pattern) */
const PatternsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M2.5 15.5L6.5 4.5L10.5 13.5L14.5 6.5L17.5 15.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="2.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="6.5" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="10.5" cy="13.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="6.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="15.5" r="1.5" fill="currentColor" />
  </svg>
);

/** 5. tv-icon-risk-reward: Horizontal reference lines with vertical metric span */
const PredictionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="4" y="4" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="4" y="10" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5" />
  </svg>
);

/** 6. tv-icon-brush: Freehand drawing brush tip / contour */
const BrushIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M15.5 2.5C16.3 3.3 16.3 4.7 15.5 5.5L7.5 13.5L3.5 14.5L4.5 10.5L12.5 2.5C13.3 1.7 14.7 1.7 15.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 14.5C2.5 15.5 2 17 2 18C3 18 4.5 17.5 5.5 16.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/** 7. tv-icon-text: Capital serif letter "T" */
const TextIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 5.5V4H16V5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="4" x2="10" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7 16.5H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 8. tv-icon-emoji: Circular outline with smiling face / emoji */
const StickersIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="7.5" cy="8.5" r="1" fill="currentColor" />
    <circle cx="12.5" cy="8.5" r="1" fill="currentColor" />
    <path
      d="M6.5 12.5C7.5 14 8.7 14.5 10 14.5C11.3 14.5 12.5 14 13.5 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/** 9. tv-icon-ruler: Angled measuring ruler with gauge graduation ticks */
const RulerIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect
      x="2.5"
      y="7"
      width="15"
      height="6"
      rx="1"
      transform="rotate(-45 10 10)"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <line x1="6" y1="8" x2="6" y2="10.5" transform="rotate(-45 10 10)" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="8.5" y1="8" x2="8.5" y2="11.5" transform="rotate(-45 10 10)" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="11" y1="8" x2="11" y2="10.5" transform="rotate(-45 10 10)" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="13.5" y1="8" x2="13.5" y2="11.5" transform="rotate(-45 10 10)" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/** 10. tv-icon-zoom-in: Magnifying glass containing a plus sign (+) */
const ZoomIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
    <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="6.5" x2="9" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6.5" y1="9" x2="11.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** 11. tv-icon-magnet: Horseshoe magnet outline */
const MagnetIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M4.5 7V10.5C4.5 13.5 7 16 10 16C13 16 15.5 13.5 15.5 10.5V7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect x="3" y="4" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />
    <rect x="14" y="4" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />
    <line x1="3" y1="6" x2="6" y2="6" stroke="currentColor" strokeWidth="1.2" />
    <line x1="14" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** 12. tv-icon-stay-in-drawing: Pencil coupled with a miniature padlock */
const StayInDrawingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M14.5 2.5L5.5 11.5L4 16L8.5 14.5L17.5 5.5L14.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="9.5" y="11.5" width="8" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="#151924" />
    <path
      d="M11.5 11.5V9.5C11.5 8.4 12.4 7.5 13.5 7.5C14.6 7.5 15.5 8.4 15.5 9.5V11.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

/** 13. tv-icon-lock-drawings: Padlock with shackle open/closed toggle */
const LockDrawingsIcon: React.FC<{ size?: number; className?: string; isLocked?: boolean }> = ({ size = 20, className, isLocked }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    {isLocked ? (
      <path d="M6.5 9V6C6.5 4.1 8.1 2.5 10 2.5C11.9 2.5 13.5 4.1 13.5 6V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ) : (
      <path d="M6.5 9V5.5C6.5 3.6 8.1 2 10 2C11.9 2 13.5 3.6 13.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    )}
    <circle cx="10" cy="13.5" r="1.3" fill="currentColor" />
  </svg>
);

/** 14. tv-icon-hide-drawings: Eye icon with iris / hidden eye toggle */
const HideDrawingsIcon: React.FC<{ size?: number; className?: string; isHidden?: boolean }> = ({ size = 20, className, isHidden }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M2 10C2 10 5 4.5 10 4.5C15 4.5 18 10 18 10C18 10 15 15.5 10 15.5C5 15.5 2 10 2 10Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="1.2" fill="currentColor" />
    {isHidden && (
      <line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    )}
  </svg>
);

/** 15. tv-icon-sync-chart: Interlocking double chain links in rounded box */
const SyncChartIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8.5 11.5L11.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10.5 12.5L12 11C13 10 13 8.5 12 7.5C11 6.5 9.5 6.5 8.5 7.5L7 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9.5 7.5L8 9C7 10 7 11.5 8 12.5C9 13.5 10.5 13.5 11.5 12.5L13 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** 16. tv-icon-trash-can: Wireframe trash bin / wastebasket */
const TrashIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M3 5.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7.5 5.5V3.5C7.5 3 8 2.5 8.5 2.5H11.5C12 2.5 12.5 3 12.5 3.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 5.5L5.5 16.5C5.6 17.3 6.3 18 7.1 18H12.9C13.7 18 14.4 17.3 14.5 16.5L15.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8.5" y1="9" x2="8.5" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="11.5" y1="9" x2="11.5" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Sub-menu Indicator: 6px × 6px Right-Pointing Caret SVG */
const CaretRightSVG: React.FC<{ isOpen?: boolean }> = ({ isOpen }) => (
  <span className="absolute bottom-1 right-1 pointer-events-none transition-transform duration-150">
    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" className={isOpen ? 'text-[#2962FF]' : 'text-[#8F9CAE]'}>
      <polygon points="1,1 5,3 1,5" />
    </svg>
  </span>
);

// ─── Separator Positions ──────────────────────────────────────────────────────
// Separator after slot 8 (stickers, index 7) and after slot 10 (zoom, index 9)
const SEPARATOR_AFTER = new Set([7, 9]);

// ─── Tooltip Component ────────────────────────────────────────────────────────

interface TooltipProps {
  label: string;
  shortcut?: string;
  buttonRect: DOMRect | null;
}

const Tooltip: React.FC<TooltipProps> = ({ label, shortcut, buttonRect }) => {
  if (!buttonRect) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none animate-in fade-in slide-in-from-left-1 duration-100"
      style={{
        left: buttonRect.right + 8,
        top: buttonRect.top + buttonRect.height / 2,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="bg-[#1E222D] border border-[#363C4E] rounded-md px-2.5 py-1.5 shadow-xl shadow-black/60 whitespace-nowrap flex items-center gap-2 notranslate" translate="no">
        <span className="text-[11px] text-[#D1D4DC] font-medium">{label}</span>
        {shortcut && (
          <span className="text-[10px] text-[#787B86] font-mono bg-[#131722] px-1.5 py-0.5 rounded border border-[#2A2E39]">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main LeftDrawingToolbar Component ───────────────────────────────────────

export const LeftDrawingToolbar: React.FC = React.memo(() => {
  const [activeTool, setActiveTool] = useState<string>('cursor-crosshair');

  // Currently selected tool in Trend Line category
  const [selectedTrendTool, setSelectedTrendTool] = useState<DrawingSubTool>(
    LINES_AND_CHANNELS_GROUPS[0].items[0] // Default: Trend Line
  );

  // Flyout drawer states
  const [isLineFlyoutOpen, setIsLineFlyoutOpen] = useState(false);
  const [isFibFlyoutOpen, setIsFibFlyoutOpen] = useState(false);
  const [isPatternFlyoutOpen, setIsPatternFlyoutOpen] = useState(false);
  const [isPredictionFlyoutOpen, setIsPredictionFlyoutOpen] = useState(false);
  const [isBrushFlyoutOpen, setIsBrushFlyoutOpen] = useState(false);

  const [activeFlyoutTop, setActiveFlyoutTop] = useState(50);

  // Toggle states
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    'tool-magnet': false,
    'tool-pencil-lock': false,
    'tool-lock-all': false,
    'tool-hide': false,
    'tool-sync-link': false,
  });

  // Hover & Tooltip states
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  // Toast notification
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastText(text);
    toastTimerRef.current = setTimeout(() => {
      setToastText(null);
    }, 2500);
  }, []);

  const activeSymbol = useChartStore((state) => state.activeSymbol) || 'BTC/USDT';

  // Chart Engine Integration Hook
  const handleSelectTool = useCallback(
    (tool: DrawingSubTool) => {
      setSelectedTrendTool(tool);
      setActiveTool('tool-trendline');
      setIsLineFlyoutOpen(false);

      useDrawingStore.getState().setActiveDrawingTool(tool.id);

      window.dispatchEvent(
        new CustomEvent('tv_chart_tool_selected', {
          detail: {
            toolId: tool.id,
            shape: tool.tradingViewIdentifier,
            nameAr: tool.nameAr,
            nameEn: tool.nameEn,
          },
        })
      );

      const win = window as any;
      if (win.tvWidget && win.tvWidget.chart) {
        try {
          win.tvWidget.chart().createMultipointShape([], {
            shape: tool.tradingViewIdentifier,
          });
        } catch (e) {
          console.warn('tvWidget createMultipointShape error:', e);
        }
      }

      showToast(`تم تفعيل أداة: ${tool.nameAr} (${tool.nameEn})`);
    },
    [showToast]
  );

  // Close all flyouts
  const closeAllFlyouts = useCallback(() => {
    setIsLineFlyoutOpen(false);
    setIsFibFlyoutOpen(false);
    setIsPatternFlyoutOpen(false);
    setIsPredictionFlyoutOpen(false);
    setIsBrushFlyoutOpen(false);
  }, []);

  // 16 Exact Tool Slots in Sequence
  const toolSlots: ToolSlot[] = [
    {
      id: 'cursor-crosshair',
      label: 'أدوات المؤشر (Crosshair Cursor)',
      shortcut: 'Ctrl+Shift+C',
      behavior: 'category',
      tvIdentifier: 'tv-icon-crosshair',
      icon: CrosshairIcon,
    },
    {
      id: 'tool-trendline',
      label: `أدوات الخطوط والقنوات (${selectedTrendTool.nameAr})`,
      shortcut: selectedTrendTool.shortcut || 'Alt+T',
      behavior: 'category',
      tvIdentifier: 'tv-icon-trend-line',
      icon: TrendLineIcon,
    },
    {
      id: 'tool-fibonacci',
      label: 'أدوات جان وفيبوناتشي (Gann & Fibonacci)',
      shortcut: 'Alt+F',
      behavior: 'category',
      tvIdentifier: 'tv-icon-fib-retracement',
      icon: FibonacciIcon,
    },
    {
      id: 'tool-patterns',
      label: 'الأنماط التوافقية (XABCD & Harmonic Patterns)',
      shortcut: 'Alt+H',
      behavior: 'category',
      tvIdentifier: 'tv-icon-xabcd',
      icon: PatternsIcon,
    },
    {
      id: 'tool-prediction',
      label: 'أدوات التنبؤ وقياس المخاطر (Forecast & Risk/Reward)',
      shortcut: 'Alt+P',
      behavior: 'category',
      tvIdentifier: 'tv-icon-risk-reward',
      icon: PredictionIcon,
    },
    {
      id: 'tool-brush',
      label: 'الأشكال الهندسية والفرشاة (Brush & Geometric Shapes)',
      shortcut: 'Alt+S',
      behavior: 'category',
      tvIdentifier: 'tv-icon-brush',
      icon: BrushIcon,
    },
    {
      id: 'tool-text',
      label: 'التعليقات والنصوص (Text & Annotations)',
      shortcut: 'Alt+X',
      behavior: 'category',
      tvIdentifier: 'tv-icon-text',
      icon: TextIcon,
    },
    {
      id: 'tool-stickers',
      label: 'الأيقونات والملصقات (Icons & Stickers)',
      shortcut: 'Alt+I',
      behavior: 'category',
      tvIdentifier: 'tv-icon-emoji',
      icon: StickersIcon,
    },
    {
      id: 'tool-ruler',
      label: 'مسطرة القياس (Price/Bars Measurement Ruler)',
      shortcut: 'Shift+R',
      behavior: 'single',
      tvIdentifier: 'tv-icon-ruler',
      icon: RulerIcon,
    },
    {
      id: 'tool-zoom',
      label: 'تكبير الرسم البياني (Zoom In Focus)',
      shortcut: 'Ctrl++',
      behavior: 'single',
      tvIdentifier: 'tv-icon-zoom-in',
      icon: ZoomIcon,
    },
    {
      id: 'tool-magnet',
      label: 'وضع المغناطيس (Magnet Mode Snap to OHLC)',
      shortcut: 'Ctrl+M',
      behavior: 'toggle',
      tvIdentifier: 'tv-icon-magnet',
      icon: MagnetIcon,
    },
    {
      id: 'tool-pencil-lock',
      label: 'البقاء في وضع الرسم (Stay in Drawing Mode)',
      shortcut: 'Ctrl+D',
      behavior: 'toggle',
      tvIdentifier: 'tv-icon-stay-in-drawing',
      icon: StayInDrawingIcon,
    },
    {
      id: 'tool-lock-all',
      label: 'قفل جميع الرسومات (Lock All Drawings)',
      shortcut: 'Ctrl+L',
      behavior: 'toggle',
      tvIdentifier: 'tv-icon-lock-drawings',
      icon: (props) => <LockDrawingsIcon {...props} isLocked={toggleStates['tool-lock-all']} />,
    },
    {
      id: 'tool-hide',
      label: 'إخفاء جميع الرسومات (Hide All Drawings)',
      shortcut: 'Ctrl+H',
      behavior: 'toggle',
      tvIdentifier: 'tv-icon-hide-drawings',
      icon: (props) => <HideDrawingsIcon {...props} isHidden={toggleStates['tool-hide']} />,
    },
    {
      id: 'tool-sync-link',
      label: 'مزامنة الرسومات عالمياً (Global Sync Across Charts)',
      shortcut: 'Ctrl+Shift+S',
      behavior: 'toggle',
      tvIdentifier: 'tv-icon-sync-chart',
      icon: SyncChartIcon,
    },
    {
      id: 'tool-trash',
      label: 'حذف جميع الرسومات (Remove All Drawings)',
      shortcut: 'Del',
      behavior: 'click',
      tvIdentifier: 'tv-icon-trash-can',
      icon: TrashIcon,
    },
  ];

  const handleToolClick = useCallback(
    (slot: ToolSlot) => {
      const btn = buttonRefs.current[slot.id];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setActiveFlyoutTop(rect.top);
      }

      if (slot.id === 'tool-trendline') {
        setActiveTool('tool-trendline');
        setIsLineFlyoutOpen((prev) => !prev);
        setIsFibFlyoutOpen(false);
        setIsPatternFlyoutOpen(false);
        setIsPredictionFlyoutOpen(false);
        setIsBrushFlyoutOpen(false);
        useDrawingStore.getState().setActiveDrawingTool(selectedTrendTool.id);
        return;
      }

      if (slot.id === 'tool-fibonacci') {
        setActiveTool('tool-fibonacci');
        setIsFibFlyoutOpen((prev) => !prev);
        setIsLineFlyoutOpen(false);
        setIsPatternFlyoutOpen(false);
        setIsPredictionFlyoutOpen(false);
        setIsBrushFlyoutOpen(false);
        return;
      }

      if (slot.id === 'tool-patterns') {
        setActiveTool('tool-patterns');
        setIsPatternFlyoutOpen((prev) => !prev);
        setIsLineFlyoutOpen(false);
        setIsFibFlyoutOpen(false);
        setIsPredictionFlyoutOpen(false);
        setIsBrushFlyoutOpen(false);
        return;
      }

      if (slot.id === 'tool-prediction') {
        setActiveTool('tool-prediction');
        setIsPredictionFlyoutOpen((prev) => !prev);
        setIsLineFlyoutOpen(false);
        setIsFibFlyoutOpen(false);
        setIsPatternFlyoutOpen(false);
        setIsBrushFlyoutOpen(false);
        return;
      }

      if (slot.id === 'tool-brush') {
        setActiveTool('tool-brush');
        setIsBrushFlyoutOpen((prev) => !prev);
        setIsLineFlyoutOpen(false);
        setIsFibFlyoutOpen(false);
        setIsPatternFlyoutOpen(false);
        setIsPredictionFlyoutOpen(false);
        return;
      }

      closeAllFlyouts();

      switch (slot.behavior) {
        case 'category':
        case 'single':
          setActiveTool(slot.id);
          showToast(`تم اختيار أداة: ${slot.label}`);
          break;
        case 'toggle':
          setToggleStates((prev) => {
            const next = { ...prev, [slot.id]: !prev[slot.id] };
            showToast(`${slot.label}: ${next[slot.id] ? 'مفعّل' : 'معطّل'}`);
            return next;
          });
          break;
        case 'click':
          if (slot.id === 'tool-trash') {
            useDrawingStore.getState().clearAllForSymbol(activeSymbol);
            showToast('تم مسح جميع الرسومات للرمز الحالي');
          } else {
            showToast('تم مسح جميع الرسومات');
          }
          break;
      }
    },
    [showToast, activeSymbol, selectedTrendTool.id, closeAllFlyouts]
  );

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredId(id);
    const btn = buttonRefs.current[id];
    if (btn) {
      setHoveredRect(btn.getBoundingClientRect());
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setHoveredRect(null);
  }, []);

  const isActive = useCallback(
    (slot: ToolSlot): boolean => {
      if (slot.behavior === 'toggle') return toggleStates[slot.id] ?? false;
      return activeTool === slot.id;
    },
    [activeTool, toggleStates]
  );

  return (
    <div
      ref={toolbarRef}
      className="w-12 shrink-0 h-full bg-[#151924] border-r border-[#262B3D] flex flex-col justify-between items-center select-none notranslate relative z-30 overflow-hidden"
      translate="no"
    >
      {/* Toast Notification */}
      {toastText && (
        <div className="fixed top-16 left-16 z-[99999] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150" dir="rtl">
          <div className="bg-[#1E222D] border border-[#2962FF]/50 text-white text-xs px-3 py-1.5 rounded-md shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2962FF] animate-ping" />
            <span>{toastText}</span>
          </div>
        </div>
      )}

      {/* Drawing Tool Slots — Upper Scrollable Area */}
      <div 
        className="w-full flex-1 flex flex-col items-center py-2 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {toolSlots.map((slot, index) => {
          const active = isActive(slot);
          const IconComponent = slot.icon;
          // Slots 1 through 8 (index 0 to 7) feature the expandable caret
          const hasExpandableCaret = index <= 7;
          const isTrendFlyoutActive = slot.id === 'tool-trendline' && isLineFlyoutOpen;

          return (
            <React.Fragment key={slot.id}>
              <button
                ref={(el) => {
                  buttonRefs.current[slot.id] = el;
                }}
                onClick={() => handleToolClick(slot)}
                onMouseEnter={() => handleMouseEnter(slot.id)}
                onMouseLeave={handleMouseLeave}
                className={`
                  relative w-10 h-10 flex items-center justify-center rounded-md
                  transition-all duration-150 cursor-pointer shrink-0 my-[1px]
                  ${
                    active
                      ? 'bg-[#1E222D] text-white border border-[#363C4E] shadow-sm'
                      : 'text-[#8F9CAE] hover:bg-[#262B3D] hover:text-white border border-transparent'
                  }
                `}
                title={slot.label}
                data-tv-tool={slot.tvIdentifier}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <IconComponent size={20} />
                </div>

                {/* Slots 1 through 8 right-pointing sub-menu triangle */}
                {hasExpandableCaret && <CaretRightSVG isOpen={isTrendFlyoutActive} />}
              </button>

              {/* Separators after slot 8 and slot 10 */}
              {SEPARATOR_AFTER.has(index) && (
                <div className="w-7 h-px bg-[#262B3D] my-1.5 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* User Management & PWA Install Action Panel — Pinned Bottom */}
      <UserActionPanel />

      {/* Hover Tooltip */}
      {hoveredId && !isLineFlyoutOpen && (() => {
        const slot = toolSlots.find((s) => s.id === hoveredId);
        if (!slot) return null;
        return (
          <Tooltip
            label={slot.label}
            shortcut={slot.shortcut}
            buttonRect={hoveredRect}
          />
        );
      })()}

      {/* Sub-menu Flyout Drawers */}
      <LinesAndChannelsFlyout
        isOpen={isLineFlyoutOpen}
        onClose={() => setIsLineFlyoutOpen(false)}
        selectedToolId={selectedTrendTool.id}
        onSelectTool={handleSelectTool}
        topOffset={activeFlyoutTop}
      />

      <FibGannFlyout
        isOpen={isFibFlyoutOpen}
        onClose={() => setIsFibFlyoutOpen(false)}
        selectedToolId="fibRetracement"
        onSelectTool={(tool) => {
          setIsFibFlyoutOpen(false);
          showToast(`تم اختيار أداة: ${tool.nameAr}`);
        }}
        topOffset={activeFlyoutTop}
      />

      <PatternsFlyout
        isOpen={isPatternFlyoutOpen}
        onClose={() => setIsPatternFlyoutOpen(false)}
        selectedToolId="xabcd"
        onSelectTool={(tool) => {
          setIsPatternFlyoutOpen(false);
          showToast(`تم اختيار نمط: ${tool.nameAr}`);
        }}
        topOffset={activeFlyoutTop}
      />

      <ForecastingFlyout
        isOpen={isPredictionFlyoutOpen}
        onClose={() => setIsPredictionFlyoutOpen(false)}
        selectedToolId="longPosition"
        onSelectTool={(tool) => {
          setIsPredictionFlyoutOpen(false);
          showToast(`تم اختيار أداة: ${tool.nameAr}`);
        }}
        topOffset={activeFlyoutTop}
      />

      <ShapesFlyout
        isOpen={isBrushFlyoutOpen}
        onClose={() => setIsBrushFlyoutOpen(false)}
        selectedToolId="brush"
        onSelectTool={(tool) => {
          setIsBrushFlyoutOpen(false);
          showToast(`تم اختيار شكل: ${tool.nameAr}`);
        }}
        topOffset={activeFlyoutTop}
      />
    </div>
  );
});
