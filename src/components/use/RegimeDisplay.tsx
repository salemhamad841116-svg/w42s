import React from 'react';
import { TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';

interface Props {
  regime: string;
  confidence: number;
}

export const RegimeDisplay: React.FC<Props> = ({ regime, confidence }) => {
  const getRegimeDetails = (regimeStr: string) => {
    switch (regimeStr) {
      case 'TRENDING_UP':
        return { icon: <TrendingUp className="w-6 h-6 text-green-600" />, label: 'اتجاه صاعد', bg: 'bg-green-50 border-green-200' };
      case 'TRENDING_DOWN':
        return { icon: <TrendingDown className="w-6 h-6 text-red-600" />, label: 'اتجاه هابط', bg: 'bg-red-50 border-red-200' };
      case 'CHOPPY':
        return { icon: <Activity className="w-6 h-6 text-yellow-600" />, label: 'متذبذب', bg: 'bg-yellow-50 border-yellow-200' };
      default:
        return { icon: <Minus className="w-6 h-6 text-gray-600" />, label: 'غير محدد', bg: 'bg-gray-50 border-gray-200' };
    }
  };

  const details = getRegimeDetails(regime);

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${details.bg} shadow-sm backdrop-blur-md`}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {details.icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">حالة السوق الحالية</p>
          <p className="text-lg font-bold text-gray-900">{details.label}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 font-medium mb-1">الثقة</p>
        <p className="text-xl font-mono tabular-nums font-bold text-gray-900">{(confidence * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
};
