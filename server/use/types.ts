/**
 * Universal Strategy Engine — Core Type Definitions
 * 
 * All interfaces and types used throughout the USE system.
 * This is the single source of truth for data shapes.
 */

// ──────────────────────────────────────────────
// DIRECTION & STATE ENUMS
// ──────────────────────────────────────────────

export type DirectionState =
  | 'STRONG_BULLISH'
  | 'BULLISH'
  | 'NEUTRAL'
  | 'BEARISH'
  | 'STRONG_BEARISH';

export type MarketRegime =
  | 'TRENDING_UP'
  | 'TRENDING_DOWN'
  | 'RANGE'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY'
  | 'BREAKOUT'
  | 'UNCERTAIN';

export type StrategyStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'BACKTESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'DISABLED';

export type StrategyLanguage = 'javascript' | 'typescript' | 'pinescript' | 'mql5' | 'python';

export type DataQuality = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

export type TradeSide = 'BUY' | 'SELL';

// ──────────────────────────────────────────────
// OHLCV & FEATURE VECTOR
// ──────────────────────────────────────────────

export interface OHLCV {
  time: number;    // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FeatureVector {
  time: number;

  // Raw OHLCV
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;

  // Returns
  returnPct: number;          // (close - prevClose) / prevClose
  logReturn: number;

  // Trend indicators
  sma20: number;
  sma50: number;
  sma200: number;
  ema9: number;
  ema20: number;
  ema50: number;

  // Momentum
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  momentum10: number;
  roc10: number;

  // Volatility
  atr14: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbWidth: number;
  stdDev20: number;

  // Volume
  volumeSma20: number;
  relativeVolume: number;

  // Candle structure
  bodyPct: number;            // |close - open| / (high - low)
  upperWickPct: number;
  lowerWickPct: number;
  rangePct: number;           // (high - low) / close

  // Temporal
  hourOfDay: number;
  dayOfWeek: number;
  session: 'ASIA' | 'EUROPE' | 'AMERICAS';

  // Multi-timeframe context (optional, provided externally)
  htfTrendDirection?: DirectionState;

  // Regime
  regime?: MarketRegime;
}

// ──────────────────────────────────────────────
// UNIVERSAL STRATEGY REPRESENTATION (USR)
// ──────────────────────────────────────────────

export interface StrategyParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: number | string | boolean;
  min?: number;
  max?: number;
  description: string;
}

export interface IndicatorDependency {
  name: string;       // e.g. 'RSI', 'EMA', 'MACD'
  params: Record<string, number>;  // e.g. { period: 14 }
}

export interface EntryRule {
  id: string;
  description: string;
  side: TradeSide;
  conditions: string[];  // Human-readable conditions extracted from strategy
}

export interface ExitRule {
  id: string;
  description: string;
  conditions: string[];
}

export interface RiskRule {
  slType: 'PERCENTAGE' | 'ATR_MULTIPLE' | 'FIXED_POINTS';
  slValue: number;
  tpType: 'PERCENTAGE' | 'ATR_MULTIPLE' | 'RISK_REWARD' | 'FIXED_POINTS';
  tpValue: number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  language: StrategyLanguage;
  version: string;
  status: StrategyStatus;

  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
  };

  parameters: StrategyParameter[];
  indicators: IndicatorDependency[];
  entryRules: EntryRule[];
  exitRules: ExitRule[];
  riskRules: RiskRule[];

  timeframeRules: {
    primary: string;           // e.g. '5m'
    confirmations: string[];   // e.g. ['15m', '1h']
  };

  dependencies: {
    minLookback: number;       // Minimum candles needed
    requiredIndicators: string[];
    requiredFeatures: string[];
  };

  // Raw source code (stored but never executed directly on main server)
  sourceCode: string;
}

// ──────────────────────────────────────────────
// FORECAST TYPES
// ──────────────────────────────────────────────

export interface HorizonForecast {
  timeframe: string;
  direction: DirectionState;
  directionProbability: number;  // 0.0 to 1.0
  confidence: number;            // 0.0 to 1.0
  signalStrength: number;        // 0.0 to 1.0
  dataQuality: DataQuality;
  sampleSize: number;
  historicalHitRate: number;     // 0.0 to 1.0
}

export interface DirectionMatrixResult {
  symbol: string;
  timestamp: number;
  regime: MarketRegime;
  horizons: HorizonForecast[];
}

export interface NextCandleForecast {
  symbol: string;
  timeframe: string;
  timestamp: number;
  bullishProbability: number;   // 0.0 to 1.0
  bearishProbability: number;
  neutralProbability: number;
  expectedReturn: number;
  expectedRangeHigh: number;
  expectedRangeLow: number;
  expectedVolatility: number;
  confidence: number;
  dataQuality: DataQuality;
  sampleSize: number;
  modelVersion: string;
}

// ──────────────────────────────────────────────
// BACKTEST TYPES
// ──────────────────────────────────────────────

export interface BacktestTrade {
  entryTime: number;
  exitTime: number;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  isWin: boolean;
  holdingPeriodBars: number;
  regime: MarketRegime;
  hourOfDay: number;
  dayOfWeek: number;
}

export interface PerformanceBreakdown {
  category: string;  // e.g. 'Monday', 'Hour 14', 'January', 'TRENDING_UP'
  trades: number;
  winRate: number;
  avgReturn: number;
  profitFactor: number;
}

export interface BacktestResult {
  strategyId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;

  // Core metrics
  totalTrades: number;
  winRate: number;
  lossRate: number;
  expectancy: number;         // Average return per trade
  profitFactor: number;       // gross profit / gross loss
  maxDrawdownPct: number;
  avgReturnPct: number;
  avgWinPct: number;
  avgLossPct: number;
  sharpeRatio: number;

  // Excursion analysis
  avgFavorableExcursion: number;
  avgAdverseExcursion: number;
  avgTimeToTarget: number;    // bars
  avgTimeToFailure: number;   // bars

  // Side performance
  longTrades: number;
  longWinRate: number;
  shortTrades: number;
  shortWinRate: number;

  // Breakdowns
  byHour: PerformanceBreakdown[];
  byWeekday: PerformanceBreakdown[];
  byMonth: PerformanceBreakdown[];
  byRegime: PerformanceBreakdown[];

  // Overfitting detection
  trainPerformance: number;   // win rate on training set
  validationPerformance: number;
  oosPerformance: number;     // out-of-sample
  overfittingRisk: boolean;

  // Trades
  trades: BacktestTrade[];

  computedAt: string;
}

// ──────────────────────────────────────────────
// CONFIDENCE & EXPLANATION
// ──────────────────────────────────────────────

export interface FeatureContribution {
  feature: string;
  contribution: number;   // positive = supporting, negative = contradicting
  description: string;
}

export interface PredictionExplanation {
  predictionId: string;
  supporting: FeatureContribution[];
  contradicting: FeatureContribution[];
  netScore: number;
}

// ──────────────────────────────────────────────
// PREDICTION AUDIT LOG
// ──────────────────────────────────────────────

export interface PredictionRecord {
  predictionId: string;
  timestamp: number;
  symbol: string;
  timeframe: string;
  strategyVersion: string;
  modelVersion: string;
  inputDataVersion: string;
  marketRegime: MarketRegime;
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  confidence: number;
  expectedRangeHigh: number;
  expectedRangeLow: number;
  actualResult: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null;  // null = pending
  actualClose: number | null;
  evaluationStatus: 'PENDING' | 'EVALUATED' | 'EXPIRED';
}

// ──────────────────────────────────────────────
// REGIME ANALYSIS
// ──────────────────────────────────────────────

export interface RegimeAnalysis {
  currentRegime: MarketRegime;
  regimeConfidence: number;
  strategyPerformanceInRegime: {
    samples: number;
    successRate: number;
    avgReturn: number;
  } | null;
}

// ──────────────────────────────────────────────
// CONFLUENCE ENGINE TYPES
// ──────────────────────────────────────────────

export type DecisionState = 'STRONG_BUY' | 'BUY' | 'NO_TRADE' | 'SELL' | 'STRONG_SELL';
export type SignalGrade = 'A+' | 'A' | 'B' | 'C' | 'NO_TRADE';

export interface EVMetrics {
  winProbability: number;
  lossProbability: number;
  avgWinDistance: number;
  avgLossDistance: number;
  tradingCosts: number;
  expectedValue: number;
}

export interface CalibrationMetrics {
  bucket: string; // e.g. "60-70%"
  sampleSize: number;
  predictedMean: number;
  actualWinRate: number;
  calibrationError: number;
}

export interface ConfluenceResult {
  symbol: string;
  timeframe: string;
  timestamp: number;
  marketRegime: MarketRegime;
  htfBias: DirectionState;
  ltfSetup: DirectionState;
  nextCandleForecast: DirectionState;
  confidence: number;
  confluenceScore: number;
  evMetrics: EVMetrics;
  finalDecision: DecisionState;
  signalGrade: SignalGrade;
  reasons: string[];
}
