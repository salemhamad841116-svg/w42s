import React from 'react';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface ForecastData {
  timeframe: string;
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  expectedRange: {
    low: number;
    high: number;
  };
  confidence: number;
  dataQuality: string;
  sampleSize: number;
}

interface Props {
  data: ForecastData | null;
}

export const NextCandleForecast: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-black/10 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
          توقع الشمعة القادمة — {data.timeframe}
        </h3>
        <div className="flex gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono tabular-nums">
            N={data.sampleSize}
          </span>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            data.dataQuality === 'HIGH' ? 'bg-green-100 text-green-800' : 
            data.dataQuality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {data.dataQuality}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {/* Bullish Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1 text-green-700 font-medium"><ArrowUp className="w-4 h-4" /> صعود</span>
            <span className="font-mono tabular-nums font-bold">{(data.bullishProbability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-black/5">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.bullishProbability * 100}%` }} />
          </div>
        </div>

        {/* Bearish Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1 text-red-700 font-medium"><ArrowDown className="w-4 h-4" /> هبوط</span>
            <span className="font-mono tabular-nums font-bold">{(data.bearishProbability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-black/5">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${data.bearishProbability * 100}%` }} />
          </div>
        </div>

        {/* Neutral Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1 text-gray-600 font-medium"><ArrowRight className="w-4 h-4" /> محايد</span>
            <span className="font-mono tabular-nums font-bold">{(data.neutralProbability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-black/5">
            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${data.neutralProbability * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">النطاق المتوقع</p>
          <p className="font-mono tabular-nums font-semibold text-gray-900">
            {data.expectedRange.low.toFixed(2)} - {data.expectedRange.high.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">مستوى الثقة</p>
          <div className="flex items-center gap-2">
            <p className="font-mono tabular-nums font-semibold text-gray-900">{(data.confidence * 100).toFixed(1)}%</p>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${data.confidence * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
