import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessment.api';
import type { GradingCostTally } from '@/types/assessment.types';
import { formatUsd, gradingPartLabel, gradingStageLabel } from '../admin/costFormat';

const int = (n: number) => n.toLocaleString('vi-VN');
const tokens = (t: Pick<GradingCostTally, 'inputTokens' | 'outputTokens'>) => `${int(t.inputTokens)} / ${int(t.outputTokens)}`;
const unknown = (t: Pick<GradingCostTally, 'unknownCostCalls'>) => (t.unknownCostCalls ? `${int(t.unknownCostCalls)} lượt` : '—');

/** Model spend on this assessment, retries included; loaded only when opened. */
export function AssessmentCostPanel({ assessmentId }: { assessmentId: string }) {
  const [open, setOpen] = useState(false);
  const report = useQuery({ queryKey: ['assessments', assessmentId, 'costs'], queryFn: () => assessmentApi.costs(assessmentId), enabled: open });
  const data = report.data;
  return <details className="assessment-panel" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Chi phí chấm bài của đợt này</summary>
    {report.isPending && open && <p role="status">Đang tính…</p>}
    {report.isError && <p role="alert">Chưa tải được chi phí. Vui lòng thử lại.</p>}
    {data && (data.calls === 0
      ? <p>Đợt này chưa gọi model nào nên chưa phát sinh chi phí.</p>
      : <>
        <p role="status">
          Đã biết {formatUsd(data.knownCostMicros)} qua {int(data.calls)} lượt gọi model (token vào/ra {tokens(data)}).
          {data.unknownCostCalls > 0 && ` Còn ${int(data.unknownCostCalls)} lượt chưa rõ chi phí, tối đa ${formatUsd(data.upperBoundCostMicros)} nếu tính cả phần giữ chỗ.`}
        </p>
        {data.knownCostPerFinalizedMicros !== null
          ? <p>Trung bình {formatUsd(data.knownCostPerFinalizedMicros)} mỗi bài đã ghi sổ ({int(data.finalizedSubmissions)} bài){data.unknownCostCalls > 0 && data.upperBoundCostPerFinalizedMicros !== null ? `, tối đa ${formatUsd(data.upperBoundCostPerFinalizedMicros)}` : ''}.</p>
          : <p>Chưa có bài nào ghi sổ nên chưa tính được chi phí mỗi bài.</p>}
        {data.retries.calls > 0 && <p>Gọi lại sau lỗi: {int(data.retries.calls)} lượt, {formatUsd(data.retries.knownCostMicros)} (đã gồm trong tổng).</p>}
        <div className="assessment-table"><table aria-label="Chi phí theo vai trò model"><thead><tr><th>Vai trò</th><th>Lượt gọi</th><th>Token vào / ra</th><th>Chi phí đã biết</th><th>Chưa rõ</th></tr></thead><tbody>
          {data.byPurpose.map(p => <tr key={p.purpose}><td>{gradingPartLabel(p.purpose)}</td><td>{int(p.calls)}</td><td>{tokens(p)}</td><td>{formatUsd(p.knownCostMicros)}</td><td>{unknown(p)}</td></tr>)}
        </tbody></table></div>
        <div className="assessment-table"><table aria-label="Chi phí theo bước xử lý"><thead><tr><th>Bước</th><th>Lượt gọi</th><th>Token vào / ra</th><th>Chi phí đã biết</th><th>Chưa rõ</th></tr></thead><tbody>
          {data.byStage.map(s => <tr key={s.stage}><td>{gradingStageLabel(s.stage)}</td><td>{int(s.calls)}</td><td>{tokens(s)}</td><td>{formatUsd(s.knownCostMicros)}</td><td>{unknown(s)}</td></tr>)}
        </tbody></table></div>
        <div className="assessment-table"><table aria-label="Chi phí theo model"><thead><tr><th>Model</th><th>Lượt gọi</th><th>Token vào / ra</th><th>Chi phí đã biết</th><th>Chưa rõ</th></tr></thead><tbody>
          {data.byModel.map(m => <tr key={`${m.provider}/${m.model}`}><td>{m.model} <small>({m.provider})</small></td><td>{int(m.calls)}</td><td>{tokens(m)}</td><td>{formatUsd(m.knownCostMicros)}</td><td>{unknown(m)}</td></tr>)}
        </tbody></table></div>
      </>)}
  </details>;
}
