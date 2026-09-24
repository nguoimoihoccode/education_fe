import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface LoadErrorNoticeProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  onRetry?: () => void;
}

/**
 * Shown when a read fails (network, 5xx, denied) so a page never falls through to
 * its empty state on an error: "you have nothing" and "we could not load it" are
 * different facts, and conflating them tells the user something false about their
 * own data. Kept separate from `NoSchoolNotice`, whose copy asserts the specific
 * fact that the caller belongs to no school — wrong for a connectivity failure.
 */
export function LoadErrorNotice({
  title = 'Không tải được dữ liệu',
  description = 'Có lỗi khi kết nối máy chủ. Kiểm tra kết nối rồi thử lại.',
  icon,
  onRetry,
}: LoadErrorNoticeProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center" role="alert">
      {icon ?? <AlertTriangle className="mx-auto h-8 w-8 text-amber-500/70" aria-hidden="true" />}
      <p className="mt-2 text-sm font-black text-slate-300">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-500">{description}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-slate-300 transition-colors hover:border-accent-400/50 hover:text-accent-200"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
}