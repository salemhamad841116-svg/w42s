import React, { useState } from 'react';
import { useChartStore } from '../../store';
import { useCurrencyStrengthStore } from '../../stores/currencyStrengthStore';
import { useForexHeatmapStore } from '../../stores/useForexHeatmapStore';
import { FunctionSquare, Check } from 'lucide-react';
import clsx from 'clsx';

const INDICATORS = ['MA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'Volume', 'Currency Strength', 'Forex Heatmap'];

export const IndicatorMenu: React.FC = () => {
  const indicators = useChartStore((state) => state.indicators) || [];
  const toggleIndicator = useChartStore((state) => state.toggleIndicator);
  const { isVisible: isStrengthVisible, toggleVisibility: toggleStrength } = useCurrencyStrengthStore();
  const { isVisible: isHeatmapVisible, toggleVisibility: toggleHeatmap } = useForexHeatmapStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[#8F9CAE] hover:bg-[#1E2336] hover:text-white transition-colors text-sm font-medium"
      >
        <FunctionSquare size={16} />
        <span className="hidden sm:inline">Indicators</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-48 bg-[#1C2030] border border-[#262B3D] rounded-lg shadow-xl z-50 py-1">
          {INDICATORS.map(ind => {
            const isActive = ind === 'Currency Strength' 
              ? isStrengthVisible 
              : ind === 'Forex Heatmap'
                ? isHeatmapVisible
                : indicators.includes(ind);
            return (
              <button
                key={ind}
                onClick={() => {
                  if (ind === 'Currency Strength') toggleStrength();
                  else if (ind === 'Forex Heatmap') toggleHeatmap();
                  else toggleIndicator(ind);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#8F9CAE] hover:bg-[#1E2336] hover:text-white transition-colors"
              >
                <span>{ind}</span>
                {isActive && <Check size={16} className="text-[#2962FF]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
