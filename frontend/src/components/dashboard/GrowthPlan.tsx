import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const GrowthPlan = () => {
  const steps = [
    {
      title: 'Become a Strong AI Engineer',
      subtitle: 'Target: Dec 2025',
      status: 'completed'
    },
    {
      title: 'Master System Design',
      subtitle: 'In progress • 72%',
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      title: 'Build Real World Projects',
      subtitle: 'In progress • 45%',
      status: 'active',
      color: 'bg-amber-500'
    },
    {
      title: 'Contribute to Open Source',
      subtitle: 'Upcoming',
      status: 'upcoming'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Your Growth Plan</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View full plan</a>
      </div>

      <div className="relative pl-3 mt-4 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {steps.map((step, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow shrink-0 z-10">
              {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white rounded-full" />}
              {step.status === 'active' && <div className={`w-2.5 h-2.5 rounded-full ${step.color}`}></div>}
              {step.status === 'upcoming' && <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>}
            </div>
            
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] px-4">
              <div className="flex flex-col">
                <h3 className={`font-semibold text-sm ${step.status === 'completed' ? 'text-slate-600' : 'text-slate-900'}`}>{step.title}</h3>
                <span className="text-xs text-slate-500 mt-1">{step.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthPlan;
