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
  { id: '1', title: 'Become a Strong AI Engineer', status: 'completed', meta: 'Target: Dec 2025' },
  { id: '2', title: 'Master System Design', status: 'current', meta: 'In progress · 72%' },
  { id: '3', title: 'Build Real World Projects', status: 'current', meta: 'In progress · 45%' },
  { id: '4', title: 'Contribute to Open Source', status: 'upcoming', meta: 'Upcoming' },
];

export const GrowthPlanTimeline: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Your Growth Plan</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View full plan</button>
      </div>

      <div className="relative pl-3 space-y-6">
        {/* Timeline line */}
        <div className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-slate-200 -z-0"></div>

        {mockPlan.map((step, index) => {
          let Icon;
          let iconColor;
          
          if (step.status === 'completed') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (step.status === 'current') {
            Icon = Circle;
            iconColor = 'text-amber-500';
            if(index === 1) iconColor = 'text-indigo-500'; // Make the first active one indigo
          } else {
            Icon = CircleDashed;
            iconColor = 'text-slate-300';
          }

          return (
            <div key={step.id} className="relative z-10 flex gap-4">
              <div className="bg-white rounded-full mt-0.5">
                <Icon className={cn("w-5 h-5 bg-white", iconColor)} strokeWidth={step.status === 'current' ? 3 : 2} />
              </div>
              <div>
                <h3 className={cn(
                  "font-medium text-sm mb-1", 
                  step.status === 'upcoming' ? 'text-slate-500' : 'text-slate-900'
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
