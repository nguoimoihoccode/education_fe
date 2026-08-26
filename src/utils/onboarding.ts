export const ONBOARDING_STORAGE_KEY = 'edupro-onboarding';

export function isOnboarded(): boolean {
  try {
    return Boolean(localStorage.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function markOnboarded(payload?: Record<string, unknown>): void {
  try {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ ...payload, completedAt: new Date().toISOString() }),
    );
  } catch {
    // ignore storage errors
  }
}