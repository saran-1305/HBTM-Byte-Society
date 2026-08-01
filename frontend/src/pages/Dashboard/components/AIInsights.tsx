import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useIdentityProfile } from '@/hooks/useIdentityProfile';

export const AIInsights = () => {
  const { data: profile } = useIdentityProfile();
  
  const insightsText = profile?.identity_summary || "Based on your recent activity, dedicating 20 more minutes to System Design today will increase your retention by 40%. You're also at peak energy levels right now.";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2>AI Insights</h2>
        </div>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">New insight</button>
      </div>

      <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden flex-1 flex flex-col justify-between">
        <p className="text-sm text-slate-700 leading-relaxed relative z-10 pr-16 line-clamp-4">
          {insightsText}
        </p>
        
        <div className="mt-4 relative z-10">
          <button className="bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Explore more insights <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Decorative Robot/Avatar Illustration (using simple shapes for now) */}
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center opacity-80">
           <div className="w-8 h-6 bg-slate-800 rounded-lg flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
