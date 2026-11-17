import type { AssessmentStep } from './assessmentSteps';

export function AssessmentSteps({ steps }: { steps: AssessmentStep[] }) {
  return <ol className="assessment-steps" aria-label="Các bước của đợt chấm">
    {steps.map((step, index) => <li key={step.id} className={`assessment-step is-${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
      <button type="button" onClick={() => document.getElementById(step.target)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })}>
        <span className="assessment-step-index" aria-hidden="true">{step.state === 'done' ? '✓' : index + 1}</span>
        <span className="assessment-step-text"><strong>{step.label}</strong><small>{step.detail}</small></span>
      </button>
    </li>)}
  </ol>;
}
