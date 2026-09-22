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

  public getPreventDuplicatePerPair(): boolean {
    return this.preventDuplicatePerPair;
  }

  // Setters & Control Actions
  public setPreventDuplicatePerPair(prevent: boolean): boolean {
    this.preventDuplicatePerPair = prevent;
    return this.preventDuplicatePerPair;
  }

  public toggleProviderStatus(providerId: string): MarketDataProviderConfig[] {
    this.providers = this.providers.map((p) => {
      if (p.id === providerId) {
        const nextStatus = p.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
        return {
          ...p,
          status: nextStatus,
          latencyMs: nextStatus === 'CONNECTED' ? Math.floor(Math.random() * 25) + 12 : 0,
          lastTickTime: nextStatus === 'CONNECTED' ? 'مباشر (Live)' : 'غير متصل',
        };
      }
      return p;
    });
    return this.providers;
  }

  public setPrimaryProvider(providerId: string): MarketDataProviderConfig[] {
    this.providers = this.providers.map((p) => ({
      ...p,
      isPrimary: p.id === providerId,
    }));
    return this.providers;
  }

  public toggleSector(sectorId: string): MarketSectorConfig[] {
    this.sectors = this.sectors.map((sec) => {
      if (sec.id === sectorId) {
        return { ...sec, enabled: !sec.enabled };
      }
      return sec;
    });
    return this.sectors;
  }

  public togglePaperTrading(enabled?: boolean): PaperAccount {
    this.paperAccount = {
      ...this.paperAccount,
      enabled: enabled !== undefined ? enabled : !this.paperAccount.enabled,
    };
    return this.paperAccount;
  }

  // Event Subscription
  public onSignalDispatched(cb: (signal: ForexSignal, log: EngineAuditLog) => void) {
    this.onSignalDispatchedCallbacks.push(cb);
  }

  public onLogAdded(cb: (log: EngineAuditLog) => void) {
    this.onLogAddedCallbacks.push(cb);
  }

  public injectCustomGeneratedSignal(signal: ForexSignal) {
    const log: EngineAuditLog = {
      id: `elog-${Date.now()}`,
      opportunityId: signal.id,
      strategyId: 'pine_script_v5',
      strategyName: 'Pine Script Strategy Engine',
      pair: signal.pair,
      timeframe: '15M',
      type: signal.type,
      entryPrice: signal.entryPrice,
      confidenceScore: 94,
      passedQualityFilter: true,
      decisionStatus: 'DISPATCHED',
      detectedAt: 'الآن',
      decisionReasonAr: signal.notesAr || 'تم إنشاء الإشارة تلقائياً بواسطة كود Pine Script V5.',
      decisionReasonEn: signal.notesEn || 'Signal created automatically by Pine Script V5.',
      indicatorsSummary: 'Pine Script Professional Pivot Right Fixed (ATR Pivot Steps)',
    };

    this.logs = [log, ...this.logs];
    this.status.totalGeneratedToday += 1;
    this.notifyStatusChange();
    this.notifySignalDispatched(signal, log);
  }

  public onStatusChanged(cb: (status: EngineSystemStatus) => void) {
    this.onStatusChangedCallbacks.push(cb);
  }

  public onSignalLifecycleUpdated(cb: (updatedSignal: ForexSignal) => void) {
    this.onSignalLifecycleUpdatedCallbacks.push(cb);
  }

  // Admin Control Actions
  public toggleEngineRunning(running?: boolean): EngineSystemStatus {
    const nextState = running !== undefined ? running : !this.status.isRunning;
    this.status = {
      ...this.status,
      isRunning: nextState,
      statusMode: nextState ? 'ONLINE_24_7' : 'PAUSED',
    };
    this.notifyStatusChange();
    return this.status;
  }

  public toggleStrategy(strategyId: string, enabled?: boolean): StrategyPlugin[] {
    this.strategies = this.strategies.map((strat) => {
      if (strat.id === strategyId) {
        return {
          ...strat,
          enabled: enabled !== undefined ? enabled : !strat.enabled,
        };
      }
      return strat;
    });

    this.status.activeStrategiesCount = this.strategies.filter((s) => s.enabled).length;
    this.notifyStatusChange();
    return this.strategies;
  }

  public updateStrategyParams(strategyId: string, updatedParams: StrategyPlugin['params']): StrategyPlugin[] {
    this.strategies = this.strategies.map((strat) => {
      if (strat.id === strategyId) {
        return { ...strat, params: updatedParams };
      }
      return strat;
    });
    return this.strategies;
  }

  public updateQualityFilterConfig(partialConfig: Partial<QualityFilterConfig>): QualityFilterConfig {
    this.qualityConfig = { ...this.qualityConfig, ...partialConfig };
    return this.qualityConfig;
  }

  public addCustomStrategyPlugin(newStrategy: StrategyPlugin): StrategyPlugin[] {
    this.strategies = [newStrategy, ...this.strategies];
    this.status.activeStrategiesCount = this.strategies.filter((s) => s.enabled).length;
    this.notifyStatusChange();
    return this.strategies;
  }

  // Execute Backtest
  public executeBacktest(config: BacktestConfig): BacktestResult {
    const targetStrat = this.strategies.find((s) => s.id === config.strategyId);
    const stratName = targetStrat ? targetStrat.nameAr : config.strategyId;
    const result = runBacktest(config, stratName);
    this.backtestHistory = [result, ...this.backtestHistory];
    return result;
  }

  // Trigger Market Scan and Auto Signal Dispatching
  public triggerManualScan(
    customPair?: string,
    activeSignals: ForexSignal[] = []
  ): { candidate: OpportunityCandidate; evaluation: QualityFilterEvaluation; log: EngineAuditLog; signal?: ForexSignal } {
    const primaryProvider = this.providers.find((p) => p.isPrimary) || this.providers[0];
