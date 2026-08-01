import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MediaGrid, type MediaItem } from '@/components/MediaGrid';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { ALL_RECOMMENDATIONS } from '@/lib/recommendations';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { cn } from '@/lib/cn';
import { Search, Book, PlayCircle, Headphones, FileText, type LucideIcon } from 'lucide-react';

const TOPICS = ['All', ...Array.from(new Set(ALL_RECOMMENDATIONS.map((item) => item.topic)))];
const SUGGESTED_TOPICS = TOPICS.filter((t) => t !== 'All').slice(0, 4);
const TYPE_ICON: Record<string, LucideIcon> = { book: Book, video: PlayCircle, audio: Headphones, article: FileText };

export default function Knowledge() {
  const { showToast } = useToast();
  const { logView, savedIds, toggleSaved, dismissedIds, dismissItem } = useOnboarding();
  const { registerSearch } = useCommandPalette();
  const [activeTopic, setActiveTopic] = useState('All');
  const [query, setQuery] = useState('');
  const loading = useBriefLoading();

  // Registered against the full library, not just what's currently filtered
  // on screen, so the palette can jump straight to something outside the
  // active topic chip.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search your knowledge library...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const pool = ALL_RECOMMENDATIONS.filter((r) => !dismissedIds.includes(r.id));
        const matches = search
          ? pool.filter((r) => r.title.toLowerCase().includes(search) || r.author.toLowerCase().includes(search))
          : pool;
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
  }, [registerSearch, logView, showToast, dismissedIds]);

  const items = useMemo(() => {
    const undismissed = ALL_RECOMMENDATIONS.filter((i) => !dismissedIds.includes(i.id));
    const byTopic = activeTopic === 'All' ? undismissed : undismissed.filter((i) => i.topic === activeTopic);
    const q = query.trim().toLowerCase();
    if (!q) return byTopic;
    return byTopic.filter((i) => i.title.toLowerCase().includes(q) || i.author.toLowerCase().includes(q));
  }, [activeTopic, query, dismissedIds]);

  const media: MediaItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${item.type} · ${item.author}`,
    imageSeed: item.id,
    duration: item.duration,
    fit: item.fit,
  }));

  const openItem = (item: MediaItem) => {
    logView(item.id);
    showToast(`Opening "${item.title}"...`);
  };

  return (
    <DashboardLayout>
      <div className="py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Knowledge</h1>
          <p className="text-sm text-muted">Everything you've captured, organized around what you're building.</p>
        </div>

        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your knowledge..."
            aria-label="Search your knowledge"
            className="block w-full pl-11 pr-4 py-3 rounded-full text-sm bg-surface text-white placeholder:text-muted border-0 focus:outline-none focus:ring-2 focus:ring-spotlight transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setActiveTopic(topic)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTopic === topic
                  ? 'bg-white text-black'
                  : 'bg-surface text-muted hover:bg-surface-hover hover:text-white'
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading your knowledge library...</span>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : items.length === 0 && query ? (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-sm text-white/70 mb-4">Nothing matches "{query}".</p>
            <p className="text-xs text-muted mb-3">Try one of these instead:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => { setQuery(''); setActiveTopic(topic); }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MediaGrid
            items={media}
            onItemClick={openItem}
            emptyLabel="Nothing in this topic yet."
            savedIds={savedIds}
            onToggleSave={(item) => toggleSaved(item.id)}
            onDismiss={(item) => { dismissItem(item.id); showToast('Got it — you won\'t see this again.'); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
