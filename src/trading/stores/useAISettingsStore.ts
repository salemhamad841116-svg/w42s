import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AISettingsState {
  isAIEnabled: boolean;
  maxRiskPerTradePercent: number; // e.g., 1.0 for 1%
  toggleAI: () => void;
  setMaxRisk: (risk: number) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      isAIEnabled: true, // Default to true
      maxRiskPerTradePercent: 1.0, // Safe default of 1%
      toggleAI: () => set((state) => ({ isAIEnabled: !state.isAIEnabled })),
      setMaxRisk: (risk: number) => set({ maxRiskPerTradePercent: Math.max(0.1, Math.min(risk, 10.0)) }), // Clamp between 0.1% and 10%
    }),
    {
      name: 'ai-execution-settings', // Stored in localStorage
    }
  )
);
