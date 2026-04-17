import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value — delays updating until the user stops changing it.
 * Perfect for search inputs to avoid firing API on every keystroke.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * // debouncedSearch only updates 300ms after the last setSearch call
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Throttle a callback — ensures it fires at most once per interval.
 * Perfect for like/bookmark buttons to prevent rapid spam.
 *
 * @example
 * const throttledLike = useThrottle((id: string) => likePost(id), 500);
 * <button onClick={() => throttledLike(postId)}>Like</button>
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delayMs = 500,
): T {
  const lastCall = useRef(0);
  const lastArgs = useRef<any[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const remaining = delayMs - (now - lastCall.current);

      lastArgs.current = args;

      if (remaining <= 0) {
        lastCall.current = now;
        callback(...args);
      } else if (!timer.current) {
        timer.current = setTimeout(() => {
          lastCall.current = Date.now();
          timer.current = null;
          callback(...(lastArgs.current || args));
        }, remaining);
      }
    },
    [callback, delayMs],
  ) as T;
}

/**
 * Loading guard for async handlers that don't use useMutation.
 * Prevents double-submit while the previous call is still in flight.
 *
 * @example
 * const [save, isSaving] = useAsyncGuard(handleSaveProfile);
 * <button onClick={save} disabled={isSaving}>Save</button>
 */
export function useAsyncGuard<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
): [T, boolean] {
  const [isPending, setIsPending] = useState(false);

  const guarded = useCallback(
    async (...args: any[]) => {
      if (isPending) return;
      setIsPending(true);
      try {
        return await asyncFn(...args);
      } finally {
        setIsPending(false);
      }
    },
    [asyncFn, isPending],
  ) as T;

  return [guarded, isPending];
}
