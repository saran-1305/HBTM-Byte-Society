import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, NotebookPen, MessageSquarePlus, Settings as SettingsIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CommandResult {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  onSelect: () => void;
}

// Every page registers its own source: its own placeholder copy and its own
// live/local content to search. There is no generic nav-list fallback — a
// page with nothing registered just says so, rather than re-listing tabs.
export interface SearchSource {
  placeholder: string;
  getResults: (query: string) => CommandResult[];
}

interface CommandPaletteContextType {
  openPalette: () => void;
  registerSearch: (source: SearchSource | null) => void;
  placeholder: string;
}

const DEFAULT_PLACEHOLDER = 'Search or jump to an action...';
const MAX_RECENT = 4;

interface Section {
  label?: string;
  items: CommandResult[];
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [source, setSource] = useState<SearchSource | null>(null);
  const [recent, setRecent] = useState<CommandResult[]>([]);
  const navigate = useNavigate();

  const openPalette = () => setOpen(true);
  const registerSearch = useCallback((next: SearchSource | null) => setSource(next), []);

  // Global Cmd/Ctrl+K toggle, from anywhere in the app
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const placeholder = source?.placeholder ?? DEFAULT_PLACEHOLDER;

  // Always available regardless of which page is open, so the palette is
  // never a dead end even on a page with nothing else to search.
  const quickActions = useMemo<CommandResult[]>(() => [
    { id: 'action-new-reflection', label: 'New reflection', sublabel: 'Quick action', icon: NotebookPen, onSelect: () => navigate('/reflection') },
    { id: 'action-new-thread', label: 'New thread', sublabel: 'Quick action', icon: MessageSquarePlus, onSelect: () => navigate('/community') },
    { id: 'action-settings', label: 'Open settings', sublabel: 'Quick action', icon: SettingsIcon, onSelect: () => navigate('/settings') },
  ], [navigate]);

  const sections = useMemo<Section[]>(() => {
    const q = query.trim();
    const sourceResults = source ? source.getResults(q) : [];
    const matchedActions = quickActions.filter((a) => !q || a.label.toLowerCase().includes(q.toLowerCase()));

    if (!q) {
      return [
        { label: 'Recent', items: recent.slice(0, MAX_RECENT) },
        { items: sourceResults },
        { label: 'Quick actions', items: matchedActions },
      ].filter((s) => s.items.length > 0);
    }
    return [
      { items: sourceResults },
      { label: 'Quick actions', items: matchedActions },
    ].filter((s) => s.items.length > 0);
  }, [query, source, quickActions, recent]);

  const flatResults = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const selectResult = useCallback((r: CommandResult) => {
    setRecent((prev) => [r, ...prev.filter((x) => x.id !== r.id)].slice(0, MAX_RECENT));
    r.onSelect();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flatResults[activeIndex]) {
        selectResult(flatResults[activeIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatResults, activeIndex, selectResult]);

  let renderIndex = -1;

  return (
    <CommandPaletteContext.Provider value={{ openPalette, registerSearch, placeholder }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/70 animate-fade-in"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-4 h-4 text-muted shrink-0" strokeWidth={1.5} />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder={placeholder}
                aria-label={placeholder}
                className="flex-1 bg-transparent text-white placeholder:text-muted text-sm focus:outline-none"
              />
              <span className="text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5 shrink-0">ESC</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {flatResults.length === 0 && (
                <p className="text-sm text-muted px-3 py-6 text-center">No matches.</p>
              )}
              {sections.map((section, sectionIndex) => (
                <div key={section.label ?? `section-${sectionIndex}`} className={sectionIndex > 0 ? 'mt-1' : undefined}>
                  {section.label && (
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-3 pt-2 pb-1">{section.label}</p>
                  )}
                  {section.items.map((r) => {
                    renderIndex += 1;
                    const i = renderIndex;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => selectResult(r)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                          i === activeIndex ? 'bg-navactive text-white' : 'text-white/70'
                        )}
                      >
                        <r.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{r.label}</span>
                          {r.sublabel && <span className="block text-xs text-muted truncate capitalize">{r.sublabel}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
};
