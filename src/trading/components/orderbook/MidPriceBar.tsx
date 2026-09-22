import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';
import { useOrderbookStore } from '../../stores/orderbookStore';
import clsx from 'clsx';

const MidPriceBar = React.memo(() => {
  const { lastPrice, isUp } = useMarketStore((state) => ({
    lastPrice: state.ticker?.currentPrice ?? 67285.50,
    isUp: state.ticker ? state.ticker.priceDirection === 'up' : true,
  }));
  
  const { spread, spreadPercent } = useOrderbookStore((state) => ({
    spread: typeof state.spread === 'number' && state.spread > 0 ? state.spread : 0.50,
    spreadPercent: typeof state.spreadPercent === 'number' && state.spreadPercent > 0 ? state.spreadPercent : 0.01,
  }));

  return (
    <div className="h-[32px] bg-[#151924] border-y border-[#262B3D] flex items-center justify-between px-3 text-xs">
      <div className={clsx("flex items-center gap-1 text-base font-bold font-mono", isUp ? "text-[#00C087]" : "text-[#F23645]")}>
        {Number(lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
        {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
      </div>
      <div className="text-[#8F9CAE] font-mono text-[11px]">
        Spread: <span className="text-white">{Number(spread).toFixed(2)}</span> ({Number(spreadPercent).toFixed(2)}%)
      </div>
    </div>
  );
});

export default MidPriceBar;
