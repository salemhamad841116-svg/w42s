import { create } from 'zustand';

interface USEStore {
  isOpen: boolean;
  selectedSymbol: string;
  selectedTimeframe: string;
  selectedStrategyId: string | null;
  isLoading: boolean;
  directionMatrix: any | null;
  nextCandleForecast: any | null;
  regime: any | null;
  confluence: any | null;
  openWorkspace: () => void;
  closeWorkspace: () => void;
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: string) => void;
  setStrategyId: (id: string) => void;
  fetchAnalysis: () => Promise<void>;
}

export const useUSEStore = create<USEStore>((set, get) => ({
  isOpen: false,
  selectedSymbol: 'BTC/USDT',
  selectedTimeframe: '5m',
  selectedStrategyId: null,
  isLoading: false,
  directionMatrix: null,
  nextCandleForecast: null,
  regime: null,
  confluence: null,

  openWorkspace: () => set({ isOpen: true }),
  closeWorkspace: () => set({ isOpen: false }),
  setSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setStrategyId: (id) => set({ selectedStrategyId: id }),

  fetchAnalysis: async () => {
    const { selectedSymbol, selectedTimeframe } = get();
    set({ isLoading: true });

    try {
      const [directionRes, nextCandleRes, regimeRes, confluenceRes] = await Promise.all([
        fetch(`/api/use/direction-matrix?symbol=${encodeURIComponent(selectedSymbol)}`),
        fetch(`/api/use/next-candle?symbol=${encodeURIComponent(selectedSymbol)}&timeframe=${encodeURIComponent(selectedTimeframe)}`),
        fetch(`/api/use/regime?symbol=${encodeURIComponent(selectedSymbol)}`),
        fetch(`/api/use/confluence?symbol=${encodeURIComponent(selectedSymbol)}&timeframe=${encodeURIComponent(selectedTimeframe)}`)
      ]);

      const [directionMatrix, nextCandleForecast, regime, confluence] = await Promise.all([
        directionRes.ok ? directionRes.json() : null,
        nextCandleRes.ok ? nextCandleRes.json() : null,
        regimeRes.ok ? regimeRes.json() : null,
        confluenceRes.ok ? confluenceRes.json() : null
      ]);

      set({
        directionMatrix,
        nextCandleForecast,
        regime,
        confluence,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch USE analysis:', error);
      set({ isLoading: false });
    }
  }
}));
