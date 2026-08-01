import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/Skeleton';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { Send, X, BookOpen } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  date: string;
}

const SEED_ENTRIES: Entry[] = [
  {
    id: 'r1',
    text: 'Today I finally got database indexing to click. Building the project is hard but I can feel real progress.',
    date: 'May 20, 2024 at 8:30 PM',
  },
  {
    id: 'r2',
    text: "Skipped my focus block for the second day in a row. I know why: I'm avoiding the part that's actually hard.",
    date: 'May 19, 2024 at 9:05 PM',
  },
  {
    id: 'r3',
    text: 'Good session this morning. Quiet house, no notifications, just did the work.',
    date: 'May 18, 2024 at 7:15 AM',
  },
];

export default function Reflection() {
  const { logReflection } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const [entries, setEntries] = useState<Entry[]>(SEED_ENTRIES);
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loading = useBriefLoading();

  // Searches the actual logged entries, including ones added/removed this
  // session, not just a static seed list.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search your reflections...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const matches = search ? entries.filter((e) => e.text.toLowerCase().includes(search)) : entries;
        return matches.slice(0, 8).map((e) => ({
          id: e.id,
          label: e.text.length > 70 ? `${e.text.slice(0, 70)}…` : e.text,
          sublabel: e.date,
          icon: BookOpen,
          onSelect: () => showToast('Scroll down to find this entry.'),
        }));
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, entries, showToast]);

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const addEntry = () => {
    const text = draft.trim();
    if (!text) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      text,
      date: new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      }),
    };
    setEntries((prev) => [entry, ...prev]);
    setDraft('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    logReflection();
    showToast('Logged. This feeds your next curation.', { variant: 'success' });
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
          <p className="text-sm text-muted">What you log here feeds the curator and can shift your stage.</p>
        </div>

        <div
          className={`bg-surface rounded-2xl p-5 border transition-colors ${focused ? 'border-white/15' : 'border-transparent'}`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={handleDraftChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What did today's curation bring up for you?"
            aria-label="New reflection"
            className="w-full bg-transparent resize-none overflow-hidden text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={addEntry}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-spotlight hover:bg-spotlight-dark disabled:bg-white/10 disabled:text-white/30 px-4 py-2 rounded-full transition-colors"
            >
              Save entry
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
                <div className="flex gap-3 items-start pr-6">
                  <span className="font-sans text-3xl text-white/15 leading-none mt-0.5">"</span>
                  <p className="text-sm text-white/70 leading-relaxed">{entry.text}</p>
                </div>
                <div className="text-xs text-muted mt-3">{entry.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
