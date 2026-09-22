import { BaseStrategy, TradingSignal, tradingSignalToForexSignal, LevelRuleConfig } from './BaseStrategy';
import { CamarillaStrategy } from './CamarillaStrategy';
import { FibonacciStrategy } from './FibonacciStrategy';
import { RSIStrategy } from './RSIStrategy';
import { EMAStrategy } from './EMAStrategy';
import { ICTStrategy } from './ICTStrategy';
import { SMCStrategy } from './SMCStrategy';
import { ForexSignal } from '../../types';

export class StrategyRegistryManager {
  private strategies: Map<string, BaseStrategy> = new Map();
  private listeners: (() => void)[] = [];

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    const camarilla = new CamarillaStrategy();
    const fibonacci = new FibonacciStrategy();
    const rsi = new RSIStrategy();
    const ema = new EMAStrategy();
    const ict = new ICTStrategy();
    const smc = new SMCStrategy();

    this.strategies.set(camarilla.id, camarilla);
    this.strategies.set(fibonacci.id, fibonacci);
    this.strategies.set(rsi.id, rsi);
    this.strategies.set(ema.id, ema);
    this.strategies.set(ict.id, ict);
    this.strategies.set(smc.id, smc);
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getAllStrategies(): BaseStrategy[] {
    return Array.from(this.strategies.values());
  }

  public getStrategy(id: string): BaseStrategy | undefined {
    return this.strategies.get(id);
  }

  public toggleStrategy(id: string, enabled?: boolean) {
    const strat = this.strategies.get(id);
    if (strat) {
      strat.enabled = enabled !== undefined ? enabled : !strat.enabled;
      this.notify();
    }
  }

  public updateStrategyRules(id: string, newRules: Partial<LevelRuleConfig>) {
    const strat = this.strategies.get(id);
    if (strat) {
      strat.updateDraftRules(newRules);
      this.notify();
    }
  }

  public publishStrategyDraft(id: string, versionLabel: string, changeReason: string, author?: string) {
    const strat = this.strategies.get(id);
    if (strat) {
      strat.publishDraft(versionLabel, changeReason, author);
      this.notify();
    }
  }

  public rollbackStrategyVersion(id: string, versionId: string, author?: string) {
    const strat = this.strategies.get(id);
    if (strat) {
      strat.rollbackToVersion(versionId, author);
      this.notify();
    }
  }

  public runStrategyBacktest(id: string, symbol?: string, tradesCount?: number) {
    const strat = this.strategies.get(id);
    if (strat) {
      return strat.runBacktest(symbol, tradesCount);
    }
    return null;
  }

  public evaluateAllCircuitBreakers() {
    let triggeredAny = false;
    this.strategies.forEach((strat) => {
      const breached = strat.evaluateCircuitBreaker();
      if (breached) triggeredAny = true;
    });
    if (triggeredAny) {
      this.notify();
    }
  }

  public processTradingViewWebhook(payload: {
    secret: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    strategy?: string;
    timeframe?: string;
  }): ForexSignal {
    const strategyId = payload.strategy || 'camarilla_pivot';
    const formattedPair = payload.ticker.includes('/')
      ? payload.ticker
      : payload.ticker.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');

    const { forexSignal } = this.generateSignalFromStrategy(
      strategyId,
      formattedPair,
      payload.price,
      payload.action,
      payload.timeframe || '15M'
    );

    return forexSignal;
  }

  /**
   * Execute strategy calculation and signal generation for a specific strategy
   */
  public generateSignalFromStrategy(
    strategyId: string,
    symbol: string,
    currentPrice: number,
    direction: 'BUY' | 'SELL',
    timeframe: string = '15M'
  ): { rawSignal: TradingSignal; forexSignal: ForexSignal } {
    const strat = this.strategies.get(strategyId);
    if (!strat) {
      throw new Error(`Strategy with ID '${strategyId}' not found in registry`);
    }

    const rawSignal: TradingSignal = strat.generateSignal(symbol, currentPrice, direction, timeframe);
    const forexSignal: ForexSignal = tradingSignalToForexSignal(rawSignal, timeframe);

    return { rawSignal, forexSignal };
  }
}

export const globalStrategyRegistry = new StrategyRegistryManager();
