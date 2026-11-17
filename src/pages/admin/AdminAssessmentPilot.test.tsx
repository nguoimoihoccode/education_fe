import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import { listClasses, listSubjects } from '@/api/school.api';
import type { PilotScope } from '@/types/assessment.types';
import type { SchoolClass, Subject } from '@/types/school.types';
import AdminAssessmentPilot from './AdminAssessmentPilot';

vi.mock('@/api/assessment.api', () => ({ assessmentApi: { pilotScopes: vi.fn(), setPilotScope: vi.fn() } }));
vi.mock('@/api/school.api', () => ({ listClasses: vi.fn(), listSubjects: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const scope: PilotScope = { id: 'p1', schoolId: 's', classId: 'c1', className: '8A', subjectId: 'm1', subjectName: 'Công nghệ', state: 'paused', revision: 3, reason: 'Tạm dừng kiểm tra', updatedBy: 1, updatedAt: '2026-11-01T02:00:00Z' };
const setup = () => {
  vi.mocked(assessmentApi.pilotScopes).mockResolvedValue([scope]);
  vi.mocked(listClasses).mockResolvedValue([{ id: 'c1', name: '8A' }, { id: 'c2', name: '8B' }] as SchoolClass[]);
  vi.mocked(listSubjects).mockResolvedValue([{ id: 'm1', name: 'Công nghệ' }] as Subject[]);
  render(<QueryClientProvider client={new QueryClient()}><AdminAssessmentPilot /></QueryClientProvider>);
};
const fill = (classId: string, state: string) => {
  fireEvent.change(screen.getByLabelText('Lớp'), { target: { value: classId } });
  fireEvent.change(screen.getByLabelText('Môn'), { target: { value: 'm1' } });
  fireEvent.change(screen.getByLabelText('Trạng thái mới'), { target: { value: state } });
  fireEvent.change(screen.getByLabelText(/Lý do/), { target: { value: 'Mở thí điểm học kỳ 1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));
};

it('reopens an existing scope with its revision and reports re-queued jobs', async () => {
  setup();
  vi.mocked(assessmentApi.setPilotScope).mockResolvedValue({ ...scope, state: 'active', revision: 4, requeuedJobs: 2 } as PilotScope);
  expect(await screen.findByText('Tạm dừng kiểm tra')).toBeTruthy();
  await screen.findByRole('option', { name: '8B' });
  fill('c1', 'active');
  await waitFor(() => expect(assessmentApi.setPilotScope).toHaveBeenCalledWith({ classId: 'c1', subjectId: 'm1', state: 'active', reason: 'Mở thí điểm học kỳ 1', expectedRevision: 3 }));
  expect(await screen.findByText(/Đang mở.*2 việc đang chờ đã được chạy lại/)).toBeTruthy();
});

it('creates a scope that has no row yet without a revision', async () => {
  setup();
  vi.mocked(assessmentApi.setPilotScope).mockResolvedValue({ ...scope, id: 'p2', classId: 'c2', state: 'active', revision: 1 });
  await screen.findByRole('option', { name: '8B' });
  fill('c2', 'active');
  await waitFor(() => expect(assessmentApi.setPilotScope).toHaveBeenCalledWith({ classId: 'c2', subjectId: 'm1', state: 'active', reason: 'Mở thí điểm học kỳ 1' }));
});

it('switches to the row school when managing multiple schools via pilotCatalog', async () => {
  const apiWithCatalog = assessmentApi as unknown as { pilotCatalog?: ReturnType<typeof vi.fn> };
  apiWithCatalog.pilotCatalog = vi.fn().mockResolvedValue({
    items: [
      scope,
      { ...scope, id: 'p2', schoolId: 's2', schoolName: 'THCS B', classId: 'c9', className: '9A', subjectId: 'm9', subjectName: 'Toán', state: 'active', revision: 2 },
    ],
    schools: [
      { id: 's', name: 'THCS A', classes: [{ id: 'c1', name: '8A' }], subjects: [{ id: 'm1', name: 'Công nghệ' }] },
      { id: 's2', name: 'THCS B', classes: [{ id: 'c9', name: '9A' }], subjects: [{ id: 'm9', name: 'Toán' }] },
    ],
  });
  try {
    render(<QueryClientProvider client={new QueryClient()}><AdminAssessmentPilot /></QueryClientProvider>);
    expect(await screen.findByLabelText('Trường')).toBeTruthy();
    const changeButtons = screen.getAllByRole('button', { name: 'Đổi' });
    fireEvent.click(changeButtons[1]);
    expect((screen.getByLabelText('Trường') as HTMLSelectElement).value).toBe('s2');
    expect((screen.getByLabelText('Lớp') as HTMLSelectElement).value).toBe('c9');
    expect((screen.getByLabelText('Môn') as HTMLSelectElement).value).toBe('m9');
  } finally {
    delete apiWithCatalog.pilotCatalog;
  }
});
