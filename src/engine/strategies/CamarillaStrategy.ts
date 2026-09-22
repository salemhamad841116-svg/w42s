import { BaseStrategy, TradingSignal, LevelRuleConfig } from './BaseStrategy';

export interface CamarillaCalculatedLevels extends Record<string, number> {
  highEdge: number; // R3
  lowEdge: number;  // S3
  pivot: number;    // P0
  fullRange: number;
  step0: number;    // R2
  step1: number;    // R1
  step2: number;    // S1
  step3: number;    // S2
}

export class CamarillaStrategy extends BaseStrategy {
  public atrPeriod: number = 14;
  public multiplier: number = 1.0;

  constructor() {
    const defaultRules: LevelRuleConfig = {
      buyEntryLevel: 'R1',
      sellEntryLevel: 'S1',
      takeProfitLevels: ['R2', 'R3', 'R4'],
      stopLossLevel: 'S3',
      availableBuyLevels: ['R1', 'R2', 'Pivot', 'S1'],
      availableSellLevels: ['S1', 'S2', 'Pivot', 'R1'],
      availableTpLevels: ['R2', 'R3', 'R4', 'S2', 'S3', 'S4'],
      availableSlLevels: ['S3', 'R3', 'Pivot'],
    };

    super(
      'camarilla_pivot',
      'Camarilla ATR Pivot Strategy',
      'استراتيجية الارتكاز المحسوبة ديناميكياً بحسب معادلات Camarilla + ATR',
      defaultRules
    );
  }

  public calculate(symbol: string, currentPrice: number): CamarillaCalculatedLevels {
    const isGoldOrCrypto = currentPrice > 100;
    const defaultAtrPips = isGoldOrCrypto ? 15.0 : 0.0025;
    const range = defaultAtrPips * this.multiplier;

    const highEdge = Number((currentPrice + range * 1.1 / 4).toFixed(isGoldOrCrypto ? 2 : 5));
    const lowEdge = Number((currentPrice - range * 1.1 / 4).toFixed(isGoldOrCrypto ? 2 : 5));
    const pivot = Number(currentPrice.toFixed(isGoldOrCrypto ? 2 : 5));
    const step0 = Number((currentPrice + range * 1.1 / 6).toFixed(isGoldOrCrypto ? 2 : 5));
    const step1 = Number((currentPrice + range * 1.1 / 12).toFixed(isGoldOrCrypto ? 2 : 5));
    const step2 = Number((currentPrice - range * 1.1 / 12).toFixed(isGoldOrCrypto ? 2 : 5));
    const step3 = Number((currentPrice - range * 1.1 / 6).toFixed(isGoldOrCrypto ? 2 : 5));

    return {
      highEdge,
      lowEdge,
      pivot,
      fullRange: range,
      step0,
      step1,
      step2,
      step3,
    };
  }

  public generateSignal(
    symbol: string,
    currentPrice: number,
    direction: 'BUY' | 'SELL',
    timeframe: string = '15M'
  ): TradingSignal {
    const levels = this.calculate(symbol, currentPrice);
    const isBuy = direction === 'BUY';
    const isGoldOrCrypto = currentPrice > 100;

    // Resolve Entry level dynamically based on levelRules configuration
    const selectedEntryKey = isBuy ? this.levelRules.buyEntryLevel : this.levelRules.sellEntryLevel;
    let entry = currentPrice;
    if (selectedEntryKey === 'R1') entry = levels.step1;
    else if (selectedEntryKey === 'R2') entry = levels.step0;
    else if (selectedEntryKey === 'R3') entry = levels.highEdge;
    else if (selectedEntryKey === 'S1') entry = levels.step2;
    else if (selectedEntryKey === 'S2') entry = levels.step3;
    else if (selectedEntryKey === 'S3') entry = levels.lowEdge;
    else if (selectedEntryKey === 'Pivot') entry = levels.pivot;

    // Resolve Take Profits dynamically
    const takeProfits: number[] = [];
    this.levelRules.takeProfitLevels.forEach((tpKey) => {
      if (tpKey === 'R2') takeProfits.push(levels.step0);
      else if (tpKey === 'R3') takeProfits.push(levels.highEdge);
      else if (tpKey === 'R4') takeProfits.push(Number((levels.highEdge + (levels.highEdge - levels.pivot) * 0.5).toFixed(isGoldOrCrypto ? 2 : 5)));
      else if (tpKey === 'S2') takeProfits.push(levels.step3);
      else if (tpKey === 'S3') takeProfits.push(levels.lowEdge);
      else if (tpKey === 'S4') takeProfits.push(Number((levels.lowEdge - (levels.pivot - levels.lowEdge) * 0.5).toFixed(isGoldOrCrypto ? 2 : 5)));
    });

    if (takeProfits.length === 0) {
      takeProfits.push(isBuy ? levels.step0 : levels.step3);
      takeProfits.push(isBuy ? levels.highEdge : levels.lowEdge);
    }

    let stopLoss = isBuy ? levels.lowEdge : levels.highEdge;
    if (this.levelRules.stopLossLevel === 'Pivot') stopLoss = levels.pivot;

    return {
      symbol,
      direction,
      entry,
      stopLoss,
      takeProfits,
      confidence: 88,
      strategy: this.name,
      reason: `Camarilla ${direction} at level ${selectedEntryKey} on ${timeframe}`,
      createdAt: new Date(),
    };
  }
}