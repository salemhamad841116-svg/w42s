import React from 'react';
import { useForexHeatmapStore, getActiveSession, getSessionCurrencies } from '../../stores/useForexHeatmapStore';
import { X, Grid3X3 } from 'lucide-react';

/**
 * ForexHeatmap — A floating 8x8 currency cross-pair heatmap grid.
 * Color-codes each cell by bullish/bearish momentum.
 * Highlights currencies belonging to the currently active trading session.
 */

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

function getCellColor(value: number): string {
  if (value === 0) return 'bg-[#1A1F2E]'; // Diagonal / self
  const abs = Math.min(Math.abs(value), 1.5);
  const intensity = Math.floor((abs / 1.5) * 100);
  
  if (value > 0) {
    // Green scale
    if (intensity > 70) return 'bg-emerald-600/80';
    if (intensity > 40) return 'bg-emerald-600/50';
    return 'bg-emerald-600/25';
  } else {
    // Red scale
    if (intensity > 70) return 'bg-red-600/80';
    if (intensity > 40) return 'bg-red-600/50';
    return 'bg-red-600/25';
  }
}

function getCellTextColor(value: number): string {
  if (value === 0) return 'text-[#363C4E]';
  return Math.abs(value) > 0.5 ? 'text-white' : 'text-[#C0C6D0]';
}

export const ForexHeatmap: React.FC = () => {
  const { cells, isVisible, toggleVisibility } = useForexHeatmapStore();
  
  if (!isVisible || cells.length === 0) return null;

  const session = getActiveSession();
  const sessionCurrencies = getSessionCurrencies(session);

  const sessionLabel = session === 'asia' ? 'Asia' : session === 'europe' ? 'Europe' : 'Americas';

  return (
    <div 
      className="absolute z-40 top-20 right-4 w-[340px] bg-[#131722]/95 backdrop-blur-xl border border-[#2A2E39] shadow-2xl rounded-xl overflow-hidden"
      dir="ltr"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2E39] bg-[#0D1117]/50">
        <div className="flex items-center gap-2">
          <Grid3X3 size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">Forex Heatmap</span>
          <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-mono">
            {sessionLabel}
          </span>
        </div>
        <button 
          onClick={toggleVisibility}
          className="p-1 text-[#8F9CAE] hover:text-[#F23645] hover:bg-[#F23645]/10 rounded transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Grid */}
      <div className="p-2">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-8 h-6"></th>
              {CURRENCIES.map((q) => (
                <th 
                  key={q} 
                  className={`text-[9px] font-bold text-center h-6 ${
                    sessionCurrencies.includes(q) 
                      ? 'text-amber-400' 
                      : 'text-[#8F9CAE]'
                  }`}
                >
                  {q}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((base, rowIdx) => {
              const isSessionRow = sessionCurrencies.includes(base);
              return (
                <tr key={base}>
                  <td className={`text-[9px] font-bold text-right pr-1.5 ${
                    isSessionRow ? 'text-amber-400' : 'text-[#8F9CAE]'
                  }`}>
                    {base}
                  </td>
                  {CURRENCIES.map((quote, colIdx) => {
                    const cell = cells[rowIdx * 8 + colIdx];
                    if (!cell) return <td key={quote}></td>;
                    
                    const isDiagonal = base === quote;
                    
                    return (
                      <td 
                        key={quote}
                        className={`text-center text-[9px] font-mono tabular-nums p-0 ${
                          isSessionRow && sessionCurrencies.includes(quote)
                            ? 'ring-1 ring-amber-500/20'
                            : ''
                        }`}
                        title={isDiagonal ? base : `${base}/${quote}: ${cell.value > 0 ? '+' : ''}${cell.value}%`}
                      >
                        <div className={`w-full h-7 flex items-center justify-center rounded-sm mx-px my-px ${getCellColor(cell.value)} ${getCellTextColor(cell.value)}`}>
                          {isDiagonal ? '—' : (cell.value > 0 ? '+' : '') + cell.value.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
