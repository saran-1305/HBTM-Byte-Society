import React from 'react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { cn } from '@/lib/cn';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';

export const GrowthPlanTimeline: React.FC = () => {
  const { profile } = useOnboarding();
  const aspiration = profile.aspiration;

  // Build a contextual plan from the aspiration and the reported stuck point
  const stuckPoint = profile.stuckPoint;

  const steps: { id: string; title: string; status: 'completed' | 'current' | 'upcoming'; meta: string }[] = [
    {
      id: '1',
      title: aspiration || 'Define your main goal',
      status: aspiration ? 'current' : 'upcoming',
      meta: aspiration ? 'In progress' : 'Set in onboarding',
    },
    {
      id: '2',
      title: stuckPoint
        ? `Work past: ${stuckPoint}`
        : 'Identify where you get stuck',
      status: stuckPoint ? 'current' : 'upcoming',
      meta: stuckPoint ? 'Actively tracking' : 'Complete onboarding',
    },
    {
      id: '3',
      title: 'Build daily consistency',
      status: 'upcoming',
      meta: 'Next milestone',
    },
    {
      id: '4',
      title: 'Share and reflect on your progress',
      status: 'upcoming',
      meta: 'After 30 days',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Growth Plan</h2>
        <Link to="/growth-plan" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Full plan</Link>
      </div>

      <div className="relative pl-3 space-y-5">
        <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-slate-200" />

        {steps.map((step, index) => {
          let Icon;
          let iconColor;

          if (step.status === 'completed') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (step.status === 'current') {
            Icon = Circle;
            iconColor = index === 0 ? 'text-indigo-500' : 'text-amber-500';
          } else {
            Icon = CircleDashed;
            iconColor = 'text-slate-300';
          }

          return (
            <div key={step.id} className="relative z-10 flex gap-4">
              <div className="bg-white rounded-full mt-0.5">
                <Icon
                  className={cn('w-5 h-5 bg-white', iconColor)}
                  strokeWidth={step.status === 'current' ? 3 : 2}
                />
              </div>
              <div>
                <h3 className={cn(
                  'font-medium text-sm mb-0.5 line-clamp-2',
                  step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                )}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500">{step.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
