import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { TIMEFRAME_LABEL } from '@/types/onboarding';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StageTracker } from '@/components/StageTracker';
import { STAGES, getStageIndex } from '@/lib/stage';
import { cn } from '@/lib/cn';
import {
  Target, Clock, BookOpen, AlertTriangle, Edit3, Sparkles,
  CheckCircle2, Circle, CircleDashed,
} from 'lucide-react';

interface Milestone {
  stage: (typeof STAGES)[number];
  detail: string;
}

export default function Identity() {
  const { profile, reflectionCount } = useOnboarding();
  const { registerSearch } = useCommandPalette();
  const aspiration = profile.aspiration;
  const habits = useMemo(() => profile.habits || [], [profile.habits]);
  const stuckPoint = profile.stuckPoint;

  // Not much free text to search here, but the habit list and the 5 stages
  // are real, tab-specific content rather than a generic nav fallback.
  useEffect(() => {
    registerSearch({
      placeholder: 'Search habits and stages...',
      getResults: (query) => {
        const q = query.trim().toLowerCase();
        const habitResults = habits
          .filter((h) => !q || h.toLowerCase().includes(q))
          .map((h) => ({ id: `habit-${h}`, label: h, sublabel: 'Current habit', icon: BookOpen, onSelect: () => {} }));
        const stageResults = STAGES
          .filter((s) => !q || s.toLowerCase().includes(q))
          .map((s) => ({ id: `stage-${s}`, label: s, sublabel: 'Stage', icon: Target, onSelect: () => {} }));
        return [...habitResults, ...stageResults];
      },
    });
    return () => registerSearch(null);
  }, [habits, registerSearch]);

  if (!aspiration) {
    return (
      <DashboardLayout>
        <div className="max-w-xl py-16 text-center mx-auto">
          <h1 className="text-2xl font-sans font-bold tracking-[-0.02em] text-white mb-2">No identity profile yet</h1>
          <p className="text-sm text-muted mb-6">
            Complete the onboarding to generate a profile and plan around your goal.
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

  const stageIndex = getStageIndex(profile, reflectionCount);

  // Milestones mapped 1:1 onto the 5 canonical stages, so the vertical
  // timeline and the horizontal stage bar always agree on where you are.
  const milestones: Milestone[] = [
    { stage: 'Explore', detail: `Goal defined: ${aspiration}` },
    {
      stage: 'Commit',
      detail: habits.length > 0
        ? `Committed to ${TIMEFRAME_LABEL[profile.timeframe || 'someday']}, tracking against: ${habits.join(', ')}.`
        : 'Complete onboarding to lock in a timeframe and current habits.',
    },
    {
      stage: 'Struggle',
      detail: stuckPoint
        ? `Working past: ${stuckPoint}. Most of the plan right now is built around clearing this.`
        : 'Complete onboarding to name your biggest obstacle.',
    },
    {
      stage: 'Breakthrough',
      detail: reflectionCount > 0
        ? `${reflectionCount} reflection${reflectionCount === 1 ? '' : 's'} logged. Three consistent reflections against your obstacle moves you here.`
        : 'Log reflections against your obstacle to start building momentum.',
    },
    {
      stage: 'Interact',
      detail: 'The arc ends here: the curator stops feeding you content and starts pointing you at people working through what you just got past.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl py-6 flex flex-col gap-6 pb-16">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">
              Your Identity Profile
            </h1>
            <p className="text-sm text-muted">This is what your AI agent knows about you, and where it's taking you.</p>
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

        {/* Timeline */}
        <div className="bg-surface rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-6">Milestones</h2>
          <div className="relative pl-3 space-y-6">
            <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-white/10" />
            {milestones.map((m, index) => {
              const status = index < stageIndex ? 'completed' : index === stageIndex ? 'current' : 'upcoming';
              let Icon = CircleDashed;
              let iconColor = 'text-white/20';
              if (status === 'completed') {
                Icon = CheckCircle2;
                iconColor = 'text-white';
              } else if (status === 'current') {
                Icon = Circle;
                iconColor = 'text-spotlight';
              }
              return (
                <div key={m.stage} className="relative z-10 flex gap-4">
                  <div className="bg-surface rounded-full mt-0.5 relative">
                    {status === 'current' && (
                      <span className="absolute inset-0 rounded-full bg-spotlight/30 motion-safe:animate-ping" />
                    )}
                    <Icon className={cn('w-5 h-5 relative', iconColor)} strokeWidth={status === 'current' ? 3 : 2} />
                  </div>
                  <div>
                    <h3 className={cn('font-medium text-sm mb-1', status === 'upcoming' ? 'text-white/30' : 'text-white')}>
                      {index + 1}. {m.stage}
                    </h3>
                    <p className={cn('text-sm leading-relaxed', status === 'upcoming' ? 'text-white/30' : 'text-white/60')}>
                      {m.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current habits */}
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
