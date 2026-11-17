/** YYYY-MM-DD of a day in Vietnam, the time zone the report groups by. */
export function vnDay(offsetDays = 0, now = new Date()): string {
  const shifted = new Date(now.getTime() + 7 * 3600_000 - offsetDays * 86400_000);
  return shifted.toISOString().slice(0, 10);
}

export function formatUsd(micros: number): string {
  const usd = micros / 1_000_000;
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: usd < 1 ? 4 : 2, maximumFractionDigits: usd < 1 ? 4 : 2 })}`;
}

const GRADING_PARTS: Record<string, string> = {
  external_text_grading: 'Chấm tự luận (LLM ngoài)',
  reader: 'Đọc bài viết tay',
  vision: 'Đọc ảnh (model thị giác)',
  grader: 'Chấm theo tiêu chí',
  marking_guide: 'Đọc hướng dẫn chấm',
};
const GRADING_STAGES: Record<string, string> = {
  template: 'Nhập đề và đáp án',
  extract: 'Đọc bài học sinh',
  grade: 'Chấm điểm',
  seal: 'Niêm phong kết quả',
};
/** Vietnamese name for a grading model role; unknown roles keep their raw name. */
export const gradingPartLabel = (key: string) => GRADING_PARTS[key] ?? key;
export const gradingStageLabel = (key: string) => GRADING_STAGES[key] ?? key;
