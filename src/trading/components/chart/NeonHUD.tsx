import React, { useState, useEffect } from 'react';
import { useBrokerStore } from '../../stores/brokerStore';
import { useAISettingsStore } from '../../stores/useAISettingsStore';
import { useMarketStore } from '../../stores/marketStore';
import { 
  ChevronUp, ChevronDown, Wallet, TrendingUp, ShieldCheck, 
  Bot, Wifi, WifiOff, Clock 
} from 'lucide-react';

/**
 * NeonHUD — Collapsible heads-up display bar showing account health,
 * AI engine status, and connection quality in a neon-accented glass style.
 * Sits between HeaderBar and the chart canvas.
 */
export const NeonHUD: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [serverTime, setServerTime] = useState(new Date());

  // Data sources
  const { activeBroker, mt5Account, binanceAccount } = useBrokerStore();
  const { isAIEnabled, maxRiskPerTradePercent } = useAISettingsStore();
  const ticker = useMarketStore((s) => s.ticker);

  // Derive balance & equity based on active broker
  const balance = activeBroker === 'BINANCE_TESTNET' 
    ? binanceAccount.balanceUSDT 
    : mt5Account.balance;
  const equity = activeBroker === 'BINANCE_TESTNET' 
    ? binanceAccount.totalWalletBalance 
    : mt5Account.equity;
  const freeMargin = activeBroker === 'BINANCE_TESTNET' 
    ? binanceAccount.availableUSDT 
    : mt5Account.freeMargin;
  const marginLevel = mt5Account.marginLevel;
  const brokerConnected = activeBroker === 'BINANCE_TESTNET' 
    ? binanceAccount.status === 'CONNECTED' 
    : mt5Account.status === 'CONNECTED';

  // Margin level color coding
  const marginColor = marginLevel > 200 
    ? 'text-emerald-400' 
    : marginLevel > 100 
      ? 'text-amber-400' 
      : 'text-red-400';

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setServerTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (collapsed) {
    return (
      <div className="w-full h-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 relative cursor-pointer group"
        onClick={() => setCollapsed(false)}
      >
        <div className="absolute right-4 -top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-[#131722] border border-cyan-500/30 rounded-full p-0.5">
            <ChevronDown size={12} className="text-cyan-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0D1117]/80 backdrop-blur-md border-b border-cyan-500/15 px-4 py-1.5 flex items-center justify-between gap-6 select-none"
      dir="ltr"
    >
      {/* Left: Account Metrics */}
      <div className="flex items-center gap-5">
        {/* Balance */}
        <div className="flex items-center gap-1.5">
          <Wallet size={13} className="text-cyan-400" />
          <span className="text-[10px] text-[#8F9CAE] uppercase tracking-wider">Balance</span>
          <span className="text-sm font-bold text-white tabular-nums font-mono">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Equity */}
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-purple-400" />
          <span className="text-[10px] text-[#8F9CAE] uppercase tracking-wider">Equity</span>
          <span className="text-sm font-bold text-white tabular-nums font-mono">
            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Free Margin */}
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span className="text-[10px] text-[#8F9CAE] uppercase tracking-wider">Free</span>
          <span className="text-sm font-bold text-white tabular-nums font-mono">
            ${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Margin Level */}
        {marginLevel > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#8F9CAE] uppercase tracking-wider">Margin</span>
            <span className={`text-sm font-bold tabular-nums font-mono ${marginColor}`}>
              {marginLevel.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Center: AI Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot size={14} className={isAIEnabled ? 'text-emerald-400' : 'text-red-400'} />
            {isAIEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <span className={`text-xs font-bold ${isAIEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {isAIEnabled ? 'AI Active' : 'AI Paused'}
          </span>
          <span className="text-[10px] text-[#8F9CAE] bg-[#1A1F2E] px-1.5 py-0.5 rounded font-mono">
            Risk {maxRiskPerTradePercent.toFixed(1)}%
          </span>
        </div>

        {/* 24h Change */}
        {ticker && (
          <div className="flex items-center gap-1">
            <span className={`text-xs font-bold tabular-nums font-mono ${
              (ticker.changePercent24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {(ticker.changePercent24h ?? 0) >= 0 ? '+' : ''}{(ticker.changePercent24h ?? 0).toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Right: Connection & Clock */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {brokerConnected 
            ? <Wifi size={13} className="text-emerald-400" /> 
            : <WifiOff size={13} className="text-red-400" />
          }
          <span className={`text-[10px] font-bold ${brokerConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {brokerConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#8F9CAE]">
          <Clock size={12} />
          <span className="text-[11px] font-mono tabular-nums">
            {serverTime.toLocaleTimeString('en-GB', { hour12: false })}
          </span>
        </div>

        {/* Collapse Button */}
        <button 
          onClick={() => setCollapsed(true)}
          className="p-1 text-[#8F9CAE] hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
          title="Collapse HUD"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    </div>
  );
};
