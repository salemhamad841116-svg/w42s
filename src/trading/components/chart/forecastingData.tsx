import React from 'react';

// ─── Forecasting Tool Types ──────────────────────────────────────────────────

export type ForecastingCategory = 'forecasting' | 'volume' | 'measurement';

export interface ForecastingTool {
  id: string;
  nameAr: string;
  nameEn: string;
  tradingViewIdentifier: string;
  category: ForecastingCategory;
  pointsCount: number;
  shortcut?: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export interface ForecastingGroup {
  groupId: ForecastingCategory;
  titleAr: string;
  titleEn: string;
  items: ForecastingTool[];
}

// ─── Position and Measurement Data Interfaces ────────────────────────────────

export interface PositionData {
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  accountSize?: number; // e.g. 10,000 USD
  riskPercent?: number; // e.g. 1%
  riskAmount?: number; // e.g. $100
  lotSize?: number; // e.g. 0.25 Lots
  rewardAmount?: number; // e.g. $250
  riskRewardRatio?: number; // e.g. 2.50
  targetPips?: number;
  stopPips?: number;
  targetPercent?: number;
  stopPercent?: number;
  barCount?: number;
  durationSeconds?: number;
  profitColor?: string; // default '#00C087'
  lossColor?: string; // default '#F23645'
  entryLineColor?: string; // default '#2962FF'
  profitOpacity?: number; // default 0.20
  lossOpacity?: number; // default 0.20
  showMetrics?: boolean;
  currency?: string; // default 'USD'
  commission?: number;
  spread?: number;
}

export interface VolumeProfileRow {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  isPOC?: boolean;
  inVA?: boolean;
}

export interface VolumeProfileData {
  rows: VolumeProfileRow[];
  pocPrice?: number;
  vahPrice?: number;
  valPrice?: number;
  totalVolume?: number;
  hasVolumeData?: boolean;
}

export interface RangeMeasurementData {
  priceDiff?: number;
  pricePercent?: number;
  pips?: number;
  barCount?: number;
  durationSeconds?: number;
}

// ─── Crisp SVG Icons Strictly Matching Reference Screenshot ─────────────────

export const LongPositionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Upper line with left/right circle handles */}
    <line x1="6" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    {/* Central Letter L */}
    <path d="M10 8V12H13" stroke="#00C087" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Lower line with left/right circle handles */}
    <line x1="4" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

export const ShortPositionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Upper line with circle */}
    <line x1="4" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" />
    {/* Central Letter S */}
    <path d="M12 8.5C12 8 11.5 7.5 10.5 7.5C9.5 7.5 9 8 9 8.8C9 10 12 9.8 12 11.2C12 12.2 11.2 12.5 10.5 12.5C9.5 12.5 9 12 9 11.5" stroke="#F23645" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Lower line with circle */}
    <line x1="6" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="6" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

export const ForecastIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Two candlesticks with forward forecast curve */}
    <line x1="5" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="1.2" />
    <rect x="3.5" y="7" width="3" height="6" rx="0.5" fill="currentColor" />
    <line x1="10" y1="7" x2="10" y2="17" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8.5" y="9" width="3" height="5" rx="0.5" fill="currentColor" />
    {/* Forecast dotted path ending with an arrow */}
    <path d="M12 11C14 9 15 6 17 4" stroke="#2962FF" strokeWidth="1.3" strokeDasharray="1.5 1.5" strokeLinecap="round" />
    <polyline points="15,4 17,4 17,6" stroke="#2962FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BarsPatternIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Dual group of candlestick patterns */}
    <line x1="5" y1="4" x2="5" y2="16" stroke="currentColor" strokeWidth="1" />
    <rect x="3.5" y="7" width="3" height="6" rx="0.5" fill="currentColor" />
    <line x1="10" y1="6" x2="10" y2="17" stroke="currentColor" strokeWidth="1" />
    <rect x="8.5" y="8" width="3" height="5" rx="0.5" fill="currentColor" />
    {/* Cloned pattern beside it */}
    <line x1="15" y1="4" x2="15" y2="16" stroke="#00BCD4" strokeWidth="1" strokeDasharray="1.5 1" />
    <rect x="13.5" y="7" width="3" height="6" rx="0.5" stroke="#00BCD4" strokeWidth="1" fill="none" />
  </svg>
);

export const GhostFeedIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Historical solid candle connected to ghost/dotted future candles */}
    <line x1="4" y1="7" x2="4" y2="15" stroke="currentColor" strokeWidth="1" />
    <rect x="2.5" y="9" width="3" height="4" rx="0.5" fill="currentColor" />
    <circle cx="8" cy="11" r="1.3" fill="currentColor" />
    <line x1="4" y1="11" x2="16" y2="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" />
    <line x1="12" y1="5" x2="12" y2="13" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    <rect x="10.5" y="7" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1" strokeOpacity="0.6" fill="none" />
    <line x1="16" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
    <rect x="14.5" y="6" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1" strokeOpacity="0.4" fill="none" />
  </svg>
);

export const SectorIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Circular sector / pie slice */}
    <path d="M4 16L16 16A12 12 0 0 0 4 4L4 16Z" fill="#2962FF" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="4" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="4" cy="4" r="1.5" fill="currentColor" />
  </svg>
);

export const AnchoredVwapIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Candlesticks with VWAP curve and anchor pin */}
    <line x1="6" y1="4" x2="6" y2="16" stroke="currentColor" strokeWidth="1" />
    <rect x="4.5" y="7" width="3" height="6" rx="0.5" fill="currentColor" />
    <line x1="14" y1="6" x2="14" y2="17" stroke="currentColor" strokeWidth="1" />
    <rect x="12.5" y="8" width="3" height="5" rx="0.5" fill="currentColor" />
    {/* VWAP trend line */}
    <path d="M3 13C7 11 11 10 17 6" stroke="#E040FB" strokeWidth="1.4" strokeLinecap="round" />
    {/* Anchor marker */}
    <circle cx="6" cy="11.5" r="1.8" fill="#E040FB" />
  </svg>
);

export const FixedRangeVolumeProfileIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Vertical range line on the right */}
    <line x1="15" y1="3" x2="15" y2="17" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="15" cy="3" r="1.3" fill="currentColor" />
    <circle cx="15" cy="17" r="1.3" fill="currentColor" />
    {/* Horizontal volume profile bars */}
    <rect x="5" y="5" width="7" height="2" fill="#2962FF" rx="0.4" />
    <rect x="3" y="8" width="10" height="2" fill="#F23645" rx="0.4" />
    <rect x="6" y="11" width="8" height="2" fill="#00C087" rx="0.4" />
    <rect x="8" y="14" width="5" height="2" fill="#2962FF" rx="0.4" />
  </svg>
);

export const AnchoredVolumeProfileIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Horizontal anchor pin on left */}
    <line x1="3" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="3" cy="10" r="1.5" fill="currentColor" />
    {/* Volume profile distribution bars on right */}
    <rect x="8" y="4" width="5" height="2" fill="#2962FF" rx="0.4" />
    <rect x="8" y="7" width="9" height="2" fill="#F23645" rx="0.4" />
    <rect x="8" y="10" width="7" height="2" fill="#00C087" rx="0.4" />
    <rect x="8" y="13" width="4" height="2" fill="#2962FF" rx="0.4" />
  </svg>
);

export const PriceRangeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Vertical measurement bracket with arrows/handles */}
    <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth="1.3" />
    <line x1="5" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.3" />
    <line x1="5" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="15" cy="4" r="1.4" fill="currentColor" />
    <circle cx="5" cy="16" r="1.4" fill="currentColor" />
  </svg>
);

export const DateRangeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Horizontal measurement bracket */}
    <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.3" />
    <line x1="4" y1="5" x2="4" y2="15" stroke="currentColor" strokeWidth="1.3" />
    <line x1="16" y1="5" x2="16" y2="15" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4" cy="15" r="1.4" fill="currentColor" />
    <circle cx="16" cy="5" r="1.4" fill="currentColor" />
  </svg>
);

export const DateAndPriceRangeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* 2D measurement box with crosshair arrows */}
    <rect x="3" y="3" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5" fill="#2962FF" fillOpacity="0.08" />
    <line x1="10" y1="6" x2="10" y2="14" stroke="#2962FF" strokeWidth="1.2" />
    <line x1="6" y1="10" x2="14" y2="10" stroke="#2962FF" strokeWidth="1.2" />
    <circle cx="10" cy="10" r="1.2" fill="#2962FF" />
  </svg>
);

// ─── Forecasting Tools Definition (12 Tools in 3 Groups) ─────────────────────

export const FORECASTING_GROUPS: ForecastingGroup[] = [
  {
    groupId: 'forecasting',
    titleAr: 'FORECASTING',
    titleEn: 'FORECASTING',
    items: [
      {
        id: 'longPosition',
        nameAr: 'مركز شراء',
        nameEn: 'Long Position',
        tradingViewIdentifier: 'LineToolRiskRewardLong',
        category: 'forecasting',
        pointsCount: 2,
        shortcut: 'Alt+B',
        icon: LongPositionIcon,
      },
      {
        id: 'shortPosition',
        nameAr: 'مركز بيع',
        nameEn: 'Short Position',
        tradingViewIdentifier: 'LineToolRiskRewardShort',
        category: 'forecasting',
        pointsCount: 2,
        shortcut: 'Alt+S',
        icon: ShortPositionIcon,
      },
      {
        id: 'forecast',
        nameAr: 'توقع المركز',
        nameEn: 'Forecast',
        tradingViewIdentifier: 'LineToolPrediction',
        category: 'forecasting',
        pointsCount: 2,
        icon: ForecastIcon,
      },
      {
        id: 'barsPattern',
        nameAr: 'Bars pattern',
        nameEn: 'Bars Pattern',
        tradingViewIdentifier: 'LineToolBarsPattern',
        category: 'forecasting',
        pointsCount: 2,
        icon: BarsPatternIcon,
      },
      {
        id: 'ghostFeed',
        nameAr: 'تغذية وهمية',
        nameEn: 'Ghost Feed',
        tradingViewIdentifier: 'LineToolGhostFeed',
        category: 'forecasting',
        pointsCount: 2,
        icon: GhostFeedIcon,
      },
      {
        id: 'sector',
        nameAr: 'قطاع',
        nameEn: 'Sector',
        tradingViewIdentifier: 'LineToolProjection',
        category: 'forecasting',
        pointsCount: 2,
        icon: SectorIcon,
      },
    ],
  },
  {
    groupId: 'volume',
    titleAr: 'معتمد على الحجم',
    titleEn: 'VOLUME-BASED',
    items: [
      {
        id: 'anchoredVWAP',
        nameAr: 'VWAP المثبت',
        nameEn: 'Anchored VWAP',
        tradingViewIdentifier: 'LineToolAnchoredVWAP',
        category: 'volume',
        pointsCount: 1,
        icon: AnchoredVwapIcon,
      },
      {
        id: 'fixedRangeVolumeProfile',
        nameAr: 'بروفايل الحجم بنطاق ثابت',
        nameEn: 'Fixed Range Volume Profile',
        tradingViewIdentifier: 'LineToolFixedRangeVolumeProfile',
        category: 'volume',
        pointsCount: 2,
        icon: FixedRangeVolumeProfileIcon,
      },
      {
        id: 'anchoredVolumeProfile',
        nameAr: 'بروفايل الحجم المثبت',
        nameEn: 'Anchored Volume Profile',
        tradingViewIdentifier: 'LineToolAnchoredVolumeProfile',
        category: 'volume',
        pointsCount: 1,
        icon: AnchoredVolumeProfileIcon,
      },
    ],
  },
  {
    groupId: 'measurement',
    titleAr: 'المقاييس',
    titleEn: 'MEASUREMENT',
    items: [
      {
        id: 'priceRange',
        nameAr: 'نطاق السعر',
        nameEn: 'Price Range',
        tradingViewIdentifier: 'LineToolPriceRange',
        category: 'measurement',
        pointsCount: 2,
        icon: PriceRangeIcon,
      },
      {
        id: 'dateRange',
        nameAr: 'نطاق التاريخ',
        nameEn: 'Date Range',
        tradingViewIdentifier: 'LineToolTimeRange',
        category: 'measurement',
        pointsCount: 2,
        icon: DateRangeIcon,
      },
      {
        id: 'dateAndPriceRange',
        nameAr: 'نطاق التاريخ والسعر',
        nameEn: 'Date and Price Range',
        tradingViewIdentifier: 'LineToolDateAndPriceRange',
        category: 'measurement',
        pointsCount: 2,
        icon: DateAndPriceRangeIcon,
      },
    ],
  },
];

// Helper to look up tool by ID
export const getForecastingToolById = (id: string): ForecastingTool | undefined => {
  for (const group of FORECASTING_GROUPS) {
    const found = group.items.find(i => i.id === id);
    if (found) return found;
  }
  return undefined;
};

// ─── Asset Specifications & Position Sizing Engine ───────────────────────────

export interface SymbolSpecs {
  pipSize: number;
  pipValuePerStandardLot: number;
  contractSize: number;
  decimals: number;
  isForex: boolean;
  isGold: boolean;
  isCrypto: boolean;
  isIndex: boolean;
}

export const getSymbolSpecs = (symbol: string): SymbolSpecs => {
  const s = symbol.toUpperCase().replace('/', '').replace('-', '');

  // Gold / Metals
  if (s.includes('XAU') || s.includes('GOLD')) {
    return {
      pipSize: 0.1,
      pipValuePerStandardLot: 10, // $10 per 0.1 move on 100oz contract
      contractSize: 100,
      decimals: 2,
      isForex: false,
      isGold: true,
      isCrypto: false,
      isIndex: false,
    };
  }

  // JPY Forex pairs
  if (s.includes('JPY')) {
    return {
      pipSize: 0.01,
      pipValuePerStandardLot: 9.2, // ~ $9.20 depending on USD/JPY rate
      contractSize: 100000,
      decimals: 3,
      isForex: true,
      isGold: false,
      isCrypto: false,
      isIndex: false,
    };
  }

  // Standard Forex (EURUSD, GBPUSD, AUDUSD, etc.)
  if (
    s.includes('EUR') || s.includes('GBP') || s.includes('AUD') ||
    s.includes('NZD') || s.includes('CAD') || s.includes('CHF')
  ) {
    return {
      pipSize: 0.0001,
      pipValuePerStandardLot: 10, // $10 per pip on standard lot (100k)
      contractSize: 100000,
      decimals: 5,
      isForex: true,
      isGold: false,
      isCrypto: false,
      isIndex: false,
    };
  }

  // Major Indices (US30, NAS100, SPX500, GER30)
  if (s.includes('US30') || s.includes('NAS') || s.includes('SPX') || s.includes('GER')) {
    return {
      pipSize: 1.0,
      pipValuePerStandardLot: 1, // $1 per point
      contractSize: 1,
      decimals: 1,
      isForex: false,
      isGold: false,
      isCrypto: false,
      isIndex: true,
    };
  }

  // Crypto default (BTC, ETH, SOL, etc.)
  return {
    pipSize: 1.0,
    pipValuePerStandardLot: 1,
    contractSize: 1,
    decimals: 2,
    isForex: false,
    isGold: false,
    isCrypto: true,
    isIndex: false,
  };
};

export const calculatePositionMetrics = (
  entryPrice: number,
  targetPrice: number,
  stopLossPrice: number,
  isLong: boolean,
  symbol: string,
  accountSize: number = 10000,
  riskPercent: number = 1,
  barCount?: number,
  durationSeconds?: number
): PositionData => {
  const specs = getSymbolSpecs(symbol);

  // Target and Stop Distances
  const targetDiff = isLong ? targetPrice - entryPrice : entryPrice - targetPrice;
  const stopDiff = isLong ? entryPrice - stopLossPrice : stopLossPrice - entryPrice;

  const targetDist = Math.max(0, targetDiff);
  const stopDist = Math.max(0.00001, stopDiff);

  const riskRewardRatio = stopDist > 0 ? Number((targetDist / stopDist).toFixed(2)) : 0;

  const targetPips = Number((targetDist / specs.pipSize).toFixed(1));
  const stopPips = Number((stopDist / specs.pipSize).toFixed(1));

  const targetPercent = entryPrice > 0 ? Number(((targetDist / entryPrice) * 100).toFixed(2)) : 0;
  const stopPercent = entryPrice > 0 ? Number(((stopDist / entryPrice) * 100).toFixed(2)) : 0;

  // Position Sizing: Risk Amount = Account * Risk%
  const riskAmount = Number(((accountSize * riskPercent) / 100).toFixed(2));

  // Lot Size calculation based on asset class
  let lotSize = 0.1;
  if (specs.isForex || specs.isGold) {
    // Lots = RiskAmount / (StopPips * PipValuePerLot)
    const pipVal = specs.pipValuePerStandardLot;
    if (stopPips > 0 && pipVal > 0) {
      lotSize = Number((riskAmount / (stopPips * pipVal)).toFixed(2));
    }
  } else if (specs.isCrypto) {
    // Position Size in Coins = RiskAmount / StopDistanceInPrice
    if (stopDist > 0) {
      lotSize = Number((riskAmount / stopDist).toFixed(4));
    }
  } else {
    // Indices or Stocks: Contracts = RiskAmount / StopPoints
    if (stopDist > 0) {
      lotSize = Number((riskAmount / stopDist).toFixed(2));
    }
  }

  // Ensure reasonable minimum lot
  lotSize = Math.max(0.01, lotSize);

  // Expected Reward Amount ($)
  const rewardAmount = Number((riskAmount * riskRewardRatio).toFixed(2));

  return {
    entryPrice,
    targetPrice,
    stopLossPrice,
    accountSize,
    riskPercent,
    riskAmount,
    lotSize,
    rewardAmount,
    riskRewardRatio,
    targetPips,
    stopPips,
    targetPercent,
    stopPercent,
    barCount,
    durationSeconds,
    profitColor: '#00C087',
    lossColor: '#F23645',
    entryLineColor: '#2962FF',
    profitOpacity: 0.22,
    lossOpacity: 0.22,
    showMetrics: true,
    currency: 'USD',
  };
};
