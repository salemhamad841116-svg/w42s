import { create } from 'zustand';

/**
 * AI Markers Store
 * Collects AI execution signals from the SSE stream and stores them
 * as chart marker entries for the lightweight-charts Markers API.
 */

export interface AIMarkerEntry {
  time: number; // Unix timestamp in seconds (matching chart candle time)
  direction: 'BUY' | 'SELL';
  confidence: number;
  reason: string;
  symbol: string;
  status: 'EXECUTED' | 'IGNORED';
}

interface AIMarkersState {
  markers: AIMarkerEntry[];
  showIgnored: boolean;
  addMarker: (entry: AIMarkerEntry) => void;
  clearMarkers: () => void;
  toggleShowIgnored: () => void;
}

export const useAIMarkersStore = create<AIMarkersState>((set) => ({
  markers: [],
  showIgnored: false,

  addMarker: (entry) =>
    set((state) => ({
      markers: [...state.markers, entry].slice(-200), // Keep last 200 markers
    })),

  clearMarkers: () => set({ markers: [] }),

  toggleShowIgnored: () =>
    set((state) => ({ showIgnored: !state.showIgnored })),
}));
