import { create } from 'zustand';
import { useChartStore } from './chartStore';
import { useDrawingStore } from './drawingStore';

export interface ChartTabSession {
  id: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
  drawings: any[];
  change24h: number;
}

const STORAGE_KEY = 'chart_workspace_tabs_sessions';
const ACTIVE_TAB_KEY = 'chart_workspace_active_tab_id';

const DEFAULT_TABS: ChartTabSession[] = [
  { id: 'tab-1', symbol: 'BTC/USDT', timeframe: '15', indicators: ['RSI', 'EMA'], drawings: [], change24h: 2.45 },
  { id: 'tab-2', symbol: 'EUR/USD', timeframe: '5', indicators: ['MA'], drawings: [], change24h: -0.32 },
  { id: 'tab-3', symbol: 'US30', timeframe: '30', indicators: ['Bollinger Bands'], drawings: [], change24h: 1.15 },
];

const loadSavedTabs = (): { tabs: ChartTabSession[]; activeTabId: string } => {
  try {
    const rawTabs = localStorage.getItem(STORAGE_KEY);
    const rawActive = localStorage.getItem(ACTIVE_TAB_KEY);
    const parsedTabs = rawTabs ? JSON.parse(rawTabs) : DEFAULT_TABS;
    const activeId = rawActive && parsedTabs.some((t: ChartTabSession) => t.id === rawActive)
      ? rawActive
      : parsedTabs[0]?.id || 'tab-1';
    return { tabs: parsedTabs, activeTabId: activeId };
  } catch {
    return { tabs: DEFAULT_TABS, activeTabId: 'tab-1' };
  }
};

const saveTabsToStorage = (tabs: ChartTabSession[], activeTabId: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
  } catch {}
};

interface TabsState {
  tabs: ChartTabSession[];
  activeTabId: string;
  switchTab: (targetTabId: string) => void;
  addTab: (symbol?: string, timeframe?: string) => void;
  closeTab: (tabId: string) => void;
  updateActiveTabMeta: (updates: Partial<ChartTabSession>) => void;
}

export const useTabsStore = create<TabsState>((set, get) => {
  const initial = loadSavedTabs();

  return {
    tabs: initial.tabs,
    activeTabId: initial.activeTabId,

    switchTab: (targetTabId: string) => {
      const { tabs, activeTabId } = get();
      if (targetTabId === activeTabId) return;

      const currentChart = useChartStore.getState();
      const currentDrawings = useDrawingStore.getState().drawings;

      // 1. Snapshot current tab state
      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            symbol: currentChart.activeSymbol || tab.symbol,
            timeframe: currentChart.activeResolution || tab.timeframe,
            indicators: currentChart.indicators || tab.indicators,
            drawings: currentDrawings || tab.drawings,
          };
        }
        return tab;
      });

      // 2. Locate target tab session
      const targetTab = updatedTabs.find(t => t.id === targetTabId);
      if (!targetTab) return;

      // 3. Update store state
      set({ tabs: updatedTabs, activeTabId: targetTabId });
      saveTabsToStorage(updatedTabs, targetTabId);

      // 4. Restore chart state for the target tab
      currentChart.setActiveSymbol(targetTab.symbol);
      currentChart.setActiveResolution(targetTab.timeframe);

      // Restore drawings for new symbol
      useDrawingStore.getState().loadDrawingsForSymbol(targetTab.symbol);
    },

    addTab: (symbol = 'ETH/USDT', timeframe = '15') => {
      const { tabs, activeTabId } = get();

      // Snapshot current tab before adding
      const currentChart = useChartStore.getState();
      const currentDrawings = useDrawingStore.getState().drawings;

      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            symbol: currentChart.activeSymbol || tab.symbol,
            timeframe: currentChart.activeResolution || tab.timeframe,
            indicators: currentChart.indicators || tab.indicators,
            drawings: currentDrawings || tab.drawings,
          };
        }
        return tab;
      });

      const newId = `tab-${Date.now()}`;
      const newTab: ChartTabSession = {
        id: newId,
        symbol,
        timeframe,
        indicators: ['RSI'],
        drawings: [],
        change24h: +(Math.random() * 4 - 2).toFixed(2),
      };

      const nextTabs = [...updatedTabs, newTab];
      set({ tabs: nextTabs, activeTabId: newId });
      saveTabsToStorage(nextTabs, newId);

      // Switch chart to new tab immediately
      currentChart.setActiveSymbol(newTab.symbol);
      currentChart.setActiveResolution(newTab.timeframe);
      useDrawingStore.getState().loadDrawingsForSymbol(newTab.symbol);
    },

    closeTab: (tabId: string) => {
      const { tabs, activeTabId } = get();
      if (tabs.length <= 1) return; // Prevent closing last remaining tab

      const filteredTabs = tabs.filter(t => t.id !== tabId);
      let nextActiveId = activeTabId;

      if (tabId === activeTabId) {
        const closedIndex = tabs.findIndex(t => t.id === tabId);
        const newIndex = Math.max(0, closedIndex - 1);
        nextActiveId = filteredTabs[newIndex]?.id || filteredTabs[0].id;

        const nextTarget = filteredTabs.find(t => t.id === nextActiveId);
        if (nextTarget) {
          const chart = useChartStore.getState();
          chart.setActiveSymbol(nextTarget.symbol);
          chart.setActiveResolution(nextTarget.timeframe);
          useDrawingStore.getState().loadDrawingsForSymbol(nextTarget.symbol);
        }
      }

      set({ tabs: filteredTabs, activeTabId: nextActiveId });
      saveTabsToStorage(filteredTabs, nextActiveId);
    },

    updateActiveTabMeta: (updates: Partial<ChartTabSession>) => {
      const { tabs, activeTabId } = get();
      const nextTabs = tabs.map(tab => tab.id === activeTabId ? { ...tab, ...updates } : tab);
      set({ tabs: nextTabs });
      saveTabsToStorage(nextTabs, activeTabId);
    },
  };
});
