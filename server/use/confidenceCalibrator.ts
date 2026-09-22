import type { DataQuality, CalibrationMetrics } from './types.js';
import { getCalibrationData } from './useDatabase.js';

export function assessDataQuality(sampleSize: number): DataQuality {
    if (sampleSize > 1000) return 'HIGH';
    if (sampleSize >= 200) return 'MEDIUM';
    if (sampleSize >= 50) return 'LOW';
    return 'INSUFFICIENT';
}

export function calibrateConfidence(rawConfidence: number, symbol: string, timeframe: string): number {
    try {
        const rawData = getCalibrationData(symbol, timeframe);
        if (!rawData || rawData.length < 10) {
            return rawConfidence; 
        }
        
        let wins = 0;
        let totalConfidence = 0;
        for (const d of rawData) {
            totalConfidence += d.confidence;
            const maxP = Math.max(d.bullish_probability, d.bearish_probability, d.neutral_probability);
            let predicted = 'NEUTRAL';
            if (maxP === d.bullish_probability) predicted = 'BULLISH';
            else if (maxP === d.bearish_probability) predicted = 'BEARISH';
            
            if (predicted === d.actual_result) wins++;
        }
        
        const actualAccuracy = wins / rawData.length;
        const averageConfidence = totalConfidence / rawData.length;
        
        // Dynamic threshold adjustment based on historical calibration error
        const calibrationFactor = averageConfidence > 0 ? (actualAccuracy / averageConfidence) : 1;
        
        let calibrated = rawConfidence * calibrationFactor;
        
        calibrated = Math.max(0, Math.min(1.0, calibrated));
        return calibrated;
    } catch (error) {
        return rawConfidence;
    }
}

export function getCalibrationDashboard(symbol: string, timeframe: string): CalibrationMetrics[] {
    const rawData = getCalibrationData(symbol, timeframe);
    if (!rawData || rawData.length === 0) return [];

    const buckets = [
        { min: 0, max: 50, label: '0-50%' },
        { min: 50, max: 60, label: '50-60%' },
        { min: 60, max: 70, label: '60-70%' },
        { min: 70, max: 80, label: '70-80%' },
        { min: 80, max: 90, label: '80-90%' },
        { min: 90, max: 100, label: '90-100%' }
    ];

    const results: CalibrationMetrics[] = [];

    for (const b of buckets) {
        const inBucket = rawData.filter((d: any) => {
            const confPct = d.confidence * 100;
            return confPct >= b.min && confPct < b.max;
        });

        if (inBucket.length === 0) {
            results.push({
                bucket: b.label,
                sampleSize: 0,
                predictedMean: 0,
                actualWinRate: 0,
                calibrationError: 0
            });
            continue;
        }

        const predictedSum = inBucket.reduce((sum: number, d: any) => sum + d.confidence, 0);
        const predictedMean = predictedSum / inBucket.length;

        const wins = inBucket.filter((d: any) => {
            if (d.bullish_probability > d.bearish_probability && d.bullish_probability > d.neutral_probability) {
                return d.actual_result === 'BULLISH';
            }
            if (d.bearish_probability > d.bullish_probability && d.bearish_probability > d.neutral_probability) {
                return d.actual_result === 'BEARISH';
            }
            return d.actual_result === 'NEUTRAL';
        }).length;

        const actualWinRate = wins / inBucket.length;
        const calibrationError = actualWinRate - predictedMean;

        results.push({
            bucket: b.label,
            sampleSize: inBucket.length,
            predictedMean,
            actualWinRate,
            calibrationError
        });
    }

    return results;
}
