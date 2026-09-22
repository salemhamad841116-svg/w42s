import type { ConfluenceResult, MarketRegime, DirectionState, DecisionState, SignalGrade, EVMetrics } from './types.js';
import { detectRegimeForSymbol } from './regimeDetector.js';
import { forecastNextCandle } from './nextCandleForecaster.js';
import { computeDirectionMatrix } from './directionMatrix.js';
import { queryCandlesUnlimited } from '../database.js';

export async function computeConfluence(symbol: string, timeframe: string): Promise<ConfluenceResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 1. Fetch Regime
    const regimeData = await detectRegimeForSymbol(symbol, timeframe);
    const regime = regimeData.regime;
    
    // 2. Fetch Direction Matrix for HTF Bias
    const dirMatrix = await computeDirectionMatrix(symbol);
    const horizons = dirMatrix.horizons;
    
    // Determine HTF Bias
    const htfMap: Record<string, string[]> = {
        '1m': ['5m', '15m', '1h'],
        '5m': ['15m', '1h', '4h'],
        '15m': ['1h', '4h', '1d'],
        '1h': ['4h', '1d'],
        '4h': ['1d'],
        '1d': []
    };
    const htfs = htfMap[timeframe] || [];
    let bullishCount = 0;
    let bearishCount = 0;
    
    for (const htf of htfs) {
        const h = horizons.find(x => x.timeframe === htf);
        if (!h) continue;
        if (h.direction.includes('BULLISH')) bullishCount++;
        if (h.direction.includes('BEARISH')) bearishCount++;
    }
    
    let htfBias: DirectionState = 'NEUTRAL';
    if (bullishCount === htfs.length && htfs.length > 0) htfBias = 'BULLISH';
    if (bearishCount === htfs.length && htfs.length > 0) htfBias = 'BEARISH';
    
    // Determine LTF Setup (from the target timeframe's matrix result)
    let ltfSetup: DirectionState = 'NEUTRAL';
    const ltfHorizon = horizons.find(x => x.timeframe === timeframe);
    if (ltfHorizon) {
        ltfSetup = ltfHorizon.direction;
    }
    
    // 3. Fetch Next Candle Forecast
    const forecast = await forecastNextCandle(symbol, timeframe);
    let nextCandleDirection: DirectionState = 'NEUTRAL';
    if (forecast.bullishProbability > forecast.bearishProbability && forecast.bullishProbability > forecast.neutralProbability) {
        nextCandleDirection = 'BULLISH';
    } else if (forecast.bearishProbability > forecast.bullishProbability && forecast.bearishProbability > forecast.neutralProbability) {
        nextCandleDirection = 'BEARISH';
    }
    
    // 4. Calculate EV
    // EV = P(win)*AvgWin - P(loss)*AvgLoss - Costs
    const costPct = 0.0001; // Assume 1 pip spread/commission approx 0.01%
    const isBullish = nextCandleDirection === 'BULLISH';
    const isBearish = nextCandleDirection === 'BEARISH';
    
    const pWin = isBullish ? forecast.bullishProbability : (isBearish ? forecast.bearishProbability : 0);
    const pLoss = 1 - pWin;
    const avgWinPct = forecast.expectedVolatility / 2;
    const avgLossPct = forecast.expectedVolatility / 2;
    
    const expectedValue = pWin > 0 ? (pWin * avgWinPct) - (pLoss * avgLossPct) - costPct : 0;
    
    const evMetrics: EVMetrics = {
        winProbability: pWin,
        lossProbability: pLoss,
        avgWinDistance: avgWinPct,
        avgLossDistance: avgLossPct,
        tradingCosts: costPct,
        expectedValue
    };
    
    // 5. Calculate Confluence Score
    let confluenceScore = 0;
    const reasons: string[] = [];
    
    // Next candle alignment (max 30)
    if (pWin > 0.6) {
        confluenceScore += 30;
        reasons.push('High probability next candle forecast');
    } else if (pWin > 0.5) {
        confluenceScore += 15;
        reasons.push('Favorable next candle forecast');
    }
    
    // HTF Alignment (max 30)
    if (htfBias === nextCandleDirection && nextCandleDirection !== 'NEUTRAL') {
        confluenceScore += 30;
        reasons.push('Higher timeframes are fully aligned');
    } else if (htfBias === 'NEUTRAL') {
        confluenceScore += 10;
        reasons.push('Higher timeframes are neutral (no strong opposition)');
    } else {
        reasons.push('Warning: Higher timeframes conflict with LTF bias');
    }
    
    // Regime Alignment (max 20)
    if (
        (isBullish && (regime === 'TRENDING_UP' || regime === 'BREAKOUT')) ||
        (isBearish && (regime === 'TRENDING_DOWN' || regime === 'BREAKOUT'))
    ) {
        confluenceScore += 20;
        reasons.push('Market regime strongly supports the direction');
    } else if (regime !== 'UNCERTAIN') {
        confluenceScore += 10;
        reasons.push('Market regime is somewhat supportive');
    }
    
    // EV Alignment (max 20)
    if (expectedValue > costPct * 2) {
        confluenceScore += 20;
        reasons.push('Highly positive Expected Value (EV)');
    } else if (expectedValue > 0) {
        confluenceScore += 10;
        reasons.push('Positive Expected Value (EV)');
    } else {
        reasons.push('Warning: Negative or poor Expected Value (EV)');
    }
    
    // Normalize to 0-100
    confluenceScore = Math.max(0, Math.min(100, confluenceScore));
    
    // 6. Assign Signal Grade & Final Decision
    let signalGrade: SignalGrade = 'NO_TRADE';
    let finalDecision: DecisionState = 'NO_TRADE';
    
    if (confluenceScore >= 90) {
        signalGrade = 'A+';
        finalDecision = isBullish ? 'STRONG_BUY' : (isBearish ? 'STRONG_SELL' : 'NO_TRADE');
    } else if (confluenceScore >= 80) {
        signalGrade = 'A';
        finalDecision = isBullish ? 'STRONG_BUY' : (isBearish ? 'STRONG_SELL' : 'NO_TRADE');
    } else if (confluenceScore >= 60) {
        signalGrade = 'B';
        finalDecision = isBullish ? 'BUY' : (isBearish ? 'SELL' : 'NO_TRADE');
    } else if (confluenceScore >= 40) {
        signalGrade = 'C';
        finalDecision = 'NO_TRADE'; // C grade means don't trade unless specifically requested
    }
    
    if (finalDecision === 'NO_TRADE') {
        signalGrade = 'NO_TRADE';
    }
    
    return {
        symbol,
        timeframe,
        timestamp,
        marketRegime: regime,
        htfBias,
        ltfSetup,
        nextCandleForecast: nextCandleDirection,
        confidence: forecast.confidence,
        confluenceScore,
        evMetrics,
        finalDecision,
        signalGrade,
        reasons
    };
}
