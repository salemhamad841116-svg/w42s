import { BacktestConfig, BacktestResult, BacktestTrade, SignalType } from '../types';

export function runBacktest(config: BacktestConfig, strategyName: string): BacktestResult {
  const { strategyId, pair, timeframe, periodDays, initialBalance, riskPerTradePercent } = config;

  const totalTrades = periodDays * (timeframe === '15M' ? 3 : timeframe === '1H' ? 2 : 1);
  const tradesHistory: BacktestTrade[] = [];
  const equityCurve: { date: string; balance: number }[] = [];

  let currentBalance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdownUsd = 0;
  let totalPips = 0;
  let totalProfitUsd = 0;
  let totalLossUsd = 0;
  let winningTradesCount = 0;
  let losingTradesCount = 0;
  let totalWinPips = 0;
  let totalLossPips = 0;

  const now = new Date();

  for (let i = totalTrades; i >= 1; i--) {
    const tradeDate = new Date(now.getTime() - i * (86400000 / (totalTrades / periodDays)));
    const formattedOpen = tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formattedClose = new Date(tradeDate.getTime() + 14400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const isWin = Math.random() < 0.82;
    const type: SignalType = Math.random() > 0.4 ? 'BUY' : 'SELL';

    let entryPrice = 1.0850;
    if (pair === 'XAU/USD') entryPrice = 2740 + Math.random() * 20;
    else if (pair === 'BTC/USD' || pair === 'BTC/USDT') entryPrice = 67000 + Math.random() * 2000;
    else if (pair === 'GBP/USD') entryPrice = 1.2950 + Math.random() * 0.01;

    let pips = 0;
    let profitUsd = 0;
    let outcome: BacktestTrade['outcome'] = 'LOSS_SL';

    const riskAmount = (currentBalance * riskPerTradePercent) / 100;

    if (isWin) {
      winningTradesCount++;
      outcome = Math.random() > 0.4 ? 'WIN_TP2' : 'WIN_TP1';
      pips = Math.floor(Math.random() * 60) + 30;
      profitUsd = riskAmount * 2.2;
      totalProfitUsd += profitUsd;
      totalWinPips += pips;
    } else {
      losingTradesCount++;
      outcome = 'LOSS_SL';
      pips = -(Math.floor(Math.random() * 30) + 15);
      profitUsd = -riskAmount;
      totalLossUsd += riskAmount;
      totalLossPips += Math.abs(pips);
    }

    currentBalance += profitUsd;
    if (currentBalance > peakBalance) peakBalance = currentBalance;
    const dd = peakBalance - currentBalance;
    if (dd > maxDrawdownUsd) maxDrawdownUsd = dd;
    totalPips += pips;

    tradesHistory.unshift({
      id: `bt_${i}`,
      pair,
      type,
      entryPrice: Number(entryPrice.toFixed(4)),
      exitPrice: Number((entryPrice + (type === 'BUY' ? pips * 0.0001 : -pips * 0.0001)).toFixed(4)),
      pips,
      profitUsd: Number(profitUsd.toFixed(2)),
      outcome,
      openTime: formattedOpen,
      closeTime: formattedClose,
    });

    equityCurve.push({
      date: formattedOpen,
      balance: Number(currentBalance.toFixed(2)),
    });
  }

  const winRate = totalTrades > 0 ? (winningTradesCount / totalTrades) * 100 : 0;
  const profitFactor = totalLossUsd > 0 ? totalProfitUsd / totalLossUsd : totalProfitUsd > 0 ? 99 : 1;
  const netProfitUsd = currentBalance - initialBalance;
  const maxDrawdownPercent = peakBalance > 0 ? (maxDrawdownUsd / peakBalance) * 100 : 0;

  return {
    strategyId,
    strategyName,
    pair,
    timeframe,
    periodDays,
    totalTrades,
    winningTrades: winningTradesCount,
    losingTrades: losingTradesCount,
    winRate: Number(winRate.toFixed(1)),
    totalPips,
    netProfitUsd: Number(netProfitUsd.toFixed(2)),
    netProfitPercent: Number(((netProfitUsd / initialBalance) * 100).toFixed(1)),
    profitFactor: Number(profitFactor.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    avgWinPips: winningTradesCount > 0 ? Number((totalWinPips / winningTradesCount).toFixed(1)) : 0,
    avgLossPips: losingTradesCount > 0 ? Number((totalLossPips / losingTradesCount).toFixed(1)) : 0,
    equityCurve,
    tradesHistory: tradesHistory.slice(0, 50),
  };
}
