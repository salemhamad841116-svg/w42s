import React, { useState, useMemo } from 'react';
import { useTabsStore } from '../../stores/tabsStore';
import { Search, X, Check } from 'lucide-react';

interface AddSymbolPanelProps {
  onClose: () => void;
}

interface SymbolItem {
  symbol: string;
  name: string;
  category: 'Forex' | 'Crypto' | 'Indices' | 'Commodities';
}

const AVAILABLE_SYMBOLS: SymbolItem[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Forex' },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'Commodities' },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', category: 'Commodities' },
  { symbol: 'BTC/USDT', name: 'Bitcoin / Tether', category: 'Crypto' },
  { symbol: 'ETH/USDT', name: 'Ethereum / Tether', category: 'Crypto' },
  { symbol: 'SOL/USDT', name: 'Solana / Tether', category: 'Crypto' },
  { symbol: 'US30', name: 'Dow Jones Industrial 30', category: 'Indices' },
  { symbol: 'NAS100', name: 'Nasdaq 100 Index', category: 'Indices' },
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'Indices' },
];

export const AddSymbolPanel: React.FC<AddSymbolPanelProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { tabs, activeTabId, switchTab, addTab } = useTabsStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const categories = ['All', 'Forex', 'Crypto', 'Indices', 'Commodities'];

  const filteredSymbols = useMemo(() => {
    return AVAILABLE_SYMBOLS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectSymbol = (symbol: string) => {
    // Check if a tab with this symbol already exists
    const existingTab = tabs.find(
      (t) => t.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (existingTab) {
      switchTab(existingTab.id);
    } else {
      addTab(symbol, '15');
    }

    onClose();
  };

  return (
    <div
      className="w-72 bg-[#181C28] border border-[#2D3345] rounded-xl shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150 notranslate text-left"
      dir="ltr"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#262B3D] bg-[#12151F]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#2962FF]/15 text-[#2962FF] flex items-center justify-center font-bold text-xs">
            +
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Add Symbol
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#8F9CAE] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-[#262B3D] bg-[#151924]">
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-2.5 text-[#8F9CAE] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol (e.g. BTC, EUR, XAU)..."
            autoFocus
            className="w-full h-8 pl-8 pr-7 bg-[#1E222D] border border-[#2B3144] rounded-lg text-xs text-white placeholder-[#60687B] focus:outline-none focus:border-[#2962FF] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#8F9CAE] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2962FF] text-white font-semibold'
                  : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-[#202534] p-1">
        {filteredSymbols.length === 0 ? (
          <div className="py-8 text-center text-[#8F9CAE] text-xs">
            No matching symbols found
          </div>
        ) : (
          filteredSymbols.map((item) => {
            const isActive =
              activeTab?.symbol.toUpperCase() === item.symbol.toUpperCase();

            return (
              <button
                key={item.symbol}
                onClick={() => handleSelectSymbol(item.symbol)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#1E222D] border border-[#2962FF]/40'
                    : 'hover:bg-[#1E2336] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#252B3C] flex items-center justify-center text-[10px] font-mono font-bold text-[#8F9CAE] group-hover:text-white group-hover:bg-[#2E364A]">
                    {item.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#2962FF] transition-colors">
                      {item.symbol}
                    </div>
                    <div className="text-[10px] text-[#8F9CAE] truncate max-w-[140px]">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#202534] text-[#8F9CAE] font-medium">
                    {item.category}
                  </span>
                  {isActive && (
                    <Check size={14} className="text-[#2962FF] shrink-0" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
