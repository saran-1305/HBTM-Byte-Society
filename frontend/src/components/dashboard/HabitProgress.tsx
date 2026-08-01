import React from 'react';
import { Loader2 } from 'lucide-react';
import { useGrowthPlan } from '@/hooks/useGrowthPlan';

const HabitProgress = () => {
  const { data, loading } = useGrowthPlan();
  const habits = data?.habits || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Habit Progress</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-8">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse text-center">AI Planner is building your routine...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">No habits available yet.</div>
        ) : (
          habits.map((habit: any, idx: number) => {
            const percentage = Math.min(100, (habit.completed_minutes / habit.target_minutes) * 100);
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm font-semibold text-slate-900 mb-2">
                  <span>{habit.name}</span>
                  <span className="text-slate-500 font-medium text-xs">
                    {habit.completed_minutes} / {habit.target_minutes} min
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${percentage >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                    style={{ width: `${percentage}%` }}
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

export default HabitProgress;
