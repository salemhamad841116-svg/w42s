/**
 * Dynamic Levels Calculation (Critical Rule)
 * 
 * Calculates Stop Loss (SL) and Take Profit (TP) using dynamic percentages
 * rather than fixed pips. This ensures universal compatibility across all
 * asset classes (Forex, Crypto, Indices) without needing per-asset pip scaling.
 */

export interface DynamicLevels {
  sl: number;
  tp: number;
}

export function calculateDynamicLevels(
  currentPrice: number,
  direction: 'BUY' | 'SELL',
  confidence: number // 0 to 100
): DynamicLevels {
  // Base risk is always 0.5% (Very tight, safe risk)
  const riskPercent = 0.5;

  // Reward depends on AI confidence:
  // > 80% confidence -> 1.5% TP (1:3 Risk/Reward)
  // > 60% confidence -> 1.0% TP (1:2 Risk/Reward)
  // Else -> 0.75% TP (1:1.5 Risk/Reward)
  let rewardPercent = 0.75;
  if (confidence >= 80) rewardPercent = 1.5;
  else if (confidence >= 60) rewardPercent = 1.0;

  if (direction === 'BUY') {
    return {
      sl: Number((currentPrice * (1 - riskPercent / 100)).toFixed(5)),
      tp: Number((currentPrice * (1 + rewardPercent / 100)).toFixed(5))
    };
  } else {
    return {
      sl: Number((currentPrice * (1 + riskPercent / 100)).toFixed(5)),
      tp: Number((currentPrice * (1 - rewardPercent / 100)).toFixed(5))
    };
  }
}
