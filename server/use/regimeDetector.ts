import type { MarketRegime, OHLCV, FeatureVector } from './types.js';
import { computeFeatures } from './featureEngine.js';
import { queryCandlesUnlimited } from '../database.js';

/**
 * Classify market regime using feature data.
 * @param features - Array of feature vectors ordered chronologically
 * @returns MarketRegime classification
 */
export function detectRegime(features: FeatureVector[]): MarketRegime {
    if (features.length === 0) return 'UNCERTAIN';
    const latest = features[features.length - 1];
    
    const { bbWidth, atr14, close, sma50, ema9, ema20, ema50 } = latest;
    
    // Calculate direction using EMAs without look-ahead bias
    const isUptrend = ema9 > ema20 && ema20 > ema50 && close > sma50;
    const isDowntrend = ema9 < ema20 && ema20 < ema50 && close < sma50;
    
    // Approximate trend strength (ADX proxy) using directional movement vs ATR
    const trendStrength = atr14 > 0 ? Math.abs(ema9 - ema50) / atr14 : 0;
    
    // Calculate historical averages for comparison
    let sumBbWidth = 0;
    let sumAtr = 0;
    const lookback = Math.min(50, features.length);
    
    for (let i = features.length - lookback; i < features.length; i++) {
        sumBbWidth += features[i].bbWidth || 0;
        sumAtr += features[i].atr14 || 0;
    }
    
    const avgBbWidth = lookback > 0 ? sumBbWidth / lookback : 0;
    const avgAtr = lookback > 0 ? sumAtr / lookback : 0;
    
    // ADX > 25 + directional = TRENDING_UP or TRENDING_DOWN (proxy used here)
    if (trendStrength > 1.5) { 
        return isUptrend ? 'TRENDING_UP' : (isDowntrend ? 'TRENDING_DOWN' : 'UNCERTAIN');
    }
    
    // BBWidth expanding + ATR spike = HIGH_VOLATILITY or BREAKOUT
    if (avgBbWidth > 0 && avgAtr > 0 && bbWidth > avgBbWidth * 1.2 && atr14 > avgAtr * 1.2) {
        return 'HIGH_VOLATILITY';
    }
    
    // BBWidth contracting + low ATR = LOW_VOLATILITY
    if (avgBbWidth > 0 && avgAtr > 0 && bbWidth < avgBbWidth * 0.8 && atr14 < avgAtr * 0.8) {
        return 'LOW_VOLATILITY';
    }
    
    // Price oscillating around SMA with no trend = RANGE
    if (trendStrength < 0.8 && Math.abs(close - sma50) < atr14) {
        return 'RANGE';
    }
    
    return 'UNCERTAIN';
}

/**
 * Detect regime for a specific symbol and timeframe using recent data.
 * @param symbol - Trading symbol
 * @param timeframe - Timeframe to analyze
 * @returns Object with regime and confidence score
 */
export async function detectRegimeForSymbol(symbol: string, timeframe: string): Promise<{ regime: MarketRegime, confidence: number }> {
    const toTimestamp = Math.floor(Date.now() / 1000);
    // Fetch far-back date to ensure we have at least 50+ candles
    const fromTimestamp = toTimestamp - 5 * 365 * 86400;
    
    const candles = await queryCandlesUnlimited(symbol, timeframe, fromTimestamp, toTimestamp);
    
    if (candles.length < 50) {
        return { regime: 'UNCERTAIN', confidence: 0 };
    }
    
    // Take the last 200 candles to compute features effectively
    const recentCandles = candles.slice(-200);
    const features = await computeFeatures(recentCandles);
    
    const regime = detectRegime(features);
    
    // Assign confidence based on signal clarity
    let confidence = 0.5;
    if (regime !== 'UNCERTAIN' && regime !== 'RANGE') {
        confidence = 0.8;
    } else if (regime === 'RANGE') {
        confidence = 0.6;
    }
    
    return { regime, confidence };
}
