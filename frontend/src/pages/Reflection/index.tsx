import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/Skeleton';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { ALL_RECOMMENDATIONS } from '@/lib/recommendations';
import { submitReflectionActivity } from '@/lib/activityApi';
import { Send, X, BookOpen, ChevronDown } from 'lucide-react';

interface Entry {
  id: string;
  recommendationId: string;
  recommendationTitle: string;
  insight: string;
  confusion: string;
  application: string;
  date: string;
  analysisSummary?: string;
}

const GENERAL_ID = 'general';
const GENERAL_TITLE = 'General reflection';

const SEED_ENTRIES: Entry[] = [
  {
    id: 'r1',
    recommendationId: GENERAL_ID,
    recommendationTitle: GENERAL_TITLE,
    insight: 'Database indexing finally clicked today.',
    confusion: "Still not sure when a composite index beats two separate ones.",
    application: 'Going to re-index the project I\'m building around this.',
    date: 'May 20, 2024 at 8:30 PM',
  },
  {
    id: 'r2',
    recommendationId: GENERAL_ID,
    recommendationTitle: GENERAL_TITLE,
    insight: "Skipped my focus block for the second day in a row.",
    confusion: "I know why: I'm avoiding the part that's actually hard.",
    application: 'Tomorrow, start with the hard part first, before anything else opens.',
    date: 'May 19, 2024 at 9:05 PM',
  },
];

// backend/services/growth_service.py reads this text back apart by these
// exact labels — keep it in sync with combined_reflection_text in
// backend/services/activity_service.py::log_reflection.
function displayText(entry: Entry): string {
  return `Insight: ${entry.insight}\nConfusion: ${entry.confusion}\nApplication: ${entry.application}`;
}

export default function Reflection() {
  const { profile, recentlyViewed, logReflection } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const [entries, setEntries] = useState<Entry[]>(SEED_ENTRIES);
  const [targetId, setTargetId] = useState(GENERAL_ID);
  const [insight, setInsight] = useState('');
  const [confusion, setConfusion] = useState('');
  const [application, setApplication] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loading = useBriefLoading();

  // What you can reflect on: anything you've actually opened, or a general
  // catch-all — never a made-up list.
  const targets = useMemo(() => {
    const viewed = recentlyViewed
      .map((id) => ALL_RECOMMENDATIONS.find((r) => r.id === id))
      .filter((r): r is (typeof ALL_RECOMMENDATIONS)[number] => !!r)
      .map((r) => ({ id: r.id, title: r.title }));
    return [{ id: GENERAL_ID, title: GENERAL_TITLE }, ...viewed];
  }, [recentlyViewed]);

  const canSubmit = insight.trim() && confusion.trim() && application.trim();

  // Searches the actual logged entries, including ones added this session.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search your reflections...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const matches = search ? entries.filter((e) => displayText(e).toLowerCase().includes(search)) : entries;
        return matches.slice(0, 8).map((e) => ({
          id: e.id,
          label: e.insight.length > 70 ? `${e.insight.slice(0, 70)}…` : e.insight,
          sublabel: `${e.recommendationTitle} · ${e.date}`,
          icon: BookOpen,
          onSelect: () => showToast('Scroll down to find this entry.'),
        }));
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, entries, showToast]);

  const addEntry = async () => {
    if (!canSubmit || submitting) return;
    const target = targets.find((t) => t.id === targetId) ?? targets[0];
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      recommendationId: target.id,
      recommendationTitle: target.title,
      insight: insight.trim(),
      confusion: confusion.trim(),
      application: application.trim(),
      date: new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      }),
    };

    setSubmitting(true);
    try {
      if (profile.userId) {
        const res = await submitReflectionActivity(profile.userId, {
          recommendation_id: target.id,
          biggest_insight: newEntry.insight,
          confusion: newEntry.confusion,
          application: newEntry.application,
        });
        newEntry.analysisSummary = res.analysis?.summary;
      }
    } catch (err) {
      console.error('Reflection API unreachable, logged locally only:', err);
    } finally {
      setSubmitting(false);
    }

    setEntries((prev) => [newEntry, ...prev]);
    setInsight('');
    setConfusion('');
    setApplication('');
    logReflection();
    showToast(
      newEntry.analysisSummary || 'Logged. This feeds your next curation.',
      { variant: 'success' }
    );
  };

  const removeEntry = (id: string) => {
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return;
    const removed = entries[index];
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('Reflection removed.', {
      action: {
        label: 'Undo',
        onClick: () => setEntries((prev) => {
          const next = [...prev];
          next.splice(index, 0, removed);
          return next;
        }),
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Reflection</h1>
          <p className="text-sm text-muted">What you log here feeds the curator and can move you to the next stage.</p>
        </div>

        <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <label htmlFor="reflection-target" className="block text-xs font-medium text-muted mb-1.5">Reflecting on</label>
            <div className="relative">
              <select
                id="reflection-target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-9 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-spotlight"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="reflection-insight" className="block text-xs font-medium text-muted mb-1.5">Your biggest insight</label>
            <textarea
              id="reflection-insight"
              rows={2}
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="What actually landed?"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 resize-none text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-spotlight"
            />
          </div>

          <div>
            <label htmlFor="reflection-confusion" className="block text-xs font-medium text-muted mb-1.5">What confused you</label>
            <textarea
              id="reflection-confusion"
              rows={2}
              value={confusion}
              onChange={(e) => setConfusion(e.target.value)}
              placeholder="Be honest — this is what the curator adjusts for."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 resize-none text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-spotlight"
            />
          </div>

          <div>
            <label htmlFor="reflection-application" className="block text-xs font-medium text-muted mb-1.5">How you'll apply it</label>
            <textarea
              id="reflection-application"
              rows={2}
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              placeholder="One concrete next step."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 resize-none text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-spotlight"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={addEntry}
              disabled={!canSubmit || submitting}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-spotlight hover:bg-spotlight-dark disabled:bg-white/10 disabled:text-white/30 px-4 py-2 rounded-full transition-colors"
            >
              {submitting ? 'Saving...' : 'Save entry'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading your reflections...</span>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-surface rounded-2xl p-10 text-center">
            <BookOpen className="w-6 h-6 text-white/25 mx-auto mb-3" />
            <p className="text-sm text-white/70 mb-1">No reflections yet.</p>
            <p className="text-xs text-muted">Log the first one above — it feeds your next curation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="group relative bg-surface rounded-2xl p-5">
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label="Delete reflection"
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs font-semibold text-spotlight uppercase tracking-wide mb-2 pr-6">{entry.recommendationTitle}</p>
                <div className="flex gap-3 items-start pr-6">
                  <span className="font-sans text-3xl text-white/15 leading-none mt-0.5">"</span>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{displayText(entry)}</p>
                </div>
                {entry.analysisSummary && (
                  <p className="text-xs text-muted italic mt-3 pl-7">{entry.analysisSummary}</p>
                )}
                <div className="text-xs text-muted mt-3">{entry.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
