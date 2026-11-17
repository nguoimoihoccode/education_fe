import { useCallback, useEffect, useRef, useState } from 'react';
import { revokePrivateArtifactUrl } from '@/api/private-artifacts';

export function usePrivateArtifactUrl() {
  const [url, setUrl] = useState('');
  const mounted = useRef(true);
  const current = useRef('');
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      revokePrivateArtifactUrl(current.current);
    };
  }, []);
  const replace = useCallback((next: string) => {
    if (!mounted.current) {
      revokePrivateArtifactUrl(next);
      return;
    }
    if (current.current !== next) revokePrivateArtifactUrl(current.current);
    current.current = next;
    setUrl(next);
  }, []);
  return [url, replace] as const;
}
