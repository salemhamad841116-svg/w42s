import {
  ForexSignal,
  StrategyPlugin,
  QualityFilterConfig,
  QualityFilterEvaluation,
  EngineAuditLog,
  EngineSystemStatus,
  OpportunityCandidate,
  MarketDataProviderConfig,
  MarketSectorConfig,
  BacktestConfig,
  BacktestResult,
  PaperAccount,
  PaperTrade,
  SignalAuditRecord,
  SignalUpdate,
} from '../types';
import { INITIAL_STRATEGY_PLUGINS } from './strategies/defaultStrategies';
import { DEFAULT_QUALITY_FILTER_CONFIG, evaluateCandidateQuality } from './QualityFilter';
import { INITIAL_ENGINE_LOGS, INITIAL_ENGINE_STATUS } from '../data/mockEngineLogs';
import { INITIAL_MARKET_PROVIDERS, INITIAL_MARKET_SECTORS } from '../data/mockMarketProviders';
import { runBacktest } from './BacktestEngine';
import { INITIAL_PAPER_ACCOUNT, INITIAL_PAPER_TRADES } from './PaperTradingEngine';

export class AutoSignalEngine {
  private strategies: StrategyPlugin[];
  private qualityConfig: QualityFilterConfig;
  private logs: EngineAuditLog[];
  private status: EngineSystemStatus;
  private providers: MarketDataProviderConfig[];
  private sectors: MarketSectorConfig[];
  private paperAccount: PaperAccount;
  private paperTrades: PaperTrade[];
  private backtestHistory: BacktestResult[];
  private preventDuplicatePerPair: boolean = true;

  private onSignalDispatchedCallbacks: ((signal: ForexSignal, log: EngineAuditLog) => void)[] = [];
  private onLogAddedCallbacks: ((log: EngineAuditLog) => void)[] = [];
  private onStatusChangedCallbacks: ((status: EngineSystemStatus) => void)[] = [];
  private onSignalLifecycleUpdatedCallbacks: ((updatedSignal: ForexSignal) => void)[] = [];

  constructor() {
    this.strategies = [...INITIAL_STRATEGY_PLUGINS];
    this.qualityConfig = { ...DEFAULT_QUALITY_FILTER_CONFIG };
    this.logs = [...INITIAL_ENGINE_LOGS];
    this.status = { ...INITIAL_ENGINE_STATUS };
    this.providers = [...INITIAL_MARKET_PROVIDERS];
    this.sectors = [...INITIAL_MARKET_SECTORS];
    this.paperAccount = { ...INITIAL_PAPER_ACCOUNT };
    this.paperTrades = [...INITIAL_PAPER_TRADES];
    this.backtestHistory = [];
  }

  // Getters
  public getStrategies(): StrategyPlugin[] {
    return this.strategies;
  }

  public getQualityConfig(): QualityFilterConfig {
    return this.qualityConfig;
  }

  public getLogs(): EngineAuditLog[] {
    return this.logs;
  }

  public getStatus(): EngineSystemStatus {
    return this.status;
  }

  public getProviders(): MarketDataProviderConfig[] {
    return this.providers;
  }

  public getSectors(): MarketSectorConfig[] {
    return this.sectors;
  }

  public getPaperAccount(): PaperAccount {
    return this.paperAccount;
  }

  public getPaperTrades(): PaperTrade[] {
    return this.paperTrades;
  }

  public getBacktestHistory(): BacktestResult[] {
    return this.backtestHistory;
  }
