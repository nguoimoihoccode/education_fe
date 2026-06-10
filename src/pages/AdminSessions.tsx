import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, Filter, Globe2, Laptop, Loader2, Search, ShieldCheck, Smartphone, Trash2, UserRound } from 'lucide-react';
import { authApi, type AdminSessionFilters, type LoginSession } from '@/api/auth.api';

type ActiveState = 'all' | 'active' | 'inactive';

const ADMIN_SESSIONS_QUERY_KEY = ['auth', 'admin-sessions'] as const;

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

function AdminSessionCard({
  session,
  isRevoking,
  isRevokeDisabled,
  onRevoke,
}: {
  session: LoginSession;
  isRevoking: boolean;
  isRevokeDisabled: boolean;
  onRevoke: (session: LoginSession) => void;
}) {
  const DeviceIcon = session.device?.toLowerCase().includes('mobile') ? Smartphone : Laptop;
  const isActive = !session.isRevoked && new Date(session.expiresAt).getTime() > Date.now();

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl transition-colors hover:border-accent-400/40 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/70 to-transparent" />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <DeviceIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-black text-white sm:text-xl">{session.email || 'Không có email'}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" aria-hidden="true" /> ID {session.userId}</span>
                {session.displayName && <span>{session.displayName}</span>}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${isActive ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>
              {isActive ? 'Đang hoạt động' : session.isRevoked ? 'Đã thu hồi' : 'Đã hết hạn'}
            </span>
          </div>

          <dl className="rounded-2xl border border-white/5 bg-black/25 p-4">
            <dt className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Thiết bị / trình duyệt / OS</dt>
            <dd className="break-words text-sm font-bold text-slate-100">
              {session.device || 'Thiết bị không rõ'} · {session.browser || 'Trình duyệt không rõ'} · {session.os || 'Hệ điều hành không rõ'}
            </dd>
          </dl>

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

        {isActive && (
          <button
            type="button"
            onClick={() => onRevoke(session)}
            disabled={isRevokeDisabled}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 transition-colors hover:border-rose-300/50 hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Thu hồi phiên ${session.email || session.tokenId}`}
          >
            {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            Thu hồi
          </button>
        )}
      </div>
    </article>
  );
}

export default function AdminSessions() {
  const queryClient = useQueryClient();
  const [draftEmail, setDraftEmail] = useState('');
  const [draftUserId, setDraftUserId] = useState('');
  const [draftActiveState, setDraftActiveState] = useState<ActiveState>('all');
  const [appliedFilters, setAppliedFilters] = useState({ email: '', userId: '', activeState: 'all' as ActiveState });

  const filters = useMemo<AdminSessionFilters>(() => {
    const next: AdminSessionFilters = {};
    const trimmedEmail = appliedFilters.email.trim();
    const parsedUserId = Number(appliedFilters.userId);

    if (trimmedEmail) next.email = trimmedEmail;
    if (appliedFilters.userId.trim() && Number.isFinite(parsedUserId)) next.userId = parsedUserId;
    if (appliedFilters.activeState !== 'all') next.active = appliedFilters.activeState === 'active';

    return next;
  }, [appliedFilters]);

  const { data: sessions = [], isLoading, isError, error } = useQuery({
    queryKey: [...ADMIN_SESSIONS_QUERY_KEY, filters],
    queryFn: () => authApi.getAdminSessions(filters),
  });

  const revokeSession = useMutation({
    mutationFn: authApi.revokeAdminSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SESSIONS_QUERY_KEY });
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-accent-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin sessions
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Quản trị phiên đăng nhập</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400 sm:text-base">
                Lọc phiên theo tài khoản, trạng thái, thiết bị; thu hồi phiên rủi ro khi cần.
              </p>
            </div>
          </div>
        </div>

        <form
          className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl md:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedFilters({ email: draftEmail, userId: draftUserId, activeState: draftActiveState });
          }}
        >
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Email</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 focus-within:border-accent-400/60 focus-within:ring-2 focus-within:ring-accent-400/20">
              <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
                placeholder="user@example.com"
                className="min-h-11 w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">User ID</span>
            <input
              type="number"
              min="1"
              value={draftUserId}
              onChange={(event) => setDraftUserId(event.target.value)}
              placeholder="123"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Trạng thái</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 focus-within:border-accent-400/60 focus-within:ring-2 focus-within:ring-accent-400/20">
              <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <select
                value={draftActiveState}
                onChange={(event) => setDraftActiveState(event.target.value as ActiveState)}
                className="min-h-11 w-full cursor-pointer bg-transparent text-sm font-semibold text-white outline-none"
              >
                <option className="bg-slate-950" value="all">Tất cả</option>
                <option className="bg-slate-950" value="active">Đang hoạt động</option>
                <option className="bg-slate-950" value="inactive">Không hoạt động</option>
              </select>
            </div>
          </label>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center self-end rounded-2xl bg-gradient-to-r from-accent-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-accent-900/30 transition-colors hover:from-accent-500 hover:to-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
          >
            Áp dụng
          </button>
        </form>

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

        {revokeSession.error && (
          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100" role="alert">
            {revokeSession.error instanceof Error ? revokeSession.error.message : 'Không thể thu hồi phiên. Vui lòng thử lại.'}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <AdminSessionCard
                  key={session.tokenId}
                  session={session}
                  isRevoking={revokeSession.isPending && revokeSession.variables === session.tokenId}
                  isRevokeDisabled={revokeSession.isPending}
                  onRevoke={(target) => revokeSession.mutate(target.tokenId)}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400 backdrop-blur-xl">
                Không tìm thấy phiên phù hợp.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
