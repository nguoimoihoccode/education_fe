import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Baby, ChevronRight, Clock, Loader2, TicketCheck, Ticket, UserRound,
} from 'lucide-react';
import { claimParentInvite, getMyChildren } from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/store/auth.store';
import type { MyChild } from '@/types/school.types';

const RELATION_LABELS: Record<MyChild['relation'], string> = {
  father: 'Bố của',
  mother: 'Mẹ của',
  guardian: 'Người giám hộ của',
};

export default function ParentChildrenPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');

  const { data: children = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.PARENT_CHILDREN,
    queryFn: getMyChildren,
    retry: false,
  });

  const claimMutation = useMutation({
    mutationFn: claimParentInvite,
    onSuccess: async (result) => {
      toast.success(
        result.childName
          ? `Đã liên kết với ${result.childName}. Chờ giáo viên chủ nhiệm duyệt.`
          : 'Đã nhập mã. Chờ giáo viên chủ nhiệm duyệt.',
      );
      setCode('');
      // The backend just granted the PARENT role — mirror it locally so the
      // "Con của tôi" sidebar section appears without a re-login.
      const { user, setUser } = useAuthStore.getState();
      if (user && !user.roles?.includes('parent') && result.roles) {
        setUser({ ...user, roles: result.roles });
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARENT_CHILDREN });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Mã mời không hợp lệ hoặc đã được sử dụng'),
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
            <Baby className="h-8 w-8 text-accent-400" aria-hidden="true" /> Con của tôi
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Nhập mã mời do giáo viên chủ nhiệm cung cấp để xem hồ sơ học tập của con.
          </p>
        </div>

        <form
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = code.trim();
            if (trimmed.length < 4) {
              toast.error('Nhập mã mời (dạng ABCD-EFGH)');
              return;
            }
            claimMutation.mutate(trimmed);
          }}
        >
          <label className="block space-y-1">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Ticket className="h-4 w-4 text-accent-400" aria-hidden="true" /> Mã mời
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="K7M2-QX9D"
              maxLength={20}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 font-mono text-lg font-black tracking-[0.25em] text-white outline-none focus:border-accent-400/60"
            />
          </label>
          <button
            type="submit"
            disabled={claimMutation.isPending}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
          >
            <TicketCheck className="h-4 w-4" aria-hidden="true" />
            {claimMutation.isPending ? 'Đang kiểm tra…' : 'Nhập mã mời'}
          </button>
        </form>

        <div className="space-y-3">
          {isLoading && (
            <div className="flex justify-center py-10 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {!isLoading && isError && (
            <p className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm font-medium text-slate-500">
              Chưa tải được danh sách con. Hãy thử lại sau.
            </p>
          )}
          {!isLoading && !isError && children.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-700" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Bạn chưa liên kết với học sinh nào. Xin mã mời từ giáo viên chủ nhiệm của con rồi nhập ở trên.
              </p>
            </div>
          )}
          {children.map((child) => (
            <article
              key={child.linkId}
              className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white">{child.childName || `Học sinh #${child.studentId}`}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  {RELATION_LABELS[child.relation]} bạn ·{' '}
                  {child.className ? `lớp ${child.className}` : 'chưa có lớp'}
                  {child.academicYear ? ` · ${child.academicYear}` : ''}
                </p>
              </div>
              {child.status === 'pending' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-200">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Chờ GVCN duyệt
                </span>
              ) : (
                <Link
                  to={ROUTES.PARENT_CHILD(child.studentId)}
                  className="group inline-flex items-center gap-1 rounded-2xl bg-accent-500/15 px-4 py-2 text-sm font-black text-accent-200 transition-colors hover:bg-accent-500/25"
                >
                  Xem hồ sơ
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
