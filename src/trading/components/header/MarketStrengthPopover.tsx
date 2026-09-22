import React, { useEffect, useRef } from 'react';
import { useCurrencyStrengthStore, Timeframe } from '../../stores/currencyStrengthStore';
import { Activity, ChevronUp, ChevronDown, Minus, X } from 'lucide-react';
import clsx from 'clsx';

interface MarketStrengthPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketStrengthPopover: React.FC<MarketStrengthPopoverProps> = ({ isOpen, onClose }) => {
  const { currencies, timeframe, setTimeframe } = useCurrencyStrengthStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-0 right-12 z-50 w-72 bg-white/95 backdrop-blur-2xl border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl p-3 select-none animate-in fade-in slide-in-from-right-2 duration-150"
      dir="ltr"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Activity size={14} />
          </div>
          <span className="text-xs font-bold text-black tracking-tight">Market Strength</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Timeframe Selector */}
          <div className="flex bg-black/[0.04] p-0.5 rounded-lg border border-black/5">
            {(['15m', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={clsx(
                  'px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer',
                  timeframe === tf
                    ? 'bg-white text-black shadow-xs font-black'
                    : 'text-gray-500 hover:text-black'
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black hover:bg-black/5 rounded-md transition-colors cursor-pointer ml-1"
            title="Close"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Table Headers */}
      <div className="flex items-center px-1 pb-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
        <div className="w-10">Asset</div>
        <div className="flex-1 text-center">Relative Strength</div>
        <div className="w-12 text-right">Score</div>
      </div>

      {/* Currency Strength Rows */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-0.5">
        {currencies.map((item) => {
          const percentage = Math.min(100, Math.abs(item.score / 10) * 100);
          const isPositive = item.score >= 0;

          return (
            <div
              key={item.currency}
              className="flex items-center px-2 py-1 bg-black/[0.02] hover:bg-black/[0.05] rounded-lg border border-black/5 transition-all"
            >
              {/* Currency Code */}
              <div className="w-10 flex items-center">
                <span className="font-black text-xs text-black font-mono">{item.currency}</span>
              </div>

              {/* Zero-Centered Strength Bar */}
              <div className="flex-1 px-2 flex items-center justify-center relative h-2.5">
                {/* Horizontal Baseline */}
                <div className="absolute inset-x-0 h-[1px] bg-black/10 top-1/2 -translate-y-1/2" />
                {/* Zero Center Line */}
                <div className="absolute inset-y-0 w-[1px] bg-black/25 left-1/2 -translate-x-1/2 z-10" />

                {/* Score Bar */}
                {isPositive ? (
                  <div
                    className="absolute left-1/2 top-0 bottom-0 bg-[#00C087] rounded-r-xs transition-all duration-200"
                    style={{ width: `${percentage / 2}%` }}
                  />
                ) : (
                  <div
                    className="absolute right-1/2 top-0 bottom-0 bg-[#F23645] rounded-l-xs transition-all duration-200"
                    style={{ width: `${percentage / 2}%` }}
                  />
                )}
              </div>

              {/* Score Value & Trend */}
              <div className="w-12 text-right flex items-center justify-end gap-1">
                {item.trend === 'up' && <ChevronUp size={11} className="text-[#00C087] shrink-0" strokeWidth={2.5} />}
                {item.trend === 'down' && <ChevronDown size={11} className="text-[#F23645] shrink-0" strokeWidth={2.5} />}
                {item.trend === 'flat' && <Minus size={11} className="text-gray-400 shrink-0" strokeWidth={2.5} />}

                <span
                  className={clsx(
                    'font-mono font-bold text-xs tabular-nums',
                    isPositive ? 'text-[#00C087]' : 'text-[#F23645]'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {item.score.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
