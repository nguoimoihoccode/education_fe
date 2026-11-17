import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessment.api';
import type { AgreementTally } from '@/types/assessment.types';
import { unitsToPoints } from './assessmentScores';

const percent = (t: Pick<AgreementTally, 'compared' | 'agreed'>) => (t.compared ? `${Math.round((t.agreed / t.compared) * 100)}%` : '—');
const confidenceLabels = { high: 'Cao', medium: 'Trung bình', low: 'Thấp', unknown: 'Không rõ' } as const;

/** Compares the AI's first proposal with what the teacher approved; loaded only when opened. */
export function AiAgreementPanel({ assessmentId }: { assessmentId: string }) {
  const [open, setOpen] = useState(false);
  const report = useQuery({ queryKey: ['assessments', assessmentId, 'ai-agreement'], queryFn: () => assessmentApi.aiAgreement(assessmentId), enabled: open });
  const data = report.data;
  return <details className="assessment-panel" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Độ khớp giữa điểm AI đề xuất và điểm giáo viên chốt</summary>
    {report.isPending && open && <p role="status">Đang tính…</p>}
    {report.isError && <p role="alert">Chưa tính được độ khớp. Vui lòng thử lại.</p>}
    {data && (data.compared === 0
      ? <p>Chưa có câu nào để so sánh. Số liệu xuất hiện khi giáo viên đã duyệt hoặc ghi sổ những bài có câu AI chấm.</p>
      : <>
        <p role="status">Đã so {data.compared} câu trên {data.decidedSubmissions} bài giáo viên đã duyệt: giữ nguyên điểm AI ở {data.agreed} câu ({percent(data)}), lệch trung bình {unitsToPoints(data.meanAbsDiffUnits ?? 0)} điểm mỗi câu.</p>
        <p>Chỉ nên cân nhắc duyệt hàng loạt cho nhóm có tỉ lệ giữ nguyên cao và đã so đủ nhiều câu.</p>
        <div className="assessment-table"><table aria-label="Theo mức tin cậy của AI"><thead><tr><th>Mức tin cậy AI</th><th>Số câu so</th><th>Giữ nguyên</th><th>Tỉ lệ</th></tr></thead><tbody>
          {(Object.keys(confidenceLabels) as (keyof typeof confidenceLabels)[]).map(key => <tr key={key}><td>{confidenceLabels[key]}</td><td>{data.byConfidence[key].compared}</td><td>{data.byConfidence[key].agreed}</td><td>{percent(data.byConfidence[key])}</td></tr>)}
        </tbody></table></div>
        <div className="assessment-table"><table aria-label="Theo câu hỏi"><thead><tr><th>Câu</th><th>Số bài so</th><th>Giữ nguyên</th><th>Tỉ lệ</th></tr></thead><tbody>
          {data.byQuestion.map(q => <tr key={q.questionKey}><td>{q.questionKey}</td><td>{q.compared}</td><td>{q.agreed}</td><td>{percent(q)}</td></tr>)}
        </tbody></table></div>
      </>)}
  </details>;
}
