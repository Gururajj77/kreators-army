import { CircleAlert } from 'lucide-react';
import type { ChangeEvent, FocusEvent, ReactNode, Ref } from 'react';
import { BRAND_GUIDE_COVERS, BRAND_GUIDE_TITLE } from './copy';

// Owner: A6 Pages B. The brief builder's pieces (visual §1.5): the step header with its dots, single-select cards with a check badge, a text field with its
// label and error, and the brand guide disclosure. The form decides what they say; every word is from content §5.

export type Control = HTMLInputElement | HTMLTextAreaElement;

/** "Step {i} of 5" and five dots: done dots ink, the active one a pill, the rest a line. Decorative except for the words. */
export function StepDots({ step, total = 5 }: { step: number; total?: number }) {
  const review = step > total;
  return (
    <div className="bf-progress" data-review={review ? '' : undefined}>
      {!review && <p className="bf-progress-label">{`Step ${step} of ${total}`}</p>}
      <ol className="bf-dots" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className="bf-dot" data-state={i + 1 < step ? 'done' : i + 1 === step ? 'now' : undefined} />
        ))}
      </ol>
    </div>
  );
}

/** A label row: the words, and "Optional" on the right for an optional field. */
export function Label({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <span className="cf-label">
      {children}
      {optional && <span className="cf-opt">Optional</span>}
    </span>
  );
}

/** The error under a field: polite, announced as it appears. Empty when there is none, so the space never jumps. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="cf-err" aria-live="polite">
      {message && (
        <>
          <CircleAlert className="size-4 flex-none" aria-hidden />
          <span>{message}</span>
        </>
      )}
    </p>
  );
}

export interface FieldProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (e: ChangeEvent<Control>) => void;
  optional?: boolean;
  required?: boolean;
  error?: string;
  /** A line under the label, linked as the field's description. */
  help?: ReactNode;
  type?: 'text' | 'email' | 'tel' | 'url';
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: 'text' | 'email' | 'tel' | 'url';
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
  onFocus?: (e: FocusEvent<Control>) => void;
  onBlur?: (e: FocusEvent<Control>) => void;
  onSelect?: (e: { currentTarget: Control }) => void;
}

/** A labelled text field (or textarea) with its error under it. Errors only appear once the field has been checked (on blur or Next). */
export function Field({
  id,
  label,
  value,
  onChange,
  optional,
  required,
  error,
  help,
  type = 'text',
  multiline,
  rows = 3,
  placeholder,
  autoComplete,
  maxLength,
  inputMode,
  className,
  inputRef,
  onFocus,
  onBlur,
  onSelect,
}: FieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    name: id,
    className: `field cf-input ${multiline ? 'cf-area' : ''}`,
    value,
    placeholder,
    maxLength,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    onChange,
    onFocus,
    onBlur,
    onSelect,
  } as const;
  return (
    <div className={`cf-field ${className ?? ''}`}>
      <label htmlFor={id}>
        <Label optional={optional}>{label}</Label>
      </label>
      {help && (
        <p id={helpId} className="cf-help">
          {help}
        </p>
      )}
      {multiline ? (
        <textarea {...common} rows={rows} />
      ) : (
        <input
          {...common}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoCapitalize={type === 'email' || type === 'url' ? 'none' : undefined}
          spellCheck={type === 'email' || type === 'url' ? false : undefined}
        />
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Single-select cards: a radiogroup of plates (two columns on desktop, one on phones). The chosen one gets an ink ring and a check badge that pops. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  children,
}: {
  name: string;
  /** The step's question, as the group's legend. */
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T | '';
  onChange: (value: T) => void;
  /** Shown under the cards: the "Tell us more" field when "Something else" is chosen. */
  children?: ReactNode;
}) {
  return (
    <fieldset className="bf-choices">
      <legend className="bf-q">{legend}</legend>
      <div className="bf-cards">
        {options.map((o) => (
          <label key={o.value} className="bf-card" data-on={value === o.value ? '' : undefined}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="bf-card-label">{o.label}</span>
            <span className="bf-badge" aria-hidden>
              <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </label>
        ))}
      </div>
      {children}
    </fieldset>
  );
}

/** The "Something else" field that appears under its cards or chips: it rises 4 px and fades in. */
export function OtherField({ id, value, onChange }: { id: string; value: string; onChange: (e: ChangeEvent<Control>) => void }) {
  return (
    <div className="bf-other">
      <Field id={id} label="Tell us more" value={value} onChange={onChange} maxLength={200} />
    </div>
  );
}

/** "What a simple brand guide covers" (content §3.3 card 5), as a disclosure. */
export function GuideDisclosure() {
  return (
    <details className="bf-guide">
      <summary>
        <span>{BRAND_GUIDE_TITLE}</span>
        <span className="bf-guide-icon" aria-hidden />
      </summary>
      <ul className="bf-guide-list">
        {BRAND_GUIDE_COVERS.map((g) => (
          <li key={g.lead}>
            <strong>{g.lead}</strong> {g.rest}
          </li>
        ))}
      </ul>
    </details>
  );
}
