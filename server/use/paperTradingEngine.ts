import { getDb, queryCandlesUnlimited } from '../database.js';
import type { ConfluenceResult } from './types.js';
import { randomUUID } from 'crypto';

export function evaluateAndExecutePaperTrade(confluence: ConfluenceResult) {
    if (confluence.finalDecision !== 'BUY' && confluence.finalDecision !== 'STRONG_BUY' &&
        confluence.finalDecision !== 'SELL' && confluence.finalDecision !== 'STRONG_SELL') {
        return;
    }
    
    // Grade C or better
    if (confluence.signalGrade === 'NO_TRADE') return;

    const db = getDb();
    
    // 1. Generate prediction_id and insert to use_predictions
    const predictionId = randomUUID();
    
    db.prepare(`
        INSERT INTO use_predictions (
            prediction_id, timestamp, symbol, timeframe, market_regime,
            confidence, confluence_score, signal_grade, evaluation_status, ev_score
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?
        )
    `).run(
        predictionId,
        confluence.timestamp,
        confluence.symbol,
        confluence.timeframe,
        confluence.marketRegime,
        confluence.confidence,
        confluence.confluenceScore,
        confluence.signalGrade,
        confluence.evMetrics.expectedValue
    );
    
    const side = (confluence.finalDecision.includes('BUY')) ? 'BUY' : 'SELL';
    
    // Fetch last candle to get entry price
    const latestCandle = db.prepare(`SELECT close FROM candles WHERE symbol = ? AND timeframe = ? ORDER BY time DESC LIMIT 1`).get(confluence.symbol, confluence.timeframe) as {close: number} | undefined;
    
    let basePrice = 1.0;
    if (latestCandle) {
        basePrice = latestCandle.close;
    }
    
    // Simulate spread (e.g., 0.01%)
    const spreadPct = 0.0001;
    let entryPrice = side === 'BUY' ? basePrice * (1 + spreadPct) : basePrice * (1 - spreadPct);
    
    // Risk management logic
    // SL and TP based on avgWinDistance and avgLossDistance (percentages)
    let slPrice = side === 'BUY' ? entryPrice * (1 - confluence.evMetrics.avgLossDistance) : entryPrice * (1 + confluence.evMetrics.avgLossDistance);
    let tpPrice = side === 'BUY' ? entryPrice * (1 + confluence.evMetrics.avgWinDistance) : entryPrice * (1 - confluence.evMetrics.avgWinDistance);
    
    // Default fallback if distance is zero
    if (confluence.evMetrics.avgLossDistance === 0) {
        slPrice = side === 'BUY' ? entryPrice * 0.99 : entryPrice * 1.01;
    }
    if (confluence.evMetrics.avgWinDistance === 0) {
        tpPrice = side === 'BUY' ? entryPrice * 1.01 : entryPrice * 0.99;
    }
    
    // Size = 1% of account equity
    const account = db.prepare(`SELECT equity FROM use_paper_account WHERE id = 'default'`).get() as {equity: number} | undefined;
    const equity = account ? account.equity : 100000;
    
    const riskAmount = equity * 0.01; 
    const priceDiff = Math.abs(entryPrice - slPrice);
    const size = priceDiff > 0 ? riskAmount / priceDiff : 1000;
    
    const tradeId = randomUUID();
    
    db.prepare(`
        INSERT INTO use_paper_trades (
            trade_id, prediction_id, symbol, side, entry_price,
            sl_price, tp_price, size, status, created_at, trading_costs
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?
        )
    `).run(
        tradeId,
        predictionId,
        confluence.symbol,
        side,
        entryPrice,
        slPrice,
        tpPrice,
        size,
        Math.floor(Date.now() / 1000),
        size * entryPrice * spreadPct // rough cost
    );
}

export async function evaluateOpenPaperTrades() {
    const db = getDb();
    
    const openTrades = db.prepare(`
        SELECT t.*, p.timeframe, p.timestamp as prediction_timestamp
        FROM use_paper_trades t
        JOIN use_predictions p ON t.prediction_id = p.prediction_id
        WHERE t.status = 'OPEN'
    `).all() as any[];
    
    for (const trade of openTrades) {
        // Fetch candles since trade was opened
        const candles = await queryCandlesUnlimited(trade.symbol, trade.timeframe, trade.prediction_timestamp, Math.floor(Date.now() / 1000));
        
        if (candles.length === 0) continue;
        
        let mfe = 0; // Max Favorable Excursion (price)
        let mae = 0; // Max Adverse Excursion (price)
        
        let mfePct = 0;
        let maePct = 0;
        
        let closed = false;
        let exitPrice = 0;
        let exitTime = 0;
        let barsHeld = 0;
        
        for (let i = 0; i < candles.length; i++) {
            const c = candles[i];
            barsHeld++;
            
            // Calculate MFE and MAE
            if (trade.side === 'BUY') {
                const highPct = (c.high - trade.entry_price) / trade.entry_price;
                const lowPct = (c.low - trade.entry_price) / trade.entry_price;
                if (highPct > mfePct) mfePct = highPct;
                if (lowPct < maePct) maePct = lowPct;
                
                if (c.low <= trade.sl_price) {
                    closed = true;
                    exitPrice = trade.sl_price;
                    exitTime = c.time;
                    break;
                }
                if (c.high >= trade.tp_price) {
                    closed = true;
                    exitPrice = trade.tp_price;
                    exitTime = c.time;
                    break;
                }
            } else {
                const lowPct = (trade.entry_price - c.low) / trade.entry_price;
                const highPct = (trade.entry_price - c.high) / trade.entry_price;
                if (lowPct > mfePct) mfePct = lowPct;
                if (highPct < maePct) maePct = highPct;
                
                if (c.high >= trade.sl_price) {
                    closed = true;
                    exitPrice = trade.sl_price;
                    exitTime = c.time;
                    break;
                }
                if (c.low <= trade.tp_price) {
                    closed = true;
                    exitPrice = trade.tp_price;
                    exitTime = c.time;
                    break;
                }
            }
        }
        
        if (closed) {
            // Calculate Realized R, net PnL
            const riskPrice = Math.abs(trade.entry_price - trade.sl_price);
            const profitPrice = trade.side === 'BUY' ? (exitPrice - trade.entry_price) : (trade.entry_price - exitPrice);
            
            const realizedR = riskPrice > 0 ? (profitPrice / riskPrice) : 0;
            const grossPnl = profitPrice * trade.size;
            const netPnl = grossPnl - trade.trading_costs;
            
            // Update trade
            db.prepare(`
                UPDATE use_paper_trades
                SET status = 'CLOSED', exit_price = ?, exit_time = ?,
                    realized_r = ?, mfe = ?, mae = ?, bars_held = ?, net_pnl = ?
                WHERE trade_id = ?
            `).run(
                exitPrice,
                exitTime,
                realizedR,
                mfePct,
                maePct,
                barsHeld,
                netPnl,
                trade.trade_id
            );
            
            // Update account balance
            db.prepare(`
                UPDATE use_paper_account
                SET balance = balance + ?, equity = equity + ?, updated_at = ?
                WHERE id = 'default'
            `).run(netPnl, netPnl, Math.floor(Date.now() / 1000));
        }
    }
}
