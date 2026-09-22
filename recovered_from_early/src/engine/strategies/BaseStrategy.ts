import { ForexSignal } from '../../types';

export interface TradingSignal {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfits: number[];
  confidence: number;
  strategy: string;
  reason: string;
  createdAt: Date;
}

export interface LevelRuleConfig {
  buyEntryLevel: string;
  sellEntryLevel: string;
  takeProfitLevels: string[];
  stopLossLevel: string;
  availableBuyLevels: string[];
  availableSellLevels: string[];
  availableTpLevels: string[];
  availableSlLevels: string[];
}

export interface StrategyVersion {
  id: string;
  version: string;
  createdAt: string;
  author: string;
  changeReason: string;
  levelRules: LevelRuleConfig;
  isPublished: boolean;
}

export interface StrategyPerformanceMetrics {
  totalSignals: number;
  winRate: number;
  winningTrades: number;
  losingTrades: number;
  consecutiveLosses: number;
  avgWinPips: number;
  avgLossPips: number;
  profitFactor: number;
  maxDrawdown: number;
  bestPair: string;
  worstPair: string;
  bestTimeframe: string;
  stats7d: { total: number; winRate: number; profitFactor: number };
  stats30d: { total: number; winRate: number; profitFactor: number };
  stats90d: { total: number; winRate: number; profitFactor: number };
  circuitBreakerTriggered: boolean;
  circuitBreakerReason?: string;
}

export interface CircuitBreakerConfig {
  minWinRateThreshold: number; // default 40%
  maxConsecutiveLossesThreshold: number; // default 10
  autoDisableOnBreach: boolean;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  wins: number;
  losses: number;
  profitFactor: number;
  maxDrawdown: number;
  netPips: number;
  tradesLog: {
    id: string;
    pair: string;
    type: 'BUY' | 'SELL';
    entry: number;
    exit: number;
    pips: number;
    isWin: boolean;
    date: string;
  }[];
}

export abstract class BaseStrategy {
  public id: string;
  public name: string;
  public description: string;
  public enabled: boolean = true;

  // Active Published Rules vs Draft Rules
  public levelRules: LevelRuleConfig;
  public draftRules: LevelRuleConfig;
  public isDraftModified: boolean = false;

  // Version Control History
  public versions: StrategyVersion[] = [];

  // Circuit Breaker & Performance
  public circuitBreakerConfig: CircuitBreakerConfig = {
    minWinRateThreshold: 40,
    maxConsecutiveLossesThreshold: 10,
    autoDisableOnBreach: true,
  };

  public performance: StrategyPerformanceMetrics;

  constructor(
    id: string,
    name: string,
    description: string,
    levelRules: LevelRuleConfig,
    initialPerformance?: Partial<StrategyPerformanceMetrics>
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.levelRules = JSON.parse(JSON.stringify(levelRules));
    this.draftRules = JSON.parse(JSON.stringify(levelRules));

    // Initial Version v1.0
    const initialVersion: StrategyVersion = {
      id: `ver-v1.0-${Date.now()}`,
      version: 'v1.0',
      createdAt: new Date().toISOString(),
      author: 'مدير النظام (System Admin)',
      changeReason: 'الإصدار الأول الأولي للاستراتيجية (Initial Baseline Release)',
      levelRules: JSON.parse(JSON.stringify(levelRules)),
      isPublished: true,
    };
    this.versions.push(initialVersion);

    // Initial default metrics
    this.performance = {
      totalSignals: initialPerformance?.totalSignals ?? 142,
      winRate: initialPerformance?.winRate ?? 76.5,
      winningTrades: initialPerformance?.winningTrades ?? 108,
      losingTrades: initialPerformance?.losingTrades ?? 34,
      consecutiveLosses: initialPerformance?.consecutiveLosses ?? 2,
      avgWinPips: initialPerformance?.avgWinPips ?? 35.4,
      avgLossPips: initialPerformance?.avgLossPips ?? 18.2,
      profitFactor: initialPerformance?.profitFactor ?? 2.38,
      maxDrawdown: initialPerformance?.maxDrawdown ?? 6.2,
      bestPair: initialPerformance?.bestPair ?? 'XAU/USD',
      worstPair: initialPerformance?.worstPair ?? 'EUR/USD',
      bestTimeframe: initialPerformance?.bestTimeframe ?? '15M',
      stats7d: initialPerformance?.stats7d ?? { total: 24, winRate: 79.1, profitFactor: 2.52 },
      stats30d: initialPerformance?.stats30d ?? { total: 86, winRate: 75.8, profitFactor: 2.31 },
      stats90d: initialPerformance?.stats90d ?? { total: 142, winRate: 76.5, profitFactor: 2.38 },
      circuitBreakerTriggered: false,
    };
  }
