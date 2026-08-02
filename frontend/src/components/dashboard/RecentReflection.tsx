import React from 'react';

const RecentReflection = () => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] relative overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h2 className="text-lg font-bold text-[#3A2E27]">Recent Reflection</h2>
        <a href="#" className="text-[#1FA35A]/400 text-sm font-semibold hover:text-[#1FA35A]/300 transition-colors">See all</a>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
          <span className="text-2xl text-[#1FA35A]/400 font-serif mr-1">"</span>
          Today I learned about database indexing and it really clicked! Building the project is challenging but exciting.
        </p>
        <p className="text-xs font-medium text-slate-500 mt-auto">May 20, 2024 • 8:30 PM</p>
      </div>

      {/* Decorative Background Blob */}
      <div className="absolute bottom-0 right-0 w-full h-24 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent -mb-8 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
      <svg className="absolute bottom-0 left-0 w-full h-1/2 text-[#3A2E27]/5 pointer-events-none" viewBox="0 0 400 150" preserveAspectRatio="none" fill="currentColor">
        <path d="M0,150 C100,50 200,100 300,20 400,80 400,150 400,150 Z" />
      </svg>
    </div>
  );
};

export default RecentReflection;





