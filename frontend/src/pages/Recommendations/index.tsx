import { useEffect, useMemo, useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/Skeleton';
import { getRecommendationsFor, isWildcard, type Recommendation } from '@/lib/recommendations';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { cn } from '@/lib/cn';
import { Book, FileText, Globe, PlayCircle, Headphones, Play, Plus, Check, Bookmark, BookmarkCheck, ThumbsDown, type LucideIcon } from 'lucide-react';

const TYPE_ICON: Record<string, LucideIcon> = { book: Book, video: PlayCircle, audio: Headphones, article: FileText };

function WildcardBadge() {
  return (
    <span className="absolute top-2 left-2 border border-spotlight text-spotlight bg-black/70 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded z-10">
      Wildcard
    </span>
  );
}

interface ItemActions {
  savedIds: string[];
  onToggleSave: (rec: Recommendation) => void;
  onDismiss: (rec: Recommendation) => void;
}

// Overlaid on an image/art thumbnail — dark backdrop-blur pill buttons,
// hover-revealed, matching MediaGrid's convention.
function CardActions({ rec, savedIds, onToggleSave, onDismiss, className }: ItemActions & { rec: Recommendation; className?: string }) {
  const saved = savedIds.includes(rec.id);
  return (
    <div className={cn('flex gap-1.5', className)}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleSave(rec); }}
        aria-label={saved ? `Remove "${rec.title}" from saved` : `Save "${rec.title}" for later`}
        aria-pressed={saved}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors',
          saved ? 'bg-spotlight text-white' : 'bg-black/60 text-white/80 hover:bg-black/80 hover:text-white'
        )}
      >
        {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDismiss(rec); }}
        aria-label={`Not interested in "${rec.title}"`}
        className="w-7 h-7 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

type Section = 'videos' | 'audio' | 'reading';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'videos', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'reading', label: 'Reading' },
];

const THUMB_TONES = ['bg-surface-hover', 'bg-[#1F1F1F]', 'bg-[#181818]', 'bg-[#242424]'];
const ART_TONES = ['bg-spotlight', 'bg-[#1F1F1F]', 'bg-[#242424]', 'bg-surface-hover', 'bg-[#181818]'];

// ─── Videos: YouTube-style dark grid with topic filter chips ───
function VideoGrid({ items, aspiration, onOpen, actions }: { items: Recommendation[]; aspiration: string | undefined; onOpen: (rec: Recommendation) => void; actions: ItemActions }) {
  const topics = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.topic)))], [items]);
  const [activeTopic, setActiveTopic] = useState('All');
  const shown = activeTopic === 'All' ? items : items.filter((i) => i.topic === activeTopic);

  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-10 text-center">
        <p className="text-sm text-muted italic">No videos matched yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setActiveTopic(topic)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTopic === topic
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/75 hover:bg-white/15'
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
        {shown.map((rec, i) => (
          <div
            key={rec.id}
            onClick={() => onOpen(rec)}
            className="group cursor-pointer transition-all duration-150 ease-out hover:-translate-y-[2px]"
          >
            <div className={cn('relative aspect-video rounded-lg overflow-hidden flex items-center justify-center mb-3', THUMB_TONES[i % THUMB_TONES.length])}>
              {isWildcard(rec, aspiration) && <WildcardBadge />}
              <PlayCircle className="w-11 h-11 text-white/85 group-hover:scale-110 group-hover:text-white transition-transform" />
              {rec.duration && (
                <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                  {rec.duration}
                </span>
              )}
              <CardActions rec={rec} {...actions} className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {rec.author.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-white/80 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-muted mt-1">{rec.author}</p>
                <p className="text-xs text-white/30">{rec.fit}% match · {rec.topic}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Audio: Spotify-style dark panel, featured pick + art-card grid ───
function AudioList({ items, aspiration, onOpen, actions }: { items: Recommendation[]; aspiration: string | undefined; onOpen: (rec: Recommendation) => void; actions: ItemActions }) {
  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-10 text-center">
        <p className="text-sm text-muted italic">No audio matched yet.</p>
      </div>
    );
  }

  const [featured, ...rest] = items;

  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-8">
      {/* Featured pick */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Up next for you</p>
        <div
          onClick={() => onOpen(featured)}
          className="flex items-center gap-5 bg-white/5 hover:bg-white/[0.07] rounded-xl p-4 transition-colors cursor-pointer group"
        >
          <div className={cn('relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center shrink-0', ART_TONES[0])}>
            {isWildcard(featured, aspiration) && <WildcardBadge />}
            <Headphones className="w-8 h-8 text-white/85" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted mb-1">Episode · {featured.topic}</p>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug mb-1 truncate">{featured.title}</h3>
            <p className="text-sm text-muted truncate">{featured.author}{featured.duration ? ` · ${featured.duration}` : ''}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label={actions.savedIds.includes(featured.id) ? `Remove "${featured.title}" from saved` : `Save "${featured.title}" for later`}
              aria-pressed={actions.savedIds.includes(featured.id)}
              onClick={(e) => { e.stopPropagation(); actions.onToggleSave(featured); }}
              className={cn(
                'w-9 h-9 rounded-full border flex items-center justify-center transition-colors',
                actions.savedIds.includes(featured.id) ? 'border-spotlight bg-spotlight/15 text-spotlight' : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
              )}
            >
              {actions.savedIds.includes(featured.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              type="button"
              aria-label="Play"
              onClick={(e) => { e.stopPropagation(); onOpen(featured); }}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rest, as art-card shelf */}
      {rest.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">More for you</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rest.map((rec, i) => (
              <div
                key={rec.id}
                onClick={() => onOpen(rec)}
                className="group cursor-pointer transition-all duration-150 ease-out hover:-translate-y-[2px]"
              >
                <div className={cn('relative aspect-square rounded-lg overflow-hidden flex items-center justify-center mb-2', ART_TONES[(i + 1) % ART_TONES.length])}>
                  {isWildcard(rec, aspiration) && <WildcardBadge />}
                  <Headphones className="w-8 h-8 text-white/70" />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {rec.topic}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <button
                      type="button"
                      aria-label="Play"
                      onClick={(e) => { e.stopPropagation(); onOpen(rec); }}
                      className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-opacity"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                  <CardActions rec={rec} {...actions} className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200" />
                </div>
                <h3 className="text-sm font-bold text-white truncate">{rec.title}</h3>
                <p className="text-xs text-muted truncate">{rec.author}{rec.duration ? ` · ${rec.duration}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reading: same dark surface system, plain list treatment ───
function ReadingList({ items, aspiration, onOpen, actions }: { items: Recommendation[]; aspiration: string | undefined; onOpen: (rec: Recommendation) => void; actions: ItemActions }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5 text-white" />;
      case 'article': return <FileText className="w-5 h-5 text-white" />;
      default: return <Globe className="w-5 h-5 text-white" />;
    }
  };
  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-10 text-center">
        <p className="text-sm text-muted italic">No reading matched yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((rec) => (
        <div
          key={rec.id}
          onClick={() => onOpen(rec)}
          className="relative bg-surface rounded-xl p-5 flex gap-4 items-start group cursor-pointer hover:bg-surface-hover transition-all duration-150 ease-out hover:-translate-y-[2px]"
        >
          <CardActions
            rec={rec}
            {...actions}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
          />
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            {getIcon(rec.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-white text-sm leading-tight pr-16">
                {rec.title}
              </h3>
              <span className="text-xs font-semibold text-white shrink-0 whitespace-nowrap">
                {rec.fit}% fit
              </span>
            </div>
            <p className="text-xs text-muted mb-2 capitalize">{rec.type} · {rec.author}</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/70">
                {rec.topic}
              </span>
              {isWildcard(rec, aspiration) && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border border-spotlight text-spotlight">
                  Wildcard
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Recommendations() {
  const { profile, logView, savedIds, toggleSaved, dismissedIds, dismissItem } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const recs = useMemo(
    () => getRecommendationsFor(profile.aspiration).filter((r) => !dismissedIds.includes(r.id)),
    [profile.aspiration, dismissedIds]
  );
  const [section, setSection] = useState<Section>('videos');
  const loading = useBriefLoading();
  const openItem = (rec: Recommendation) => {
    logView(rec.id);
    showToast(`Opening "${rec.title}"...`);
  };

  const actions: ItemActions = {
    savedIds,
    onToggleSave: (rec) => toggleSaved(rec.id),
    onDismiss: (rec) => { dismissItem(rec.id); showToast('Got it — you won\'t see this again.'); },
  };

  useEffect(() => {
    registerSearch({
      placeholder: 'Search your recommendations...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const matches = search
          ? recs.filter((r) => r.title.toLowerCase().includes(search) || r.author.toLowerCase().includes(search) || r.topic.toLowerCase().includes(search))
          : recs;
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
  }, [registerSearch, recs, logView, showToast]);

  const videos = recs.filter((r) => r.type === 'video');
  const audio = recs.filter((r) => r.type === 'audio');
  const reading = recs.filter((r) => r.type === 'book' || r.type === 'article');

  const counts: Record<Section, number> = { videos: videos.length, audio: audio.length, reading: reading.length };

  return (
    <DashboardLayout>
      <div className="py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Recommendations</h1>
          <p className="text-sm text-muted">
            {profile.aspiration
              ? `Matched to "${profile.aspiration}"`
              : 'Complete onboarding for picks matched to your goal.'}
          </p>
        </div>

        <div className="flex gap-2 border-b border-white/10">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                section === s.id
                  ? 'border-spotlight text-white'
                  : 'border-transparent text-muted hover:text-white'
              )}
            >
              {s.label}
              <span className="ml-1.5 text-xs text-white/30">{counts[s.id]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-surface rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading your recommendations...</span>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-lg" />)}
          </div>
        ) : (
          <>
            {section === 'videos' && <VideoGrid items={videos} aspiration={profile.aspiration} onOpen={openItem} actions={actions} />}
            {section === 'audio' && <AudioList items={audio} aspiration={profile.aspiration} onOpen={openItem} actions={actions} />}
            {section === 'reading' && <ReadingList items={reading} aspiration={profile.aspiration} onOpen={openItem} actions={actions} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
