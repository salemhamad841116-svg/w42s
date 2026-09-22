import type { NextCandleForecast, FeatureVector } from './types.js';
import { computeFeatures } from './featureEngine.js';
import { queryCandlesUnlimited } from '../database.js';
import { assessDataQuality } from './confidenceCalibrator.js';

/**
 * Calculates Euclidean distance between two normalized feature vectors.
 * Focuses on RSI, MACD histogram, EMA alignment, ATR ratio, and momentum.
 */
function calculateDistance(f1: FeatureVector, f2: FeatureVector): number {
    const diffRsi = (f1.rsi14 - f2.rsi14) / 100; // Normalize 0-100
    
    // Normalize MACD relative to absolute size
    const diffMacd = (f1.macdHistogram - f2.macdHistogram) / (Math.abs(f1.macdHistogram) + 0.0001);
    
    // EMA alignment proxy: distance between EMA ratios
    const emaRatio1 = f1.ema50 > 0 ? f1.ema9 / f1.ema50 : 1;
    const emaRatio2 = f2.ema50 > 0 ? f2.ema9 / f2.ema50 : 1;
    const diffEma = emaRatio1 - emaRatio2;
    
    // ATR ratio (volatility relative to closing price)
    const atrRatio1 = f1.close > 0 ? f1.atr14 / f1.close : 0;
    const atrRatio2 = f2.close > 0 ? f2.atr14 / f2.close : 0;
    const diffAtr = (atrRatio1 - atrRatio2) * 100; // Scale up for importance
    
    // Momentum
    const diffMom = (f1.momentum10 - f2.momentum10) / (Math.abs(f1.momentum10) + 0.0001);
    
    return Math.sqrt(
        diffRsi * diffRsi +
        diffMacd * diffMacd +
        diffEma * diffEma +
        diffAtr * diffAtr +
        diffMom * diffMom
    );
}

/**
 * Forecasts the next candle using statistical similarity of historical features.
 * 
 * @param symbol Trading symbol
 * @param timeframe Target timeframe
 * @returns Statistical prediction of the next candle
 */
export async function forecastNextCandle(symbol: string, timeframe: string): Promise<NextCandleForecast> {
    const toTimestamp = Math.floor(Date.now() / 1000);
    // 1. Query last 2000+ candles using zero as far-back timestamp
    const allCandles = await queryCandlesUnlimited(symbol, timeframe, 0, toTimestamp);
    
    // Take recent 2500 to ensure we have at least 2000 valid samples plus feature warmup
    const candles = allCandles.slice(-2500);
    
    if (candles.length < 100) {
        return {
            symbol, timeframe, timestamp: toTimestamp,
            bullishProbability: 0.33, bearishProbability: 0.33, neutralProbability: 0.34,
            expectedReturn: 0, expectedRangeHigh: 0, expectedRangeLow: 0, expectedVolatility: 0,
            confidence: 0, dataQuality: 'INSUFFICIENT', sampleSize: candles.length, modelVersion: '1.0'
        };
    }
    
    // 2. Compute features for all available data
    const features = await computeFeatures(candles);
    if (features.length < 2) {
        throw new Error("Insufficient features computed for forecast");
    }
    
    // 3. Take the LAST candle's feature vector as the query
    const targetFeature = features[features.length - 1];
    
    // 4. Find the 200 most similar historical setups
    interface Neighbor {
        index: number;
        distance: number;
    }
    
    const neighbors: Neighbor[] = [];
    
    // Iterate over history (skip the very last one as it has no "next" candle)
    for (let i = 50; i < features.length - 1; i++) {
        const dist = calculateDistance(targetFeature, features[i]);
        neighbors.push({ index: i, distance: dist });
    }
    
    // Sort by smallest distance (most similar)
    neighbors.sort((a, b) => a.distance - b.distance);
    const kOptions = [50, 100, 200, 500];
    let bestResult: any = null;
    let bestConfidence = -1;

    for (const k of kOptions) {
        const kNeighbors = neighbors.slice(0, k);
        if (kNeighbors.length === 0) continue;

        // 5. Count outcomes
        let bullish = 0;
        let bearish = 0;
        let neutral = 0;
        let totalReturn = 0;
        let sumRange = 0;
        
        for (const n of kNeighbors) {
            const currentCandle = candles[n.index];
            const nextCandle = candles[n.index + 1]; 
            
            if (!nextCandle || !currentCandle || currentCandle.close <= 0) continue;
            
            const ret = (nextCandle.close - currentCandle.close) / currentCandle.close;
            const range = (nextCandle.high - nextCandle.low) / currentCandle.close;
            
            // 6. Bullish if > +0.05%, bearish if < -0.05%, else neutral
            if (ret > 0.0005) {
                bullish++;
            } else if (ret < -0.0005) {
                bearish++;
            } else {
                neutral++;
            }
            
            totalReturn += ret;
            sumRange += range;
        }
        
        const validCount = bullish + bearish + neutral;
        if (validCount === 0) continue;

        const avgReturn = totalReturn / validCount;
        const avgRange = sumRange / validCount;
        
        // 7. Calculate expected range from historical outcome range
        const expectedRangeHigh = targetFeature.close * (1 + (avgRange / 2));
        const expectedRangeLow = targetFeature.close * (1 - (avgRange / 2));
        
        // 8. Confidence = Wilson Score Lower Bound
        const maxVotes = Math.max(bullish, bearish, neutral);
        const p = maxVotes / validCount;
        const n = validCount;
        const z = 1.96; // 95% confidence
        const wilsonLowerBound = (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
        
        if (wilsonLowerBound > bestConfidence) {
            bestConfidence = wilsonLowerBound;
            bestResult = {
                bullishProbability: bullish / validCount,
                bearishProbability: bearish / validCount,
                neutralProbability: neutral / validCount,
                expectedReturn: avgReturn,
                expectedRangeHigh,
                expectedRangeLow,
                expectedVolatility: avgRange,
                confidence: wilsonLowerBound
            };
        }
    }

    if (!bestResult) {
        return {
            symbol, timeframe, timestamp: toTimestamp,
            bullishProbability: 0.33, bearishProbability: 0.33, neutralProbability: 0.34,
            expectedReturn: 0, expectedRangeHigh: 0, expectedRangeLow: 0, expectedVolatility: 0,
            confidence: 0, dataQuality: assessDataQuality(allCandles.length), sampleSize: allCandles.length, modelVersion: '1.0.0'
        };
    }
    
    // 9. Store as prediction audit log entry (typically done externally by calling service)
    return {
        symbol,
        timeframe,
        timestamp: toTimestamp,
        ...bestResult,
        dataQuality: assessDataQuality(allCandles.length),
        sampleSize: allCandles.length,
        modelVersion: '1.0.0'
    };
}
