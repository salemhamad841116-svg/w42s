import React from 'react';

export interface DrawingSubTool {
  id: string;
  nameAr: string;
  nameEn: string;
  shortcut?: string;
  tradingViewIdentifier: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export interface DrawingToolGroup {
  groupId: string;
  titleAr: string;
  titleEn: string;
  items: DrawingSubTool[];
}

// ─── SVG Icons matching TradingView lines & channels ──────────────────────────

export const TrendLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="15" x2="15" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="3" cy="15" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="3" r="1.5" fill="currentColor"/>
  </svg>
);

export const RayIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="4" y1="14" x2="16" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="4" cy="14" r="1.5" fill="currentColor"/>
    <polyline points="12,2 16,2 16,6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InfoLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="13" x2="15" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="3" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="3" r="1.5" fill="currentColor"/>
    <rect x="7" y="10" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

export const ExtendedLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="1" y1="17" x2="17" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="5" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="13" cy="5" r="1.5" fill="currentColor"/>
  </svg>
);

export const TrendAngleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="3" y1="14" x2="14" y2="3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="3" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="3" r="1.5" fill="currentColor"/>
    <path d="M7 14C7 12 8 10 9.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
  </svg>
);

export const HorizLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.7" fill="currentColor"/>
  </svg>
);

export const HorizRayIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="6" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="6" cy="9" r="1.7" fill="currentColor"/>
    <polyline points="14,6 17,9 14,12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const VertLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.7" fill="currentColor"/>
  </svg>
);

export const CrossLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.7" fill="currentColor"/>
  </svg>
);

export const ParallelChannelIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="11" x2="14" y2="3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="5" y1="16" x2="16" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="4" y1="13.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2"/>
    <circle cx="3" cy="11" r="1.3" fill="currentColor"/>
    <circle cx="14" cy="3" r="1.3" fill="currentColor"/>
    <circle cx="5" cy="16" r="1.3" fill="currentColor"/>
  </svg>
);

export const RegressionTrendIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="3" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.1" fill="currentColor" fillOpacity="0.08" transform="skewY(-12)"/>
    <line x1="2" y1="11" x2="16" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const FlatBottomIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="2" y1="14" x2="16" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="2" cy="4" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="4" r="1.3" fill="currentColor"/>
    <circle cx="2" cy="14" r="1.3" fill="currentColor"/>
  </svg>
);

export const DisjointChannelIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="12" x2="15" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="16" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="2" cy="12" r="1.4" fill="currentColor"/>
    <circle cx="15" cy="4" r="1.4" fill="currentColor"/>
    <circle cx="16" cy="15" r="1.4" fill="currentColor"/>
  </svg>
);

export const PitchforkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="14" x2="8" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="8" y1="8" x2="16" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="8" x2="15" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="8" x2="12" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="2" cy="14" r="1.4" fill="currentColor"/>
    <circle cx="16" cy="3" r="1.3" fill="currentColor"/>
    <circle cx="15" cy="9" r="1.3" fill="currentColor"/>
    <circle cx="12" cy="15" r="1.3" fill="currentColor"/>
  </svg>
);

export const SchiffPitchforkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="2" y1="12" x2="9" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="9" y1="7" x2="16" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="9" y1="7" x2="16" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="9" y1="7" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="2" cy="12" r="1.4" fill="currentColor"/>
    <circle cx="16" cy="2" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="8" r="1.3" fill="currentColor"/>
    <circle cx="14" cy="15" r="1.3" fill="currentColor"/>
  </svg>
);

export const ModSchiffPitchforkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="15" x2="10" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="10" y1="8" x2="17" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="10" y1="8" x2="15" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="10" y1="8" x2="11" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="3" cy="15" r="1.4" fill="currentColor"/>
    <circle cx="17" cy="4" r="1.3" fill="currentColor"/>
    <circle cx="15" cy="11" r="1.3" fill="currentColor"/>
  </svg>
);

export const InsidePitchforkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <line x1="3" y1="14" x2="8" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="8" y1="9" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="9" x2="16" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="3" cy="14" r="1.4" fill="currentColor"/>
    <circle cx="14" cy="4" r="1.3" fill="currentColor"/>
    <circle cx="16" cy="10" r="1.3" fill="currentColor"/>
  </svg>
);

// ─── Grouped Items Specification ──────────────────────────────────────────────

export const LINES_AND_CHANNELS_GROUPS: DrawingToolGroup[] = [
  {
    groupId: 'lines',
    titleAr: 'خطوط الاتجاه',
    titleEn: 'LINES',
    items: [
      {
        id: 'trendLine',
        nameAr: 'خط اتجاه',
        nameEn: 'Trend Line',
        shortcut: 'Alt + T',
        tradingViewIdentifier: 'LineToolTrendLine',
        icon: TrendLineIcon,
      },
      {
        id: 'ray',
        nameAr: 'شعاع',
        nameEn: 'Ray',
        tradingViewIdentifier: 'LineToolRay',
        icon: RayIcon,
      },
      {
        id: 'infoLine',
        nameAr: 'خط معلومات',
        nameEn: 'Info Line',
        tradingViewIdentifier: 'LineToolInfoLine',
        icon: InfoLineIcon,
      },
      {
        id: 'extendedLine',
        nameAr: 'خط ممتد',
        nameEn: 'Extended Line',
        tradingViewIdentifier: 'LineToolExtended',
        icon: ExtendedLineIcon,
      },
      {
        id: 'trendAngle',
        nameAr: 'زاوية الاتجاه',
        nameEn: 'Trend Angle',
        tradingViewIdentifier: 'LineToolTrendAngle',
        icon: TrendAngleIcon,
      },
      {
        id: 'horizLine',
        nameAr: 'خط أفقي',
        nameEn: 'Horizontal Line',
        shortcut: 'Alt + H',
        tradingViewIdentifier: 'LineToolHorizLine',
        icon: HorizLineIcon,
      },
      {
        id: 'horizRay',
        nameAr: 'شعاع أفقي',
        nameEn: 'Horizontal Ray',
        shortcut: 'Alt + J',
        tradingViewIdentifier: 'LineToolHorizRay',
        icon: HorizRayIcon,
      },
      {
        id: 'vertLine',
        nameAr: 'خط عمودي',
        nameEn: 'Vertical Line',
        shortcut: 'Alt + V',
        tradingViewIdentifier: 'LineToolVertLine',
        icon: VertLineIcon,
      },
      {
        id: 'crossLine',
        nameAr: 'Crossline',
        nameEn: 'Cross Line',
        shortcut: 'Alt + C',
        tradingViewIdentifier: 'LineToolCrossLine',
        icon: CrossLineIcon,
      },
    ],
  },
  {
    groupId: 'channels',
    titleAr: 'القنوات السعرية',
    titleEn: 'CHANNELS',
    items: [
      {
        id: 'parallelChannel',
        nameAr: 'قناة متوازية',
        nameEn: 'Parallel Channel',
        tradingViewIdentifier: 'LineToolParallelChannel',
        icon: ParallelChannelIcon,
      },
      {
        id: 'regressionTrend',
        nameAr: 'اتجاه الانحدار',
        nameEn: 'Regression Trend',
        tradingViewIdentifier: 'LineToolRegressionTrend',
        icon: RegressionTrendIcon,
      },
      {
        id: 'flatBottom',
        nameAr: 'قمة/قاع مسطح',
        nameEn: 'Flat Top/Bottom',
        tradingViewIdentifier: 'LineToolFlatBottom',
        icon: FlatBottomIcon,
      },
      {
        id: 'disjointChannel',
        nameAr: 'قناة منفصلة',
        nameEn: 'Disjoint Channel',
        tradingViewIdentifier: 'LineToolDisjointAngle',
        icon: DisjointChannelIcon,
      },
    ],
  },
  {
    groupId: 'pitchforks',
    titleAr: 'أدوات الشوكة',
    titleEn: 'PITCHFORKS',
    items: [
      {
        id: 'pitchfork',
        nameAr: 'شوكة Pitchfork',
        nameEn: 'Andrews Pitchfork',
        tradingViewIdentifier: 'LineToolPitchfork',
        icon: PitchforkIcon,
      },
      {
        id: 'schiffPitchfork',
        nameAr: 'شوكة شيف',
        nameEn: 'Schiff Pitchfork',
        tradingViewIdentifier: 'LineToolSchiffPitchfork2',
        icon: SchiffPitchforkIcon,
      },
      {
        id: 'modSchiffPitchfork',
        nameAr: 'شوكة شيف المعدلة',
        nameEn: 'Modified Schiff Pitchfork',
        tradingViewIdentifier: 'LineToolSchiffPitchfork',
        icon: ModSchiffPitchforkIcon,
      },
      {
        id: 'insidePitchfork',
        nameAr: 'شوكة داخلية',
        nameEn: 'Inside Pitchfork',
        tradingViewIdentifier: 'LineToolInsidePitchfork',
        icon: InsidePitchforkIcon,
      },
    ],
  },
];
