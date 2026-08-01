import React from 'react';

const RecentReflection = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h2 className="text-lg font-bold text-slate-900">Recent Reflection</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <p className="text-slate-600 text-sm leading-relaxed italic mb-4">
          <span className="text-2xl text-indigo-300 font-serif mr-1">"</span>
          Today I learned about database indexing and it really clicked! Building the project is challenging but exciting.
        </p>
        <p className="text-xs font-medium text-slate-400 mt-auto">May 20, 2024 • 8:30 PM</p>
      </div>

      {/* Decorative Background Blob */}
      <div className="absolute bottom-0 right-0 w-full h-24 bg-gradient-to-tr from-indigo-100/40 via-purple-100/40 to-transparent -mb-8 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
      <svg className="absolute bottom-0 left-0 w-full h-1/2 text-indigo-50/50 pointer-events-none" viewBox="0 0 400 150" preserveAspectRatio="none" fill="currentColor">
        <path d="M0,150 C100,50 200,100 300,20 400,80 400,150 400,150 Z" />
      </svg>
    </div>
  );
};

export default RecentReflection;
