import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyConsoleFigure } from './StudyConsoleFigure';

describe('StudyConsoleFigure', () => {
  it('renders the study console figure', () => {
    const { container } = render(<StudyConsoleFigure progress={0.68} />);
    expect(screen.getByText('Study Console')).toBeInTheDocument();
    expect(container.querySelector('.iso-stage')).toBeInTheDocument();
  });

  it('sweeps the dial with the arrow keys and leaves todayMinutes alone', () => {
    const { container } = render(
      <StudyConsoleFigure progress={0.68} todayMinutes={24} />
    );
    // Scope to this render: the suite has no global cleanup, so an earlier
    // test's markup is still in document.body.
    const view = within(container);
    const stage = container.querySelector('.iso-stage') as HTMLElement;

    expect(view.getByText('68% hoàn thành · 24 phút hôm nay')).toBeInTheDocument();

    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(view.getByText('73% hoàn thành · 24 phút hôm nay')).toBeInTheDocument();

    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    expect(view.getByText('68% hoàn thành · 24 phút hôm nay')).toBeInTheDocument();
  });
});
