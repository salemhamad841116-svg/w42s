import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useChartStore } from '../../store';
import { useMarketStore } from '../../stores/marketStore';
import { useTabsStore } from '../../stores/tabsStore';
import { liveMarketService } from '../../services/liveMarketService';
import clsx from 'clsx';

export interface AssetSymbolItem {
  id: string;
  name: string;
  price: number;
  change: number;
  category: 'Forex' | 'Crypto' | 'Commodities' | 'Indices' | 'Stocks';
  favorite: boolean;
}

const BASE_SYMBOLS: AssetSymbolItem[] = [
  // Forex Majors
  { id: 'EURUSD', name: 'EUR/USD', price: 1.0850, change: 0.12, category: 'Forex', favorite: true },
  { id: 'GBPUSD', name: 'GBP/USD', price: 1.2640, change: -0.18, category: 'Forex', favorite: true },
  { id: 'USDJPY', name: 'USD/JPY', price: 154.20, change: 0.35, category: 'Forex', favorite: true },
  { id: 'AUDUSD', name: 'AUD/USD', price: 0.6540, change: 0.22, category: 'Forex', favorite: false },
  { id: 'USDCAD', name: 'USD/CAD', price: 1.3650, change: -0.15, category: 'Forex', favorite: false },
  { id: 'USDCHF', name: 'USD/CHF', price: 0.9020, change: 0.05, category: 'Forex', favorite: false },

  // Commodities / Metals
  { id: 'XAUUSD', name: 'XAU/USD', price: 2470.20, change: 0.45, category: 'Commodities', favorite: true },

  // Indices
  { id: 'US30', name: 'US30', price: 39850.00, change: 0.65, category: 'Indices', favorite: true },
  { id: 'NAS100', name: 'NAS100', price: 18050.60, change: 1.10, category: 'Indices', favorite: true },
  { id: 'SPX500', name: 'SPX500', price: 5120.40, change: 0.80, category: 'Indices', favorite: true },

  // Crypto Majors
  { id: 'BTCUSDT', name: 'BTC/USDT', price: 78500.00, change: 1.25, category: 'Crypto', favorite: true },
  { id: 'ETHUSDT', name: 'ETH/USDT', price: 3450.20, change: -0.85, category: 'Crypto', favorite: true },
  { id: 'SOLUSDT', name: 'SOL/USDT', price: 182.40, change: 3.40, category: 'Crypto', favorite: true },

  // Stocks
  { id: 'AAPL', name: 'AAPL', price: 175.50, change: 1.50, category: 'Stocks', favorite: false },
  { id: 'TSLA', name: 'TSLA', price: 190.20, change: -2.10, category: 'Stocks', favorite: false },
];

const CATEGORIES = ['All', 'Forex', 'Crypto', 'Commodities', 'Indices', 'Stocks'];

export const AssetSelector: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const activeSymbol = useChartStore((state) => state.activeSymbol) || 'EUR/USD';
  const setActiveSymbol = useChartStore((state) => state.setActiveSymbol);
  const setCurrentSymbol = useMarketStore((state) => state.setCurrentSymbol);
  const updateActiveTabMeta = useTabsStore((state) => state.updateActiveTabMeta);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const symbolsWithLive = BASE_SYMBOLS.map(s => {
    const live = liveMarketService.getTicker(s.name);
    return {
      ...s,
      price: live ? live.currentPrice : s.price,
      change: live ? live.changePercent24h : s.change,
    };
  });

  const filteredSymbols = symbolsWithLive.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || s.category === category;
    return matchesSearch && matchesCat;
  });

  const handleSelect = (symbolName: string) => {
    setActiveSymbol(symbolName);
    setCurrentSymbol(symbolName);
    try {
      updateActiveTabMeta({ symbol: symbolName });
    } catch {}
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Compact Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer border shadow-xs select-none",
          isOpen
            ? "bg-black/10 text-black border-black/20"
            : isLight
            ? "bg-white hover:bg-gray-50 text-black border-black/10"
            : "bg-[#1E222D] hover:bg-[#2A2E39] text-white border-[#2A2E39]"
        )}
        title="اختيار رمز الزوج / السوق (Symbol Selector)"
      >
        <span className="tracking-tight">{activeSymbol}</span>
        <ChevronDown 
          size={13} 
          className={clsx("transition-transform duration-200 text-gray-500", isOpen && "rotate-180 text-black")} 
        />
      </button>

      {/* White Glass Popover Menu */}
      {isOpen && (
        <div 
          className="absolute top-full mt-1.5 left-0 w-80 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          dir="ltr"
        >
          {/* Top Search Bar */}
          <div className="p-2.5 border-b border-black/5 bg-black/[0.02]">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                autoFocus
                placeholder="Search symbol (e.g. EUR/USD, BTC)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-lg pl-8 pr-3 py-1.5 text-black text-xs font-semibold placeholder:text-gray-400 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex px-2 py-1.5 gap-1 border-b border-black/5 overflow-x-auto no-scrollbar bg-black/[0.01]">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer",
                  category === c 
                    ? "bg-black text-white shadow-xs" 
                    : "text-gray-500 hover:text-black hover:bg-black/5"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Symbol Rows */}
          <div className="max-h-80 overflow-y-auto py-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredSymbols.map(s => {
              const isActive = s.name === activeSymbol;
              const isPositive = s.change >= 0;

              return (
                <button 
                  key={s.id}
                  onClick={() => handleSelect(s.name)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3.5 py-2 transition-all text-left cursor-pointer group border-b border-black/[0.02] last:border-none",
                    isActive 
                      ? "bg-blue-50/80 text-blue-900 font-bold border-l-3 border-l-blue-600" 
                      : "hover:bg-black/[0.03] text-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <Check size={14} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-500 shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className={clsx("text-xs font-black tracking-tight", isActive ? "text-blue-700" : "text-black")}>
                        {s.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {s.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold font-mono tabular-nums text-black">
                      {s.price < 10 ? s.price.toFixed(4) : s.price.toFixed(2)}
                    </span>
                    <span className={clsx("text-[10px] font-black font-mono tabular-nums", isPositive ? "text-[#00C087]" : "text-[#F23645]")}>
                      {isPositive ? '+' : ''}{s.change.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredSymbols.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs font-medium">
                No symbols found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
