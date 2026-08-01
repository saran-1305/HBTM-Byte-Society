import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { TIMEFRAME_LABEL } from '@/types/onboarding';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StageTracker } from '@/components/StageTracker';
import { STAGES, STAGE_CONFIG, getStageIndex, type Stage } from '@/lib/stage';
import { getArcState, getArcStatus, type StageTransition } from '@/lib/arcApi';
import { SEED_THREADS } from '@/lib/community';
import { cn } from '@/lib/cn';
import {
  Target, Clock, BookOpen, AlertTriangle, Edit3, Sparkles,
  CheckCircle2, Circle, CircleDashed, Layers, Shuffle, History,
} from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  media: 'media picks',
  knowledge: 'deep knowledge',
  experience: 'hands-on experience',
  community_thread: 'community threads',
};

// e.g. "70% media picks · 20% deep knowledge · 10% hands-on experience"
function formatWeights(weights: Record<string, number>): string {
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${Math.round(value * 100)}% ${TYPE_LABEL[key] ?? key}`)
    .join(' · ');
}

function wildcardCopy(frequency: number): string {
  if (frequency === 0) return 'No wildcards here — every pick stays on-topic.';
  return `Roughly 1 in ${frequency} picks is a deliberate wildcard, chosen outside your usual topics.`;
}

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

// Local, per-stage fallback used only when the current stage's real server
// progress (arcState) isn't reachable. Struggle/Breakthrough have a real
// local signal (reflections against the obstacle); the rest don't, so they
// get a fixed "you're actively in this stage" estimate rather than a
// fabricated precise number.
function localStageProgress(stage: Stage, reflectionCount: number): number {
  switch (stage) {
    case 'Explore': return 20;
    case 'Commit': return 40;
    case 'Struggle': return Math.round((Math.min(reflectionCount, 3) / 3) * 100);
    case 'Breakthrough': return Math.round((Math.min(reflectionCount, 7) / 7) * 100);
    case 'Integrate': return 70;
  }
}

// <40 red ("needs work"), 40-70 yellow ("getting there"), >70 green ("strong").
function completionColor(percent: number) {
  if (percent < 40) return { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Needs work' };
  if (percent < 70) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Getting there' };
  return { bar: 'bg-mint-500', text: 'text-mint-400', badge: 'bg-mint-500/10 text-mint-400 border-mint-500/30', label: 'Strong' };
}

interface StageCard {
  stage: Stage;
  status: 'completed' | 'current' | 'upcoming';
  headline: string;
  feel: string;
  weights: string;
  wildcard: string;
  completionPercent: number;
}

export default function Arc() {
  const { profile, reflectionCount, startedAt } = useOnboarding();
  const { registerSearch } = useCommandPalette();
  const aspiration = profile.aspiration;
  const habits = useMemo(() => profile.habits || [], [profile.habits]);
  const stuckPoint = profile.stuckPoint;

  // Real server-side stage + progress, when reachable. Falls back to the
  // local reflection-count heuristic below if the backend has no ARC row
  // for this user yet (e.g. onboarding never called /api/onboarding/start)
  // or is simply unreachable.
  const [arcState, setArcState] = useState<{ stageIndex: number; progress: number } | null>(null);
  const [stageHistory, setStageHistory] = useState<StageTransition[]>([]);

  useEffect(() => {
    const userId = profile.userId;
    if (!userId) return;
    let cancelled = false;

    getArcState(userId)
      .then((state) => {
        if (cancelled) return;
        const idx = STAGES.findIndex((s) => s.toLowerCase() === state.current_stage.toLowerCase());
        if (idx !== -1) setArcState({ stageIndex: idx, progress: state.progress });
      })
      .catch(() => { /* no ARC row yet, or backend unreachable — local heuristic stays authoritative */ });

    getArcStatus(userId)
      .then((status) => { if (!cancelled) setStageHistory(status.stage_history); })
      .catch(() => { /* optional enrichment only */ });

    return () => { cancelled = true; };
  }, [profile.userId]);

  // The habit list, the 5 stages, and what each stage actually means for
  // this user — real, tab-specific content instead of a nav fallback.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search your arc...',
      getResults: (query) => {
        const q = query.trim().toLowerCase();
        const habitResults = habits
          .filter((h) => !q || h.toLowerCase().includes(q))
          .map((h) => ({ id: `habit-${h}`, label: h, sublabel: 'Current habit', icon: BookOpen, onSelect: () => {} }));
        const stageResults = STAGES
          .filter((s) => !q || s.toLowerCase().includes(q))
          .map((s) => ({ id: `stage-${s}`, label: s, sublabel: STAGE_CONFIG[s].feel, icon: Layers, onSelect: () => {} }));
        return [...habitResults, ...stageResults];
      },
    });
    return () => registerSearch(null);
  }, [habits, registerSearch]);

  if (!aspiration) {
    return (
      <DashboardLayout>
        <div className="max-w-xl py-16 text-center mx-auto">
          <h1 className="text-2xl font-sans font-bold tracking-[-0.02em] text-white mb-2">Your arc hasn't started yet</h1>
          <p className="text-sm text-muted mb-6">
            Complete onboarding to generate a personalized arc around your goal.
          </p>
          <Link
            to="/onboarding"
            className="inline-block bg-spotlight text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-spotlight-dark transition-colors"
          >
            Start onboarding
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stageIndex = arcState?.stageIndex ?? getStageIndex(profile, reflectionCount);
  const daysIn = daysSince(startedAt);
  const struggleThreadCount = SEED_THREADS.filter((t) => t.stageTag === 'Struggle').length;

  // One rich, personalized card per stage — not just a status line. Mirrors
  // the horizontal StageTracker exactly (same index math) so the two never
  // disagree about where the user actually is.
  const stageCards: StageCard[] = STAGES.map((stage, index) => {
    const config = STAGE_CONFIG[stage];
    const status: StageCard['status'] = index < stageIndex ? 'completed' : index === stageIndex ? 'current' : 'upcoming';
    let headline = '';

    switch (stage) {
      case 'Explore':
        headline = `Goal defined: "${aspiration}."`;
        break;
      case 'Commit':
        headline = habits.length > 0
          ? `Committed to ${TIMEFRAME_LABEL[profile.timeframe || 'someday']}. Right now, time mostly goes to ${habits.join(', ')}.`
          : 'Complete onboarding to lock in a timeframe and current habits.';
        break;
      case 'Struggle':
        headline = stuckPoint
          ? `Named the obstacle: "${stuckPoint}."${config.refusalSensitivity === 'high' ? " The curator won't soften this with generic positivity here — it stays honest." : ''}`
          : 'Complete onboarding to name your biggest obstacle.';
        break;
      case 'Breakthrough':
        headline = reflectionCount >= 7
          ? `Earned it — ${reflectionCount} reflections logged against "${stuckPoint || 'your obstacle'}."`
          : reflectionCount > 0
          ? `${reflectionCount} of 7 reflections logged. Consistent reflection against your obstacle is what moves you to Integrate.`
          : 'Log reflections against your obstacle to start building momentum.';
        break;
      case 'Integrate':
        headline = `The curator stops feeding content and starts pointing you at people. d/thearc has ${struggleThreadCount} thread${struggleThreadCount === 1 ? '' : 's'} tagged Struggle right now — you'd be well placed to help.`;
        break;
    }

    // Every stage gets a completion score, not just the current one:
    // already-passed stages read 100, stages you haven't reached yet read 0,
    // and the current stage uses real server progress when it's reachable.
    const completionPercent = index < stageIndex
      ? 100
      : index > stageIndex
      ? 0
      : arcState
      ? Math.round(arcState.progress * 100)
      : localStageProgress(stage, reflectionCount);

    return { stage, status, headline, feel: config.feel, weights: formatWeights(config.typeWeights), wildcard: wildcardCopy(config.wildcardFrequency), completionPercent };
  });

  return (
    <DashboardLayout>
      <div className="max-w-3xl py-6 flex flex-col gap-6 pb-16">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Your Arc</h1>
            <p className="text-sm text-muted">
              {daysIn > 0 ? `${daysIn} day${daysIn === 1 ? '' : 's'} in. ` : ''}
              Where you started, where you are, and what the curator is doing about it.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-surface hover:bg-surface-hover px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>
        </div>

        <StageTracker currentIndex={stageIndex} />

        {/* Goal card */}
        <div className="bg-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-2.5 bg-white/5 rounded-lg shrink-0 self-start">
            <Target className="w-5 h-5 text-spotlight" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Goal</p>
            <p className="text-lg text-white leading-snug mb-3">{aspiration}</p>
            <div className="flex flex-wrap gap-2">
              {profile.timeframe && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Clock className="w-3.5 h-3.5" />
                  {TIMEFRAME_LABEL[profile.timeframe]}
                </span>
              )}
              {stuckPoint && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stuckPoint}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.profileSummary && (
          <div className="bg-surface rounded-xl p-5 flex gap-3">
            <Sparkles className="w-4 h-4 text-spotlight shrink-0 mt-0.5" />
            <p className="text-sm text-white/70 leading-relaxed italic">{profile.profileSummary}</p>
          </div>
        )}

        {/* Stage-by-stage detail */}
        <div className="bg-surface rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-1">The five stages</h2>
          <p className="text-xs text-muted mb-6">What the curator does differently at each one, and where you actually are in it.</p>
          <div className="relative pl-3 space-y-7">
            <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-white/10" />
            {stageCards.map((card, index) => {
              let Icon = CircleDashed;
              let iconColor = 'text-white/20';
              if (card.status === 'completed') { Icon = CheckCircle2; iconColor = 'text-white'; }
              else if (card.status === 'current') { Icon = Circle; iconColor = 'text-spotlight'; }
              const color = completionColor(card.completionPercent);
              const needsWork = card.completionPercent < 40;
              return (
                <div key={card.stage} className="relative z-10 flex gap-4">
                  <div className="bg-surface rounded-full mt-0.5 relative shrink-0">
                    {card.status === 'current' && (
                      <span className="absolute inset-0 rounded-full bg-spotlight/30 motion-safe:animate-ping" />
                    )}
                    <Icon className={cn('w-5 h-5 relative', iconColor)} strokeWidth={card.status === 'current' ? 3 : 2} />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn('font-medium text-sm', card.status === 'upcoming' ? 'text-white/30' : 'text-white')}>
                          {index + 1}. {card.stage}
                        </h3>
                        {card.status === 'current' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-spotlight border border-spotlight rounded-full px-2 py-0.5">
                            You are here
                          </span>
                        )}
                      </div>
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 border shrink-0', color.badge, needsWork && 'motion-safe:animate-pulse')}>
                        {card.completionPercent}% · {color.label}
                      </span>
                    </div>
                    <p className={cn('text-sm leading-relaxed mb-2', card.status === 'upcoming' ? 'text-white/30' : 'text-white/70')}>
                      {card.headline}
                    </p>
                    <div className="mb-2 max-w-xs">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', color.bar, needsWork && 'motion-safe:animate-pulse')}
                          style={{ width: `${card.completionPercent}%` }}
                        />
                      </div>
                    </div>
                    <p className={cn('text-xs italic mb-1.5', card.status === 'upcoming' ? 'text-white/20' : 'text-muted')}>
                      {card.feel}
                    </p>
                    <div className={cn('flex flex-wrap gap-x-4 gap-y-1 text-[11px]', card.status === 'upcoming' ? 'text-white/20' : 'text-white/40')}>
                      <span className="inline-flex items-center gap-1"><Layers className="w-3 h-3 shrink-0" />{card.weights}</span>
                      <span className="inline-flex items-center gap-1"><Shuffle className="w-3 h-3 shrink-0" />{card.wildcard}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage history — only rendered once the server has real transitions */}
        {stageHistory.length > 0 && (
          <div className="bg-surface rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-spotlight" />
              <h2 className="text-base font-medium text-white">Stage history</h2>
            </div>
            <div className="flex flex-col gap-3">
              {stageHistory.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">
                    <span className="capitalize">{t.from_stage}</span> → <span className="capitalize text-white font-medium">{t.to_stage}</span>
                  </span>
                  <span className="text-xs text-muted shrink-0">
                    {new Date(t.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits */}
        <div className="bg-surface rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-4">Where your time goes today</h2>
          {habits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <span key={habit} className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/80">
                  {habit}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30 italic">No habits added yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
