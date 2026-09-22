import { create } from 'zustand';
import { useCurrencyStrengthStore } from './currencyStrengthStore';

/**
 * Forex Heatmap Store
 * Generates a matrix of cross-pair percentage changes derived from
 * the CurrencyStrength scores. Updates every 2 seconds.
 */

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'] as const;

export type HeatmapCell = {
  base: string;
  quote: string;
  value: number; // Percentage change approximation
};

interface ForexHeatmapState {
  cells: HeatmapCell[];
  isVisible: boolean;
  toggleVisibility: () => void;
  updateHeatmap: () => void;
}

/**
 * Returns the active trading session based on UTC hour.
 * Asia: 00-08 UTC, Europe: 07-16 UTC, Americas: 13-22 UTC
 */
export function getActiveSession(): 'asia' | 'europe' | 'americas' {
  const hour = new Date().getUTCHours();
  if (hour >= 13 && hour < 22) return 'americas';
  if (hour >= 7 && hour < 16) return 'europe';
  return 'asia';
}

/**
 * Returns which currencies are most active in each session.
 */
export function getSessionCurrencies(session: 'asia' | 'europe' | 'americas'): string[] {
  switch (session) {
    case 'asia': return ['JPY', 'AUD', 'NZD'];
    case 'europe': return ['EUR', 'GBP', 'CHF'];
    case 'americas': return ['USD', 'CAD'];
  }
}

export const useForexHeatmapStore = create<ForexHeatmapState>((set) => ({
  cells: [],
  isVisible: false,

  toggleVisibility: () => set((s) => ({ isVisible: !s.isVisible })),

  updateHeatmap: () => {
    const strengthState = useCurrencyStrengthStore.getState();
    const scoreMap: Record<string, number> = {};
    
    for (const c of strengthState.currencies) {
      scoreMap[c.currency] = c.score;
    }

    const newCells: HeatmapCell[] = [];
    for (const base of CURRENCIES) {
      for (const quote of CURRENCIES) {
        if (base === quote) {
          newCells.push({ base, quote, value: 0 });
        } else {
          // Cross-pair delta: if USD is strong (+5) and EUR is weak (-3),
          // then EUR/USD direction is negative (EUR weakening vs USD).
          // Value = base_score - quote_score, scaled as pseudo-percentage
          const delta = (scoreMap[base] ?? 0) - (scoreMap[quote] ?? 0);
          newCells.push({ base, quote, value: Number((delta * 0.12).toFixed(2)) });
        }
      }
    }

    set({ cells: newCells });
  },
}));

// Update the heatmap every 2 seconds
setInterval(() => {
  useForexHeatmapStore.getState().updateHeatmap();
}, 2000);

// Initial fill
useForexHeatmapStore.getState().updateHeatmap();
