import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MediaGrid, type MediaItem } from '@/components/MediaGrid';
import { StageTracker } from '@/components/StageTracker';
import { Skeleton } from '@/components/Skeleton';
import { STAGES, STAGE_CONFIG, getStageIndex } from '@/lib/stage';
import { HeroBanner } from './components/HeroBanner';
import { RightPanel } from './components/RightPanel';
import { getRecommendationsFor, ALL_RECOMMENDATIONS, isWildcard, type Recommendation } from '@/lib/recommendations';
import { getCandidates, getCuratedRecommendation, toFrontendRecommendation, type CuratorReasoning } from '@/lib/recommendationApi';
import { startActivity } from '@/lib/activityApi';
import { SEED_THREADS, sortThreads, formatDaysAgo } from '@/lib/community';
import { ArrowBigUp, MessageSquare, Book, PlayCircle, Headphones, FileText, ArrowRight, type LucideIcon } from 'lucide-react';

const TYPE_ICON: Record<string, LucideIcon> = { book: Book, video: PlayCircle, audio: Headphones, article: FileText };

// Wildcard flagging is gated by the stage's wildcard_frequency, not applied
// to every off-topic item: Struggle surfaces one every 4th slot, Commit every
// 6th (protects the forming habit), matching the engine spec's cadence.
const toMediaItem = (rec: Recommendation, aspiration: string | undefined, index: number, wildcardFrequency: number): MediaItem => {
  const wildcard = wildcardFrequency > 0 && (index + 1) % wildcardFrequency === 0 && isWildcard(rec, aspiration);
  return {
    id: rec.id,
    title: rec.title,
    meta: `${rec.author}`,
    imageSeed: rec.id,
    thumbnail: rec.thumbnail,
    duration: rec.duration,
    wildcard,
    fit: rec.fit,
    reason: wildcard
      ? 'A wildcard pick — deliberately outside your usual topics.'
      : `Matched to your goal via ${rec.topic}.`,
  };
};

export default function Dashboard() {
  const {
    profile, reflectionCount, reflectionStreak, recentlyViewed, logView,
    savedIds, toggleSaved, dismissedIds, dismissItem,
    lastSeenStageIndex, setLastSeenStageIndex,
  } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const navigate = useNavigate();
  const [heroDismissed, setHeroDismissed] = useState(false);

  // The curator "computing your picks" is a real (if brief) step conceptually,
  // so this skeleton represents that instead of being pure decoration.
  const [curating, setCurating] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setCurating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Real recommendation engine + curator reasoning, when reachable. Falls
  // back to the local mock library/template below otherwise — same
  // resilient pattern as everywhere else in the app.
  const [realPicks, setRealPicks] = useState<Recommendation[] | null>(null);
  const [curatorReasoning, setCuratorReasoning] = useState<CuratorReasoning | null>(null);

  useEffect(() => {
    const userId = profile.userId;
    if (!userId) return;
    let cancelled = false;

    getCandidates(userId)
      .then((res) => {
        if (cancelled) return;
        setRealPicks(res.candidates.map((c) => toFrontendRecommendation(c.candidate, c.scores.total)));
      })
      .catch(() => { /* no recommendations yet, or backend unreachable — mock library stays authoritative */ });

    getCuratedRecommendation(userId)
      .then((res) => { if (!cancelled) setCuratorReasoning(res.curator); })
      .catch(() => { /* narrative enrichment only */ });

    return () => { cancelled = true; };
  }, [profile.userId]);

  const picks = useMemo(
    () => (realPicks ?? getRecommendationsFor(profile.aspiration)).filter((r) => !dismissedIds.includes(r.id)),
    [realPicks, profile.aspiration, dismissedIds]
  );
  const featured = picks[0];
  const feed = picks.slice(1, 9);

  // Real picks might include ids the local mock library doesn't know about
  // (and vice versa), so "recent" and "continue where you left off" search
  // both pools.
  const recentPool = useMemo(() => [...(realPicks ?? []), ...ALL_RECOMMENDATIONS], [realPicks]);

  // "Recent" shows what you've actually opened once there's history; before
  // that, it falls back to unexplored library items so the row isn't empty.
  const recentItems = useMemo(() => {
    const viewed = recentlyViewed
      .map((id) => recentPool.find((r) => r.id === id))
      .filter((r): r is Recommendation => !!r && !dismissedIds.includes(r.id));
    if (viewed.length > 0) return viewed.slice(0, 8);
    return recentPool.filter((r) => !picks.some((p) => p.id === r.id) && !dismissedIds.includes(r.id)).slice(0, 8);
  }, [recentlyViewed, picks, dismissedIds, recentPool]);

  const lastViewedItem = useMemo(() => {
    const id = recentlyViewed[0];
    return id ? recentPool.find((r) => r.id === id) : undefined;
  }, [recentlyViewed, recentPool]);

  const stageIndex = getStageIndex(profile, reflectionCount);
  const stageName = STAGES[stageIndex];
  const config = STAGE_CONFIG[stageName];
  const isIntegrate = stageName === 'Integrate';

  // Fires once per actual transition, not on every reload: lastSeenStageIndex
  // is persisted, so re-visiting the same stage never re-triggers this.
  useEffect(() => {
    if (stageIndex !== lastSeenStageIndex) {
      if (stageIndex > lastSeenStageIndex) {
        showToast(`You've moved from ${STAGES[lastSeenStageIndex]} to ${stageName}.`, { variant: 'success', duration: 6000 });
      }
      setLastSeenStageIndex(stageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex]);

  // Integrate's primary_type is community_thread, not media: the engine
  // stops feeding content and starts pointing outward, so the feed itself
  // has to change shape, not just its label.
  const topThreads = useMemo(() => sortThreads(SEED_THREADS, 'hot').slice(0, 4), []);
  const topThread = topThreads[0];

  const reasoning = isIntegrate
    ? `You're in Integrate: ${config.feel} Threads below are weighted toward Struggle, since you just lived through it.`
    : curatorReasoning
    ? `${curatorReasoning.summary} ${curatorReasoning.why_now}`
    : featured
    ? `You're in the ${stageName} stage, so this ${featured.type} on ${featured.topic.toLowerCase()} is weighted highest: it scored a ${featured.fit}% fit against your stated goal${profile.stuckPoint ? ` and directly addresses "${profile.stuckPoint}"` : ''}.`
    : 'Complete onboarding so your curator has a goal to work from.';

  const openItem = (item: MediaItem) => {
    logView(item.id);
    showToast(`Opening "${item.title}"...`);
    if (profile.userId) startActivity(profile.userId, item.id).catch(() => { /* best-effort activity log */ });
  };

  // What's searchable shifts with the feed itself: threads once you've
  // reached Integrate, your actual picks and recently-viewed items otherwise.
  useEffect(() => {
    registerSearch({
      placeholder: isIntegrate ? 'Search community threads...' : 'Search your picks...',
      getResults: (q) => {
        const search = q.toLowerCase();
        if (isIntegrate) {
          const matches = search ? topThreads.filter((t) => t.title.toLowerCase().includes(search)) : topThreads;
          return matches.map((t) => ({
            id: t.id,
            label: t.title,
            sublabel: `${t.stageTag} · d/${t.author}`,
            icon: MessageSquare,
            onSelect: () => navigate('/community'),
          }));
        }
        const pool = [...picks, ...recentItems].filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
        const matches = search
          ? pool.filter((r) => r.title.toLowerCase().includes(search) || r.author.toLowerCase().includes(search))
          : pool.slice(0, 8);
        return matches.slice(0, 8).map((r) => ({
          id: r.id,
          label: r.title,
          sublabel: `${r.type} · ${r.author}`,
          icon: TYPE_ICON[r.type] ?? FileText,
          onSelect: () => { logView(r.id); showToast(`Opening "${r.title}"...`); },
        }));
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, isIntegrate, topThreads, picks, recentItems, logView, showToast, navigate]);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-16">
        {/* Main feed */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {curating ? (
            <div className="flex flex-col gap-8" aria-live="polite" aria-busy="true">
              <span className="sr-only">Curating your picks...</span>
              <Skeleton className="h-[280px] sm:h-[340px] rounded-3xl" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-xl" />)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            </div>
          ) : isIntegrate ? (
            <>
              {topThread && (
                <HeroBanner
                  meta="You've reached Integrate"
                  title={topThread.title}
                  reason={reasoning}
                  imageSeed={`thread-${topThread.id}`}
                  onStart={() => navigate('/community')}
                  onDismiss={() => setHeroDismissed(true)}
                />
              )}

              <StageTracker currentIndex={stageIndex} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-white">From the community</h2>
                  <Link to="/community" className="text-xs text-muted hover:text-white transition-colors">Show all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {topThreads.map((thread) => (
                    <Link
                      key={thread.id}
                      to="/community"
                      className="flex items-center gap-4 bg-surface hover:bg-surface-hover rounded-xl p-4 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-0.5 text-muted shrink-0 w-10">
                        <ArrowBigUp className="w-4 h-4" />
                        <span className="text-xs font-semibold text-white">{thread.upvotes}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{thread.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          d/{thread.author} · {thread.stageTag} · {formatDaysAgo(thread.daysAgo)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {thread.comments.length}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {featured && !heroDismissed && (
                <HeroBanner
                  meta={profile.aspiration ? `Picked for "${profile.aspiration}"` : 'Picked for you'}
                  title={featured.title}
                  reason={reasoning}
                  imageSeed={featured.id}
                  imageUrl={featured.thumbnail}
                  onStart={() => { logView(featured.id); showToast(`Opening "${featured.title}"...`); if (profile.userId) startActivity(profile.userId, featured.id).catch(() => {}); }}
                  onDismiss={() => setHeroDismissed(true)}
                />
              )}

              {lastViewedItem && (
                <button
                  type="button"
                  onClick={() => { logView(lastViewedItem.id); showToast(`Opening "${lastViewedItem.title}"...`); if (profile.userId) startActivity(profile.userId, lastViewedItem.id).catch(() => {}); }}
                  className="flex items-center gap-4 bg-surface hover:bg-surface-hover rounded-xl p-4 transition-colors text-left"
                >
                  <img
                    src={lastViewedItem.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(lastViewedItem.id)}/80/80`}
                    alt=""
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">Continue where you left off</p>
                    <p className="text-sm font-bold text-white truncate">{lastViewedItem.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              )}

              <StageTracker currentIndex={stageIndex} />

              <MediaGrid
                title={`Matched to ${stageName} phase`}
                items={feed.map((r, i) => toMediaItem(r, profile.aspiration, i, config.wildcardFrequency))}
                onItemClick={openItem}
                emptyLabel="Complete onboarding to get picks."
                savedIds={savedIds}
                onToggleSave={(item) => toggleSaved(item.id)}
                onDismiss={(item) => { dismissItem(item.id); showToast('Got it — you won\'t see this again.'); }}
              />
              <MediaGrid
                title="Recent"
                items={recentItems.map((r, i) => toMediaItem(r, profile.aspiration, i, config.wildcardFrequency))}
                onItemClick={openItem}
                savedIds={savedIds}
                onToggleSave={(item) => toggleSaved(item.id)}
                onDismiss={(item) => { dismissItem(item.id); showToast('Got it — you won\'t see this again.'); }}
              />
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="xl:col-span-4">
          <RightPanel profile={profile} reasoning={reasoning} streak={reflectionStreak} />
        </div>
      </div>
    </DashboardLayout>
  );
}
