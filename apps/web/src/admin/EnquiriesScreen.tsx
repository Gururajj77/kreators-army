// Owner: A4 Admin. The enquiries inbox (admin brief 5.6 with V2-SPEC 4.2, C16, C17): status tabs New · Contacted · Archived as a TabBar, the kind filter
// All · Trial briefs · Questions as a Segment, search, and Export CSV with the current filters. Two panes on desktop; on phones the list, then the detail
// on its own page (/admin/enquiries/:id).
import type { AdminLead, AdminLeadList, LeadKind, LeadStatus } from '@kreators/shared';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, MessageCircle, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { Link, useMatch, useNavigate, useSearchParams } from 'react-router';
import { Segment, TabBar, TabPanel } from '../components/tabs';
import { Seo } from '../components/ui';
import { adminApi, keys, retryOnce, AdminApiError } from './api';
import { EmptyState, When } from './bits';
import { LeadDetail } from './LeadDetail';

const STATUSES: { id: LeadStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'archived', label: 'Archived' },
];
type KindFilter = 'all' | LeadKind;

export function EnquiriesScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const match = useMatch('/admin/enquiries/:id');
  const openId = match?.params.id ?? null;
  const status = (STATUSES.some((s) => s.id === params.get('status')) ? params.get('status') : 'new') as LeadStatus;
  const kind = (params.get('kind') === 'trial' || params.get('kind') === 'question' ? params.get('kind') : 'all') as KindFilter;
  const [q, setQ] = useState(params.get('q') ?? '');
  const query = useDeferredValue(q.trim().slice(0, 60));

  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const filters = { status, kind: kind === 'all' ? undefined : kind, q: query || undefined };
  const list = useInfiniteQuery({
    queryKey: keys.leads(filters),
    queryFn: ({ pageParam }) => adminApi.leads({ ...filters, cursor: pageParam ?? undefined, limit: 50 }),
    initialPageParam: null as string | null,
    getNextPageParam: (last: AdminLeadList) => last.nextCursor,
    retry: retryOnce,
  });
  const leads = list.data?.pages.flatMap((p) => p.leads) ?? [];
  const counts = list.data?.pages[0]?.counts;

  // Keep the shell's "Enquiries (n)" in step with what this screen sees.
  useEffect(() => {
    if (counts) qc.setQueryData<AdminLeadList>(keys.leads({ counts: true }), (old) => (old ? { ...old, counts } : { leads: [], nextCursor: null, counts }));
  }, [counts, qc]);

  const csv = adminApi.leadsCsvUrl({ status, kind: kind === 'all' ? undefined : kind });
  const search = params.toString() ? `?${params.toString()}` : '';
  const order = STATUSES.findIndex((s) => s.id === status);

  let listBody;
  if (list.isPending) {
    listBody = (
      <ul className="adm-leads" aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="adm-lead-row adm-lead-skel">
            <span className="skeleton adm-skel-line" />
            <span className="skeleton adm-skel-line adm-skel-short" />
          </li>
        ))}
      </ul>
    );
  } else if (list.isError) {
    listBody = (
      <div className="adm-state" role="alert">
        <p className="adm-state-title">Enquiries didn't load.</p>
        {list.error instanceof AdminApiError && list.error.requestId && <p className="adm-state-meta">Request {list.error.requestId}</p>}
        <button type="button" className="btn btn-sm btn-ink" onClick={() => void list.refetch()}>
          Retry
        </button>
      </div>
    );
  } else if (!leads.length) {
    listBody =
      query || kind !== 'all' ? (
        <div className="adm-state">
          <p className="adm-state-title">No enquiries match.</p>
        </div>
      ) : status === 'new' ? (
        <EmptyState who="bolu" size={96} title="No new enquiries. Briefs land here as soon as someone sends one." />
      ) : (
        <div className="adm-state">
          <p className="adm-state-title">{status === 'contacted' ? 'No enquiries marked as contacted.' : 'Nothing archived.'}</p>
        </div>
      );
  } else {
    listBody = (
      <>
        <ul className="adm-leads" aria-label={`${STATUSES[order]?.label} enquiries`}>
          {leads.map((l) => (
            <LeadRow key={l.id} lead={l} current={l.id === openId} to={`/admin/enquiries/${encodeURIComponent(l.id)}${search}`} />
          ))}
        </ul>
        {list.hasNextPage && (
          <button type="button" className="btn btn-sm btn-ghost adm-more" onClick={() => void list.fetchNextPage()} disabled={list.isFetchingNextPage}>
            {list.isFetchingNextPage ? 'Loading…' : 'Show more'}
          </button>
        )}
      </>
    );
  }

  return (
    <section className="adm-screen adm-enq" data-open={openId ? '' : undefined} aria-labelledby="adm-enq-title">
      <Seo title="Enquiries · Library admin" description="Library admin" noindex />
      <div className="adm-head">
        <h1 id="adm-enq-title" className="adm-title">
          Enquiries
        </h1>
        <a className="btn btn-sm btn-ghost" href={csv} download data-csv>
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </div>

      <div className="adm-enq-tools">
        <TabBar
          idBase="adm-enq"
          label="Enquiry status"
          value={status}
          onChange={(v) => setParam('status', v === 'new' ? null : v)}
          tabs={STATUSES.map((s) => ({ id: s.id, label: s.label, count: s.id === 'new' ? counts?.new : undefined }))}
        />
        <Segment
          label="Kind"
          size="sm"
          className="adm-kind"
          value={kind}
          onChange={(v) => setParam('kind', v === 'all' ? null : v)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'trial', label: 'Trial briefs' },
            { value: 'question', label: 'Questions' },
          ]}
        />
        <label className="adm-search adm-search-sm">
          <Search className="size-4" aria-hidden />
          <span className="sr-only">Search enquiries by name, email, brand or phone</span>
          <input type="search" placeholder="Search name, email, brand" value={q} maxLength={60} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      <div className="adm-enq-panes">
        <TabPanel idBase="adm-enq" id={status} order={order} className="adm-enq-list">
          {listBody}
        </TabPanel>
        <div className="adm-enq-detail">
          {openId ? (
            <LeadPane
              id={openId}
              fallback={leads.find((l) => l.id === openId)}
              back={`/admin/enquiries${search}`}
              onGone={() => navigate(`/admin/enquiries${search}`, { replace: true })}
            />
          ) : (
            <div className="adm-enq-pick">
              <p>{leads.length ? 'Choose an enquiry to read it.' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LeadRow({ lead, current, to }: { lead: AdminLead; current: boolean; to: string }) {
  const pkg = lead.service || (lead.brief?.package ? '' : '');
  return (
    <li>
      <Link to={to} className="adm-lead-row" data-unread={lead.status === 'new' ? '' : undefined} aria-current={current ? 'page' : undefined} preventScrollReset>
        <span className="adm-lead-kind" aria-hidden title={lead.kind === 'trial' ? 'Trial brief' : 'Question'}>
          {lead.kind === 'trial' ? <FileText className="size-4" /> : <MessageCircle className="size-4" />}
        </span>
        <span className="adm-lead-main">
          <span className="adm-lead-name">{lead.name || 'No name'}</span>
          <span className="adm-lead-sub">{lead.kind === 'trial' ? lead.brand || lead.email : lead.email}</span>
        </span>
        <span className="adm-lead-side">
          <When value={lead.createdAt} className="adm-lead-when" />
          {pkg && <span className="adm-chip adm-lead-pkg" data-tone="grey">{pkg}</span>}
        </span>
        <span className="sr-only">{lead.kind === 'trial' ? ', trial brief' : ', question'}</span>
      </Link>
    </li>
  );
}

function LeadPane({ id, fallback, back, onGone }: { id: string; fallback?: AdminLead; back: string; onGone: () => void }) {
  const q = useQuery({ queryKey: keys.lead(id), queryFn: () => adminApi.lead(id), initialData: fallback, staleTime: 10_000, retry: retryOnce });
  if (q.isPending) {
    return (
      <div className="adm-lead" aria-busy="true">
        <span className="skeleton adm-skel-line" />
        <span className="skeleton adm-skel-block" />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div className="adm-state" role="alert">
        <p className="adm-state-title">{q.error instanceof AdminApiError && q.error.status === 404 ? 'This enquiry is gone.' : "This enquiry didn't load."}</p>
        <Link to={back} className="btn btn-sm btn-ghost">
          Back to the list
        </Link>
      </div>
    );
  }
  return <LeadDetail key={q.data.id} lead={q.data} back={back} onGone={onGone} />;
}
