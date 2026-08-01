import React from 'react';

export const RecentReflection: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="font-semibold text-slate-900">Last reflection</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">All entries</button>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          <span className="font-serif text-4xl text-indigo-200 leading-none mt-0.5">"</span>
          <p className="text-sm text-slate-700 leading-relaxed">
            Today I finally got database indexing to click. Building the project is hard but I can feel real progress.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          May 20, 2024 at 8:30 PM
        </div>
      </div>

      {/* Soft background shape */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
    </div>
  );
};
