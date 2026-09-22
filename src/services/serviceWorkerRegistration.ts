/**
 * Service Worker Registration & Lifecycle Controller
 */

export interface SWRegistrationCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

let activeRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(callbacks?: SWRegistrationCallbacks): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          activeRegistration = registration;

          // Check if waiting worker already exists
          if (registration.waiting) {
            callbacks?.onUpdate?.(registration);
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; please refresh.
                  console.log('[SW] New update installed and waiting activation.');
                  callbacks?.onUpdate?.(registration);
                } else {
                  // Content is cached for offline use.
                  console.log('[SW] Content is cached for offline use.');
                  callbacks?.onSuccess?.(registration);
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[SW] Service worker registration failed:', error);
        });

      // Handle controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

export function activateWaitingServiceWorker(): void {
  if (activeRegistration && activeRegistration.waiting) {
    activeRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function checkForServiceWorkerUpdate(): void {
  if (activeRegistration) {
    activeRegistration.update().catch((err) => {
      console.warn('[SW] Manual update check error:', err);
    });
  }
}
