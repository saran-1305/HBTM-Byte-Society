import React from 'react';
import { Loader2 } from 'lucide-react';
import { useGrowthPlan } from '@/hooks/useGrowthPlan';

export const HabitProgress = () => {
  const { data, loading } = useGrowthPlan();
  const habits = data?.habits || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Habit Progress</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-8">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse text-center">AI Planner is building your routine...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">No habits available yet.</div>
        ) : (
          habits.map((habit: any, index: number) => {
            const percent = Math.min(100, Math.round((habit.completed_minutes / habit.target_minutes) * 100));
            return (
              <div key={habit.id || index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-800">{habit.name}</span>
                  <span className="text-slate-500">{habit.completed_minutes} / {habit.target_minutes} min</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
