import React from 'react';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { useGrowthPlan } from '@/hooks/useGrowthPlan';

export const GrowthPlanTimeline = () => {
  const { data, loading } = useGrowthPlan();
  const milestones = data?.milestones || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Your Growth Plan</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View full plan</button>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-8">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse text-center">AI Planner is creating your custom roadmap...</p>
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">No growth plan available yet.</div>
        ) : (
          <>
            <div className="absolute left-[11px] top-3 bottom-4 w-[2px] bg-slate-100 rounded-full" />
            <div className="flex flex-col gap-6 relative">
              {milestones.map((milestone: any, index: number) => {
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';
                const isUpcoming = milestone.status === 'upcoming';
                
                return (
                  <div key={milestone.id || index} className="flex gap-4 items-start group cursor-pointer">
                    <div className="bg-white py-1 relative z-10 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : isInProgress ? (
                        <Circle className="w-6 h-6 text-indigo-500 fill-indigo-50" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 border-dashed" />
                      )}
                    </div>
                    
                    <div className="flex-1 pt-1.5">
                      <h3 className={`font-medium text-sm leading-tight mb-1 group-hover:text-indigo-600 transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-700'}`}>
                        {milestone.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        {isInProgress ? (
                          <span className="text-indigo-600 font-medium">In progress · {milestone.progress_percentage}%</span>
                        ) : isUpcoming ? (
                          <span className="text-slate-400">Upcoming</span>
                        ) : (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {milestone.target_date && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Target: {milestone.target_date}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
