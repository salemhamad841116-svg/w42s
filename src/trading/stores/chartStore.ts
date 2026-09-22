import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ChartState {
  activeSymbol: string;
  activeResolution: string;
  chartType: string;
  indicators: string[];
  isAutoSaving: boolean;
  setSymbol: (symbol: string) => void;
  setActiveSymbol: (symbol: string) => void;
  setResolution: (res: string) => void;
  setActiveResolution: (res: string) => void;
  setChartType: (type: string) => void;
  addIndicator: (id: string) => void;
  removeIndicator: (id: string) => void;
  toggleIndicator: (id: string) => void;
}

export const useChartStore = create<ChartState>()(immer((set) => ({
  activeSymbol: 'BTC/USDT',
  activeResolution: '15',
  chartType: 'candlestick',
  indicators: [],
  isAutoSaving: true,
  setSymbol: (symbol) => set(s => { s.activeSymbol = symbol; }),
  setActiveSymbol: (symbol) => set(s => { s.activeSymbol = symbol; }),
  setResolution: (res) => set(s => { s.activeResolution = res; }),
  setActiveResolution: (res) => set(s => { s.activeResolution = res; }),
  setChartType: (type) => set(s => { s.chartType = type; }),
  addIndicator: (id) => set(s => { if (!s.indicators.includes(id)) s.indicators.push(id); }),
  removeIndicator: (id) => set(s => { s.indicators = s.indicators.filter(i => i !== id); }),
  toggleIndicator: (id) => set(s => {
    if (s.indicators.includes(id)) s.indicators = s.indicators.filter(i => i !== id);
    else s.indicators.push(id);
  }),
})));
