import { describe, expect, it, vi } from 'vitest';
import {
  RELOAD_COOLDOWN_MS,
  installChunkLoadRecovery,
  type RecoveryTarget,
} from './chunk-recovery';

const PRELOAD_ERROR = 'vite:preloadError';

const makeHarness = () => {
  const store = new Map<string, string>();
  const listeners: ((event: Event) => void)[] = [];
  const reload = vi.fn();
  let clock = 1_000_000;

  const target: RecoveryTarget = {
    addEventListener: (type, listener) => {
      if (type === PRELOAD_ERROR) listeners.push(listener);
    },
    location: { reload },
    sessionStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    },
  };

  installChunkLoadRecovery(target, () => clock);

  return {
    reload,
    advance: (ms: number) => {
      clock += ms;
    },
    fire: () => {
      const event = new Event(PRELOAD_ERROR, { cancelable: true });
      listeners.forEach((listener) => listener(event));
      return event;
    },
  };
};

describe('installChunkLoadRecovery', () => {
  it('reloads when a lazy chunk is missing', () => {
    const { reload, fire } = makeHarness();

    fire();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  // Vite rethrows the import error unless the event's default is prevented,
  // which is what would unmount the app instead of recovering it.
  it('stops Vite from rethrowing the import error', () => {
    const { fire } = makeHarness();

    const event = fire();

    expect(event.defaultPrevented).toBe(true);
  });

  it('does not reload again inside the cooldown, so a broken build cannot loop', () => {
    const { reload, advance, fire } = makeHarness();

    fire();
    advance(RELOAD_COOLDOWN_MS - 1);
    fire();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads again once the cooldown has passed', () => {
    const { reload, advance, fire } = makeHarness();

    fire();
    advance(RELOAD_COOLDOWN_MS + 1);
    fire();

    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('still recovers when session storage is unavailable', () => {
    const reload = vi.fn();
    const listeners: ((event: Event) => void)[] = [];
    const target = {
      addEventListener: (type: string, listener: (event: Event) => void) => {
        if (type === PRELOAD_ERROR) listeners.push(listener);
      },
      location: { reload },
      sessionStorage: {
        getItem: () => {
          throw new Error('storage disabled');
        },
        setItem: () => {
          throw new Error('storage disabled');
        },
      },
    } as unknown as RecoveryTarget;

    installChunkLoadRecovery(target, () => 1_000_000);
    listeners.forEach((listener) => listener(new Event(PRELOAD_ERROR, { cancelable: true })));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});