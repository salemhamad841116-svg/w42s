import React from 'react';
import { useMarketStore } from '../../store';
import { AssetSelector } from './AssetSelector';
import { TimeframeSelector } from './TimeframeSelector';
import clsx from 'clsx';

export const DesktopMarketBar: React.FC = () => {
  const ticker = useMarketStore((state) => state.ticker);
  
  if (!ticker) return null;

  const isPositive = (ticker.change24h ?? 0) >= 0;

  return (
    <div className="hidden md:flex items-center h-[42px] bg-white/95 backdrop-blur-xl border border-black/10 shadow-sm rounded-xl px-2 mx-1 select-none" dir="ltr">
      
      {/* Asset & Timeframe */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-black/10">
        <AssetSelector isLight={true} />
        <TimeframeSelector isLight={true} />
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-5 pl-4 pr-2">
        {/* High */}
        <div className="flex flex-col min-w-[64px]">
          <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">24h High</span>
          <span className="text-[13px] font-[700] text-black" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(ticker.high24h ?? 0).toFixed(2)}
          </span>
        </div>

        {/* Low */}
        <div className="flex flex-col min-w-[64px]">
          <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">24h Low</span>
          <span className="text-[13px] font-[700] text-black" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(ticker.low24h ?? 0).toFixed(2)}
          </span>
        </div>

        {/* Change */}
        <div className="flex flex-col min-w-[68px]">
          <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">24h Change</span>
          <span className={clsx("text-[13px] font-[700]", isPositive ? "text-[#00C087]" : "text-[#F23645]")} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {isPositive ? '+' : ''}{(ticker.changePercent24h ?? 0).toFixed(2)}%
          </span>
        </div>

        {/* Volume */}
        <div className="flex flex-col min-w-[50px]">
          <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">24h Vol</span>
          <span className="text-[13px] font-[700] text-black" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {((ticker.volume24h ?? 0) / 1000000).toFixed(2)}M
          </span>
        </div>

        {/* Current Price */}
        <div className="flex flex-col pl-4 border-l border-black/10 ml-1 min-w-[76px]">
          <span className="text-[9px] text-gray-500 font-medium tracking-wide uppercase">Current</span>
          <span className={clsx("text-[14px] font-[800]", isPositive ? "text-[#00C087]" : "text-[#F23645]")} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(ticker.currentPrice ?? 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
