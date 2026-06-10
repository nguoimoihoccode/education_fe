import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, Globe2, Laptop, Loader2, LogOut, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi, type LoginSession } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const SESSIONS_QUERY_KEY = ['auth', 'my-sessions'] as const;

function formatDateTime(value?: string) {
  if (!value) return 'Không có dữ liệu';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không hợp lệ';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function SessionCard({
  session,
  isRevoking,
  onRevoke,
}: {
  session: LoginSession;
  isRevoking: boolean;
  onRevoke: (session: LoginSession) => void;
}) {
  const DeviceIcon = session.device?.toLowerCase().includes('mobile') ? Smartphone : Laptop;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl transition-colors hover:border-accent-400/40 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/70 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <DeviceIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-white sm:text-xl">{session.device || 'Thiết bị không xác định'}</h2>
              <p className="text-sm font-semibold text-slate-400">{session.browser || 'Trình duyệt không rõ'} · {session.os || 'Hệ điều hành không rõ'}</p>
            </div>
            {session.isCurrentSession && (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
                Phiên hiện tại
              </span>
            )}
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <dt className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Globe2 className="h-4 w-4" aria-hidden="true" /> IP</dt>
              <dd className="break-words text-sm font-bold text-slate-100">{session.ipAddress || 'Không có dữ liệu'}</dd>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Tạo lúc</dt>
              <dd className="text-sm font-bold text-slate-100">{formatDateTime(session.createdAt)}</dd>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <dt className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Clock className="h-4 w-4" aria-hidden="true" /> Hoạt động cuối</dt>
              <dd className="text-sm font-bold text-slate-100">{formatDateTime(session.lastUsedAt)}</dd>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Hết hạn</dt>
              <dd className="text-sm font-bold text-slate-100">{formatDateTime(session.expiresAt)}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={() => onRevoke(session)}
          disabled={isRevoking}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 transition-colors hover:border-rose-300/50 hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Thu hồi phiên ${session.device || session.tokenId}`}
        >
          {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
          Thu hồi
        </button>
      </div>
    </article>
  );
}

export default function SessionManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, isError, error } = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: authApi.getMySessions,
  });

  const revokeSession = useMutation({
    mutationFn: authApi.revokeMySession,
    onSuccess: async (_data, tokenId) => {
      const revoked = sessions.find((session) => session.tokenId === tokenId);
      if (revoked?.isCurrentSession) {
        useAuthStore.getState().logout();
        navigate('/login');
        return;
      }

      await queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });

  const revokeOthers = useMutation({
    mutationFn: authApi.revokeOtherSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });

  const activeSessions = sessions.filter((session) => !session.isRevoked);
  const mutationError = revokeSession.error || revokeOthers.error;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-accent-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Bảo mật tài khoản
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Quản lý phiên đăng nhập</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400 sm:text-base">
                  Kiểm tra thiết bị đang đăng nhập, thu hồi phiên lạ, hoặc đăng xuất khỏi toàn bộ thiết bị khác.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => revokeOthers.mutate()}
              disabled={revokeOthers.isPending || activeSessions.length <= 1}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-accent-900/30 transition-colors hover:from-accent-500 hover:to-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revokeOthers.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
              Đăng xuất thiết bị khác
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center backdrop-blur-xl" role="status">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-accent-300" aria-hidden="true" />
            <p className="font-bold text-slate-300">Đang tải danh sách phiên...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 p-6 text-rose-100" role="alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
              <div>
                <h2 className="font-black text-white">Không thể tải phiên đăng nhập</h2>
                <p className="mt-1 text-sm text-rose-100/80">{error instanceof Error ? error.message : 'Vui lòng thử lại sau.'}</p>
              </div>
            </div>
          </div>
        )}

        {mutationError && (
          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100" role="alert">
            {mutationError instanceof Error ? mutationError.message : 'Không thể cập nhật phiên. Vui lòng thử lại.'}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {activeSessions.length > 0 ? (
              activeSessions.map((session) => (
                <SessionCard
                  key={session.tokenId}
                  session={session}
                  isRevoking={revokeSession.isPending && revokeSession.variables === session.tokenId}
                  onRevoke={(target) => revokeSession.mutate(target.tokenId)}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400 backdrop-blur-xl">
                Không có phiên đăng nhập nào.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
