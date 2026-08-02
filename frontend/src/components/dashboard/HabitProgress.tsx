import React from 'react';

const HabitProgress = () => {
  const habits = [
    { name: 'Daily Learning', current: 45, max: 60, unit: 'min' },
    { name: 'Reading', current: 20, max: 30, unit: 'min' },
    { name: 'Exercise', current: 30, max: 30, unit: 'min' },
    { name: 'Meditation', current: 10, max: 15, unit: 'min' },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[#3A2E27]">Habit Progress</h2>
        <a href="#" className="text-[#1FA35A]/400 text-sm font-semibold hover:text-[#1FA35A]/300 transition-colors">See all</a>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-4">
        {habits.map((habit, idx) => {
          const percentage = (habit.current / habit.max) * 100;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm font-semibold text-slate-200 mb-2">
                <span>{habit.name}</span>
                <span className="text-slate-400 font-medium text-xs">
                  {habit.current} / {habit.max} {habit.unit}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${percentage >= 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-emerald-500'}`}
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





