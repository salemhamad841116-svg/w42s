export interface StrategyPlugin {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  author: string;
  version: string;
  timeframe: string; // e.g. "15M", "1H", "4H"
  enabled: boolean;
  supportedPairs: string[];
  minConfidenceThreshold: number; // e.g. 80
  defaultRiskRatio: string; // e.g. "1:2.5"
  params: StrategyParamConfig[];
  performanceStats: {
    signalsGenerated: number;
    winRate: number; // percentage e.g. 88.5
    avgPipsGained: number;
    totalPips: number;
  };
}

export interface MarketTick {
  pair: string;
  price: number;
  timeframe: string;
  rsi14: number;
  ema20: number;
  ema50: number;
  macdHistogram: number;
  volumeSpikeRatio: number;