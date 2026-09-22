/**
 * Technical Indicators Calculator
 * حاسبة المؤشرات الفنية
 */

import { OHLCVCandle } from './otcDataProvider';

/**
 * Interface for Technical Analysis results.
 * واجهة لنتائج التحليل الفني
 */
export interface TechnicalAnalysis {
  atr: number;
  bollingerBands: { 
    upper: number; 
    middle: number; 
    lower: number; 
    bandwidth: number 
  };
  lastClose: number;
  pricePosition: 'above_upper' | 'near_upper' | 'middle' | 'near_lower' | 'below_lower';
}

/**
 * Calculates Average True Range (ATR).
 * حساب متوسط المدى الحقيقي
 * 
 * @param candles Array of OHLCV candles / مصفوفة الشموع
 * @param period The period for ATR (default 14) / فترة الحساب
 * @returns ATR value / قيمة ATR
 */
export function calculateATR(candles: OHLCVCandle[], period: number = 14): number {
  if (candles.length === 0) return 0;
  
  const trueRanges: number[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    const current = candles[i];
    if (i === 0) {
      trueRanges.push(current.high - current.low);
    } else {
      const prev = candles[i - 1];
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - prev.close);
      const tr3 = Math.abs(current.low - prev.close);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
  }
  
  // Calculate SMA of TR / حساب المتوسط المتحرك البسيط للمدى الحقيقي
  const slice = trueRanges.slice(-period);
  if (slice.length === 0) return 0;
  const sum = slice.reduce((a, b) => a + b, 0);
  
  return sum / slice.length;
}

/**
 * Calculates Bollinger Bands.
 * حساب مؤشر بولينجر باند
 * 
 * @param candles Array of OHLCV candles / مصفوفة الشموع
 * @param period The period for SMA (default 20) / فترة الحساب
 * @param stdDevMultiplier The multiplier for standard deviation (default 2) / مضاعف الانحراف المعياري
 * @returns Bollinger Bands data / بيانات بولينجر باند
 */
export function calculateBollingerBands(
  candles: OHLCVCandle[], 
  period: number = 20, 
  stdDevMultiplier: number = 2
): { upper: number, middle: number, lower: number, bandwidth: number } {
  if (candles.length === 0) {
    return { upper: 0, middle: 0, lower: 0, bandwidth: 0 };
  }
  
  const closes = candles.map(c => c.close);
  const slice = closes.slice(-period);
  const count = slice.length;
  
  if (count === 0) {
    return { upper: 0, middle: 0, lower: 0, bandwidth: 0 };
  }
  
  // Calculate SMA (Middle Band) / حساب المتوسط المتحرك البسيط
  const sma = slice.reduce((a, b) => a + b, 0) / count;
  
  // Calculate Standard Deviation / حساب الانحراف المعياري
  const squaredDiffs = slice.map(c => Math.pow(c - sma, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(avgSquaredDiff);
  
  const upper = sma + (stdDev * stdDevMultiplier);
  const lower = sma - (stdDev * stdDevMultiplier);
  const bandwidth = upper === 0 ? 0 : (upper - lower) / sma;
  
  return { upper, middle: sma, lower, bandwidth };
}

/**
 * Analyzes technical indicators for the given candles.
 * تحليل المؤشرات الفنية للشموع المعطاة
 * 
 * @param candles Array of OHLCV candles / مصفوفة الشموع
 * @returns Technical analysis summary / ملخص التحليل الفني
 */
export function analyzeTechnicals(candles: OHLCVCandle[]): TechnicalAnalysis {
  const atr = calculateATR(candles);
  const bb = calculateBollingerBands(candles);
  
  let lastClose = 0;
  let pricePosition: TechnicalAnalysis['pricePosition'] = 'middle';
  
  if (candles.length > 0) {
    lastClose = candles[candles.length - 1].close;
    
    // Determine price position relative to Bollinger Bands
    // تحديد موقع السعر بالنسبة لخطوط بولينجر
    const bandRange = bb.upper - bb.lower;
    const position = (lastClose - bb.lower) / bandRange;
    
    if (lastClose > bb.upper) {
      pricePosition = 'above_upper';
    } else if (lastClose < bb.lower) {
      pricePosition = 'below_lower';
    } else if (position >= 0.8) {
      pricePosition = 'near_upper';
    } else if (position <= 0.2) {
      pricePosition = 'near_lower';
    } else {
      pricePosition = 'middle';
    }
  }
  
  return {
    atr,
    bollingerBands: bb,
    lastClose,
    pricePosition
  };
}
