import React from 'react';
import { X, Play, RefreshCw } from 'lucide-react';
import { useUSEStore } from '../../trading/stores/useUSEStore';
import { DirectionMatrix } from './DirectionMatrix';
import { NextCandleForecast } from './NextCandleForecast';
import { RegimeDisplay } from './RegimeDisplay';
import { ExplainPrediction } from './ExplainPrediction';
import { ConfluencePanel } from './ConfluencePanel';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XAU/USD', 'EUR/USD'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const USEWorkspace: React.FC = () => {
  const { 
    isOpen, closeWorkspace, 
    selectedSymbol, setSymbol, 
    selectedTimeframe, setTimeframe,
    isLoading, fetchAnalysis,
    directionMatrix, nextCandleForecast, regime, confluence
  } = useUSEStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 bg-white/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">محرك الاستراتيجية الشامل (USE)</h2>
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedSymbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              <select 
                value={selectedTimeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <button 
                onClick={() => fetchAnalysis()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                تحليل
              </button>
            </div>
          </div>
          
          <button 
            onClick={closeWorkspace}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <div className="flex flex-col gap-6">
            
            {/* Top row: Confluence */}
            {confluence && (
              <ConfluencePanel confluence={confluence} />
            )}

            {/* Second row: Regime */}
            {regime && (
              <div className="w-full">
                <RegimeDisplay regime={regime.regime || regime.currentRegime} confidence={regime.confidence} />
              </div>
            )}

            {/* Middle row: Direction Matrix & Forecast */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-2/5">
                {directionMatrix ? (
                  <DirectionMatrix data={directionMatrix} />
                ) : (
                  <div className="h-full min-h-[200px] flex items-center justify-center border border-dashed border-gray-300 rounded-xl bg-white/50 text-gray-400">
                    انقر على تحليل لإنشاء مصفوفة الاتجاه
                  </div>
                )}
              </div>
              <div className="w-full lg:w-3/5">
                {nextCandleForecast ? (
                  <NextCandleForecast data={nextCandleForecast} />
                ) : (
                  <div className="h-full min-h-[200px] flex items-center justify-center border border-dashed border-gray-300 rounded-xl bg-white/50 text-gray-400">
                    انقر على تحليل لإنشاء توقع الشمعة
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: Explanation */}
            {nextCandleForecast?.explanation && (
              <div className="w-full">
                <ExplainPrediction 
                  supporting={nextCandleForecast.explanation.supporting} 
                  contradicting={nextCandleForecast.explanation.contradicting} 
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
