import { queryClient } from '../config/query';

export const clearClientSessionStorage = async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');

  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith('edupro-api-cache:')) {
      sessionStorage.removeItem(key);
    }
  }

  queryClient.clear();

  // Older service workers cached signed evidence URLs as ordinary images.
  // Drop every browser cache on a session boundary, including legacy names.
  if (typeof caches !== 'undefined') {
    try {
      await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
    } catch {
      // CacheStorage can be disabled by browser privacy settings.
    }
  }
};
