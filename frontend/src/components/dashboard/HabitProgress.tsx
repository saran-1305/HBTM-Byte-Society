import React from 'react';

const HabitProgress = () => {
  const habits = [
    { name: 'Daily Learning', current: 45, max: 60, unit: 'min' },
    { name: 'Reading', current: 20, max: 30, unit: 'min' },
    { name: 'Exercise', current: 30, max: 30, unit: 'min' },
    { name: 'Meditation', current: 10, max: 15, unit: 'min' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Habit Progress</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-4">
        {habits.map((habit, idx) => {
          const percentage = (habit.current / habit.max) * 100;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm font-semibold text-slate-900 mb-2">
                <span>{habit.name}</span>
                <span className="text-slate-500 font-medium text-xs">
                  {habit.current} / {habit.max} {habit.unit}
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
        })}
      </div>
    </div>
  );
};

export default HabitProgress;
