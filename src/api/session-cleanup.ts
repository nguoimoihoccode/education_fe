import { queryClient } from '../config/query';

export const clearClientSessionStorage = () => {
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
};
