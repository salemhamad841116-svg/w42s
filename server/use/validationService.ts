import { getDb } from '../database.js';

export function getValidationDashboard() {
    const db = getDb();
    
    // Fetch all closed paper trades with their prediction details
    const trades = db.prepare(`
        SELECT t.*, p.signal_grade, p.market_regime, p.timeframe, p.timestamp as prediction_timestamp,
               p.bullish_probability, p.bearish_probability, p.neutral_probability, p.confidence, p.actual_result
        FROM use_paper_trades t
        JOIN use_predictions p ON t.prediction_id = p.prediction_id
        WHERE t.status = 'CLOSED'
    `).all() as any[];
    
    const performanceByGrade: Record<string, any> = {};
    const performanceBreakdown: any = {
        symbol: {}, timeframe: {}, regime: {}, side: {}, hour: {}, weekday: {}, month: {}
    };
    
    let totalWinCount = 0;
    let totalTrades = 0;
    
    // Process trades
    for (const t of trades) {
        totalTrades++;
        const isWin = t.net_pnl > 0;
        if (isWin) totalWinCount++;
        
        // 1. By Grade
        const grade = t.signal_grade || 'UNKNOWN';
        if (!performanceByGrade[grade]) {
            performanceByGrade[grade] = { trades: 0, wins: 0, netPnl: 0, expectancy: 0, rSum: 0 };
        }
        performanceByGrade[grade].trades++;
        if (isWin) performanceByGrade[grade].wins++;
        performanceByGrade[grade].netPnl += t.net_pnl;
        performanceByGrade[grade].rSum += t.realized_r;
        
        // 2. Breakdown
        const date = new Date(t.prediction_timestamp * 1000);
        const hour = date.getUTCHours().toString();
        const weekday = date.getUTCDay().toString();
        const month = date.getUTCMonth().toString();
        
        const keys = [
            { category: 'symbol', value: t.symbol },
            { category: 'timeframe', value: t.timeframe },
            { category: 'regime', value: t.market_regime },
            { category: 'side', value: t.side },
            { category: 'hour', value: hour },
            { category: 'weekday', value: weekday },
            { category: 'month', value: month }
        ];
        
        for (const { category, value } of keys) {
            if (!performanceBreakdown[category][value]) {
                performanceBreakdown[category][value] = { trades: 0, netPnl: 0, wins: 0 };
            }
            performanceBreakdown[category][value].trades++;
            performanceBreakdown[category][value].netPnl += t.net_pnl;
            if (isWin) performanceBreakdown[category][value].wins++;
        }
    }
    
    // Finalize Grade calcs
    for (const g in performanceByGrade) {
        const stats = performanceByGrade[g];
        stats.winRate = stats.trades > 0 ? stats.wins / stats.trades : 0;
        stats.expectancy = stats.trades > 0 ? stats.rSum / stats.trades : 0;
    }
    
    // 3. Probability Calibration
    const calibrationBuckets = [
        { label: '0-50%', min: 0, max: 50, samples: 0, predictedSum: 0, wins: 0 },
        { label: '50-60%', min: 50, max: 60, samples: 0, predictedSum: 0, wins: 0 },
        { label: '60-70%', min: 60, max: 70, samples: 0, predictedSum: 0, wins: 0 },
        { label: '70-80%', min: 70, max: 80, samples: 0, predictedSum: 0, wins: 0 },
        { label: '80-90%', min: 80, max: 90, samples: 0, predictedSum: 0, wins: 0 },
        { label: '90-100%', min: 90, max: 100, samples: 0, predictedSum: 0, wins: 0 }
    ];
    
    for (const t of trades) {
        const confPct = t.confidence * 100;
        const bucket = calibrationBuckets.find(b => confPct >= b.min && confPct <= b.max);
        if (bucket) {
            bucket.samples++;
            bucket.predictedSum += t.confidence;
            if (t.net_pnl > 0) bucket.wins++;
        }
    }
    
    const calibration = calibrationBuckets.map(b => ({
        bucket: b.label,
        sampleSize: b.samples,
        predictedMean: b.samples > 0 ? b.predictedSum / b.samples : 0,
        actualWinRate: b.samples > 0 ? b.wins / b.samples : 0,
        calibrationError: b.samples > 0 ? (b.wins / b.samples) - (b.predictedSum / b.samples) : 0
    }));
    
    // 4. Drift Detection Alerts
    const alerts: string[] = [];
    if (totalTrades >= 20) {
        const recentTrades = trades.slice(-20);
        const recentWins = recentTrades.filter(t => t.net_pnl > 0).length;
        const recentWinRate = recentWins / 20;
        const overallWinRate = totalWinCount / totalTrades;
        
        if (overallWinRate - recentWinRate > 0.15) {
            alerts.push('EXPECTANCY_DETERIORATING');
        }
    }
    
    // Check calibration drift in 70-100% ranges
    const highConfBuckets = calibration.filter(b => b.bucket === '70-80%' || b.bucket === '80-90%' || b.bucket === '90-100%');
    let driftCount = 0;
    for (const b of highConfBuckets) {
        if (b.sampleSize >= 10 && Math.abs(b.calibrationError) > 0.15) {
            driftCount++;
        }
    }
    if (driftCount > 0) alerts.push('CALIBRATION_DRIFT');
    
    // 5. Dataset Comparison Matrix
    // Fetch historical/oos backtests
    const backtests = db.prepare(`SELECT * FROM use_backtests ORDER BY created_at DESC LIMIT 50`).all() as any[];
    const comparison = {
        historical: { winRate: 0, expectancy: 0, sampleSize: 0 },
        oos: { winRate: 0, expectancy: 0, sampleSize: 0 },
        forward: { winRate: totalTrades > 0 ? totalWinCount / totalTrades : 0, expectancy: totalTrades > 0 ? performanceByGrade['A+']?.expectancy || 0 : 0, sampleSize: totalTrades }
    };
    
    // Aggregate backtests for comparison
    for (const b of backtests) {
        if (b.dataset_type === 'OOS') {
            comparison.oos.sampleSize += b.total_trades;
            comparison.oos.winRate = (comparison.oos.winRate + b.win_rate) / 2; // Rough avg
        } else {
            comparison.historical.sampleSize += b.total_trades;
            comparison.historical.winRate = (comparison.historical.winRate + b.win_rate) / 2;
        }
    }
    
    return {
        performanceByGrade,
        performanceBreakdown,
        calibration,
        alerts,
        datasetComparison: comparison
    };
}
