import { create } from 'zustand';
import { activateWaitingServiceWorker, checkForServiceWorkerUpdate } from '../../services/serviceWorkerRegistration';

export interface VersionInfo {
  version: string;
  buildId: string;
  minimumSupportedVersion: string;
  forceUpdate: boolean;
  releaseNotes: string[];
  releasedAt: string;
}

interface AppUpdateState {
  currentVersion: string;
  latestVersion: string | null;
  buildId: string | null;
  minimumSupportedVersion: string;
  isUpdateAvailable: boolean;
  isForceUpdate: boolean;
  releaseNotes: string[];
  lastCheckedAt: number | null;
  isApplyingUpdate: boolean;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => void;
  dismissToast: () => void;
}

const APP_CURRENT_VERSION = '2.5.0';

/**
 * Compare two semver strings: a < b returns -1, a === b returns 0, a > b returns 1
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

export const useAppUpdateStore = create<AppUpdateState>((set, get) => ({
  currentVersion: APP_CURRENT_VERSION,
  latestVersion: null,
  buildId: null,
  minimumSupportedVersion: '2.0.0',
  isUpdateAvailable: false,
  isForceUpdate: false,
  releaseNotes: [],
  lastCheckedAt: null,
  isApplyingUpdate: false,

  checkForUpdates: async () => {
    try {
      // Trigger SW check if browser supports it
      checkForServiceWorkerUpdate();

      const response = await fetch(`/api/version?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const manifest: VersionInfo = await response.json();
      const current = get().currentVersion;

      const isNewer = compareSemver(current, manifest.version) < 0;
      const isBelowMin = compareSemver(current, manifest.minimumSupportedVersion) < 0;
      const mustForce = (isNewer && manifest.forceUpdate) || isBelowMin;

      if (isNewer || isBelowMin) {
        set({
          latestVersion: manifest.version,
          buildId: manifest.buildId,
          minimumSupportedVersion: manifest.minimumSupportedVersion,
          isUpdateAvailable: true,
          isForceUpdate: mustForce,
          releaseNotes: manifest.releaseNotes || [],
          lastCheckedAt: Date.now(),
        });
      } else {
        set({
          latestVersion: manifest.version,
          buildId: manifest.buildId,
          minimumSupportedVersion: manifest.minimumSupportedVersion,
          isUpdateAvailable: false,
          isForceUpdate: false,
          releaseNotes: manifest.releaseNotes || [],
          lastCheckedAt: Date.now(),
        });
      }
    } catch (err) {
      console.warn('[AppUpdate] Version check error:', err);
    }
  },

  applyUpdate: () => {
    set({ isApplyingUpdate: true, isUpdateAvailable: false, isForceUpdate: false });

    // Safe State Preservation before reloading:
    try {
      const stateBackup = {
        timestamp: Date.now(),
        savedSymbol: localStorage.getItem('trading_symbol') || 'BTC/USDT',
        savedTimeframe: localStorage.getItem('trading_timeframe') || '5m',
        workspaces: localStorage.getItem('trading_workspaces_state'),
        pineDraft: localStorage.getItem('pine_editor_draft'),
      };
      localStorage.setItem('__app_safe_state_backup__', JSON.stringify(stateBackup));
    } catch (err) {
      console.warn('[AppUpdate] State backup warning:', err);
    }

    // Activate waiting SW
    activateWaitingServiceWorker();

    // Reload page after short delay for SW activation
    setTimeout(() => {
      window.location.reload();
    }, 300);
  },

  dismissToast: () => {
    set({ isUpdateAvailable: false, isForceUpdate: false });
  },
}));
