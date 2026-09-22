import { create } from 'zustand';

export interface CurrencyStrength {
  currency: string;
  score: number;       // 0 to 10 or -100 to 100
  previousScore: number;
  trend: 'up' | 'down' | 'flat';
}

export type PanelPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type Timeframe = '15m' | '1H' | '4H' | '1D';

interface CurrencyStrengthState {
  currencies: CurrencyStrength[];
  position: PanelPosition;
  timeframe: Timeframe;
  isVisible: boolean;
  setPosition: (pos: PanelPosition) => void;
  setTimeframe: (tf: Timeframe) => void;
  toggleVisibility: () => void;
  updateStrengths: () => void;
}

const INITIAL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

export const useCurrencyStrengthStore = create<CurrencyStrengthState>((set, get) => ({
  currencies: INITIAL_CURRENCIES.map(c => ({
    currency: c,
    score: (Math.random() * 10) - 5, // -5 to +5 initially
    previousScore: 0,
    trend: 'flat' as const,
  })).sort((a, b) => b.score - a.score),
  
  position: 'bottom-left',
  timeframe: '1D',
  isVisible: false,
  
  setPosition: (position) => set({ position }),
  setTimeframe: (timeframe) => {
    // When timeframe changes, reset to new random baseline
    const newCurrencies = INITIAL_CURRENCIES.map(c => ({
      currency: c,
      score: (Math.random() * 10) - 5,
      previousScore: 0,
      trend: 'flat' as const,
    })).sort((a, b) => b.score - a.score);
    set({ timeframe, currencies: newCurrencies });
  },
  toggleVisibility: () => set(state => ({ isVisible: !state.isVisible })),
  
  updateStrengths: () => set(state => {
    // Simulate real-time tick updates (random walk)
    const newCurrencies = state.currencies.map(c => {
      const volatility = state.timeframe === '1D' ? 0.05 : state.timeframe === '4H' ? 0.1 : 0.2;
      let change = (Math.random() - 0.5) * volatility;
      
      // Mean reversion to keep scores between -10 and +10
      if (c.score > 8) change -= 0.1;
      if (c.score < -8) change += 0.1;

      let newScore = c.score + change;
      newScore = Math.max(-10, Math.min(10, newScore));
      
      return {
        ...c,
        previousScore: c.score,
        score: newScore,
        trend: (newScore > c.score ? 'up' : newScore < c.score ? 'down' : 'flat') as 'up' | 'down' | 'flat',
      };
    });

    // Dynamic Sorting (Strongest at the top)
    newCurrencies.sort((a, b) => b.score - a.score);

    return { currencies: newCurrencies };
  }),
}));

// Start the live ticker simulation
setInterval(() => {
  useCurrencyStrengthStore.getState().updateStrengths();
}, 1500);

