import React from 'react';

// ─── Pattern Tool Types ──────────────────────────────────────────────────────

export type PatternCategory = 'patterns' | 'elliott' | 'cycles';

export interface PatternTool {
  id: string;
  nameAr: string;
  nameEn: string;
  tradingViewIdentifier: string;
  category: PatternCategory;
  pointsCount: number;
  pointLabels: string[];
  shortcut?: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export interface PatternGroup {
  groupId: PatternCategory;
  titleAr: string;
  titleEn: string;
  items: PatternTool[];
}

// ─── Crisp SVG Icons matching Reference Screenshot ───────────────────────────

export const XabcdIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Triangles XAB and BCD */}
    <polygon points="2,16 6,4 10,13" fill="#2962FF" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="10,13 14,5 18,16" fill="#00BCD4" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <circle cx="2" cy="16" r="1.4" fill="currentColor"/>
    <circle cx="6" cy="4" r="1.4" fill="currentColor"/>
    <circle cx="10" cy="13" r="1.4" fill="currentColor"/>
    <circle cx="14" cy="5" r="1.4" fill="currentColor"/>
    <circle cx="18" cy="16" r="1.4" fill="currentColor"/>
  </svg>
);

export const CypherIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="2,15 6,5 11,14 15,3 18,12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="2" y1="15" x2="11" y2="14" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5"/>
    <line x1="6" y1="5" x2="18" y2="12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5"/>
    <circle cx="2" cy="15" r="1.3" fill="currentColor"/>
    <circle cx="6" cy="5" r="1.3" fill="currentColor"/>
    <circle cx="11" cy="14" r="1.3" fill="currentColor"/>
    <circle cx="15" cy="3" r="1.3" fill="currentColor"/>
    <circle cx="18" cy="12" r="1.3" fill="currentColor"/>
  </svg>
);

export const HeadAndShouldersIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Left shoulder (LS), Trough 1 (N1), Head (H), Trough 2 (N2), Right shoulder (RS) */}
    <polyline points="2,14 5,8 8,14 10,4 12,14 15,8 18,14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Neckline */}
    <line x1="1" y1="14" x2="19" y2="14" stroke="#2962FF" strokeWidth="1" strokeDasharray="2 1.5"/>
    <circle cx="5" cy="8" r="1.3" fill="currentColor"/>
    <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="8" r="1.3" fill="currentColor"/>
  </svg>
);

export const AbcdIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="3,15 8,5 12,12 17,3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="5" x2="17" y2="3" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5"/>
    <circle cx="3" cy="15" r="1.3" fill="currentColor"/>
    <circle cx="8" cy="5" r="1.3" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
    <circle cx="17" cy="3" r="1.3" fill="currentColor"/>
  </svg>
);

export const TrianglePatternIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Converging boundary lines */}
    <line x1="2" y1="4" x2="18" y2="9" stroke="currentColor" strokeWidth="1.3"/>
    <line x1="2" y1="16" x2="18" y2="11" stroke="currentColor" strokeWidth="1.3"/>
    {/* Zigzag waves inside */}
    <polyline points="3,5 7,14 11,7 14,13 17,10" stroke="#00BCD4" strokeWidth="1" strokeLinejoin="round"/>
    <circle cx="3" cy="5" r="1.2" fill="currentColor"/>
    <circle cx="7" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="11" cy="7" r="1.2" fill="currentColor"/>
    <circle cx="14" cy="13" r="1.2" fill="currentColor"/>
    <circle cx="17" cy="10" r="1.2" fill="currentColor"/>
  </svg>
);

export const ThreeDrivesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* 3 consecutive drives */}
    <polyline points="2,16 5,11 8,15 11,8 14,13 17,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="11" r="1.3" fill="currentColor"/>
    <circle cx="11" cy="8" r="1.3" fill="currentColor"/>
    <circle cx="17" cy="5" r="1.3" fill="currentColor"/>
  </svg>
);

export const ElliottImpulseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="2,16 5,10 8,14 12,5 15,10 18,3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="10" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="5" r="1.2" fill="currentColor"/>
    <circle cx="15" cy="10" r="1.2" fill="currentColor"/>
    <circle cx="18" cy="3" r="1.2" fill="currentColor"/>
    {/* Indicators 1 and 5 */}
    <text x="5" y="8" fill="currentColor" fontSize="6" fontFamily="sans-serif" textAnchor="middle">1</text>
    <text x="18" y="2.5" fill="currentColor" fontSize="6" fontFamily="sans-serif" textAnchor="middle">5</text>
  </svg>
);

export const ElliottCorrectionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="3,5 8,15 13,9 17,17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="15" r="1.2" fill="currentColor"/>
    <circle cx="13" cy="9" r="1.2" fill="currentColor"/>
    <circle cx="17" cy="17" r="1.2" fill="currentColor"/>
    <text x="8" y="19" fill="currentColor" fontSize="6" fontFamily="sans-serif" textAnchor="middle">A</text>
    <text x="17" y="19" fill="currentColor" fontSize="6" fontFamily="sans-serif" textAnchor="middle">C</text>
  </svg>
);

export const ElliottTriangleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="2,4 6,15 10,7 13,13 16,9 18,11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="2" y1="4" x2="18" y2="9" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5"/>
    <line x1="6" y1="15" x2="18" y2="11" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5"/>
    <text x="3" y="3" fill="currentColor" fontSize="5.5" fontFamily="sans-serif">A</text>
    <text x="18" y="8" fill="currentColor" fontSize="5.5" fontFamily="sans-serif">E</text>
  </svg>
);

export const ElliottDoubleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="2,6 7,15 12,9 17,16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="15" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="9" r="1.2" fill="currentColor"/>
    <circle cx="17" cy="16" r="1.2" fill="currentColor"/>
    <text x="7" y="19" fill="currentColor" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">W</text>
    <text x="17" y="19" fill="currentColor" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">Y</text>
  </svg>
);

export const ElliottTripleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polyline points="2,6 5,14 9,9 12,15 15,10 18,16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="5" y="18" fill="currentColor" fontSize="5" fontFamily="sans-serif" textAnchor="middle">W</text>
    <text x="18" y="18" fill="currentColor" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Z</text>
  </svg>
);

export const CyclicLinesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <line x1="4" y1="3" x2="4" y2="17" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="9" y1="3" x2="9" y2="17" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="14" y1="3" x2="14" y2="17" stroke="currentColor" strokeWidth="1.2"/>
    {/* Dial adjustments */}
    <circle cx="4" cy="7" r="1.5" fill="currentColor"/>
    <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
  </svg>
);

export const TimeCyclesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    {/* Repeating semicircle arches */}
    <path d="M2 14C2 9 6 9 6 14C6 9 10 9 10 14C10 9 14 9 14 14C14 9 18 9 18 14" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    <line x1="1" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
  </svg>
);

export const SineLineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 10C4 4 7 4 9 10C11 16 14 16 16 10C17 7 18 7 19 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.5"/>
  </svg>
);

// ─── Complete Tools Registry (14 Tools, 3 Groups) ───────────────────────────

export const PATTERNS_GROUPS: PatternGroup[] = [
  {
    groupId: 'patterns',
    titleAr: 'أنماط الرسم البياني',
    titleEn: 'CHART PATTERNS',
    items: [
      {
        id: 'xabcd',
        nameAr: 'نموذج XABCD',
        nameEn: 'XABCD Pattern',
        tradingViewIdentifier: 'LineToolXABCD',
        category: 'patterns',
        pointsCount: 5,
        pointLabels: ['X', 'A', 'B', 'C', 'D'],
        shortcut: 'Alt+X',
        icon: XabcdIcon,
      },
      {
        id: 'cypher',
        nameAr: 'نموذج Cypher',
        nameEn: 'Cypher Pattern',
        tradingViewIdentifier: 'LineToolCypher',
        category: 'patterns',
        pointsCount: 5,
        pointLabels: ['X', 'A', 'B', 'C', 'D'],
        icon: CypherIcon,
      },
      {
        id: 'headAndShoulders',
        nameAr: 'الرأس والكتفين',
        nameEn: 'Head and Shoulders',
        tradingViewIdentifier: 'LineToolHeadAndShoulders',
        category: 'patterns',
        pointsCount: 5, // Left Shoulder, Neck 1, Head, Neck 2, Right Shoulder
        pointLabels: ['LS', 'N1', 'Head', 'N2', 'RS'],
        icon: HeadAndShouldersIcon,
      },
      {
        id: 'abcd',
        nameAr: 'نموذج ABCD',
        nameEn: 'ABCD Pattern',
        tradingViewIdentifier: 'LineToolABCD',
        category: 'patterns',
        pointsCount: 4,
        pointLabels: ['A', 'B', 'C', 'D'],
        icon: AbcdIcon,
      },
      {
        id: 'trianglePattern',
        nameAr: 'نموذج المثلث',
        nameEn: 'Triangle Pattern',
        tradingViewIdentifier: 'LineToolTriangle',
        category: 'patterns',
        pointsCount: 5,
        pointLabels: ['A', 'B', 'C', 'D', 'E'],
        icon: TrianglePatternIcon,
      },
      {
        id: 'threeDrives',
        nameAr: 'نموذج ثلاثي الحركات',
        nameEn: 'Three Drives Pattern',
        tradingViewIdentifier: 'LineToolThreeDrives',
        category: 'patterns',
        pointsCount: 6,
        pointLabels: ['0', '1', 'A', '2', 'C', '3'],
        icon: ThreeDrivesIcon,
      },
    ],
  },
  {
    groupId: 'elliott',
    titleAr: 'موجات إليوت',
    titleEn: 'ELLIOTT WAVES',
    items: [
      {
        id: 'elliottImpulse',
        nameAr: 'موجة إليوت الاندفاعية (1-2-3-4-5)',
        nameEn: 'Elliott Impulse Wave (1-2-3-4-5)',
        tradingViewIdentifier: 'LineToolElliottImpulse',
        category: 'elliott',
        pointsCount: 6,
        pointLabels: ['0', '1', '2', '3', '4', '5'],
        icon: ElliottImpulseIcon,
      },
      {
        id: 'elliottCorrection',
        nameAr: 'موجة تصحيح إليوت (A-B-C)',
        nameEn: 'Elliott Correction Wave (A-B-C)',
        tradingViewIdentifier: 'LineToolElliottCorrection',
        category: 'elliott',
        pointsCount: 4,
        pointLabels: ['0', 'A', 'B', 'C'],
        icon: ElliottCorrectionIcon,
      },
      {
        id: 'elliottTriangle',
        nameAr: 'موجة مثلث إليوت (A-B-C-D-E)',
        nameEn: 'Elliott Triangle Wave (A-B-C-D-E)',
        tradingViewIdentifier: 'LineToolElliottTriangle',
        category: 'elliott',
        pointsCount: 6,
        pointLabels: ['0', 'A', 'B', 'C', 'D', 'E'],
        icon: ElliottTriangleIcon,
      },
      {
        id: 'elliottDoubleCombo',
        nameAr: 'موجة إليوت المزدوجة المركبة (W-X-Y)',
        nameEn: 'Elliott Double Combo Wave (W-X-Y)',
        tradingViewIdentifier: 'LineToolElliottDoubleCombo',
        category: 'elliott',
        pointsCount: 4,
        pointLabels: ['0', 'W', 'X', 'Y'],
        icon: ElliottDoubleIcon,
      },
      {
        id: 'elliottTripleCombo',
        nameAr: 'موجة إليوت الثلاثية المركبة (W-X-Y-X-Z)',
        nameEn: 'Elliott Triple Combo Wave (W-X-Y-X-Z)',
        tradingViewIdentifier: 'LineToolElliottTripleCombo',
        category: 'elliott',
        pointsCount: 6,
        pointLabels: ['0', 'W', 'X', 'Y', 'X', 'Z'],
        icon: ElliottTripleIcon,
      },
    ],
  },
  {
    groupId: 'cycles',
    titleAr: 'الدورات الزمنية',
    titleEn: 'CYCLES',
    items: [
      {
        id: 'cyclicLines',
        nameAr: 'خطوط دورية',
        nameEn: 'Cyclic Lines',
        tradingViewIdentifier: 'LineToolCyclicLines',
        category: 'cycles',
        pointsCount: 2,
        pointLabels: ['P1', 'P2'],
        icon: CyclicLinesIcon,
      },
      {
        id: 'timeCycles',
        nameAr: 'دورات الزمن',
        nameEn: 'Time Cycles',
        tradingViewIdentifier: 'LineToolTimeCycles',
        category: 'cycles',
        pointsCount: 2,
        pointLabels: ['P1', 'P2'],
        icon: TimeCyclesIcon,
      },
      {
        id: 'sineLine',
        nameAr: 'خط جيبي',
        nameEn: 'Sine Line',
        tradingViewIdentifier: 'LineToolSineLine',
        category: 'cycles',
        pointsCount: 2,
        pointLabels: ['P1', 'P2'],
        icon: SineLineIcon,
      },
    ],
  },
];

// Helper to look up tool by ID
export const getPatternToolById = (id: string): PatternTool | undefined => {
  for (const group of PATTERNS_GROUPS) {
    const found = group.items.find(i => i.id === id);
    if (found) return found;
  }
  return undefined;
};

// ─── Harmonic Ratio Calculation and Validation Presets ──────────────────────

export interface HarmonicRatios {
  ab_xa?: number;
  bc_ab?: number;
  cd_bc?: number;
  xd_xa?: number;
  bc_xa?: number;
  cd_xc?: number;
}

export interface HarmonicValidationResult {
  status: 'valid' | 'warning' | 'invalid';
  matchedPattern?: string;
  score: number; // 0 to 100
  details: { label: string; ratio: number; target: number; inTolerance: boolean }[];
}

export const HARMONIC_PRESETS = {
  Gartley: {
    ab_xa: { min: 0.58, max: 0.65, ideal: 0.618 },
    bc_ab: { min: 0.35, max: 0.90, ideal: 0.618 },
    cd_bc: { min: 1.15, max: 1.70, ideal: 1.272 },
    xd_xa: { min: 0.74, max: 0.83, ideal: 0.786 },
  },
  Bat: {
    ab_xa: { min: 0.35, max: 0.55, ideal: 0.500 },
    bc_ab: { min: 0.35, max: 0.90, ideal: 0.618 },
    cd_bc: { min: 1.50, max: 2.70, ideal: 2.000 },
    xd_xa: { min: 0.84, max: 0.93, ideal: 0.886 },
  },
  Butterfly: {
    ab_xa: { min: 0.74, max: 0.83, ideal: 0.786 },
    bc_ab: { min: 0.35, max: 0.90, ideal: 0.618 },
    cd_bc: { min: 1.50, max: 2.70, ideal: 1.618 },
    xd_xa: { min: 1.20, max: 1.35, ideal: 1.272 },
  },
  Crab: {
    ab_xa: { min: 0.35, max: 0.65, ideal: 0.618 },
    bc_ab: { min: 0.35, max: 0.92, ideal: 0.618 },
    cd_bc: { min: 2.10, max: 3.80, ideal: 2.618 },
    xd_xa: { min: 1.50, max: 1.72, ideal: 1.618 },
  },
  Cypher: {
    ab_xa: { min: 0.35, max: 0.65, ideal: 0.500 },
    bc_xa: { min: 1.10, max: 1.45, ideal: 1.272 },
    cd_xc: { min: 0.74, max: 0.83, ideal: 0.786 },
  },
};

export const calculateHarmonicRatios = (prices: number[]): HarmonicRatios => {
  if (prices.length < 4) return {};

  const pX = prices[0];
  const pA = prices[1];
  const pB = prices[2];
  const pC = prices[3];
  const pD = prices[4];

  const xa = Math.abs(pA - pX);
  const ab = Math.abs(pB - pA);
  const bc = Math.abs(pC - pB);
  const cd = pD !== undefined ? Math.abs(pD - pC) : 0;
  const xd = pD !== undefined ? Math.abs(pD - pX) : 0;
  const xc = Math.abs(pC - pX);

  return {
    ab_xa: xa > 0 ? ab / xa : undefined,
    bc_ab: ab > 0 ? bc / ab : undefined,
    cd_bc: bc > 0 && pD !== undefined ? cd / bc : undefined,
    xd_xa: xa > 0 && pD !== undefined ? xd / xa : undefined,
    bc_xa: xa > 0 ? bc / xa : undefined,
    cd_xc: xc > 0 && pD !== undefined ? cd / xc : undefined,
  };
};

export const validateHarmonicPattern = (
  ratios: HarmonicRatios,
  patternName?: string,
  tolerancePercent: number = 10
): HarmonicValidationResult => {
  const tol = tolerancePercent / 100;
  let bestMatch: { name: string; score: number; status: 'valid' | 'warning' | 'invalid'; details: any[] } = {
    name: 'Harmonic',
    score: 0,
    status: 'invalid',
    details: [],
  };

  const presetsToTest = patternName && (HARMONIC_PRESETS as any)[patternName]
    ? { [patternName]: (HARMONIC_PRESETS as any)[patternName] }
    : HARMONIC_PRESETS;

  for (const [name, rules] of Object.entries(presetsToTest)) {
    let matches = 0;
    let total = 0;
    const details: any[] = [];

    for (const [key, ruleObj] of Object.entries(rules as any)) {
      const rule = ruleObj as any;
      const val = (ratios as any)[key];
      if (val === undefined) continue;
      total++;
      const inRange = val >= rule.min * (1 - tol) && val <= rule.max * (1 + tol);
      const isStrict = val >= rule.min && val <= rule.max;
      if (isStrict) matches += 1;
      else if (inRange) matches += 0.5;

      details.push({
        label: key.toUpperCase().replace('_', '/'),
        ratio: val,
        target: rule.ideal,
        inTolerance: inRange,
      });
    }

    const score = total > 0 ? (matches / total) * 100 : 0;
    if (score > bestMatch.score) {
      bestMatch = {
        name,
        score,
        status: score >= 80 ? 'valid' : score >= 50 ? 'warning' : 'invalid',
        details,
      };
    }
  }

  return {
    status: bestMatch.status,
    matchedPattern: bestMatch.name,
    score: Math.round(bestMatch.score),
    details: bestMatch.details,
  };
};
