import { CheckCircle2, Loader2 } from 'lucide-react';
import { useGrowthPlan } from '../../hooks/useGrowthPlan';

const GrowthPlan = () => {
  const { data, loading } = useGrowthPlan();
  const steps = data?.milestones || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Your Growth Plan</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View full plan</a>
      </div>

      <div className="relative pl-3 mt-4 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-8 bg-white relative z-10">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse text-center">AI Planner is creating your custom roadmap...</p>
          </div>
        ) : steps.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4 bg-white relative z-10">No growth plan available yet.</div>
        ) : (
          steps.map((step: any, index: number) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'in_progress';
            const isUpcoming = step.status === 'upcoming';
            const color = isActive ? (index % 2 === 0 ? 'bg-blue-500' : 'bg-amber-500') : '';
            
            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active bg-white">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow shrink-0 z-10">
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white rounded-full" />}
                  {isActive && <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>}
                  {isUpcoming && <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>}
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] px-4">
                  <div className="flex flex-col">
                    <h3 className={`font-semibold text-sm ${isCompleted ? 'text-slate-600' : 'text-slate-900'}`}>{step.title}</h3>
                    <span className="text-xs text-slate-500 mt-1">
                      {isActive ? `In progress • ${step.progress_percentage}%` : isUpcoming ? 'Upcoming' : `Target: ${step.target_date}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GrowthPlan;
