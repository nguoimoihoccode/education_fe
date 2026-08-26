import { describe, it, expect, beforeEach } from 'vitest';
import { isOnboarded, markOnboarded, ONBOARDING_STORAGE_KEY } from './onboarding';

describe('onboarding util', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when no onboarding flag is set', () => {
    expect(isOnboarded()).toBe(false);
  });

  it('returns true after markOnboarded', () => {
    markOnboarded({ dailyTime: '15' });
    expect(isOnboarded()).toBe(true);
  });

  it('persists payload with completedAt timestamp', () => {
    markOnboarded({ dailyTime: '30' });
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.dailyTime).toBe('30');
    expect(parsed.completedAt).toBeTruthy();
  });

  it('rejects storage-less environment gracefully', () => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Object.defineProperty(Storage.prototype, 'getItem', {
      value: () => { throw new Error('denied'); },
    });
    Object.defineProperty(Storage.prototype, 'setItem', {
      value: () => { throw new Error('denied'); },
    });
    expect(isOnboarded()).toBe(false);
    expect(() => markOnboarded()).not.toThrow();
    Object.defineProperty(Storage.prototype, 'getItem', { value: getItem });
    Object.defineProperty(Storage.prototype, 'setItem', { value: setItem });
  });
});