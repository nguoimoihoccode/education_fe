import { useEffect, useMemo, useRef, useState } from 'react';
import studyConsoleSvg from './study-console.svg?raw';
import './anatomy.css';

interface StudyConsoleFigureProps {
  /** Learning progress from 0.0 to 1.0 (default 0.68) */
  progress?: number;
  /** Estimated study time today in minutes (default 24) */
  todayMinutes?: number;
  /** Title of the card */
  title?: string;
  /** Force light or dark theme ('auto' adapts to data-theme or system) */
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

const P = {
  origin: [360, 242.97817472043894] as [number, number],
  scale: 1.3941033081055147,
  azimuth: 44,
  elevation: 30,
};

// src/index.css sizes every attribute-less <svg> to 1em for the Lucide icons
// (`svg:not([width]):not([class*="w-"])`), which would shrink the figure to
// 16px. An explicit width/height opts out of that rule so `.iso-svg`'s
// `width:100%;height:auto` wins.
const figureSvg = studyConsoleSvg.replace('<svg ', '<svg width="720" height="460" ');

const RADIANS = Math.PI / 180;
const UNIT = Math.sqrt(1.6);
const PLUNGER_X = -40;
const DIAL_Y = 0;
const DIAL_TOP = 76;
const DIAL_R = 28;

function iso([x, y, z]: [number, number, number]): [number, number] {
  const a = P.azimuth * RADIANS;
  const e = P.elevation * RADIANS;
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const sinE = Math.sin(e);
  const cosE = Math.cos(e);
  const k = P.scale * UNIT;
  return [
    P.origin[0] + (x * sinA - y * cosA) * k,
    P.origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k,
  ];
}

function calcNeedlePath(turn: number): string {
  const angle = turn * Math.PI * 2;
  const p0 = iso([
    PLUNGER_X - Math.sin(angle) * 4,
    DIAL_Y + Math.cos(angle) * 4,
    DIAL_TOP + 0.3,
  ]);
  const p1 = iso([
    PLUNGER_X + Math.sin(angle) * (DIAL_R - 5),
    DIAL_Y - Math.cos(angle) * (DIAL_R - 5),
    DIAL_TOP + 0.3,
  ]);
  return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
}

function formatReadout(progress: number, todayMinutes: number): string {
  return `${Math.round(progress * 100)}% hoàn thành · ${todayMinutes} phút hôm nay`;
}

/**
 * Interactive isometric "study console" for the dashboard. The needle follows
 * the pointer (and the arrow keys) across the stage, while `todayMinutes` stays
 * fixed: sweeping the dial changes the progress share only.
 *
 * The markup deliberately avoids `.iso-plate` / `.iso-plate-corners` from
 * anatomy.css: those rules position the corner labels absolutely for the
 * standalone HTML page, which would break this inline layout.
 */
export function StudyConsoleFigure({
  progress = 0.68,
  todayMinutes = 24,
  title = 'Study Console',
  theme = 'auto',
  className = '',
}: StudyConsoleFigureProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const [readout, setReadout] = useState(() => formatReadout(progress, todayMinutes));
  const [ariaNow, setAriaNow] = useState(() => Math.round(progress * 100));

  // A fresh `{ __html }` object on every render makes React re-write the
  // injected markup, replacing all 434 paths and detaching the needle node.
  const figureHtml = useMemo(() => ({ __html: figureSvg }), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const apply = (value: number) => {
      const clamped = Math.max(0, Math.min(1, value));
      progressRef.current = clamped;
      stage
        .querySelector<SVGPathElement>('[data-part="needle"]')
        ?.setAttribute('d', calcNeedlePath(clamped));
      setReadout(formatReadout(clamped, todayMinutes));
      setAriaNow(Math.round(clamped * 100));
    };

    apply(progress);

    const onPointerMove = (event: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0) return;
      apply((event.clientX - rect.left) / rect.width);
    };

    const onPointerLeave = () => apply(progress);

    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? 0.05
          : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
            ? -0.05
            : 0;
      if (step === 0) return;
      event.preventDefault();
      apply(progressRef.current + step);
    };

    stage.addEventListener('mousemove', onPointerMove);
    stage.addEventListener('mouseleave', onPointerLeave);
    stage.addEventListener('keydown', onKeyDown);

    return () => {
      stage.removeEventListener('mousemove', onPointerMove);
      stage.removeEventListener('mouseleave', onPointerLeave);
      stage.removeEventListener('keydown', onKeyDown);
    };
  }, [progress, todayMinutes]);

  return (
    <div
      className={`iso overflow-hidden rounded-[2rem] ${className}`}
      data-theme={theme === 'auto' ? undefined : theme}
      style={{
        background: 'var(--anatomy-card)',
        border: '1px solid var(--anatomy-mid)',
        boxShadow: 'var(--anatomy-lift)',
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          <span className="font-bold text-slate-900">Fig 1</span>
          <span className="hidden sm:inline">{title}</span>
          <span className="opacity-70">Rê chuột hoặc dùng phím ← → để xoay kim đo</span>
          <span className="font-mono text-sm font-semibold text-emerald-600" aria-live="polite">
            {readout}
          </span>
        </div>

        <div
          ref={stageRef}
          className="iso-stage relative aspect-[720/460] w-full cursor-ew-resize select-none overflow-hidden rounded-xl"
          tabIndex={0}
          role="slider"
          aria-label="Kim đo tiến độ học tập"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaNow}
          dangerouslySetInnerHTML={figureHtml}
        />

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-white shadow-sm ring-1 ring-slate-300" />
              <strong>Kim đo:</strong> Mục tiêu học hôm nay (0–100%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded bg-zinc-600" />
              <strong>5 ngăn thẻ:</strong> Decks từ vựng SRS
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-zinc-400" />
              <strong>3 chuông:</strong> Grammar / Listening / Reading
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyConsoleFigure;
