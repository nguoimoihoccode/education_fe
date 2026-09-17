import type { ReactNode } from 'react';
import { School } from 'lucide-react';

interface NoSchoolNoticeProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Empty state for a school page the caller cannot see data on: they belong to no
 * school (the BE throws NotFoundException from `resolveSchoolIdForUser`), or they
 * have no relationship to the class they opened. Every read is scoped per tenant
 * and every denial is a 404, so this replaces what would otherwise be a raw error
 * branch with an explanation.
 */
export default function NoSchoolNotice({
  title = 'Bạn chưa thuộc trường nào',
  description = 'Tài khoản của bạn chưa được gắn với trường hoặc lớp nào. Hỏi quản trị trường hay giáo viên chủ nhiệm để được thêm vào.',
  icon,
  action,
}: NoSchoolNoticeProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
      {icon ?? <School className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />}
      <p className="mt-2 text-sm font-black text-slate-300">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-500">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}