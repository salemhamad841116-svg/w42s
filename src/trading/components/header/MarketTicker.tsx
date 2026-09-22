import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../../store';
import clsx from 'clsx';

export const MarketTicker: React.FC = () => {
  const ticker = useMarketStore((state) => state.ticker);
  const currentPrice = ticker?.currentPrice || 0;
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState(currentPrice);

  useEffect(() => {
    if (!currentPrice) return;
    if (currentPrice > prevPrice) {
      setFlash('up');
      setTimeout(() => setFlash(null), 300);
    } else if (currentPrice < prevPrice) {
      setFlash('down');
      setTimeout(() => setFlash(null), 300);
    }
    setPrevPrice(currentPrice);
  }, [currentPrice]);

  if (!ticker || currentPrice === 0) {
    return <div className="text-[#8F9CAE] text-sm animate-pulse">Loading market data...</div>;
  }

  const isPositive = (ticker.change24h ?? 0) >= 0;

  return (
    <div className="flex items-center gap-6">
      <div className={clsx(
        "text-xl font-medium transition-colors duration-300 px-2 py-0.5 rounded font-mono",
        flash === 'up' && "bg-[#00C087]/20 text-[#00C087]",
        flash === 'down' && "bg-[#F23645]/20 text-[#F23645]",
        !flash && (isPositive ? "text-[#00C087]" : "text-[#F23645]")
      )}>
        {currentPrice.toFixed(2)}
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] text-[#8F9CAE]">24h Change</span>
        <span className={clsx("text-sm font-medium font-mono", isPositive ? "text-[#00C087]" : "text-[#F23645]")}>
          {isPositive ? '+' : ''}{(ticker.change24h ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(ticker.changePercent24h ?? 0).toFixed(2)}%)
        </span>
      </div>

      <div className="flex flex-col hidden md:flex">
        <span className="text-[10px] text-[#8F9CAE]">24h High</span>
        <span className="text-sm text-white font-medium font-mono">{(ticker.high24h ?? 0).toFixed(2)}</span>
      </div>

      <div className="flex flex-col hidden md:flex">
        <span className="text-[10px] text-[#8F9CAE]">24h Low</span>
        <span className="text-sm text-white font-medium font-mono">{(ticker.low24h ?? 0).toFixed(2)}</span>
      </div>

      <div className="flex flex-col hidden lg:flex">
        <span className="text-[10px] text-[#8F9CAE]">24h Vol</span>
        <span className="text-sm text-white font-medium font-mono">{(ticker.volume24h ?? 0).toLocaleString()}</span>
      </div>
    </div>
  );
};
