import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

// Static progress values for onboarding habits (would come from tracking backend later)
const HABIT_DEFAULTS: Record<string, number> = {
  Reading: 66,
  Gym: 80,
  Meditation: 50,
  Coding: 90,
  Journaling: 40,
};

export const HabitProgress: React.FC = () => {
  const { profile } = useOnboarding();
  const habits = profile.habits && profile.habits.length > 0
    ? profile.habits
    : ['Reading', 'Coding', 'Meditation', 'Journaling', 'Gym'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Habits today</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Track</button>
      </div>

      <div className="flex flex-col gap-5">
        {habits.map((habit) => {
          const progress = HABIT_DEFAULTS[habit] ?? 60;
          return (
            <div key={habit}>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-900">{habit}</span>
                <span className="text-slate-500">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
