import React, { useState, useRef, useEffect } from 'react';
import { useTabsStore, ChartTabSession } from '../../stores/tabsStore';
import { Plus, X, Search, ChevronRight, ChevronLeft } from 'lucide-react';

const QUICK_ADD_SYMBOLS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH/USDT', name: 'Ethereum', category: 'Crypto' },
  { symbol: 'SOL/USDT', name: 'Solana', category: 'Crypto' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'US30', name: 'Dow Jones 30 Index', category: 'Indices' },
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'Indices' },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'Commodities' },
];

// Helper to render asset flag or crypto badge
const AssetIcon: React.FC<{ symbol: string }> = ({ symbol }) => {
  const clean = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.startsWith('BTC')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#F7931A]/20 text-[#F7931A] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#F7931A]/40">
        ₿
      </span>
    );
  }
  if (clean.startsWith('ETH')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#627EEA]/20 text-[#627EEA] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#627EEA]/40">
        Ξ
      </span>
    );
  }
  if (clean.startsWith('SOL')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#14F195]/20 text-[#14F195] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#14F195]/40">
        S
      </span>
    );
  }
  if (clean.includes('EUR')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#0052B4]/20 text-[#5C93FF] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#0052B4]/40">
        €
      </span>
    );
  }
  if (clean.includes('GBP')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#8A2BE2]/20 text-[#C084FC] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#8A2BE2]/40">
        £
      </span>
    );
  }
  if (clean.includes('JPY')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#BC002D]/20 text-[#F87171] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#BC002D]/40">
        ¥
      </span>
    );
  }
  if (clean.includes('XAU') || clean.includes('GOLD')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#E5A93C]/20 text-[#FBBF24] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#E5A93C]/40">
        Au
      </span>
    );
  }
  if (clean.includes('30') || clean.includes('SPX')) {
    return (
      <span className="w-4 h-4 rounded-full bg-[#2962FF]/20 text-[#2962FF] font-bold text-[8px] flex items-center justify-center shrink-0 border border-[#2962FF]/40">
        IDX
      </span>
    );
  }

  return (
    <span className="w-4 h-4 rounded-full bg-gray-700/50 text-gray-300 font-semibold text-[9px] flex items-center justify-center shrink-0 border border-gray-600/40">
      {clean.slice(0, 2)}
    </span>
  );
};

export const ChartWorkspaceTabs: React.FC = () => {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const switchTab = useTabsStore((state) => state.switchTab);
  const addTab = useTabsStore((state) => state.addTab);
  const closeTab = useTabsStore((state) => state.closeTab);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  const handleSelectNewSymbol = (symbol: string) => {
    addTab(symbol, '15');
    setIsPickerOpen(false);
    setSearchQuery('');
  };

  const filteredSymbols = QUICK_ADD_SYMBOLS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="h-9 w-full bg-[#151924] border-b border-[#262B3D] flex items-center justify-between px-1.5 select-none relative z-30"
      dir="ltr"
    >
      {/* Scrollable Tabs List */}
      <div className="flex-1 flex items-center overflow-hidden h-full mr-2">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar h-full scroll-smooth py-0.5"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab: ChartTabSession) => {
            const isActive = tab.id === activeTabId;
            const isPositive = (tab.change24h ?? 0) >= 0;

            return (
              <div
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`group relative h-[30px] flex items-center gap-2 px-2.5 rounded-t cursor-pointer transition-all shrink-0 border-t-2 text-xs ${
                  isActive
                    ? 'bg-[#1E222D] text-white border-[#2962FF] font-medium shadow-sm'
                    : 'bg-[#151924] text-[#8F9CAE] border-transparent hover:bg-[#1A1F2C] hover:text-gray-200'
                }`}
              >
                {/* Asset Icon / Flag */}
                <AssetIcon symbol={tab.symbol} />

                {/* Symbol & Resolution Badge */}
                <span className="font-semibold tracking-tight whitespace-nowrap">
                  {tab.symbol.replace('/', '')}
                </span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-gray-500'
                  }`}
                >
                  {tab.timeframe}
                </span>

                {/* 24h Direction Indicator */}
                <span
                  className={`text-[10px] font-mono flex items-center ${
                    isPositive ? 'text-[#00C087]' : 'text-[#F23645]'
                  }`}
                  title={`24h Change: ${isPositive ? '+' : ''}${tab.change24h}%`}
                >
                  {isPositive ? '▲' : '▼'}
                </span>

                {/* Close Button (✕) */}
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ml-0.5 ${
                      isActive
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white hover:bg-white/10'
                    }`}
                    title="إغلاق اللسان"
                    aria-label="إغلاق اللسان"
                  >
                    <X size={11} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trailing Action Controls: Add Tab (+) & Horizontal Nav */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Scroll Left/Right arrows if overflowing */}
        <button
          onClick={scrollLeft}
          className="w-5 h-6 text-gray-400 hover:text-white hover:bg-[#1E222D] rounded flex items-center justify-center transition-colors"
          title="تمرير لليسار"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={scrollRight}
          className="w-5 h-6 text-gray-400 hover:text-white hover:bg-[#1E222D] rounded flex items-center justify-center transition-colors"
          title="تمرير لليمين"
        >
          <ChevronRight size={13} />
        </button>

        <div className="w-[1px] h-3.5 bg-[#262B3D] mx-0.5" />

        {/* Add Tab Button (+) */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className={`h-[26px] px-2 rounded flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
              isPickerOpen
                ? 'bg-[#2962FF] text-white'
                : 'text-[#8F9CAE] hover:text-white hover:bg-[#1E222D]'
            }`}
            title="إضافة جلسة رسم بياني جديدة (+)"
          >
            <Plus size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline text-[11px]">جلسة جديدة</span>
          </button>

          {/* Quick Symbol Search & Launch Popover */}
          {isPickerOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-64 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              dir="rtl"
            >
              <div className="relative mb-2">
                <Search
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="ابحث عن رمز أو زوج عملات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#131722] border border-[#2A2E39] rounded px-8 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#2962FF]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5 no-scrollbar">
                {filteredSymbols.length === 0 ? (
                  <div className="text-center py-3 text-xs text-gray-500">لا توجد رموز مطابقة</div>
                ) : (
                  filteredSymbols.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelectNewSymbol(item.symbol)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#2A2E39] rounded transition-colors text-right cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <AssetIcon symbol={item.symbol} />
                        <div>
                          <span className="text-xs font-semibold text-white group-hover:text-[#2962FF] transition-colors">
                            {item.symbol}
                          </span>
                          <span className="block text-[10px] text-gray-400">{item.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#131722] text-gray-400 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartWorkspaceTabs;
