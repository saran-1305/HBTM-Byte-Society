import React from 'react';

export const RecentReflection: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="font-semibold text-slate-900">Recent Reflection</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-between">
        <div className="flex gap-4">
          <span className="font-serif text-4xl text-indigo-200 leading-none h-4">"</span>
          <p className="text-sm text-slate-700 leading-relaxed pt-1">
            Today I learned about database indexing and it really clicked! Building the project is challenging but exciting.
          </p>
        </div>
        <div className="mt-4 text-xs text-slate-400 pl-8">
          May 20, 2024 • 8:30 PM
        </div>
      </div>

      {/* Decorative Wave at the bottom right */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
    </div>
  );
};
