import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AIInsights: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2>AI Insights</h2>
        </div>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
          Refresh
        </button>
      </div>

      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 relative overflow-hidden flex flex-col gap-4">
        <p className="text-sm text-slate-700 leading-relaxed relative z-10 pr-14">
          You learn best between 9 and 11 AM. Try scheduling focused study sessions in that window.
        </p>

        <div className="relative z-10">
          <button className="bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            See all insights <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Decorative indicator */}
        <div className="absolute bottom-4 right-4 w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center opacity-80">
          <div className="w-6 h-5 bg-slate-800 rounded-md flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
