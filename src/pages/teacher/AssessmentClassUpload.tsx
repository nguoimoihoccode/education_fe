import { useId, useState } from 'react';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentUploadPlan } from '@/types/assessment.types';

type Student = { id: number; displayName: string; studentCode?: string };
type PageFile = {
  id: string;
  file: File;
  state: 'queued' | 'uploading' | 'submitted' | 'error';
  error?: string;
};
type StudentGroup = {
  studentId: number;
  clientGroupId: string;
  submissionId?: string;
  started?: boolean;
  error?: string;
  files: PageFile[];
};

const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxFilesPerStudent = 30;
const concurrentGroups = 3;
const statusLabels = {
  queued: 'Chưa tải',
  uploading: 'Đang tải',
  submitted: 'Đã gửi xác thực',
  error: 'Lỗi tải',
};

function errorMessage(error: unknown) {
  const response = (error as { response?: { data?: { message?: unknown } } })?.response;
  const message = response?.data?.message;
  return typeof message === 'string'
    ? message
    : error instanceof Error ? error.message : 'Vui lòng thử lại.';
}

export function AssessmentClassUpload({
  assessmentId,
  roster,
  existingStudentIds,
  busy,
  run,
}: {
  assessmentId: string;
  roster: Student[];
  existingStudentIds: ReadonlySet<number>;
  busy: boolean;
  run: (action: () => Promise<void>) => Promise<void>;
}) {
  const headingId = useId();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Record<number, StudentGroup>>({});
  const [fileError, setFileError] = useState('');

  const group = studentId === null ? undefined : groups[studentId];
  const selectedStudent = roster.find(student => student.id === studentId);
  const prepared = roster.flatMap(student => groups[student.id] ? [groups[student.id]] : []);
  const files = prepared.flatMap(item => item.files);
  const canAdd = !busy && !!selectedStudent && !group?.started && !existingStudentIds.has(selectedStudent.id);
  const selectedIndex = roster.findIndex(student => student.id === studentId);
  const nextStudent = [...roster.slice(selectedIndex + 1), ...roster.slice(0, selectedIndex)]
    .find(student => !groups[student.id] && !existingStudentIds.has(student.id));

  function updateGroup(id: number, update: (current: StudentGroup) => StudentGroup) {
    setGroups(current => ({ ...current, [id]: update(current[id]) }));
  }

  function addFiles(selected: File[]) {
    if (!canAdd || !selectedStudent || selected.length === 0) return;
    const invalid = selected.find(file =>
      !acceptedTypes.includes(file.type) || !file.size ||
      file.size > (file.type === 'application/pdf' ? 50 : 20) * 1024 * 1024 ||
      file.name.length > 255,
    );
    if (invalid) {
      setFileError(`Không thêm được ${invalid.name}. Dùng JPEG/PNG tối đa 20 MiB hoặc PDF tối đa 50 MiB.`);
      return;
    }
    if ((group?.files.length ?? 0) + selected.length > maxFilesPerStudent) {
      setFileError('Mỗi học sinh có thể chọn tối đa 30 file. Bài sau khi chuyển PDF cũng phải nằm trong giới hạn 30 trang.');
      return;
    }
    setFileError('');
    const additions: PageFile[] = selected.map(file => ({ id: crypto.randomUUID(), file, state: 'queued' }));
    const student = selectedStudent.id;
    const clientGroupId = group?.clientGroupId ?? crypto.randomUUID();
    setGroups(current => ({
      ...current,
      [student]: {
        studentId: student,
        clientGroupId,
        files: [...(current[student]?.files ?? []), ...additions],
      },
    }));
  }

  function removeFile(student: number, id: string) {
    setGroups(current => {
      const updated = { ...current };
      const item = updated[student];
      const remaining = item.files.filter(file => file.id !== id);
      if (remaining.length) updated[student] = { ...item, files: remaining };
      else delete updated[student];
      return updated;
    });
  }

  async function uploadGroups(retry: boolean) {
    const pending = prepared.filter(item => retry
      ? item.error || item.files.some(file => file.state === 'error')
      : !item.started);
    if (!pending.length || busy) return;
    await run(async () => {
      let next = 0;
      async function uploadNext() {
        while (next < pending.length) {
          const item = pending[next++];
          updateGroup(item.studentId, current => ({ ...current, started: true, error: undefined }));
          let submissionId = item.submissionId;
          if (!submissionId) {
            const plan: AssessmentUploadPlan[] = item.files.map(({ id, file }) => ({
              clientFileId: id, name: file.name, mime: file.type, byteSize: file.size,
            }));
            try {
              const submission = await assessmentApi.createSubmission(assessmentId, item.studentId, {
                clientGroupId: item.clientGroupId,
                files: plan,
              });
              submissionId = submission.id;
              updateGroup(item.studentId, current => ({ ...current, submissionId }));
            } catch (error) {
              updateGroup(item.studentId, current => ({ ...current, error: errorMessage(error) }));
              continue;
            }
          }
          for (const page of item.files) {
            if (page.state === 'submitted') continue;
            const setFile = (state: PageFile['state'], error?: string) => {
              updateGroup(item.studentId, current => ({
                ...current,
                files: current.files.map(file => file.id === page.id ? { ...file, state, error } : file),
              }));
            };
            setFile('uploading');
            try {
              await assessmentApi.upload(assessmentId, submissionId, page.file, page.id);
              setFile('submitted');
            } catch (error) {
              setFile('error', errorMessage(error));
            }
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(concurrentGroups, pending.length) }, uploadNext));
    });
  }

  const submittedCount = files.filter(file => file.state === 'submitted').length;
  const hasErrors = prepared.some(item => item.error || item.files.some(file => file.state === 'error'));

  return (
    <section className="assessment-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Tải bài cả lớp</h3>
      <p>Chọn học sinh, chụp hoặc thêm ảnh/PDF của em đó, rồi chuyển sang em tiếp theo. Mỗi nhóm gồm cả đề và bài làm.</p>
      <div className="assessment-controls">
        <label>
          Học sinh
          <select
            value={studentId ?? ''}
            disabled={busy || roster.length === 0}
            onChange={event => { setStudentId(Number(event.target.value) || null); setFileError(''); }}
          >
            <option value="">Chọn học sinh trong lớp</option>
            {roster.map(student => (
              <option key={student.id} value={student.id} disabled={existingStudentIds.has(student.id) && !groups[student.id]}>
                {student.displayName}{student.studentCode ? ` — ${student.studentCode}` : ''}
                {groups[student.id] ? ` (${groups[student.id].files.length} file)` : existingStudentIds.has(student.id) ? ' (đã có bài)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ảnh hoặc PDF của học sinh đang chọn
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            multiple
            disabled={!canAdd}
            onChange={event => { addFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }}
          />
        </label>
        <label>
          Chụp ảnh trang bài
          <input
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            disabled={!canAdd}
            onChange={event => { addFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }}
          />
        </label>
        <button
          type="button"
          disabled={busy || !nextStudent}
          onClick={() => { if (nextStudent) setStudentId(nextStudent.id); setFileError(''); }}
        >
          Học sinh tiếp theo
        </button>
      </div>
      {fileError && <p role="alert">{fileError}</p>}
      {prepared.length > 0 && (
        <>
          <p role="status">{prepared.length} học sinh · {submittedCount}/{files.length} file đã gửi xác thực</p>
          <ul>
            {prepared.map(item => (
              <li key={item.clientGroupId}>
                <details open={item.studentId === studentId || !!item.error || item.files.some(file => file.state === 'error')}>
                  <summary>{roster.find(student => student.id === item.studentId)?.displayName} · {item.files.length} file</summary>
                  {item.error && <p role="alert">{item.error}</p>}
                  <ul>
                    {item.files.map(page => (
                      <li key={page.id}>
                        {page.file.name} · {statusLabels[page.state]}{page.error && <span role="alert"> · {page.error}</span>}
                        {!item.started && (
                          <button type="button" disabled={busy} onClick={() => removeFile(item.studentId, page.id)}>
                            Bỏ {page.file.name}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="assessment-controls">
        <button type="button" disabled={busy || !prepared.some(item => !item.started)} onClick={() => void uploadGroups(false)}>
          Tải bài cả lớp
        </button>
        {hasErrors && <button type="button" disabled={busy} onClick={() => void uploadGroups(true)}>Thử lại file lỗi</button>}
      </div>
      <p>Giữ trang mở trong khi tải. Nếu tải bị gián đoạn sau khi đã tạo bài, mở bài đó để chọn lại những file còn thiếu.</p>
    </section>
  );
}
