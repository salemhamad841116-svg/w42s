import { create } from 'zustand';

export type ScriptType = 'Indicator' | 'Strategy' | 'Library' | 'Unknown';

export interface ScriptVersion {
  versionId: string;
  scriptId: string;
  versionNumber: number;
  code: string;
  timestamp: number;
  author: string;
  changeNote: string;
}

export interface Script {
  id: string;
  name: string;
  type: ScriptType;
  category: 'Personal' | 'Built-in' | 'Community' | 'Marketplace';
  code: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
}

interface ScriptState {
  scripts: Script[];
  favorites: string[]; // array of script IDs
  versions: ScriptVersion[];
  
  // Editor State
  editorScriptId: string | null;
  editorCode: string;
  isDirty: boolean;

  // Actions
  createScript: (name: string, type: ScriptType, code: string) => void;
  saveScript: (id: string, code: string, changeNote?: string) => void;
  duplicateScript: (id: string, newName: string) => void;
  renameScript: (id: string, newName: string) => void;
  restoreVersion: (versionId: string) => void;
  
  toggleFavorite: (id: string) => void;
  openScriptInEditor: (id: string) => void;
  setEditorCode: (code: string) => void;
  resetDirtyState: () => void;
}

export const useScriptStore = create<ScriptState>((set, get) => ({
  scripts: [
    {
      id: 'built-in-rsi',
      name: 'Relative Strength Index',
      type: 'Indicator',
      category: 'Built-in',
      code: '//@version=5\nindicator("RSI")',
      tags: ['momentum', 'oscillator'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
    },
    {
      id: 'built-in-macd',
      name: 'MACD',
      type: 'Indicator',
      category: 'Built-in',
      code: '//@version=5\nindicator("MACD")',
      tags: ['trend', 'momentum'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
    }
  ],
  favorites: ['built-in-rsi'],
  versions: [],
  
  editorScriptId: null,
  editorCode: '',
  isDirty: false,

  createScript: (name, type, code) => set((state) => {
    const newScript: Script = {
      id: `script-${Date.now()}`,
      name,
      type,
      category: 'Personal',
      code,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
    };
    return {
      scripts: [...state.scripts, newScript],
      editorScriptId: newScript.id,
      editorCode: code,
      isDirty: false
    };
  }),

  saveScript: (id, code, changeNote = 'Saved version') => set((state) => {
    const script = state.scripts.find(s => s.id === id);
    if (!script) return state;
    
    // Create version snapshot
    const versionNumber = state.versions.filter(v => v.scriptId === id).length + 1;
    const newVersion: ScriptVersion = {
      versionId: `v-${Date.now()}`,
      scriptId: id,
      versionNumber,
      code,
      timestamp: Date.now(),
      author: 'User',
      changeNote
    };

    return {
      scripts: state.scripts.map(s => 
        s.id === id ? { ...s, code, updatedAt: Date.now() } : s
      ),
      versions: [...state.versions, newVersion],
      isDirty: false
    };
  }),

  duplicateScript: (id, newName) => set((state) => {
    const script = state.scripts.find(s => s.id === id);
    if (!script) return state;
    const copy: Script = {
      ...script,
      id: `script-${Date.now()}`,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      category: 'Personal' // Copies become personal
    };
    return {
      scripts: [...state.scripts, copy],
      editorScriptId: copy.id,
      editorCode: copy.code,
      isDirty: false
    };
  }),

  renameScript: (id, newName) => set((state) => ({
    scripts: state.scripts.map(s => 
      s.id === id ? { ...s, name: newName, updatedAt: Date.now() } : s
    )
  })),

  restoreVersion: (versionId) => set((state) => {
    const version = state.versions.find(v => v.versionId === versionId);
    if (!version) return state;
    const script = state.scripts.find(s => s.id === version.scriptId);
    if (!script) return state;

    // Create a new version representing the restoration
    const newVersionNumber = state.versions.filter(v => v.scriptId === script.id).length + 1;
    const restoredVersion: ScriptVersion = {
      versionId: `v-${Date.now()}`,
      scriptId: script.id,
      versionNumber: newVersionNumber,
      code: version.code,
      timestamp: Date.now(),
      author: 'User',
      changeNote: `Restored from v${version.versionNumber}`
    };

    return {
      scripts: state.scripts.map(s => 
        s.id === script.id ? { ...s, code: version.code, updatedAt: Date.now() } : s
      ),
      versions: [...state.versions, restoredVersion],
      editorCode: version.code,
      isDirty: false
    };
  }),

  toggleFavorite: (id) => set((state) => {
    const isFav = state.favorites.includes(id);
    return {
      favorites: isFav 
        ? state.favorites.filter(fId => fId !== id)
        : [...state.favorites, id]
    };
  }),

  openScriptInEditor: (id) => set((state) => {
    const script = state.scripts.find(s => s.id === id);
    if (!script) return state;
    
    // Update lastOpenedAt
    const updatedScripts = state.scripts.map(s => 
      s.id === id ? { ...s, lastOpenedAt: Date.now() } : s
    );

    return {
      scripts: updatedScripts,
      editorScriptId: id,
      editorCode: script.code,
      isDirty: false
    };
  }),

  setEditorCode: (code) => set((state) => ({
    editorCode: code,
    isDirty: code !== state.scripts.find(s => s.id === state.editorScriptId)?.code
  })),

  resetDirtyState: () => set({ isDirty: false })
}));
