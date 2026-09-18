import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Roles the school module accepts for writes — mirrors the BE decorator
 * `@Roles(UserRole.TEACHER, ...SCHOOL_ADMIN_ROLES)` on every school write handler.
 *
 * Exported so the sidebar can gate its staff-only groups on the same list: the
 * way to have a homeroom class is to hold one of these roles.
 */
export const SCHOOL_WRITE_ROLES = ['teacher', 'principal', 'admin'];

/** Whether these roles are school staff (the ones who may write school data). */
export function isSchoolStaff(roles: string[]): boolean {
  return roles.some((role) => SCHOOL_WRITE_ROLES.includes(role));
}

/**
 * Whether the signed-in user may add/edit/delete school data.
 *
 * Reads are open to every signed-in user (the server confines them per
 * relationship), so a student or parent can legitimately land on a school page
 * and see data — but the write handlers still reject them. The server remains
 * the authority; this only hides buttons that could do nothing but 404.
 */
export function useCanWriteSchool(): boolean {
  const roles = useAuthStore((state) => state.user?.roles);
  return useMemo(() => isSchoolStaff(roles ?? []), [roles]);
}