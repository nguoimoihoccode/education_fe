import { useQuery } from '@tanstack/react-query';
import { CalendarRange, Loader2 } from 'lucide-react';
import TimetableGrid from '@/components/school/TimetableGrid';
import { getMyTimetable } from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';

/**
 * Read-only weekly grid for the signed-in user (GET /timetable/me):
 * teachers see their teaching slots, students see their class grid.
 * Shared by "Thời khoá biểu của tôi" and the timetable tab of "Trường của tôi".
 */
export default function MyTimetablePanel() {
  const meQuery = useQuery({
    queryKey: QUERY_KEYS.MY_TIMETABLE,
    queryFn: getMyTimetable,
    retry: false,
  });

  if (meQuery.isLoading) {
    return (
      <div className="flex justify-center rounded-3xl border border-white/10 bg-slate-900/70 py-16 text-slate-500 backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
        <CalendarRange className="mx-auto h-10 w-10 text-slate-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-500">
          Chưa có thời khóa biểu nào gắn với tài khoản của bạn — học sinh cần được xếp vào lớp,
          giáo viên cần có phân công giảng dạy.
        </p>
      </div>
    );
  }

  const me = meQuery.data;

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-white">
          {me.as === 'teacher'
            ? 'Lịch dạy của tôi'
            : me.class
              ? `Lớp ${me.class.name} · Khối ${me.class.grade}`
              : 'Lớp của tôi'}
        </p>
        <p className="text-xs font-bold text-slate-500">
          {me.slots.length} tiết/tuần
          {me.as === 'student' && me.class?.academicYear ? ` · ${me.class.academicYear}` : ''}
        </p>
      </div>
      <TimetableGrid slots={me.slots} periodConfig={me.periodConfig} />
    </div>
  );
}
