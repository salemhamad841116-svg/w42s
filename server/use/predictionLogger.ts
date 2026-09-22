/**
 * Prediction Logger
 * Handles logging and evaluation of model predictions.
 */

import type { PredictionRecord, NextCandleForecast } from './types.js';
import { insertPrediction, evaluatePrediction, getPendingPredictions } from './useDatabase.js';
import { queryCandlesUnlimited } from '../database.js';

export function logPrediction(forecast: NextCandleForecast, regime: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const predictionId = `pred_${timestamp}_${randomSuffix}`;
    
    const record: PredictionRecord = {
        id: predictionId,
        symbol: forecast.symbol,
        timeframe: forecast.timeframe,
        timestamp: forecast.targetTimestamp,
        forecastBullsPct: forecast.bullishProbability,
        forecastBearsPct: forecast.bearishProbability,
        confidence: forecast.confidence,
        expectedHigh: forecast.expectedRange?.high,
        expectedLow: forecast.expectedRange?.low,
        regime,
        status: 'PENDING'
    };
    
    // Store the forecast probabilities, confidence, expected range BEFORE knowing the result
    insertPrediction(record);
    
    return predictionId;
}

export async function evaluatePendingPredictions(): Promise<number> {
    const pending = await getPendingPredictions();
    let evaluatedCount = 0;
    
    for (const pred of pending) {
        // For each, check if the candle at that timestamp has closed (query the candle from SQLite)
        const candles = await queryCandlesUnlimited(pred.symbol, pred.timeframe, pred.timestamp, pred.timestamp);
        
        if (candles && candles.length > 0) {
            const actualCandle = candles[0];
            
            let actualResult: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
            if (actualCandle.close > actualCandle.open) {
                actualResult = 'BULLISH';
            } else if (actualCandle.close < actualCandle.open) {
                actualResult = 'BEARISH';
            }
            
            // Update the prediction record with actual_result and actual_close
            await evaluatePrediction(pred.id, actualResult, actualCandle.close);
            evaluatedCount++;
        }
    }
    
    return evaluatedCount;
}
