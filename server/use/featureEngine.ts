import type { FeatureVector, OHLCV } from './types.js';

/**
 * Calculates Simple Moving Average
 */
export function calcSMA(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) {
      sum -= values[i - period];
    }
    if (i >= period - 1) {
      result[i] = sum / period;
    }
  }
  return result;
}

/**
 * Calculates Exponential Moving Average
 */
export function calcEMA(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return result;
  
  const alpha = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let ema = sum / period;
  result[period - 1] = ema;
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * alpha + ema;
    result[i] = ema;
  }
  return result;
}

/**
 * Calculates Relative Strength Index (Wilder's Smoothing)
 */
export function calcRSI(closes: number[], period: number): number[] {
  const result: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return result;

  let sumGain = 0;
  let sumLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) sumGain += diff;
    else sumLoss -= diff;
  }

  let avgGain = sumGain / period;
  let avgLoss = sumLoss / period;

  if (avgLoss === 0) result[period] = 100;
  else result[period] = 100 - (100 / (1 + avgGain / avgLoss));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - (100 / (1 + rs));
    }
  }

  return result;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calcMACD(closes: number[]): { line: number[], signal: number[], histogram: number[] } {
  const fastEma = calcEMA(closes, 12);
  const slowEma = calcEMA(closes, 26);
  
  const macdLine: number[] = new Array(closes.length).fill(NaN);
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(fastEma[i]) && !isNaN(slowEma[i])) {
      macdLine[i] = fastEma[i] - slowEma[i];
    }
  }

  const validMacdLine = macdLine.filter(val => !isNaN(val));
  const signalEma = calcEMA(validMacdLine, 9);
  
  const signalLine: number[] = new Array(closes.length).fill(NaN);
  const histogram: number[] = new Array(closes.length).fill(NaN);
  
  const nanCount = closes.length - validMacdLine.length;
  
  for (let i = nanCount; i < closes.length; i++) {
    signalLine[i] = signalEma[i - nanCount];
    if (!isNaN(macdLine[i]) && !isNaN(signalLine[i])) {
      histogram[i] = macdLine[i] - signalLine[i];
    }
  }
  
  return { line: macdLine, signal: signalLine, histogram };
}

/**
 * Calculates True Range and Average True Range (Wilder's Smoothing)
 */
export function calcATR(candles: OHLCV[], period: number): number[] {
  const tr: number[] = new Array(candles.length).fill(0);
  const result: number[] = new Array(candles.length).fill(NaN);
  
  if (candles.length === 0) return result;
  
  tr[0] = candles[0].high - candles[0].low;
  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowClose = Math.abs(candles[i].low - candles[i - 1].close);
    tr[i] = Math.max(highLow, highClose, lowClose);
  }
  
  if (candles.length < period) return result;
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += tr[i];
  }
  result[period - 1] = sum / period;
  
  for (let i = period; i < candles.length; i++) {
    result[i] = (result[i - 1] * (period - 1) + tr[i]) / period;
  }
  
  return result;
}

/**
 * Calculates Standard Deviation over a period
 */
export function calcStdDev(values: number[], period: number, sma: number[]): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  for (let i = period - 1; i < values.length; i++) {
    let sumSq = 0;
    const avg = sma[i];
    for (let j = 0; j < period; j++) {
      const diff = values[i - j] - avg;
      sumSq += diff * diff;
    }
    result[i] = Math.sqrt(sumSq / period);
  }
  return result;
}

/**
 * Calculates Bollinger Bands
 */
export function calcBollingerBands(closes: number[], period: number, stdMult: number): { upper: number[], middle: number[], lower: number[], width: number[] } {
  const middle = calcSMA(closes, period);
  const stddev = calcStdDev(closes, period, middle);
  
  const upper: number[] = new Array(closes.length).fill(NaN);
  const lower: number[] = new Array(closes.length).fill(NaN);
  const width: number[] = new Array(closes.length).fill(NaN);
  
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(middle[i]) && !isNaN(stddev[i])) {
      upper[i] = middle[i] + stdMult * stddev[i];
      lower[i] = middle[i] - stdMult * stddev[i];
      width[i] = (upper[i] - lower[i]) / middle[i];
    }
  }
  
  return { upper, middle, lower, width };
}

/**
 * Main function to compute all features for a given array of candles
 */
export function computeFeatures(candles: OHLCV[]): FeatureVector[] {
  if (candles.length === 0) return [];

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);

  // Trend
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const ema9 = calcEMA(closes, 9);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);

  // Momentum
  const rsi14 = calcRSI(closes, 14);
  const macd = calcMACD(closes);
  
  const momentum10: number[] = new Array(closes.length).fill(NaN);
  const roc10: number[] = new Array(closes.length).fill(NaN);
  for (let i = 10; i < closes.length; i++) {
    momentum10[i] = closes[i] - closes[i - 10];
    roc10[i] = (momentum10[i] / closes[i - 10]) * 100;
  }

  // Volatility
  const atr14 = calcATR(candles, 14);
  const bb20 = calcBollingerBands(closes, 20, 2);
  const stdDev20 = calcStdDev(closes, 20, bb20.middle);

  // Volume
  const volSma20 = calcSMA(volumes, 20);
  const relVol: number[] = new Array(volumes.length).fill(NaN);
  for (let i = 0; i < volumes.length; i++) {
    if (!isNaN(volSma20[i]) && volSma20[i] > 0) {
      relVol[i] = volumes[i] / volSma20[i];
    }
  }

  return candles.map((candle, i) => {
    const totalRange = candle.high - candle.low;
    const body = Math.abs(candle.close - candle.open);
    
    // Default to 0 if total range is 0 to avoid NaN
    const rangePercent = totalRange === 0 ? 0 : totalRange / candle.close;
    const bodyPercent = totalRange === 0 ? 0 : body / totalRange;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const upperWickPercent = totalRange === 0 ? 0 : upperWick / totalRange;
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const lowerWickPercent = totalRange === 0 ? 0 : lowerWick / totalRange;

    const date = new Date(candle.time);
    const hourOfDay = date.getUTCHours();
    const dayOfWeek = date.getUTCDay();
    
    let session = 'OTHER';
    if (hourOfDay >= 0 && hourOfDay < 8) session = 'ASIA';
    else if (hourOfDay >= 7 && hourOfDay < 16) session = 'EUROPE';
    else if (hourOfDay >= 13 && hourOfDay < 22) session = 'AMERICAS';

    // Workaround for returning the object, we assume FeatureVector type is compliant
    return {
      // Original OHLCV properties
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      
      // Trend
      sma20: sma20[i],
      sma50: sma50[i],
      sma200: sma200[i],
      ema9: ema9[i],
      ema20: ema20[i],
      ema50: ema50[i],
      
      // Momentum
      rsi14: rsi14[i],
      macdLine: macd.line[i],
      macdSignal: macd.signal[i],
      macdHist: macd.histogram[i],
      momentum10: momentum10[i],
      roc10: roc10[i],
      
      // Volatility
      atr14: atr14[i],
      bbUpper: bb20.upper[i],
      bbMiddle: bb20.middle[i],
      bbLower: bb20.lower[i],
      bbWidth: bb20.width[i],
      stdDev20: stdDev20[i],
      
      // Volume
      volSma20: volSma20[i],
      relVol: relVol[i],
      
      // Candle Structure
      bodyPercent,
      upperWickPercent,
      lowerWickPercent,
      rangePercent,
      
      // Temporal
      hourOfDay,
      dayOfWeek,
      session
    } as unknown as FeatureVector;
  });
}
