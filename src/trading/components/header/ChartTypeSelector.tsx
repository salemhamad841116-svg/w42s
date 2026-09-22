import React, { useState } from 'react';
import { useChartStore } from '../../store';
import { BarChart2, LineChart, CandlestickChart, Activity } from 'lucide-react';
import clsx from 'clsx';

const TYPES = [
  { id: 'candle', label: 'Candlestick', icon: CandlestickChart },
  { id: 'heikin', label: 'Heikin Ashi', icon: BarChart2 },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'area', label: 'Area', icon: Activity },
];

export const ChartTypeSelector: React.FC = () => {
  const chartType = useChartStore((state) => state.chartType) || 'candle';
  const setChartType = useChartStore((state) => state.setChartType);
  const [open, setOpen] = useState(false);

  const activeOption = TYPES.find(t => t.id === chartType) || TYPES[0];
  const Icon = activeOption.icon;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded text-[#8F9CAE] hover:bg-[#1E2336] hover:text-white transition-colors"
        title="Chart Type"
      >
        <Icon size={18} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-40 bg-[#1C2030] border border-[#262B3D] rounded-lg shadow-xl z-50 py-1">
          {TYPES.map(type => {
            const TypeIcon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => { setChartType(type.id); setOpen(false); }}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                  chartType === type.id ? "text-[#2962FF] bg-[#2962FF]/10" : "text-[#8F9CAE] hover:bg-[#1E2336] hover:text-white"
                )}
              >
                <TypeIcon size={16} />
                {type.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
