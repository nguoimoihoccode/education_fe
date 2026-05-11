import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const EMPTY_ROLES: string[] = [];

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userRoles = useAuthStore((state) => state.user?.roles ?? EMPTY_ROLES);

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.some((role) => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
