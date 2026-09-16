/**
 * A deploy replaces every hashed chunk and deletes the previous ones, so the
 * prior build's `index-*.js` 404s. A tab that is still running the old
 * index.html -- the PWA service worker precaches index.html and answers every
 * navigation with it -- then fails the next lazy-route import it needs.
 *
 * Vite fires `vite:preloadError` for that and rethrows unless a listener calls
 * preventDefault, so the `React.lazy` promise rejects and, with no error
 * boundary above it, React unmounts the whole tree. Since every route in
 * App.tsx is lazy, this hits whichever page the user opens next -- Settings
 * among them -- and leaves them on the boot splash from index.html.
 *
 * Reloading lands on a consistent build either way: the service worker has
 * either the previous build cached in full or has already swapped to the new
 * one. The timestamp guard keeps a genuinely broken build from turning into an
 * endless reload loop.
 */

const RELOAD_MARKER = 'edupro:chunk-reload-at';

export const RELOAD_COOLDOWN_MS = 10_000;

export interface RecoveryTarget {
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  location: { reload: () => void };
  sessionStorage: Pick<Storage, 'getItem' | 'setItem'>;
}

const readMarker = (target: RecoveryTarget): number => {
  try {
    return Number(target.sessionStorage.getItem(RELOAD_MARKER) ?? 0);
  } catch {
    // Storage access can throw outright in private mode; treat it as no marker.
    return 0;
  }
};

const writeMarker = (target: RecoveryTarget, now: number): void => {
  try {
    target.sessionStorage.setItem(RELOAD_MARKER, String(now));
  } catch {
    // Failing to record the attempt must not block the recovery.
  }
};

export const installChunkLoadRecovery = (
  target: RecoveryTarget = window,
  now: () => number = Date.now,
): void => {
  target.addEventListener('vite:preloadError', (event) => {
    // Stopping the default is what keeps Vite from rethrowing the import error.
    event.preventDefault();

    const at = now();
    const last = readMarker(target);
    if (last && at - last < RELOAD_COOLDOWN_MS) {
      return;
    }

    writeMarker(target, at);
    target.location.reload();
  });
};