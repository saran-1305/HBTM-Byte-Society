import React from 'react';
import { cn } from '@/lib/cn';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';

interface PlanStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  meta: string;
}

const mockPlan: PlanStep[] = [
  { id: '1', title: 'AI Engineering foundations', status: 'completed', meta: 'Finished Dec 2025' },
  { id: '2', title: 'System Design depth', status: 'current', meta: 'In progress · 72%' },
  { id: '3', title: 'Real-world project builds', status: 'current', meta: 'In progress · 45%' },
  { id: '4', title: 'Open source contributions', status: 'upcoming', meta: 'Next up' },
];

export const GrowthPlanTimeline: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Growth Plan</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Full plan</button>
      </div>

      <div className="relative pl-3 space-y-5">
        {/* Timeline line */}
        <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-slate-200" />

        {mockPlan.map((step, index) => {
          let Icon;
          let iconColor;

          if (step.status === 'completed') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (step.status === 'current') {
            Icon = Circle;
            iconColor = index === 1 ? 'text-indigo-500' : 'text-amber-500';
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
                  'font-medium text-sm mb-0.5',
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
