import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  chartType: string;
  indicators: string[]; // array of script IDs
  drawings: any[];
  layout: any;
  visibleRange: any;
  selectedStrategyId: string | null;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  
  createWorkspace: (name: string, symbol: string, timeframe: string) => void;
  switchWorkspace: (id: string) => void;
  renameWorkspace: (id: string, newName: string) => void;
  duplicateWorkspace: (id: string) => void;
  closeWorkspace: (id: string) => void;
  closeOtherWorkspaces: (id: string) => void;
  addIndicatorToWorkspace: (workspaceId: string, indicatorId: string) => void;
  updateWorkspaceState: (id: string, updates: Partial<Workspace>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [
    {
      id: 'default-ws',
      name: 'EUR/USD — 5m',
      symbol: 'EUR/USD',
      timeframe: '5m',
      chartType: 'Candles',
      indicators: [],
      drawings: [],
      layout: null,
      visibleRange: null,
      selectedStrategyId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ],
  activeWorkspaceId: 'default-ws',

  createWorkspace: (name, symbol, timeframe) => set((state) => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      symbol,
      timeframe,
      chartType: 'Candles',
      indicators: [],
      drawings: [],
      layout: null,
      visibleRange: null,
      selectedStrategyId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return {
      workspaces: [...state.workspaces, newWs],
      activeWorkspaceId: newWs.id
    };
  }),

  switchWorkspace: (id) => set({ activeWorkspaceId: id }),

  renameWorkspace: (id, newName) => set((state) => ({
    workspaces: state.workspaces.map(ws => 
      ws.id === id ? { ...ws, name: newName, updatedAt: Date.now() } : ws
    )
  })),

  duplicateWorkspace: (id) => set((state) => {
    const wsToCopy = state.workspaces.find(ws => ws.id === id);
    if (!wsToCopy) return state;
    const duplicate: Workspace = {
      ...wsToCopy,
      id: `ws-${Date.now()}`,
      name: `${wsToCopy.name} Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return {
      workspaces: [...state.workspaces, duplicate],
      activeWorkspaceId: duplicate.id
    };
  }),

  closeWorkspace: (id) => set((state) => {
    const filtered = state.workspaces.filter(ws => ws.id !== id);
    let newActiveId = state.activeWorkspaceId;
    if (state.activeWorkspaceId === id) {
      newActiveId = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
    }
    return { workspaces: filtered, activeWorkspaceId: newActiveId };
  }),

  closeOtherWorkspaces: (id) => set((state) => {
    const keep = state.workspaces.filter(ws => ws.id === id);
    return { workspaces: keep, activeWorkspaceId: id };
  }),

  addIndicatorToWorkspace: (workspaceId, indicatorId) => set((state) => ({
    workspaces: state.workspaces.map(ws => {
      if (ws.id === workspaceId) {
        if (!ws.indicators.includes(indicatorId)) {
          return { ...ws, indicators: [...ws.indicators, indicatorId], updatedAt: Date.now() };
        }
      }
      return ws;
    })
  })),

  updateWorkspaceState: (id, updates) => set((state) => ({
    workspaces: state.workspaces.map(ws => 
      ws.id === id ? { ...ws, ...updates, updatedAt: Date.now() } : ws
    )
  })),
}));
