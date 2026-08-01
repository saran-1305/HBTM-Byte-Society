import { Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { TIMEFRAME_LABEL } from '@/types/onboarding';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/cn';
import {
  Target, Clock, CheckCircle2, Circle, CircleDashed, AlertTriangle, Sparkles
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  detail: string;
  status: 'completed' | 'current' | 'upcoming';
}

export default function GrowthPlan() {
  const { profile } = useOnboarding();
  const aspiration = profile.aspiration;
  const habits = profile.habits || [];
  const stuckPoint = profile.stuckPoint;

  if (!aspiration) {
    return (
      <DashboardLayout>
        <div className="max-w-xl py-16 text-center mx-auto">
          <h1 className="text-2xl font-serif text-slate-900 mb-2">No growth plan yet</h1>
          <p className="text-sm text-slate-500 mb-6">
            Complete the onboarding to generate a plan around your goal.
          </p>
          <Link
            to="/onboarding"
            className="inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start onboarding
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Goal defined',
      detail: aspiration,
      status: 'completed',
    },
    {
      id: '2',
      title: stuckPoint ? `Work past: ${stuckPoint}` : 'Identify where you get stuck',
      detail: stuckPoint
        ? "This is the obstacle you named. Most of the early plan is built around clearing it."
        : 'Complete onboarding to name your biggest obstacle.',
      status: stuckPoint ? 'current' : 'upcoming',
    },
    {
      id: '3',
      title: 'Replace one habit at a time',
      detail: habits.length > 0
        ? `Start with the highest-friction habit on your list and swap in a smaller version of the goal instead.`
        : 'Add current habits in onboarding so the plan can target the right one first.',
      status: 'upcoming',
    },
    {
      id: '4',
      title: 'Build daily consistency',
      detail: `Hold a small, repeatable version of "${aspiration}" for ${profile.timeframe ? TIMEFRAME_LABEL[profile.timeframe] : 'a while'} before raising the bar.`,
      status: 'upcoming',
    },
    {
      id: '5',
      title: 'Reflect and adjust',
      detail: 'Check in on what is and is not working, and let the plan shift with you.',
      status: 'upcoming',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-1">Your Growth Plan</h1>
          <p className="text-sm text-slate-500">The path from where you are to who you're becoming.</p>
        </div>

        {/* Goal card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-2.5 bg-indigo-50 rounded-lg shrink-0 self-start">
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Goal</p>
            <p className="text-lg text-slate-900 leading-snug mb-3">{aspiration}</p>
            <div className="flex flex-wrap gap-2">
              {profile.timeframe && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  <Clock className="w-3.5 h-3.5" />
                  {TIMEFRAME_LABEL[profile.timeframe]}
                </span>
              )}
              {stuckPoint && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stuckPoint}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.profileSummary && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed italic">{profile.profileSummary}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Milestones</h2>
          <div className="relative pl-3 space-y-6">
            <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-slate-200" />
            {milestones.map((m, index) => {
              let Icon = CircleDashed;
              let iconColor = 'text-slate-300';
              if (m.status === 'completed') {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-500';
              } else if (m.status === 'current') {
                Icon = Circle;
                iconColor = 'text-indigo-500';
              }
              return (
                <div key={m.id} className="relative z-10 flex gap-4">
                  <div className="bg-white rounded-full mt-0.5">
                    <Icon className={cn('w-5 h-5 bg-white', iconColor)} strokeWidth={m.status === 'current' ? 3 : 2} />
                  </div>
                  <div>
                    <h3 className={cn('font-medium text-sm mb-1', m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900')}>
                      {index + 1}. {m.title}
                    </h3>
                    <p className={cn('text-sm leading-relaxed', m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-600')}>
                      {m.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus areas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Where your time goes today</h2>
          {habits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <span key={habit} className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                  {habit}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No habits added yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
