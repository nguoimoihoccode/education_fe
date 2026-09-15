import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Baby, BookOpenCheck, Check, CheckCircle2, ClipboardCheck, Clock, Copy, GraduationCap, Loader2,
  Send, Trash2, UserPlus, Users, X,
} from 'lucide-react';
import {
  getHomeroomRoster,
  inviteClassParent,
  listClassParents,
  approveParentLink,
  revokeParentLink,
  listMyHomeroomClasses,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import type {
  ClassParentRow,
  InviteParentDto,
  ParentLinkStatus,
  ParentRelation,
  RosterStudent,
} from '@/types/school.types';

const RELATION_LABELS: Record<ParentRelation, string> = {
  father: 'Bố',
  mother: 'Mẹ',
  guardian: 'Người giám hộ',
};

const STATUS_META: Record<ParentLinkStatus, { label: string; tone: string }> = {
  pending: { label: 'Chờ duyệt', tone: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  approved: { label: 'Đã duyệt', tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  revoked: { label: 'Đã thu hồi', tone: 'border-rose-400/30 bg-rose-400/10 text-rose-200' },
};

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Đã sao chép');
  } catch {
    toast.error('Trình duyệt không cho phép sao chép');
  }
}

interface InviteForm {
  student: RosterStudent;
}

export default function TeacherClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'students' | 'parents'>('students');
  const [invite, setInvite] = useState<InviteForm | null>(null);
  const [form, setForm] = useState<InviteParentDto>({
    studentId: 0,
    relation: 'mother',
    parentName: '',
    parentPhone: '',
  });
  /** The link just created — its code is shown once in a success panel */
  const [issued, setIssued] = useState<{ code: string; childName: string } | null>(null);

  const classesQuery = useQuery({
    queryKey: QUERY_KEYS.TEACHER_CLASSES,
    queryFn: listMyHomeroomClasses,
  });
  const cls = classesQuery.data?.find((c) => c.id === id);

  const rosterQuery = useQuery({
    queryKey: QUERY_KEYS.TEACHER_CLASS_STUDENTS(id),
    queryFn: () => getHomeroomRoster(id),
    enabled: !!id,
  });
  const parentsQuery = useQuery({
    queryKey: QUERY_KEYS.CLASS_PARENTS(id),
    queryFn: () => listClassParents(id),
    enabled: !!id,
  });

  const inviteMutation = useMutation({
    mutationFn: (dto: InviteParentDto) => inviteClassParent(id, dto),
    onSuccess: (link) => {
      const childName =
        invite?.student.student.name || invite?.student.student.email || `HS #${link.studentId}`;
      setInvite(null);
      setIssued({ code: link.inviteCode, childName });
      toast.success('Đã tạo mã mời');
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_PARENTS(id) });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không tạo được mã mời'),
  });

  const approveMutation = useMutation({
    mutationFn: (linkId: string) => approveParentLink(id, linkId),
    onSuccess: async () => {
      toast.success('Đã duyệt phụ huynh');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_PARENTS(id) });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không duyệt được'),
  });
  const revokeMutation = useMutation({
    mutationFn: (linkId: string) => revokeParentLink(id, linkId),
    onSuccess: async () => {
      toast.success('Đã thu hồi liên kết');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_PARENTS(id) });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không thu hồi được'),
  });

  const openInvite = (student: RosterStudent) => {
    setIssued(null);
    setForm({ studentId: student.student.id, relation: 'mother', parentName: '', parentPhone: '' });
    setInvite({ student });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to={ROUTES.TEACHING}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-accent-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Lớp chủ nhiệm
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Lớp {cls?.name ?? '…'}
              {cls && (
                <span className="ml-3 align-middle text-sm font-bold text-slate-500">
                  {cls.grade > 0 ? `Khối ${cls.grade}` : ''} · {cls.academicYear?.name ?? ''} · {cls.studentCount ?? 0} HS
                </span>
              )}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.TEACHING_ATTENDANCE(id)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-accent-400/30 bg-slate-900/70 px-4 py-2.5 text-sm font-black text-accent-200 transition-colors hover:bg-accent-400/10"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Điểm danh
            </Link>
            <Link
              to={ROUTES.TEACHING_GRADES(id)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm font-black text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
            >
              <GraduationCap className="h-4 w-4" aria-hidden="true" /> Sổ điểm
            </Link>
            <Link
              to={ROUTES.TEACHING_HOMEWORK(id)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm font-black text-slate-300 transition-colors hover:border-violet-400/40 hover:text-violet-200"
            >
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" /> Giao BTVN
            </Link>
            <div className="flex rounded-2xl border border-white/10 bg-slate-900/70 p-1">
            <button
              type="button"
              onClick={() => setTab('students')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                tab === 'students' ? 'bg-accent-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" aria-hidden="true" /> Học sinh
            </button>
            <button
              type="button"
              onClick={() => setTab('parents')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                tab === 'parents' ? 'bg-accent-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Baby className="h-4 w-4" aria-hidden="true" /> Phụ huynh
            </button>
            </div>
          </div>
        </div>

        {/* ---------- students tab ---------- */}
        {tab === 'students' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
            {rosterQuery.isLoading ? (
              <div className="flex justify-center py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (rosterQuery.data ?? []).length === 0 ? (
              <p className="p-10 text-center text-sm font-medium text-slate-500">
                Lớp chưa có học sinh nào.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-black uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">Tài khoản</th>
                    <th className="px-5 py-3">Phụ huynh đã liên kết</th>
                    <th className="px-5 py-3 text-right">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(rosterQuery.data ?? []).map((row) => {
                    const linked = (parentsQuery.data ?? []).filter(
                      (p) => p.student.id === row.student.id && p.status !== 'revoked',
                    );
                    return (
                      <tr key={row.membershipId} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 font-black text-white">
                          {row.student.name || '(chưa có tên)'}
                        </td>
                        <td className="px-5 py-3 text-slate-400">{row.student.email}</td>
                        <td className="px-5 py-3">
                          {linked.length === 0 ? (
                            <span className="text-xs font-bold text-slate-600">chưa có</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {linked.map((p) => (
                                <span
                                  key={p.linkId}
                                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_META[p.status].tone}`}
                                >
                                  {RELATION_LABELS[p.relation]}
                                  {p.parentName ? ` ${p.parentName}` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openInvite(row)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-accent-400/30 px-3 py-1.5 text-xs font-black text-accent-200 transition-colors hover:bg-accent-400/10"
                          >
                            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Mời phụ huynh
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ---------- code issued panel ---------- */}
        {issued && (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              Gửi mã mời cho phụ huynh của {issued.childName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="rounded-xl border border-emerald-400/30 bg-black/40 px-4 py-2 font-mono text-2xl font-black tracking-[0.2em] text-emerald-200">
                {issued.code}
              </code>
              <button
                type="button"
                onClick={() => copyText(issued.code)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-black text-slate-300 transition-colors hover:border-accent-400/50 hover:text-accent-200"
              >
                <Copy className="h-4 w-4" aria-hidden="true" /> Copy mã
              </button>
              <button
                type="button"
                onClick={() => setIssued(null)}
                aria-label="Đóng"
                className="ml-auto rounded-xl border border-white/10 px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-400">
              Phụ huynh đăng ký tài khoản (chọn "Tôi là phụ huynh"), nhập mã này, sau đó bạn duyệt
              ở tab <span className="font-black text-slate-200">Phụ huynh</span>.
            </p>
          </div>
        )}

        {/* ---------- parents tab ---------- */}
        {tab === 'parents' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
            {parentsQuery.isLoading ? (
              <div className="flex justify-center py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (parentsQuery.data ?? []).length === 0 ? (
              <p className="p-10 text-center text-sm font-medium text-slate-500">
                Chưa mời phụ huynh nào. Sang tab Học sinh và bấm "Mời phụ huynh" để tạo mã mời.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {(parentsQuery.data ?? []).map((row: ClassParentRow) => (
                  <li key={row.linkId} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-white">
                        {RELATION_LABELS[row.relation]} của{' '}
                        <span className="text-accent-200">{row.student.name || row.student.email}</span>
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {row.parentName || row.parent?.name || '(chưa có tên)'}
                        {row.parentPhone ? ` · ${row.parentPhone}` : ''}
                        {row.parent ? ` · ${row.parent.email}` : ''}
                      </p>
                    </div>
                    <code className="hidden rounded-lg bg-black/40 px-2 py-1 font-mono text-xs font-black tracking-widest text-slate-400 sm:block">
                      {row.inviteCode}
                    </code>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${STATUS_META[row.status].tone}`}
                    >
                      {row.status === 'pending' && !row.parent ? 'Chưa nhập mã' : STATUS_META[row.status].label}
                    </span>
                    {row.status === 'pending' && row.parent && (
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(row.linkId)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/90 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-emerald-400 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Duyệt
                      </button>
                    )}
                    {row.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Thu hồi quyền xem của ${row.parentName || row.parent?.name || 'phụ huynh'}?`)) {
                            revokeMutation.mutate(row.linkId);
                          }
                        }}
                        disabled={revokeMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 px-3 py-1.5 text-xs font-black text-rose-300 transition-colors hover:bg-rose-400/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Thu hồi
                      </button>
                    )}
                    {row.status === 'pending' && !row.parent && (
                      <button
                        type="button"
                        onClick={() => copyText(row.inviteCode)}
                        aria-label={`Copy mã mời ${row.inviteCode}`}
                        className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:border-accent-400/50 hover:text-accent-200"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ---------- invite modal ---------- */}
        {invite && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setInvite(null)}
          >
            <form
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                inviteMutation.mutate({
                  ...form,
                  parentName: form.parentName?.trim() || undefined,
                  parentPhone: form.parentPhone?.trim() || undefined,
                });
              }}
              className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black text-white">
                  <Send className="h-5 w-5 text-accent-400" aria-hidden="true" />
                  Mời phụ huynh của {invite.student.student.name || invite.student.student.email}
                </h2>
                <button
                  type="button"
                  onClick={() => setInvite(null)}
                  aria-label="Đóng"
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Quan hệ</span>
                <select
                  value={form.relation}
                  onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value as ParentRelation }))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  <option value="mother">Mẹ</option>
                  <option value="father">Bố</option>
                  <option value="guardian">Người giám hộ</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Tên phụ huynh <span className="normal-case text-slate-600">(tùy chọn, in hoa giúp phụ huynh dễ nhận)</span>
                </span>
                <input
                  value={form.parentName}
                  onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
                  maxLength={100}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Số điện thoại (tùy chọn)</span>
                <input
                  value={form.parentPhone}
                  onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))}
                  maxLength={30}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>

              <p className="flex items-start gap-2 rounded-2xl bg-black/25 p-3 text-xs font-medium text-slate-400">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                Mã sẽ hiển thị sau khi tạo. Phụ huynh dùng mã để đăng ký liên kết, bạn duyệt trong tab Phụ huynh.
              </p>

              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="min-h-11 w-full rounded-xl bg-accent-500 px-4 text-sm font-black text-white transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {inviteMutation.isPending ? 'Đang tạo mã…' : 'Tạo mã mời'}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
