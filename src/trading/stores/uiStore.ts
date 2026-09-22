import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UiState {
  bottomPanelHeight: number;
  bottomPanelCollapsed: boolean;
  bottomPanelActiveTab: string;
  rightPanelWidth: number;
  layoutMode: string;
  showAssetSearch: boolean;
  theme: string;
  setBottomPanelHeight: (h: number) => void;
  toggleBottomPanel: () => void;
  setBottomPanelTab: (tab: string) => void;
  setRightPanelWidth: (w: number) => void;
  setLayoutMode: (mode: string) => void;
  toggleAssetSearch: () => void;
}

export const useUiStore = create<UiState>()(immer((set) => ({
  bottomPanelHeight: 250,
  bottomPanelCollapsed: false,
  bottomPanelActiveTab: 'positions',
  rightPanelWidth: 300,
  layoutMode: '1x1',
  showAssetSearch: false,
  theme: 'dark',
  setBottomPanelHeight: (h) => set(s => { s.bottomPanelHeight = h; }),
  toggleBottomPanel: () => set(s => { s.bottomPanelCollapsed = !s.bottomPanelCollapsed; }),
  setBottomPanelTab: (tab) => set(s => { s.bottomPanelActiveTab = tab; }),
  setRightPanelWidth: (w) => set(s => { s.rightPanelWidth = w; }),
  setLayoutMode: (mode) => set(s => { s.layoutMode = mode; }),
  toggleAssetSearch: () => set(s => { s.showAssetSearch = !s.showAssetSearch; }),
})));