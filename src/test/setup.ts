import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia, and it is not a no-op gap: SettingsEffect
// reads it to resolve the 'system' theme (App.tsx), so without this stub any
// test that renders <App> throws `window.matchMedia is not a function`.
// Defaults to "no preference" (matches: false), which resolves 'system' to dark
// -- the same as the store's own default.
if (typeof window.matchMedia !== 'function') {
  const listeners = new Set<() => void>();

  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
    // Deprecated API, kept so older call sites in dependencies keep working.
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}