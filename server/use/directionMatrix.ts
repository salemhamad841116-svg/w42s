import type { DirectionMatrixResult, HorizonForecast, DirectionState, DataQuality } from './types.js';
import { computeFeatures } from './featureEngine.js';
import { queryCandlesUnlimited } from '../database.js';
import { detectRegime } from './regimeDetector.js';

/**
 * Computes multi-timeframe direction matrix for a given symbol.
 * Analyzes independent timeframes without look-ahead bias or timeframe conversions.
 * @param symbol Trading symbol
 * @returns DirectionMatrixResult
 */
export async function computeDirectionMatrix(symbol: string): Promise<DirectionMatrixResult> {
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    const horizons: HorizonForecast[] = [];
    const toTimestamp = Math.floor(Date.now() / 1000);
    const fromTimestamp = 0; // Ensures we get maximum available history
    
    for (const tf of timeframes) {
        // 1. Query last 200 candles from SQLite (querying all history and slicing to maintain feature integrity)
        const allCandles = await queryCandlesUnlimited(symbol, tf, fromTimestamp, toTimestamp);
        
        // 6. Set dataQuality based on candle count available
        let dataQuality: DataQuality = 'INSUFFICIENT';
        if (allCandles.length > 1000) dataQuality = 'HIGH';
        else if (allCandles.length >= 200) dataQuality = 'MEDIUM';
        else if (allCandles.length >= 50) dataQuality = 'LOW';
        
        if (allCandles.length < 50) {
            horizons.push({
                timeframe: tf,
                direction: 'NEUTRAL',
                directionProbability: 0.5,
                confidence: 0,
                signalStrength: 0,
                dataQuality,
                sampleSize: allCandles.length,
                historicalHitRate: 0.5
            });
            continue;
        }
        
        // Take last 200 candles for the specific timeframe analysis
        const recentCandles = allCandles.slice(-200);
        
        // 2. Compute features for the given timeframe data independently
        const features = await computeFeatures(recentCandles);
        const latest = features[features.length - 1];
        
        let score = 0;
        
        // 3. Score direction
        // EMA alignment (9 > 20 > 50 = bullish)
        if (latest.ema9 > latest.ema20 && latest.ema20 > latest.ema50) {
            score += 2;
        } else if (latest.ema9 < latest.ema20 && latest.ema20 < latest.ema50) {
            score -= 2;
        }
        
        // RSI zones
        if (latest.rsi14 > 60) score += 1;
        else if (latest.rsi14 < 40) score -= 1;
        
        // MACD signal
        if (latest.macdLine > latest.macdSignal) score += 1;
        else if (latest.macdLine < latest.macdSignal) score -= 1;
        
        // Momentum
        if (latest.momentum10 > 0) score += 1;
        else if (latest.momentum10 < 0) score -= 1;
        
        // 4. Map score to DirectionState
        let direction: DirectionState = 'NEUTRAL';
        if (score >= 4) direction = 'STRONG_BULLISH';
        else if (score >= 2) direction = 'BULLISH';
        else if (score <= -4) direction = 'STRONG_BEARISH';
        else if (score <= -2) direction = 'BEARISH';
        
        // 5. Calculate probability from score magnitude
        const maxScore = 5;
        const scoreMagnitude = Math.abs(score);
        const directionProbability = 0.5 + (scoreMagnitude / (maxScore * 2)); // Maps to [0.5, 1.0]
        const confidence = Math.min(1.0, scoreMagnitude / maxScore);
        
        horizons.push({
            timeframe: tf,
            direction,
            directionProbability,
            confidence,
            signalStrength: confidence,
            dataQuality,
            sampleSize: allCandles.length,
            historicalHitRate: 0.5
        });
    }
    
    // Overall regime based on 1h timeframe features
    const h1Candles = await queryCandlesUnlimited(symbol, '1h', fromTimestamp, toTimestamp);
    let regime: any = 'UNCERTAIN';
    
    if (h1Candles.length >= 50) {
        const h1Features = await computeFeatures(h1Candles.slice(-200));
        regime = detectRegime(h1Features);
    }
    
    return {
        symbol,
        timestamp: toTimestamp,
        regime,
        horizons
    };
}
