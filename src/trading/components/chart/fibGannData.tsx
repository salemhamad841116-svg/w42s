import React from 'react';

export interface FibLevelConfig {
  value: number; // e.g. 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, etc.
  label?: string;
  color: string;
  enabled: boolean;
  opacity?: number;
}

export interface GannRatioConfig {
  ratio: string; // "1:1", "1:2", "2:1", etc.
  slopeX: number;
  slopeY: number;
  color: string;
  enabled: boolean;
}

export interface FibGannTool {
  id: string;
  nameAr: string;
  nameEn: string;
  numPoints: 2 | 3;
  icon: React.FC<{ size?: number; className?: string }>;
  tradingViewIdentifier: string;
}

export interface FibGannGroup {
  groupId: string;
  titleAr: string;
  titleEn: string;
  items: FibGannTool[];
}

// ─── Default 14 Fibonacci Levels with Standard TradingView Color Coding ───────

export const DEFAULT_FIB_LEVELS: FibLevelConfig[] = [
  { value: 0,     label: '0',     color: '#787B86', enabled: true },
  { value: 0.236, label: '0.236', color: '#F23645', enabled: true },
  { value: 0.382, label: '0.382', color: '#FF9800', enabled: true },
  { value: 0.5,   label: '0.5',   color: '#4CAF50', enabled: true },
  { value: 0.618, label: '0.618', color: '#00BCD4', enabled: true },
  { value: 0.786, label: '0.786', color: '#2962FF', enabled: true },
  { value: 1,     label: '1',     color: '#787B86', enabled: true },
  { value: 1.272, label: '1.272', color: '#9C27B0', enabled: true },
  { value: 1.414, label: '1.414', color: '#E91E63', enabled: true },
  { value: 1.618, label: '1.618', color: '#2962FF', enabled: true },
  { value: 2,     label: '2',     color: '#787B86', enabled: false },
  { value: 2.618, label: '2.618', color: '#00BCD4', enabled: false },
  { value: 3.618, label: '3.618', color: '#4CAF50', enabled: false },
  { value: 4.236, label: '4.236', color: '#F23645', enabled: false },
];

export const DEFAULT_GANN_RATIOS: GannRatioConfig[] = [
  { ratio: '1:8', slopeX: 8, slopeY: 1, color: '#F23645', enabled: true },
  { ratio: '1:4', slopeX: 4, slopeY: 1, color: '#FF9800', enabled: true },
  { ratio: '1:3', slopeX: 3, slopeY: 1, color: '#FFEB3B', enabled: true },
  { ratio: '1:2', slopeX: 2, slopeY: 1, color: '#4CAF50', enabled: true },
  { ratio: '1:1', slopeX: 1, slopeY: 1, color: '#2962FF', enabled: true }, // The main 45-degree angle
  { ratio: '2:1', slopeX: 1, slopeY: 2, color: '#00BCD4', enabled: true },
  { ratio: '3:1', slopeX: 1, slopeY: 3, color: '#9C27B0', enabled: true },
  { ratio: '4:1', slopeX: 1, slopeY: 4, color: '#E91E63', enabled: true },
  { ratio: '8:1', slopeX: 1, slopeY: 8, color: '#F23645', enabled: true },
];

// ─── SVG Icons matching Reference Image ──────────────────────────────────────

export const FibRetraceIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="14" cy="4" r="1.3" fill="currentColor"/>
    <circle cx="4" cy="8" r="1.3" fill="currentColor"/>
    <circle cx="14" cy="14" r="1.3" fill="currentColor"/>
  </svg>
);

export const FibExtensionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <polyline points="2,14 7,4 12,11 16,3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="2" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="7" cy="4" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="11" r="1.2" fill="currentColor"/>
    <circle cx="16" cy="3" r="1.2" fill="currentColor"/>
    <line x1="12" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const FibChannelIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="4" y1="14" x2="14" y2="4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1.5 1.5"/>
    <line x1="6" y1="16" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="2" r="1.2" fill="currentColor"/>
    <circle cx="6" cy="16" r="1.2" fill="currentColor"/>
  </svg>
);

export const FibTimeZoneIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="2" x2="3" y2="16" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="6" y1="2" x2="6" y2="16" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="10" y1="2" x2="10" y2="16" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="15" y1="2" x2="15" y2="16" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="6" cy="7" r="1.3" fill="currentColor"/>
    <circle cx="10" cy="11" r="1.3" fill="currentColor"/>
  </svg>
);

export const FibSpeedResistanceFanIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="2" y1="16" x2="16" y2="2" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="2" y1="16" x2="16" y2="7" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="2" y1="16" x2="16" y2="12" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="16" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.1"/>
    <circle cx="2" cy="16" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="2" r="1.3" fill="currentColor"/>
  </svg>
);

export const TrendBasedFibTimeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <polyline points="2,14 6,4 11,10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
    <line x1="6" y1="2" x2="6" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
    <line x1="11" y1="2" x2="11" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
    <line x1="16" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
    <circle cx="2" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="6" cy="4" r="1.2" fill="currentColor"/>
    <circle cx="11" cy="10" r="1.2" fill="currentColor"/>
  </svg>
);

export const FibCirclesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.1"/>
    <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.1"/>
    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="9" y1="9" x2="16.5" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
    <circle cx="16.5" cy="9" r="1.2" fill="currentColor"/>
  </svg>
);

export const FibSpiralIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M9 9 C9 7.5, 11 7.5, 11 9 C11 11, 7.5 11, 7.5 9 C7.5 6, 13 6, 13 9 C13 13, 5 13, 5 9 C5 4, 15 4, 15 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
    <circle cx="15" cy="9" r="1.2" fill="currentColor"/>
  </svg>
);

export const FibSpeedResistanceArcsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M2 13 C2 6, 16 6, 16 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.5 13 C4.5 8, 13.5 8, 13.5 13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M7 13 C7 10, 11 10, 11 13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1"/>
    <circle cx="9" cy="13" r="1.3" fill="currentColor"/>
  </svg>
);

export const FibWedgeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="15" x2="15" y2="3" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="2" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M6 15 A9 9 0 0 1 10 7" stroke="currentColor" strokeWidth="1.1" fill="none"/>
    <path d="M10 15 A14 14 0 0 1 14 5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
    <circle cx="2" cy="15" r="1.3" fill="currentColor"/>
    <circle cx="15" cy="3" r="1.2" fill="currentColor"/>
    <circle cx="16" cy="15" r="1.2" fill="currentColor"/>
  </svg>
);

export const PitchfanIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="14" x2="8" y2="9" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="8" y1="9" x2="16" y2="4" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="8" y1="9" x2="15" y2="10" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="8" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="16" y1="4" x2="12" y2="15" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 1.5"/>
    <circle cx="2" cy="14" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="4" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="15" r="1.2" fill="currentColor"/>
  </svg>
);

// ─── GANN SVG ICONS ──────────────────────────────────────────────────────────

export const GannBoxIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2.5" y="2.5" width="13" height="13" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="2.5" y1="2.5" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="1"/>
    <line x1="2.5" y1="15.5" x2="15.5" y2="2.5" stroke="currentColor" strokeWidth="1"/>
    <line x1="9" y1="2.5" x2="9" y2="15.5" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1 1.5"/>
    <line x1="2.5" y1="9" x2="15.5" y2="9" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1 1.5"/>
    <circle cx="2.5" cy="2.5" r="1.2" fill="currentColor"/>
    <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
  </svg>
);

export const GannSquareFixedIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="3" y="3" width="12" height="12" stroke="currentColor" strokeWidth="1.2"/>
    <polygon points="9,3 15,9 9,15 3,9" stroke="currentColor" strokeWidth="0.9"/>
    <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="0.9"/>
    <line x1="3" y1="15" x2="15" y2="3" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="3" cy="3" r="1.2" fill="currentColor"/>
    <circle cx="15" cy="15" r="1.2" fill="currentColor"/>
  </svg>
);

export const GannSquareIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="16" x2="16" y2="2" stroke="currentColor" strokeWidth="1"/>
    <line x1="6.6" y1="2" x2="6.6" y2="16" stroke="currentColor" strokeWidth="0.8"/>
    <line x1="11.3" y1="2" x2="11.3" y2="16" stroke="currentColor" strokeWidth="0.8"/>
    <line x1="2" y1="6.6" x2="16" y2="6.6" stroke="currentColor" strokeWidth="0.8"/>
    <line x1="2" y1="11.3" x2="16" y2="11.3" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="2" cy="2" r="1.2" fill="currentColor"/>
    <circle cx="16" cy="16" r="1.2" fill="currentColor"/>
  </svg>
);

export const GannFanIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="15" x2="16" y2="3" stroke="currentColor" strokeWidth="1.3"/>
    <line x1="2" y1="15" x2="16" y2="7" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="15" x2="16" y2="11" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="15" x2="8" y2="3" stroke="currentColor" strokeWidth="1"/>
    <line x1="2" y1="15" x2="4" y2="3" stroke="currentColor" strokeWidth="1"/>
    <circle cx="2" cy="15" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="3" r="1.3" fill="currentColor"/>
  </svg>
);

// ─── Grouped Items Specification ──────────────────────────────────────────────

export const FIBONACCI_AND_GANN_GROUPS: FibGannGroup[] = [
  {
    groupId: 'fibonacci',
    titleAr: 'فيبوناتشي',
    titleEn: 'FIBONACCI',
    items: [
      {
        id: 'fibRetracement',
        nameAr: 'تصحيح فيبوناتشي',
        nameEn: 'Fib Retracement',
        numPoints: 2,
        icon: FibRetraceIcon,
        tradingViewIdentifier: 'LineToolFibRetracement',
      },
      {
        id: 'fibExtension',
        nameAr: 'امتداد فيبوناتشي قائم على الاتجاه',
        nameEn: 'Trend-Based Fib Extension',
        numPoints: 3,
        icon: FibExtensionIcon,
        tradingViewIdentifier: 'LineToolTrendBasedFibExtension',
      },
      {
        id: 'fibChannel',
        nameAr: 'قناة فيبوناتشي',
        nameEn: 'Fib Channel',
        numPoints: 3,
        icon: FibChannelIcon,
        tradingViewIdentifier: 'LineToolFibChannel',
      },
      {
        id: 'fibTimeZone',
        nameAr: 'منطقة الزمن فيبوناتشي',
        nameEn: 'Fib Time Zone',
        numPoints: 2,
        icon: FibTimeZoneIcon,
        tradingViewIdentifier: 'LineToolFibTimeZone',
      },
      {
        id: 'fibSpeedFan',
        nameAr: 'مروحة مقاومة السرعة فيبوناتشي',
        nameEn: 'Fib Speed Resistance Fan',
        numPoints: 2,
        icon: FibSpeedResistanceFanIcon,
        tradingViewIdentifier: 'LineToolFibSpeedResistanceFan',
      },
      {
        id: 'trendFibTime',
        nameAr: 'وقت فيبوناتشي قائم على الاتجاه',
        nameEn: 'Trend-Based Fib Time',
        numPoints: 3,
        icon: TrendBasedFibTimeIcon,
        tradingViewIdentifier: 'LineToolTrendBasedFibTime',
      },
      {
        id: 'fibCircles',
        nameAr: 'دوائر فيبوناتشي',
        nameEn: 'Fib Circles',
        numPoints: 2,
        icon: FibCirclesIcon,
        tradingViewIdentifier: 'LineToolFibCircles',
      },
      {
        id: 'fibSpiral',
        nameAr: 'حلزون فيبوناتشي',
        nameEn: 'Fib Spiral',
        numPoints: 2,
        icon: FibSpiralIcon,
        tradingViewIdentifier: 'LineToolFibSpiral',
      },
      {
        id: 'fibArcs',
        nameAr: 'أقواس مقاومة السرعة فيبوناتشي',
        nameEn: 'Fib Speed Resistance Arcs',
        numPoints: 2,
        icon: FibSpeedResistanceArcsIcon,
        tradingViewIdentifier: 'LineToolFibSpeedResistanceArcs',
      },
      {
        id: 'fibWedge',
        nameAr: 'إسفين فيبوناتشي',
        nameEn: 'Fib Wedge',
        numPoints: 3,
        icon: FibWedgeIcon,
        tradingViewIdentifier: 'LineToolFibWedge',
      },
      {
        id: 'pitchfan',
        nameAr: 'مروحة Pitchfork',
        nameEn: 'Pitchfan',
        numPoints: 3,
        icon: PitchfanIcon,
        tradingViewIdentifier: 'LineToolPitchfan',
      },
    ],
  },
  {
    groupId: 'gann',
    titleAr: 'أدوات جان',
    titleEn: 'GANN',
    items: [
      {
        id: 'gannBox',
        nameAr: 'صندوق جان',
        nameEn: 'Gann Box',
        numPoints: 2,
        icon: GannBoxIcon,
        tradingViewIdentifier: 'LineToolGannBox',
      },
      {
        id: 'gannSquareFixed',
        nameAr: 'مربع جان ثابت',
        nameEn: 'Gann Square Fixed',
        numPoints: 2,
        icon: GannSquareFixedIcon,
        tradingViewIdentifier: 'LineToolGannSquareFixed',
      },
      {
        id: 'gannSquare',
        nameAr: 'مربع جان',
        nameEn: 'Gann Square',
        numPoints: 2,
        icon: GannSquareIcon,
        tradingViewIdentifier: 'LineToolGannSquare',
      },
      {
        id: 'gannFan',
        nameAr: 'مروحة جان',
        nameEn: 'Gann Fan',
        numPoints: 2,
        icon: GannFanIcon,
        tradingViewIdentifier: 'LineToolGannFan',
      },
    ],
  },
];
