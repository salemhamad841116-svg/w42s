/**
 * Risk Management Utility
 * Calculates mathematically sound lot sizes based on account balance and risk percentage.
 * ALL code comments are in English to prevent macOS/Wine encoding compilation issues.
 */

export interface RiskCalculationResult {
  lotSize: number;
  amountAtRiskUsd: number;
  positionSizeUsd: number;
  isValid: boolean;
  reason?: string;
}

/**
 * Determines if a symbol belongs to Forex (Standard Lot = 100k units) or Crypto/Commodities.
 */
function isForexPair(symbol: string): boolean {
  // Forex pairs usually have 6 letters (e.g. EURUSD, GBPJPY) and no special crypto suffixes.
  const cleanSymbol = symbol.replace(/[^A-Z]/g, '');
  if (cleanSymbol.length !== 6) return false;
  
  const fiatCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const base = cleanSymbol.substring(0, 3);
  const quote = cleanSymbol.substring(3, 6);
  
  return fiatCurrencies.includes(base) && fiatCurrencies.includes(quote);
}

/**
 * Calculates the dynamic lot size.
 * 
 * @param accountBalance The current usable equity in USD.
 * @param currentPrice The entry price.
 * @param slPrice The calculated stop-loss price.
 * @param riskPercent The maximum allowed loss percentage of the account balance (e.g., 1.0).
 * @param symbol The ticker symbol.
 */
export function calculateDynamicLotSize(
  accountBalance: number,
  currentPrice: number,
  slPrice: number,
  riskPercent: number,
  symbol: string
): RiskCalculationResult {
  
  if (accountBalance <= 0 || currentPrice <= 0 || slPrice <= 0) {
    return { lotSize: 0, amountAtRiskUsd: 0, positionSizeUsd: 0, isValid: false, reason: 'Invalid price or balance inputs.' };
  }

  // Calculate physical distance to SL in absolute terms
  const slDistanceAbs = Math.abs(currentPrice - slPrice);
  if (slDistanceAbs === 0) {
    return { lotSize: 0, amountAtRiskUsd: 0, positionSizeUsd: 0, isValid: false, reason: 'SL distance is zero.' };
  }

  // Calculate distance in percentage
  const slDistancePercent = slDistanceAbs / currentPrice;

  // Maximum amount in USD that we are allowed to lose
  const amountAtRiskUsd = accountBalance * (riskPercent / 100);

  // Calculate the total required position size in USD to achieve the target risk
  const positionSizeUsd = amountAtRiskUsd / slDistancePercent;

  let lotSize = 0;

  if (isForexPair(symbol)) {
    // Forex: 1 Standard Lot = 100,000 units of the base currency.
    // If base is not USD, this requires precise conversion, but for general estimation, 
    // we use a 100,000 multiplier standard for margin accounts.
    lotSize = positionSizeUsd / 100000;
    
    // Clamp to minimum 0.01 micro lot
    lotSize = Math.max(0.01, Number(lotSize.toFixed(2)));
  } else {
    // Crypto / Commodities (e.g., BTC/USDT, XAU/USD)
    // 1 Lot = 1 Unit of the asset (e.g., 1 BTC, 1 oz of Gold)
    lotSize = positionSizeUsd / currentPrice;
    
    // Clamp to reasonable precision (3 decimals for crypto)
    lotSize = Math.max(0.001, Number(lotSize.toFixed(3)));
  }

  // Safety cap (Do not allow absurd lot sizes preventing liquidation on bad ticks)
  if (isForexPair(symbol) && lotSize > 50) {
    return { lotSize, amountAtRiskUsd, positionSizeUsd, isValid: false, reason: 'Calculated lot size exceeds maximum safety cap (50 lots).' };
  }

  return {
    lotSize,
    amountAtRiskUsd: Number(amountAtRiskUsd.toFixed(2)),
    positionSizeUsd: Number(positionSizeUsd.toFixed(2)),
    isValid: true
  };
}
