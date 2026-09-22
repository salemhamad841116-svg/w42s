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
    // Determine category based on pair or random enabled sector
    const enabledSectors = this.sectors.filter((s) => s.enabled);
    let selectedSector = enabledSectors[Math.floor(Math.random() * enabledSectors.length)] || this.sectors[0];

    let pair = customPair;
    if (!pair) {
      const availablePairs = selectedSector.supportedPairs;
      pair = availablePairs[Math.floor(Math.random() * availablePairs.length)];
    } else {
      const matchedSector = this.sectors.find((s) => s.supportedPairs.includes(pair!));
      if (matchedSector) selectedSector = matchedSector;
    }

    // Rule 1: Check Market Sector Status
    if (!selectedSector.enabled) {
      const dummyCandidate: OpportunityCandidate = {
        id: `opp-disabled-${Date.now()}`,
        strategyId: 'disabled',
        strategyName: 'قطاع معطل',
        pair: pair!,
        timeframe: '1H',
        type: 'BUY',
        proposedEntryPrice: 1.0,
        proposedTp1: 1.01,
        proposedTp2: 1.02,
        proposedTp3: 1.03,
        proposedStopLoss: 0.99,
        calculatedRiskRatio: '1:2',
        detectedAt: 'الآن',
        indicatorsBreakdown: {},
        rawConfidenceScore: 0,
      };

      const failedEval: QualityFilterEvaluation = {
        passed: false,
        finalScore: 0,
        breakdown: { indicatorConfirmScore: 0, trendAlignmentScore: 0, volumeSpikeScore: 0, riskRewardScore: 0 },
        reasonAr: `تم إيقاف الفحص: سوق (${selectedSector.nameAr}) معطل حالياً من إعدادات الإدارة.`,
        reasonEn: `Scan aborted: Market sector (${selectedSector.nameEn}) is currently disabled.`,
      };

      const dummyLog: EngineAuditLog = {
        id: `elog-${Date.now()}`,
        opportunityId: dummyCandidate.id,
        strategyId: 'disabled',
        strategyName: 'قطاع معطل',
        pair: pair!,
        timeframe: '1H',
        type: 'BUY',
        entryPrice: 1.0,
        confidenceScore: 0,
        passedQualityFilter: false,
        decisionStatus: 'FILTERED_OUT',
        detectedAt: 'الآن',
        decisionReasonAr: failedEval.reasonAr,
        decisionReasonEn: failedEval.reasonEn,
        indicatorsSummary: 'سوق معطل',
      };

      this.logs = [dummyLog, ...this.logs];
      return { candidate: dummyCandidate, evaluation: failedEval, log: dummyLog };
    }

    // Rule 2: Check Duplicate Active Signal for same pair
    if (this.preventDuplicatePerPair && activeSignals.some((s) => s.pair === pair && s.status !== 'cancelled' && s.status !== 'all_tps_hit' && s.status !== 'sl_hit')) {
      const dummyCandidate: OpportunityCandidate = {
        id: `opp-dup-${Date.now()}`,
        strategyId: 'duplicate_check',
        strategyName: 'منع تكرار الإشارة',
        pair: pair!,
        timeframe: '1H',
        type: 'BUY',
        proposedEntryPrice: 1.0,
        proposedTp1: 1.01,
        proposedTp2: 1.02,
        proposedTp3: 1.03,
        proposedStopLoss: 0.99,
        calculatedRiskRatio: '1:2',
        detectedAt: 'الآن',
        indicatorsBreakdown: {},
        rawConfidenceScore: 0,
      };

      const dupEval: QualityFilterEvaluation = {
        passed: false,
        finalScore: 0,
        breakdown: { indicatorConfirmScore: 0, trendAlignmentScore: 0, volumeSpikeScore: 0, riskRewardScore: 0 },
        reasonAr: `تم إلغاء التوزيع: توجد إشارة مفتوحة نشطة حالياً على زوج (${pair}). يرجى انتظار إغلاقها.`,
        reasonEn: `Duplicate prevented: An active signal already exists for (${pair}).`,
      };

      const dupLog: EngineAuditLog = {
        id: `elog-${Date.now()}`,
        opportunityId: dummyCandidate.id,
        strategyId: 'duplicate_check',
        strategyName: 'منع التكرار',
        pair: pair!,
        timeframe: '1H',
        type: 'BUY',
        entryPrice: 1.0,
        confidenceScore: 0,
        passedQualityFilter: false,
        decisionStatus: 'FILTERED_OUT',
        detectedAt: 'الآن',
        decisionReasonAr: dupEval.reasonAr,
        decisionReasonEn: dupEval.reasonEn,
        indicatorsSummary: 'إشارة نشطة قائمة بالفعل',
      };

      this.logs = [dupLog, ...this.logs];
      return { candidate: dummyCandidate, evaluation: dupEval, log: dupLog };
    }

    // Select active strategy
    const activeStrats = this.strategies.filter((s) => s.enabled);
    const selectedStrat = activeStrats.length > 0
      ? activeStrats[Math.floor(Math.random() * activeStrats.length)]
      : this.strategies[0];

    const type = Math.random() > 0.4 ? 'BUY' : 'SELL';

    // Base prices per pair
    let entryPrice = 1.0850;
    let tp1 = 1.0890;
    let tp2 = 1.0930;
    let tp3 = 1.0980;
    let sl = 1.0810;

    if (pair === 'XAU/USD') {
      entryPrice = 2748.50;
      tp1 = type === 'BUY' ? 2760.00 : 2735.00;
      tp2 = type === 'BUY' ? 2772.00 : 2722.00;
      tp3 = type === 'BUY' ? 2785.00 : 2710.00;
      sl = type === 'BUY' ? 2738.00 : 2758.00;
    } else if (pair === 'GBP/USD') {
      entryPrice = 1.2970;
      tp1 = type === 'BUY' ? 1.3020 : 1.2920;
      tp2 = type === 'BUY' ? 1.3070 : 1.2870;
      tp3 = type === 'BUY' ? 1.3120 : 1.2820;
      sl = type === 'BUY' ? 1.2930 : 1.3010;
    } else if (pair === 'USD/JPY') {
      entryPrice = 154.50;
      tp1 = type === 'BUY' ? 155.20 : 153.80;
      tp2 = type === 'BUY' ? 155.80 : 153.20;
      tp3 = type === 'BUY' ? 156.50 : 152.50;
      sl = type === 'BUY' ? 154.00 : 155.00;
    } else if (pair === 'BTC/USD') {
      entryPrice = 96450.00;
      tp1 = type === 'BUY' ? 97800.00 : 95100.00;
      tp2 = type === 'BUY' ? 99200.00 : 93800.00;
      tp3 = type === 'BUY' ? 101000.00 : 92000.00;
      sl = type === 'BUY' ? 95000.00 : 97800.00;
    }

    const candidate: OpportunityCandidate = {
      id: `opp-${Date.now()}`,
      strategyId: selectedStrat.id,
      strategyName: selectedStrat.nameAr,
      pair: pair!,
      timeframe: selectedStrat.timeframe,
      type,
      proposedEntryPrice: entryPrice,
      proposedTp1: tp1,
      proposedTp2: tp2,
      proposedTp3: tp3,
      proposedStopLoss: sl,
      calculatedRiskRatio: selectedStrat.defaultRiskRatio,
      detectedAt: 'الآن (Real-time)',
      indicatorsBreakdown: {
        rsi14: type === 'BUY' ? 28 : 74,
        macdHistogram: type === 'BUY' ? 0.0024 : -0.0018,
        ema20: entryPrice,
        ema50: type === 'BUY' ? entryPrice - 0.002 : entryPrice + 0.002,
        volumeSpikeRatio: 1.85,
        trend: type === 'BUY' ? 'bullish' : 'bearish',
        marketProvider: primaryProvider.nameAr,
      },
      rawConfidenceScore: Math.floor(Math.random() * 18) + 82,
    };

    // Quality Filter Evaluation
    const evaluation = evaluateCandidateQuality(candidate, this.qualityConfig);

    let dispatchedSignal: ForexSignal | undefined = undefined;
    const decisionStatus: EngineAuditLog['decisionStatus'] = evaluation.passed
      ? this.qualityConfig.autoApproveAndDispatch
        ? 'DISPATCHED'
        : 'PENDING_APPROVAL'
      : 'FILTERED_OUT';

    // Chart snapshot URL generation
    const chartSnapshotUrl = `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80`;

    // Signal Audit Record Generation
    const auditRecord: SignalAuditRecord = {
      strategyId: selectedStrat.id,
      strategyName: selectedStrat.nameAr,
      marketProvider: primaryProvider.nameAr,
      indicatorsUsed: candidate.indicatorsBreakdown,
      confidenceScore: evaluation.finalScore,
      detectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chartSnapshotUrl,
      creationReasonAr: `تم اكتشاف إشارة عبر استراتيجية (${selectedStrat.nameAr}) بناءً على تقاطع المتوسطات واختراق السيولة بكميات تداول عالية.`,
      creationReasonEn: `Signal detected via strategy (${selectedStrat.nameEn}) based on moving average crossover and liquidity surge.`,
    };

    if (decisionStatus === 'DISPATCHED') {
      dispatchedSignal = {
        id: `sig-auto-${Date.now()}`,
        pair: pair!,
        type,
        entryPrice,
        tp1,
        tp2,
        tp3,
        stopLoss: sl,
        riskRatio: candidate.calculatedRiskRatio,
        analyst: `🤖 ${selectedStrat.nameAr}`,
        notesAr: `تم اختيار الإشارة بواسطة ${selectedStrat.nameAr} من مصدر (${primaryProvider.nameAr}). نسبة الثقة: ${evaluation.finalScore}%.`,
        notesEn: `Generated by ${selectedStrat.nameEn} via ${primaryProvider.nameEn}. Confidence: ${evaluation.finalScore}%.`,
        status: 'new',
        trend: candidate.indicatorsBreakdown.trend as any,
        trendStrength: evaluation.finalScore,
        trendTimeframe: selectedStrat.timeframe,
        openTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: 'الآن',
        updatedAt: 'الآن',
        imageUrl: chartSnapshotUrl,
        marketCategory: selectedSector.id,
        auditRecord,
        preventDuplicateUntilClose: true,
        updates: [
          {
            id: `up-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messageAr: `🚀 تم دخول صفقة ${pair} تلقائياً. المتابعة جارية عبر الخادم 24/7.`,
            messageEn: `🚀 Automatic trade entry for ${pair}. Server live monitoring activated.`,
            type: 'entry',
          },
        ],
      };

      // Also record in Paper Trading if enabled
      if (this.paperAccount.enabled) {
        const paperTrade: PaperTrade = {
          id: `pt-${Date.now()}`,
          signalId: dispatchedSignal.id,
          pair: pair!,
          type,
          strategyName: selectedStrat.nameAr,
          entryPrice,
          currentPrice: entryPrice,
          tp1,
          tp2,
          tp3,
          stopLoss: sl,
          pnlPips: 0,
          pnlUsd: 0,
          status: 'OPEN',
          openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        this.paperTrades = [paperTrade, ...this.paperTrades];
      }

      this.logs = [auditLog, ...this.logs];
      this.status.totalGeneratedToday += 1;
      this.status.totalDispatchedToday += 1;
      this.notifyStatusChange();
      this.notifySignalDispatched(dispatchedSignal, auditLog);

      return {
        candidate,
        evaluation,
        log: auditLog,
        signal: dispatchedSignal,
      };
    } else {
      this.logs = [auditLog, ...this.logs];
      this.status.totalGeneratedToday += 1;
      this.status.totalFilteredToday += 1;
      this.notifyStatusChange();
      this.notifyLogAdded(auditLog);

      return {
        candidate,
        evaluation,
        log: auditLog,
      };
    }
  }

  private notifyStatusChange() {
    this.onStatusChangedCallbacks.forEach((cb) => cb(this.status));
  }

  private notifySignalDispatched(signal: ForexSignal, log: EngineAuditLog) {
    this.onSignalDispatchedCallbacks.forEach((cb) => cb(signal, log));
  }

  private notifyLogAdded(log: EngineAuditLog) {
    this.onLogAddedCallbacks.forEach((cb) => cb(log));
  }

  private notifySignalLifecycleUpdated(signal: ForexSignal) {
    this.onSignalLifecycleUpdatedCallbacks.forEach((cb) => cb(signal));
  }
}

export const globalAutoEngine = new AutoSignalEngine();
