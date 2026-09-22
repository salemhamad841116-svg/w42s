import React from 'react';
import { ArrowUp, ArrowDown, ArrowRight, Minus } from 'lucide-react';

interface Horizon {
  timeframe: string;
  direction: string;
  directionProbability: number;
  confidence: number;
  dataQuality: string;
  sampleSize: number;
}

interface DirectionMatrixData {
  symbol: string;
  regime: string;
  horizons: Horizon[];
}

interface Props {
  data: DirectionMatrixData | null;
}

export const DirectionMatrix: React.FC<Props> = ({ data }) => {
  if (!data || !data.horizons) return null;

  const getDirectionIcon = (direction: string) => {
    if (direction.includes('BULLISH')) return <ArrowUp className="w-5 h-5 text-green-600" />;
    if (direction.includes('BEARISH')) return <ArrowDown className="w-5 h-5 text-red-600" />;
    if (direction === 'NEUTRAL') return <ArrowRight className="w-5 h-5 text-gray-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'HIGH': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-black/10 rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">مصفوفة الاتجاه (Direction Matrix)</h3>
      <div className="space-y-3">
        {data.horizons.map((horizon, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-black/5 last:border-0 hover:bg-gray-50/50 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <span className="font-bold w-12 text-gray-800">{horizon.timeframe}</span>
              {getDirectionIcon(horizon.direction)}
              <span className="text-sm font-medium text-gray-700">{horizon.direction}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">الاحتمالية</span>
                <span className="font-mono tabular-nums font-bold text-gray-900">{(horizon.directionProbability * 100).toFixed(1)}%</span>
              </div>
              
              <div className="w-24">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">الثقة</span>
                  <span className="font-mono tabular-nums">{(horizon.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${horizon.confidence * 100}%` }}
                  />
                </div>
              </div>
              
              <span className={`text-[10px] px-2 py-1 rounded font-medium ${getQualityColor(horizon.dataQuality)}`}>
                {horizon.dataQuality}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
