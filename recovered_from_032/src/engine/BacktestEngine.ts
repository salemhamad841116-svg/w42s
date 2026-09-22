import { BacktestConfig, BacktestResult, BacktestTrade, SignalType } from '../types';

export function runBacktest(config: BacktestConfig, strategyName: string): BacktestResult {
  const { strategyId, pair, timeframe, periodDays, initialBalance, riskPerTradePercent } = config;

  // Estimate total trades based on timeframe & period
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

    const isWin = Math.random() < 0.82; // ~82% win rate simulation for good strategy
    const type: SignalType = Math.random() > 0.4 ? 'BUY' : 'SELL';

    let entryPrice = 1.0850;
    if (pair === 'XAU/USD') entryPrice = 2740 + Math.random() * 20;
    else if (pair === 'BTC/USD') entryPrice = 96000 + Math.random() * 2000;
    else if (pair === 'GBP/USD') entryPrice = 1.2950 + Math.random() * 0.01;

    let pips = 0;
    let profitUsd = 0;
    let outcome: BacktestTrade['outcome'] = 'LOSS_SL';
