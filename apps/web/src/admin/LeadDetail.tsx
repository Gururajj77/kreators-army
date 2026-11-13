// Owner: A4 Admin. One enquiry (admin brief 5.6): the header (name, email with a copy button, phone, brand, website as text unless it is an http(s) link,
// "Agency"), then the brief in its own order with the shared labels, "Not shared yet." for what was skipped, and for a question only the question.
// Reply by email, WhatsApp when the phone has 10 or more digits, status moves, a note that saves on blur and after 1 s idle, and permanent delete
// from Archived only. Every value is rendered as text; links only for http(s), always with rel="noopener noreferrer".
// (form7) A partial lead (saved as the visitor went, never sent) says where they stopped and shows its answers step by step, each with when it was saved.
import { BRIEF_STEP_TITLES, briefLabel, isHttpUrl, type AdminLead, type AdminLeadList, type LeadStatus } from '@kreators/shared';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Archive, ArrowLeft, Inbox, Mail, Phone, Trash2, UserCheck } from 'lucide-react';
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { CopyButton } from '../components/ui';
import { AdminApiError, adminApi, keys } from './api';
import { ConfirmDialog, StatusChip, exactTime, relativeTime } from './bits';
import { toast } from './Toasts';

const NOT_SHARED = 'Not shared yet.';

function Item({ label, children, empty }: { label: string; children?: ReactNode; empty?: boolean }) {
  return (
    <div className="adm-brief-item" data-empty={empty ? '' : undefined}>
      <dt>{label}</dt>
      <dd>{empty ? <span className="adm-muted">{NOT_SHARED}</span> : children}</dd>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function SafeLink({ url }: { url: string }) {
  if (!isHttpUrl(url)) return <span className="adm-break">{url}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="adm-ref">
      <b>{hostOf(url)}</b> <span className="adm-break">{url}</span>
    </a>
  );
}

/** (form7) "Stopped at step 3: Brand integration" for a partial trial brief; a question has no steps. */
export function stopLabel(lead: Pick<AdminLead, 'kind' | 'stepReached'>): string {
  if (lead.kind === 'question') return 'Stopped before sending';
  const n = (lead.stepReached ?? 1) as keyof typeof BRIEF_STEP_TITLES;
  return `Stopped at step ${n}: ${BRIEF_STEP_TITLES[n] ?? ''}`;
}

const BRIEF_STEPS = [1, 2, 3, 4, 5] as const;

/** wa.me wants digits only; a 10-digit number is Indian, so 91 goes first. Null under 10 digits. */
export function whatsappOf(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

export function LeadDetail({ lead: initial, back, onGone }: { lead: AdminLead; back: string; onGone: () => void }) {
  const qc = useQueryClient();
  const [lead, setLead] = useState(initial);
  const [note, setNote] = useState(initial.note);
  const [noteState, setNoteState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [moving, setMoving] = useState<LeadStatus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const saved = useRef(initial.note);
  const timer = useRef(0);
  const noteId = useId();
  const headId = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sync = (l: AdminLead) => {
    setLead(l);
    qc.setQueryData(keys.lead(l.id), l);
    qc.setQueriesData<InfiniteData<AdminLeadList>>({ queryKey: ['admin', 'leads'] }, (old) =>
      old && 'pages' in old ? { ...old, pages: old.pages.map((p) => ({ ...p, leads: p.leads.map((x) => (x.id === l.id ? l : x)) })) } : old,
    );
  };

  const saveNote = async (text: string) => {
    window.clearTimeout(timer.current);
    if (text === saved.current) return;
    setNoteState('saving');
    try {
      const l = await adminApi.updateLead(lead.id, { note: text });
      saved.current = l.note;
      sync({ ...l });
      setNoteState('saved');
    } catch (e) {
      setNoteState('error');
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    }
  };

  const move = async (status: LeadStatus) => {
    setMoving(status);
    try {
      const l = await adminApi.updateLead(lead.id, { status });
      sync(l);
      await qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
      toast(status === 'contacted' ? 'Marked as contacted' : status === 'archived' ? 'Archived' : 'Moved to New');
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setMoving(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteLead(lead.id);
      setConfirmDelete(false);
      toast('Deleted for good');
      // Leave first: a detail still mounted would ask for the enquiry again and meet a 404.
      onGone();
      window.setTimeout(() => {
        qc.removeQueries({ queryKey: keys.lead(lead.id) });
        void qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
      }, 0);
    } catch (e) {
      if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const b = lead.brief;
  const trial = lead.kind === 'trial';
  const partial = lead.completion === 'partial';
  const reached = lead.stepReached ?? 1;
  const subject = trial ? 'Your Kreators.Army trial brief' : 'Your question to Kreators.Army';
  const mailto = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}`;
  const wa = lead.phone ? whatsappOf(lead.phone) : null;

  const pkg = b?.package ? briefLabel('package', b.package) : '';
  const pkgText = [lead.service || pkg, b?.brands && b.brands > 1 ? `for ${b.brands} brands` : ''].filter(Boolean).join(' ');
  const objective = b?.objective ? `${briefLabel('objective', b.objective)}${b.objective === 'other' && b.objectiveOther ? `: ${b.objectiveOther}` : ''}` : '';
  const integration = b?.integration ? `${briefLabel('integration', b.integration)}${b.integration === 'other' && b.integrationOther ? `: ${b.integrationOther}` : ''}` : '';

  // The brief's answers grouped by the form step that asks them: one flat list for a sent brief, step by step for a partial one.
  const byStep: Record<(typeof BRIEF_STEPS)[number], ReactNode> = {
    1: (
      <Item key="pkg" label="Package interest" empty={!pkgText}>
        {pkgText}
      </Item>
    ),
    2: (
      <Item key="objective" label="Objective" empty={!objective}>
        {objective}
      </Item>
    ),
    3: (
      <Item key="integration" label="Brand integration" empty={!integration}>
        {integration}
      </Item>
    ),
    4: (
      <Fragment key="musts">
        <Item label="Must-haves" empty={!b?.mustHaves.length}>
          <ul className="adm-musts">
            {b?.mustHaves.map((m) => (
              <li key={m} className="adm-chip" data-tone="grey">
                {briefLabel('mustHave', m)}
                {m === 'other' && b.mustHavesOther ? `: ${b.mustHavesOther}` : ''}
              </li>
            ))}
          </ul>
        </Item>
        <Item label="After watching, what should people think, feel or do?" empty={!b?.viewerResponse}>
          <p className="adm-pre">{b?.viewerResponse}</p>
        </Item>
      </Fragment>
    ),
    5: (
      <Fragment key="refs">
        <Item label="References" empty={!b?.referenceLinks.length}>
          <ul className="adm-refs">
            {b?.referenceLinks.map((u) => (
              <li key={u}>
                <SafeLink url={u} />
              </li>
            ))}
          </ul>
        </Item>
        <Item label="Brand guide" empty={!b?.brandGuideUrl}>
          {b?.brandGuideUrl && <SafeLink url={b.brandGuideUrl} />}
        </Item>
        <Item label="Anything else" empty={!lead.message}>
          <p className="adm-pre">{lead.message}</p>
        </Item>
      </Fragment>
    ),
  };

  return (
    <article className="adm-lead" aria-labelledby={headId}>
      <Link to={back} className="adm-back">
        <ArrowLeft className="size-4" aria-hidden /> All enquiries
      </Link>
      <header className="adm-lead-head">
        <div className="adm-lead-titles">
          <h2 id={headId} className="adm-lead-title">
            {lead.name || 'No name'}
          </h2>
          <p className="adm-lead-meta">
            <StatusChip tone={trial ? 'blue' : 'grey'}>{trial ? 'Trial brief' : 'Question'}</StatusChip>
            <StatusChip tone={lead.status === 'new' ? 'green' : 'grey'}>{lead.status === 'new' ? 'New' : lead.status === 'contacted' ? 'Contacted' : 'Archived'}</StatusChip>
            {partial ? (
              <>
                <StatusChip tone="amber">{stopLabel(lead)}</StatusChip>
                <span title={exactTime(lead.updatedAt ?? lead.createdAt)}>Not sent · last saved {relativeTime(lead.updatedAt ?? lead.createdAt)}</span>
              </>
            ) : (
              <span title={exactTime(lead.createdAt)}>Received {relativeTime(lead.createdAt)}</span>
            )}
          </p>
        </div>
        <dl className="adm-lead-contact">
          <div>
            <dt>Email</dt>
            <dd className="adm-lead-email">
              {lead.email ? (
                <>
                  <span className="adm-break">{lead.email}</span>
                  <CopyButton text={lead.email} className="adm-copy" />
                </>
              ) : (
                <span className="adm-muted">{NOT_SHARED}</span>
              )}
            </dd>
          </div>
          {lead.phone && (
            <div>
              <dt>Phone</dt>
              <dd>{lead.phone}</dd>
            </div>
          )}
          {(trial || lead.brand) && (
            <div>
              <dt>Brand</dt>
              <dd>
                {lead.brand || <span className="adm-muted">{NOT_SHARED}</span>} {b?.isAgency && <StatusChip tone="ink">Agency</StatusChip>}
              </dd>
            </div>
          )}
          {trial && (
            <div>
              <dt>Website</dt>
              <dd>{b?.website ? isHttpUrl(b.website, 300) ? <SafeLink url={b.website} /> : <span className="adm-break">{b.website}</span> : <span className="adm-muted">{NOT_SHARED}</span>}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="adm-lead-actions">
        {lead.email && (
          <a className="btn btn-sm btn-ink" href={mailto}>
            <Mail className="size-4" aria-hidden /> Reply by email
          </a>
        )}
        {wa && (
          <a className="btn btn-sm btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">
            <Phone className="size-4" aria-hidden /> WhatsApp
          </a>
        )}
        <span className="adm-grow" />
        {lead.status === 'new' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => void move('contacted')} disabled={!!moving}>
            <UserCheck className="size-4" aria-hidden /> Mark as contacted
          </button>
        )}
        {lead.status !== 'archived' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => void move('archived')} disabled={!!moving}>
            <Archive className="size-4" aria-hidden /> Archive
          </button>
        )}
        {lead.status !== 'new' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => void move('new')} disabled={!!moving}>
            <Inbox className="size-4" aria-hidden /> Move to New
          </button>
        )}
        {lead.status === 'archived' && (
          <button type="button" className="btn btn-sm btn-ghost" data-intent="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden /> Delete permanently
          </button>
        )}
      </div>

      {trial && partial ? (
        <div className="adm-steps">
          {BRIEF_STEPS.map((n) => {
            const saved = lead.steps[String(n)];
            return (
              <section key={n} className="adm-step" aria-labelledby={`${headId}-s${n}`}>
                <h3 id={`${headId}-s${n}`} className="adm-step-title">
                  Step {n}: {BRIEF_STEP_TITLES[n]}
                  <span className="adm-step-when" title={saved ? exactTime(saved) : undefined}>
                    {saved ? `Saved ${relativeTime(saved)}` : n <= reached ? 'Opened, nothing saved' : 'Not reached'}
                  </span>
                </h3>
                <dl className="adm-brief">{byStep[n]}</dl>
              </section>
            );
          })}
        </div>
      ) : trial ? (
        <dl className="adm-brief">
          {BRIEF_STEPS.map((n) => byStep[n])}
        </dl>
      ) : (
        <dl className="adm-brief">
          <Item label="Question" empty={!lead.message}>
            <p className="adm-pre">{lead.message}</p>
          </Item>
        </dl>
      )}

      <div className="adm-note">
        <label className="adm-label" htmlFor={noteId}>
          Note <span className="adm-optional">(only you see this)</span>
        </label>
        <textarea
          id={noteId}
          className="field adm-note-field"
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => {
            const v = e.target.value;
            setNote(v);
            setNoteState('idle');
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => void saveNote(v), 1000);
          }}
          onBlur={() => void saveNote(note)}
          aria-describedby={`${noteId}-state`}
        />
        <p id={`${noteId}-state`} className="adm-help" aria-live="polite" data-note-state={noteState}>
          {noteState === 'saving' ? 'Saving…' : noteState === 'saved' ? 'Saved' : noteState === 'error' ? "Couldn't save the note. It saves again when you type." : ''}
        </p>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this enquiry for good?"
          body="Use this when someone asks you to remove their details."
          confirmLabel="Delete permanently"
          danger
          icon={<Trash2 className="size-4" aria-hidden />}
          busy={deleting}
          onConfirm={() => void remove()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </article>
  );
}
