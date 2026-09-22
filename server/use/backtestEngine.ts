/**
 * Backtest Engine
 * Performs walk-forward backtesting without look-ahead bias.
 */

import type { BacktestResult, BacktestTrade, StrategyDefinition, PerformanceBreakdown } from './types.js';
import { computeFeatures } from './featureEngine.js';
import { detectRegime } from './regimeDetector.js';
import { queryCandlesUnlimited } from '../database.js';

export async function runBacktest(strategy: StrategyDefinition, symbol: string, timeframe: string): Promise<BacktestResult> {
    // 1. Query all available candles for symbol+timeframe from SQLite
    const now = Math.floor(Date.now() / 1000);
    const candles = await queryCandlesUnlimited(symbol, timeframe, 0, now);
    
    if (!candles || candles.length === 0) {
        throw new Error('No candles found for backtesting');
    }

    // 2. Compute features for all candles
    const features = await computeFeatures(candles);
    
    // 3. Split data chronologically: 60% train, 20% validation, 20% out-of-sample (NEVER shuffle)
    const n = candles.length;
    const trainEnd = Math.floor(n * 0.6);
    const valEnd = Math.floor(n * 0.8);
    
    // Create sets without shuffling
    const trainCandles = candles.slice(0, trainEnd);
    const valCandles = candles.slice(trainEnd, valEnd);
    const oosCandles = candles.slice(valEnd);

    const trades: BacktestTrade[] = [];
    let currentPosition: 'LONG' | 'SHORT' | 'NONE' = 'NONE';
    let entryPrice = 0;
    let entryTime = 0;
    
    // Apply risk rules from strategy.riskRules
    const slPct = strategy.riskRules?.stopLossPct || 0.02;
    const tpPct = strategy.riskRules?.takeProfitPct || 0.04;

    // Helper to simulate trading for a specific dataset segment
    const runSimulation = (dataset: any[], startIndex: number) => {
        const setTrades: BacktestTrade[] = [];
        for (let i = 0; i < dataset.length; i++) {
            const candle = dataset[i];
            const feat = features[startIndex + i];
            
            // Exit rules check if in a position
            if (currentPosition !== 'NONE') {
                const returnPct = currentPosition === 'LONG' 
                    ? (candle.close - entryPrice) / entryPrice 
                    : (entryPrice - candle.close) / entryPrice;
                    
                const hitSL = returnPct <= -slPct;
                const hitTP = returnPct >= tpPct;
                
                // Force exit at end of dataset
                if (hitSL || hitTP || i === dataset.length - 1) {
                    const exitTime = candle.time;
                    let exitPrice = candle.close;
                    
                    if (hitSL) {
                        exitPrice = entryPrice * (1 - (currentPosition === 'LONG' ? slPct : -slPct));
                    } else if (hitTP) {
                        exitPrice = entryPrice * (1 + (currentPosition === 'LONG' ? tpPct : -tpPct));
                    }
                        
                    const actualReturn = currentPosition === 'LONG' 
                        ? (exitPrice - entryPrice) / entryPrice 
                        : (entryPrice - exitPrice) / entryPrice;
                        
                    const date = new Date(entryTime * 1000);
                    setTrades.push({
                        id: `tr_${entryTime}`,
                        type: currentPosition,
                        entryTime,
                        exitTime,
                        entryPrice,
                        exitPrice,
                        returnPct: actualReturn,
                        holdingPeriod: exitTime - entryTime,
                        regime: detectRegime(feat),
                        hour: date.getUTCHours(),
                        weekday: date.getUTCDay(),
                        month: date.getUTCMonth()
                    });
                    currentPosition = 'NONE';
                }
                continue;
            }
            
            // Entry rules check
            const rsi = feat.rsi || 50;
            const macdHist = feat.macdHist || 0;
            const ema20 = feat.ema20 || candle.close;
            
            // Default momentum strategy
            let buySignal = rsi < 30 && macdHist > 0 && candle.close > ema20;
            let sellSignal = rsi > 70 && macdHist < 0 && candle.close < ema20;
            
            if (buySignal) {
                currentPosition = 'LONG';
                entryPrice = candle.close;
                entryTime = candle.time;
            } else if (sellSignal) {
                currentPosition = 'SHORT';
                entryPrice = candle.close;
                entryTime = candle.time;
            }
        }
        return setTrades;
    };

    const trainTrades = runSimulation(trainCandles, 0);
    const valTrades = runSimulation(valCandles, trainEnd);
    const oosTrades = runSimulation(oosCandles, valEnd);
    
    trades.push(...trainTrades, ...valTrades, ...oosTrades);
    
    // Helper to calculate win rate
    const calculateWinRate = (tr: BacktestTrade[]) => {
        if (tr.length === 0) return 0;
        const wins = tr.filter(t => t.returnPct > 0).length;
        return wins / tr.length;
    };
    
    const trainWinRate = calculateWinRate(trainTrades);
    const valWinRate = calculateWinRate(valTrades);
    const oosWinRate = calculateWinRate(oosTrades);
    
    const totalWins = trades.filter(t => t.returnPct > 0);
    const totalLosses = trades.filter(t => t.returnPct <= 0);
    
    const grossProfit = totalWins.reduce((sum, t) => sum + t.returnPct, 0);
    const grossLoss = Math.abs(totalLosses.reduce((sum, t) => sum + t.returnPct, 0));
    
    const winRate = calculateWinRate(trades);
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 1;
    let currentEq = 1;
    for (const t of trades) {
        currentEq *= (1 + t.returnPct);
        if (currentEq > peak) peak = currentEq;
        const dd = (peak - currentEq) / peak;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }
    
    const avgReturn = trades.length > 0 ? trades.reduce((sum, t) => sum + t.returnPct, 0) / trades.length : 0;
    const stdDev = trades.length > 0 ? Math.sqrt(trades.reduce((sum, t) => sum + Math.pow(t.returnPct - avgReturn, 2), 0) / trades.length) : 0;
    const sharpe = stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252);
    
    const avgWin = totalWins.length > 0 ? grossProfit / totalWins.length : 0;
    const avgLoss = totalLosses.length > 0 ? grossLoss / totalLosses.length : 0;
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

    // Performance breakdowns
    const performanceBreakdown: PerformanceBreakdown = {
        byHour: {},
        byWeekday: {},
        byMonth: {},
        byRegime: {}
    };

    for (const t of trades) {
        // By Hour
        if (!performanceBreakdown.byHour[t.hour]) performanceBreakdown.byHour[t.hour] = { trades: 0, winRate: 0, wins: 0 };
        performanceBreakdown.byHour[t.hour].trades++;
        if (t.returnPct > 0) performanceBreakdown.byHour[t.hour].wins++;
        
        // By Weekday
        if (!performanceBreakdown.byWeekday[t.weekday]) performanceBreakdown.byWeekday[t.weekday] = { trades: 0, winRate: 0, wins: 0 };
        performanceBreakdown.byWeekday[t.weekday].trades++;
        if (t.returnPct > 0) performanceBreakdown.byWeekday[t.weekday].wins++;
        
        // By Month
        if (!performanceBreakdown.byMonth[t.month]) performanceBreakdown.byMonth[t.month] = { trades: 0, winRate: 0, wins: 0 };
        performanceBreakdown.byMonth[t.month].trades++;
        if (t.returnPct > 0) performanceBreakdown.byMonth[t.month].wins++;
        
        // By Regime
        if (!performanceBreakdown.byRegime[t.regime]) performanceBreakdown.byRegime[t.regime] = { trades: 0, winRate: 0, wins: 0 };
        performanceBreakdown.byRegime[t.regime].trades++;
        if (t.returnPct > 0) performanceBreakdown.byRegime[t.regime].wins++;
    }
    
    // Calculate win rates in breakdowns
    for (const k in performanceBreakdown.byHour) performanceBreakdown.byHour[k].winRate = performanceBreakdown.byHour[k].wins / performanceBreakdown.byHour[k].trades;
    for (const k in performanceBreakdown.byWeekday) performanceBreakdown.byWeekday[k].winRate = performanceBreakdown.byWeekday[k].wins / performanceBreakdown.byWeekday[k].trades;
    for (const k in performanceBreakdown.byMonth) performanceBreakdown.byMonth[k].winRate = performanceBreakdown.byMonth[k].wins / performanceBreakdown.byMonth[k].trades;
    for (const k in performanceBreakdown.byRegime) performanceBreakdown.byRegime[k].winRate = performanceBreakdown.byRegime[k].wins / performanceBreakdown.byRegime[k].trades;

    // Compare train vs validation vs OOS win rates
    const overfittingRisk = trainWinRate > (oosWinRate + 0.15);

    return {
        strategyId: strategy.id,
        symbol,
        timeframe,
        totalTrades: trades.length,
        winRate,
        profitFactor,
        maxDrawdown,
        sharpe,
        expectancy,
        trainWinRate,
        valWinRate,
        oosWinRate,
        overfittingRisk,
        trades,
        performanceBreakdown
    };
}
