import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/Skeleton';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { cn } from '@/lib/cn';
import { SEED_THREADS, sortThreads, formatDaysAgo, type Thread, type ThreadStageTag } from '@/lib/community';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Users, Flame } from 'lucide-react';

type Sort = 'hot' | 'new' | 'top';
const SORTS: { id: Sort; label: string }[] = [
  { id: 'hot', label: 'Hot' },
  { id: 'new', label: 'New' },
  { id: 'top', label: 'Top' },
];

const TAG_STYLES: Record<ThreadStageTag, string> = {
  Explore: 'bg-white/10 text-white/80',
  Commit: 'bg-white/10 text-white/80',
  Struggle: 'border border-spotlight text-spotlight',
  Breakthrough: 'bg-mint-500/15 text-mint-300',
};

type Vote = 1 | 0 | -1;

export default function Community() {
  const { profile } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [sort, setSort] = useState<Sort>('hot');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const loading = useBriefLoading();

  // Searches live threads, including ones just posted this session, not
  // just the static seed data.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search threads...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const matches = search
          ? threads.filter((t) => t.title.toLowerCase().includes(search) || t.body.toLowerCase().includes(search))
          : threads;
        return matches.slice(0, 8).map((t) => ({
          id: t.id,
          label: t.title,
          sublabel: `${t.stageTag} · d/${t.author}`,
          icon: MessageSquare,
          onSelect: () => setExpanded(t.id),
        }));
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, threads]);

  const vote = (id: string, direction: 1 | -1) => {
    setVotes((prev) => {
      const current = prev[id] ?? 0;
      const next: Vote = current === direction ? 0 : direction;
      return { ...prev, [id]: next };
    });
  };

  const voteDelta = (id: string) => votes[id] ?? 0;

  const postThread = () => {
    const title = draftTitle.trim();
    if (!title) return;
    const thread: Thread = {
      id: crypto.randomUUID(),
      title,
      body: draftBody.trim(),
      author: profile.name || 'you',
      stageTag: 'Struggle',
      upvotes: 1,
      daysAgo: 0,
      comments: [],
    };
    setThreads((prev) => [thread, ...prev]);
    setDraftTitle('');
    setDraftBody('');
    setComposerOpen(false);
    showToast('Thread posted.', { variant: 'success' });
  };

  const sorted = sortThreads(threads, sort);
  const struggleCount = threads.filter((t) => t.stageTag === 'Struggle').length;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
        {/* Main feed */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Community</h1>
            <p className="text-sm text-muted">
              Threads from people further along the arc, weighted toward Struggle — you've just lived it.
            </p>
          </div>

          {/* Composer */}
          <div className="bg-surface rounded-2xl p-4">
            {!composerOpen ? (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="w-full text-left px-4 py-2.5 rounded-full bg-white/5 text-muted hover:bg-white/10 transition-colors text-sm"
              >
                Start a thread...
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full bg-transparent border-b border-white/10 pb-2 text-white placeholder:text-white/30 text-sm font-medium focus:outline-none focus:border-white/30"
                />
                <textarea
                  rows={3}
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  placeholder="What's going on?"
                  className="w-full bg-transparent resize-none text-sm text-white/80 placeholder:text-white/30 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setComposerOpen(false); setDraftTitle(''); setDraftBody(''); }}
                    className="text-sm font-medium text-muted hover:text-white px-4 py-2 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={postThread}
                    disabled={!draftTitle.trim()}
                    className="text-sm font-medium text-white bg-spotlight hover:bg-spotlight-dark disabled:bg-white/10 disabled:text-white/30 px-4 py-2 rounded-full transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort tabs */}
          <div className="flex gap-2">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSort(s.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  sort === s.id ? 'bg-white text-black' : 'bg-surface text-muted hover:bg-surface-hover hover:text-white'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Threads */}
          {loading ? (
            <div className="flex flex-col gap-3" aria-live="polite" aria-busy="true">
              <span className="sr-only">Loading threads...</span>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-surface rounded-2xl p-10 text-center">
              <Flame className="w-6 h-6 text-white/25 mx-auto mb-3" />
              <p className="text-sm text-white/70 mb-1">No threads yet.</p>
              <p className="text-xs text-muted">Be the first to start one above.</p>
            </div>
          ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((thread) => {
              const isExpanded = expanded === thread.id;
              const delta = voteDelta(thread.id);
              const displayVotes = thread.upvotes + delta;
              return (
                <div key={thread.id} className="bg-surface rounded-2xl p-4 flex gap-3">
                  {/* Vote rail */}
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <button
                      type="button"
                      aria-label="Upvote"
                      onClick={() => vote(thread.id, 1)}
                      className={cn('p-1 rounded hover:bg-white/10 transition-colors', delta === 1 ? 'text-spotlight' : 'text-muted hover:text-white')}
                    >
                      <ArrowBigUp className="w-5 h-5" fill={delta === 1 ? 'currentColor' : 'none'} />
                    </button>
                    <span className="text-sm font-semibold text-white tabular-nums">{displayVotes}</span>
                    <button
                      type="button"
                      aria-label="Downvote"
                      onClick={() => vote(thread.id, -1)}
                      className={cn('p-1 rounded hover:bg-white/10 transition-colors', delta === -1 ? 'text-white' : 'text-muted hover:text-white')}
                    >
                      <ArrowBigDown className="w-5 h-5" fill={delta === -1 ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide', TAG_STYLES[thread.stageTag])}>
                        {thread.stageTag}
                      </span>
                      <span className="text-xs text-muted">
                        Posted by d/{thread.author} · {formatDaysAgo(thread.daysAgo)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : thread.id)}
                      className="text-left font-bold text-white text-sm sm:text-base leading-snug hover:text-white/80 transition-colors"
                    >
                      {thread.title}
                    </button>
                    <p className={cn('text-sm text-white/60 leading-relaxed mt-1.5', !isExpanded && 'line-clamp-2')}>
                      {thread.body}
                    </p>

                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : thread.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors mt-3"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {thread.comments.length} comment{thread.comments.length === 1 ? '' : 's'}
                    </button>

                    {isExpanded && thread.comments.length > 0 && (
                      <div className="mt-3 pl-4 border-l border-white/10 flex flex-col gap-3">
                        {thread.comments.map((c) => (
                          <div key={c.id}>
                            <p className="text-xs text-muted mb-0.5">d/{c.author} · {formatDaysAgo(c.daysAgo)}</p>
                            <p className="text-sm text-white/70 leading-relaxed">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* About sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">d/thearc</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              People who have been through the same 5 stages you're working through, talking about what actually happened.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 2,481 members</span>
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> {threads.length} threads today</span>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-white mb-2">Why Struggle leads the feed</h2>
            <p className="text-[13px] text-white/60 leading-relaxed">
              This week's bias is <span className="text-spotlight font-semibold">Struggle</span> ({struggleCount} threads).
              You just lived through it, which makes you the best-placed person here to answer someone still in it.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">Guidelines</h2>
            <ul className="text-[13px] text-white/60 leading-relaxed list-disc pl-4 space-y-1.5">
              <li>Talk about what actually happened, not just what worked.</li>
              <li>No toxic positivity — reframing is welcome, dismissal isn't.</li>
              <li>If you're answering a Struggle thread, you've been there. Say so.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
