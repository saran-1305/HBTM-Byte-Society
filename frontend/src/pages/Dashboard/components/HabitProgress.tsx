import React from 'react';

interface Habit {
  id: string;
  name: string;
  progress: number;
  meta: string;
}

const mockHabits: Habit[] = [
  { id: '1', name: 'Daily Learning', progress: 75, meta: '45 / 60 min' },
  { id: '2', name: 'Reading', progress: 66, meta: '20 / 30 min' },
  { id: '3', name: 'Exercise', progress: 100, meta: '30 / 30 min' },
  { id: '4', name: 'Meditation', progress: 66, meta: '10 / 15 min' },
  { id: '5', name: 'Journaling', progress: 50, meta: '15 / 30 min' },
];

export const HabitProgress: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Habits today</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex flex-col gap-5">
        {mockHabits.map((habit) => (
          <div key={habit.id}>
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-slate-900">{habit.name}</span>
              <span className="text-slate-500">{habit.meta}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${habit.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
