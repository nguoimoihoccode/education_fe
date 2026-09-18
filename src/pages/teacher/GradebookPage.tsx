import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Check, GraduationCap, Loader2, Pencil, Plus, Trash2, Trophy, X,
} from 'lucide-react';
import {
  createGrade,
  deleteGrade,
  getClassRanking,
  getGradeReport,
  listAssignments,
  listSubjects,
  updateGrade,
} from '@/api/school.api';
import {
  DEFAULT_COEFFICIENT,
  TEST_TYPES,
  TEST_TYPE_LABELS,
  TEST_TYPE_TONES,
  scoreTone,
} from '@/components/school/grades-meta';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/store/auth.store';
import { useCanWriteSchool } from '@/hooks/useCanWriteSchool';
import type {
  CreateGradeInput,
  GradeEntryView,
  GradeReportRow,
  GradeTestType,
  UpdateGradeInput,
} from '@/types/school.types';

function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function currentTerm(): number {
  // Same rule as BE: Sep–Dec = học kỳ 1, Jan–Aug = học kỳ 2.
  return new Date().getMonth() + 1 >= 9 ? 1 : 2;
}

interface GradeDraft {
  /** null = thêm mới; có id = sửa đầu điểm này */
  editId: string | null;
  studentId: number;
  studentLabel: string;
  testType: GradeTestType;
  score: string;
  date: string;
  coefficient: string;
  term: string;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

/** Sổ điểm theo lớp × môn — grid HS × loại điểm, TB từ server (Phase 4, plan §4). */
export default function GradebookPage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);
  // Reads are open to everyone; POST/PATCH/DELETE /grades and the ranking panel
  // stay staff-only on the BE, so hide those affordances from a read-only visitor.
  const canWrite = useCanWriteSchool();
  const isSchoolAdmin = useMemo(
    () => userRoles.includes('principal') || userRoles.includes('admin'),
    [userRoles],
  );

  const [subjectId, setSubjectId] = useState<string>('');
  const [term, setTerm] = useState<number | ''>('');
  const [draft, setDraft] = useState<GradeDraft | null>(null);
  const [rankingScope, setRankingScope] = useState<'subject' | 'class'>('subject');

  // Subject picker: principal sees every subject, a teacher only their
  // assignments for this class (assertWriteAccess on BE is stricter anyway).
  const assignmentsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_ASSIGNMENTS,
    queryFn: () => listAssignments({ classId: id }),
    enabled: !!id && !isSchoolAdmin,
  });
  const subjectsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_SUBJECTS,
    queryFn: listSubjects,
    enabled: isSchoolAdmin,
  });

  const subjects = useMemo(() => {
    if (isSchoolAdmin) {
      return (subjectsQuery.data ?? [])
        .filter((s) => s.active)
        .map((s) => ({ id: s.id, name: s.name }));
    }
    const seen = new Set<string>();
    const rows: Array<{ id: string; name: string }> = [];
    for (const a of assignmentsQuery.data ?? []) {
      if (a.subject && !seen.has(a.subject.id)) {
        seen.add(a.subject.id);
        rows.push({ id: a.subject.id, name: a.subject.name });
      }
    }
    return rows;
  }, [isSchoolAdmin, subjectsQuery.data, assignmentsQuery.data]);

  // Default to the first selectable subject once the list lands.
  useEffect(() => {
    if (!subjectId && subjects.length > 0) setSubjectId(subjects[0].id);
    if (subjectId && subjects.length > 0 && !subjects.some((s) => s.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  const reportQuery = useQuery({
    queryKey: QUERY_KEYS.GRADE_REPORT(id, subjectId || 'none', term === '' ? undefined : term),
    queryFn: () => getGradeReport(id, subjectId, term === '' ? undefined : term),
    enabled: !!id && !!subjectId,
    retry: false,
  });
  const report = reportQuery.data;

  // Bảng xếp hạng dùng lại subject/term đang chọn. Scope "toàn lớp" cần
  // GVCN/hiệu trưởng/ADMIN (BE 404 với GV bộ môn thường) — panel hiện hint.
  const rankingQuery = useQuery({
    queryKey: QUERY_KEYS.GRADE_RANKING(
      id,
      rankingScope === 'subject' ? subjectId || undefined : undefined,
      term === '' ? undefined : term,
    ),
    queryFn: () =>
      getClassRanking({
        classId: id,
        subjectId: rankingScope === 'subject' ? subjectId : undefined,
        term: term === '' ? undefined : term,
      }),
    enabled: !!id && (rankingScope === 'class' || !!subjectId),
    retry: false,
  });
  const ranking = rankingQuery.data;

  const invalidateGrades = () =>
    // ['grades'] is a prefix of GRADE_REPORT / MY_GRADES keys too.
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GRADES });

  type SavePayload =
    | { mode: 'create'; dto: CreateGradeInput }
    | { mode: 'update'; id: string; dto: UpdateGradeInput };

  const saveMutation = useMutation({
    mutationFn: (payload: SavePayload) =>
      payload.mode === 'create'
        ? createGrade(payload.dto)
        : updateGrade(payload.id, payload.dto),
    onSuccess: (_res, payload) => {
      toast.success(payload.mode === 'create' ? 'Đã thêm đầu điểm' : 'Đã cập nhật điểm');
      setDraft(null);
      invalidateGrades();
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không lưu được đầu điểm'),
  });

  const deleteMutation = useMutation({
    mutationFn: (gradeId: string) => deleteGrade(gradeId),
    onSuccess: () => {
      toast.success('Đã xoá đầu điểm');
      setDraft(null);
      invalidateGrades();
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không xoá được đầu điểm'),
  });

  const openAdd = (row: GradeReportRow, testType: GradeTestType) => {
    setDraft({
      editId: null,
      studentId: row.studentId,
      studentLabel: row.studentName || `HS #${row.studentId}`,
      testType,
      score: '',
      date: localDate(),
      coefficient: String(DEFAULT_COEFFICIENT[testType]),
      term: String(currentTerm()),
    });
  };

  const openEdit = (row: GradeReportRow, entry: GradeEntryView) => {
    setDraft({
      editId: entry.id,
      studentId: row.studentId,
      studentLabel: row.studentName || `HS #${row.studentId}`,
      testType: entry.testType,
      score: String(entry.score),
      date: entry.date,
      coefficient: String(entry.coefficient),
      term: String(entry.term),
    });
  };

  const submitDraft = () => {
    if (!draft || !subjectId) return;
    const score = Number(draft.score);
    if (draft.score.trim() === '' || Number.isNaN(score) || score < 0 || score > 10) {
      toast.error('Điểm phải từ 0 đến 10');
      return;
    }
    const dto: CreateGradeInput = {
      classId: id,
      subjectId,
      studentId: draft.studentId,
      testType: draft.testType,
      score: Math.round(score * 10) / 10,
      date: draft.date,
      coefficient: Number(draft.coefficient) || undefined,
      term: Number(draft.term) || undefined,
    };
    if (draft.editId) {
      saveMutation.mutate({
        mode: 'update',
        id: draft.editId,
        dto: {
          subjectId: dto.subjectId,
          studentId: dto.studentId,
          testType: dto.testType,
          score: dto.score,
          date: dto.date,
          coefficient: dto.coefficient,
          term: dto.term,
        },
      });
    } else {
      saveMutation.mutate({ mode: 'create', dto });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <Link
            to={ROUTES.TEACHING_CLASS(id)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-accent-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Lớp chủ nhiệm
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-white">
            <GraduationCap className="h-7 w-7 text-accent-400" aria-hidden="true" />
            Sổ điểm
            {report && (
              <span className="text-lg font-black text-slate-500">· {report.className}</span>
            )}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Bấm vào ô trống để thêm đầu điểm; bấm vào điểm đã có để sửa hoặc xoá.
            Trung bình giữa kỳ / cả năm tính theo hệ số (miệng, 15p ×1 · 45p, cuối kỳ ×2).
          </p>
        </div>

        {/* ---------- subject + term picker ---------- */}
        <div className="flex flex-wrap items-end gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          <label className="min-w-48 flex-1 space-y-1">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Môn học {isSchoolAdmin ? '' : '(môn bạn được phân công dạy lớp này)'}
            </span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
            >
              {subjects.length === 0 && <option value="">— chưa chọn được —</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-1">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Học kỳ
            </span>
            <div className="flex rounded-xl border border-white/10 bg-black/25 p-1">
              {[
                { v: '' as const, label: 'Cả năm' },
                { v: 1 as const, label: 'HK I' },
                { v: 2 as const, label: 'HK II' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setTerm(opt.v)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-black transition-colors ${
                    term === opt.v ? 'bg-accent-500 text-on-accent' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- grid ---------- */}
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
          {!subjectId ? (
            <p className="p-10 text-center text-sm font-medium text-slate-500">
              {isSchoolAdmin
                ? 'Trường chưa có môn học nào.'
                : 'Bạn chưa được phân công môn nào cho lớp này — hiệu trưởng thêm ở trang Giáo viên.'}
            </p>
          ) : reportQuery.isLoading ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reportQuery.isError || !report ? (
            <p className="p-10 text-center text-sm font-medium text-slate-500">
              Không tải được sổ điểm (bạn cần là GVCN, GV bộ môn của lớp, hoặc hiệu trưởng).
            </p>
          ) : report.rows.length === 0 ? (
            <p className="p-10 text-center text-sm font-medium text-slate-500">
              Lớp chưa có học sinh nào.
            </p>
          ) : (
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-black uppercase tracking-widest text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-900/95 px-5 py-3 backdrop-blur">
                    Học sinh
                  </th>
                  {TEST_TYPES.map((t) => (
                    <th key={t} className="px-3 py-3">
                      {TEST_TYPE_LABELS[t]}
                      <span className="ml-1 font-bold text-slate-600">×{DEFAULT_COEFFICIENT[t]}</span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-emerald-300/80">TB giữa kỳ</th>
                  <th className="px-5 py-3 text-violet-300/80">TB cả năm</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-white/5 last:border-0">
                    <td className="sticky left-0 z-10 bg-slate-900/95 px-5 py-3 backdrop-blur">
                      <p className="font-black text-white">{row.studentName || `HS #${row.studentId}`}</p>
                      <p className="text-[11px] font-bold text-slate-600">
                        {row.totalEntries} đầu điểm
                      </p>
                    </td>
                    {TEST_TYPES.map((t) => {
                      const entries = row.entries.filter((e) => e.testType === t);
                      return (
                        <td key={t} className="px-3 py-3 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {entries.map((e) => {
                              const title = `${e.date} · hệ số ${e.coefficient}${
                                e.homeworkId ? ' · tự sinh từ BTVN' : ''
                              }`;
                              const tone = `rounded-lg border px-2 py-0.5 text-xs font-black ${TEST_TYPE_TONES[t]}`;
                              // A read-only visitor (student, parent) may open this
                              // grid -- GET /grades narrows them to their own rows --
                              // but POST/PATCH/DELETE /grades stay TEACHER+ on the
                              // BE, so the chips are inert for them.
                              if (!canWrite) {
                                return (
                                  <span key={e.id} title={title} className={tone}>
                                    {e.homeworkId && <span className="mr-0.5">⚡</span>}
                                    {e.score}
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={e.id}
                                  type="button"
                                  onClick={() => openEdit(row, e)}
                                  title={title}
                                  className={`${tone} transition-transform hover:scale-105`}
                                >
                                  {e.homeworkId && <span className="mr-0.5">⚡</span>}
                                  {e.score}
                                </button>
                              );
                            })}
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => openAdd(row, t)}
                                aria-label={`Thêm điểm ${TEST_TYPE_LABELS[t]} cho ${row.studentName || row.studentId}`}
                                className="rounded-lg border border-dashed border-white/15 p-0.5 text-slate-600 transition-colors hover:border-accent-400/50 hover:text-accent-300"
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                          {row.byType[t] != null && (
                            <p className="mt-1 text-[11px] font-bold text-slate-600">
                              TB {row.byType[t]}
                            </p>
                          )}
                        </td>
                      );
                    })}
                    <td
                      className={`px-3 py-3 text-base font-black ${
                        row.midterm == null ? 'text-slate-700' : scoreTone(row.midterm)
                      }`}
                    >
                      {row.midterm ?? '—'}
                    </td>
                    <td
                      className={`px-5 py-3 text-base font-black ${
                        row.year == null ? 'text-slate-700' : scoreTone(row.year)
                      }`}
                    >
                      {row.year ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ---------- xếp hạng ---------- */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <Trophy className="h-5 w-5 text-amber-300" aria-hidden="true" />
              Xếp hạng{' '}
              {rankingScope === 'subject'
                ? `môn ${report?.subjectName ?? subjects.find((s) => s.id === subjectId)?.name ?? ''}`
                : 'toàn lớp'}
              {ranking && (
                <span className="text-xs font-black text-slate-500">
                  · {ranking.rankedCount} HS có điểm
                  {ranking.unrankedCount > 0
                    ? ` · ${ranking.unrankedCount} chưa xếp hạng`
                    : ''}
                </span>
              )}
            </h2>
            <div className="flex rounded-xl border border-white/10 bg-black/25 p-1">
              {(
                [
                  { v: 'subject' as const, label: 'Theo môn' },
                  { v: 'class' as const, label: 'Toàn lớp' },
                ]
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRankingScope(opt.v)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-black transition-colors ${
                    rankingScope === opt.v
                      ? 'bg-accent-500 text-on-accent'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            {rankingQuery.isLoading ? (
              <div className="flex justify-center py-8 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : rankingQuery.isError || !ranking ? (
              <p className="py-4 text-center text-sm font-medium text-slate-500">
                {rankingScope === 'class'
                  ? 'Xếp hạng toàn lớp chỉ dành cho GVCN, hiệu trưởng hoặc admin.'
                  : 'Không tải được bảng xếp hạng.'}
              </p>
            ) : ranking.rows.length === 0 ? (
              <p className="py-4 text-center text-sm font-medium text-slate-500">
                Lớp chưa có học sinh nào.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-black uppercase tracking-widest text-slate-500">
                      <th className="w-16 px-4 py-2">Hạng</th>
                      <th className="px-4 py-2">Học sinh</th>
                      <th className="px-4 py-2">Điểm xét hạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.rows.map((row) => (
                      <tr
                        key={row.studentId}
                        className={`border-b border-white/5 last:border-0 ${
                          row.rank != null && row.rank <= 3 ? 'bg-amber-400/5' : ''
                        }`}
                      >
                        <td className="px-4 py-2 text-base font-black text-white">
                          {row.rank == null
                            ? '—'
                            : RANK_MEDALS[row.rank] ?? row.rank}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-200">
                          {row.studentName || `HS #${row.studentId}`}
                        </td>
                        <td
                          className={`px-4 py-2 text-base font-black ${
                            row.average == null ? 'text-slate-700' : scoreTone(row.average)
                          }`}
                        >
                          {row.average ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs font-medium text-slate-600">
          Quy tắc: TB giữa kỳ = trung bình cộng có hệ số của các đầu điểm chưa phải cuối kỳ;
          TB cả năm = (giữa kỳ × 2 + cuối kỳ) ÷ 3. Đầu điểm có ⚡ tự sinh khi học sinh hoàn thành
          BTVN dạng quiz (đầu điểm 15 phút) — lần làm gần nhất tính điểm. Xếp hạng theo điểm
          cả năm (chưa có thì giữa kỳ), đồng điểm trùng hạng kiểu 1-1-3; học sinh chưa đủ điểm
          để tính TB sẽ nằm cuối bảng mà không bị loại khỏi lớp.
        </p>
      </section>

      {/* ---------- add/edit modal ---------- */}
      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setDraft(null)}
        >
          <form
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              submitDraft();
            }}
            className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-black text-white">
                <Pencil className="h-5 w-5 text-accent-400" aria-hidden="true" />
                {draft.editId ? 'Sửa đầu điểm' : 'Thêm đầu điểm'} · {draft.studentLabel}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Đóng"
                className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Loại bài
                </span>
                <select
                  value={draft.testType}
                  onChange={(e) => {
                    const t = e.target.value as GradeTestType;
                    setDraft((d) =>
                      d ? { ...d, testType: t, coefficient: String(DEFAULT_COEFFICIENT[t]) } : d,
                    );
                  }}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                >
                  {TEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TEST_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Điểm (0–10)
                </span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={draft.score}
                  onChange={(e) => setDraft((d) => (d ? { ...d, score: e.target.value } : d))}
                  autoFocus
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Ngày kiểm tra
                </span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft((d) => (d ? { ...d, date: e.target.value } : d))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                    Hệ số
                  </span>
                  <select
                    value={draft.coefficient}
                    onChange={(e) => setDraft((d) => (d ? { ...d, coefficient: e.target.value } : d))}
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                  >
                    <option value="1">×1</option>
                    <option value="2">×2</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                    HK
                  </span>
                  <select
                    value={draft.term}
                    onChange={(e) => setDraft((d) => (d ? { ...d, term: e.target.value } : d))}
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                  >
                    <option value="1">I</option>
                    <option value="2">II</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {draft.editId && (
                <button
                  type="button"
                  onClick={() => {
                    const gradeId = draft.editId;
                    if (gradeId && window.confirm('Xoá đầu điểm này?')) {
                      deleteMutation.mutate(gradeId);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 px-3 py-2 text-xs font-black text-rose-300 transition-colors hover:bg-rose-400/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Xoá
                </button>
              )}
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-accent-500 px-5 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="h-4 w-4" aria-hidden="true" />
                )}
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
