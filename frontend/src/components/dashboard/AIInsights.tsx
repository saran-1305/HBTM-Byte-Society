import React from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

const AIInsights = () => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Insights
        </h2>
        <a href="#" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">New insight</a>
      </div>

      <div className="flex-1 bg-indigo-950/30 rounded-xl p-5 flex items-center justify-between border border-indigo-500/20 overflow-hidden relative">
        <div className="max-w-[70%] relative z-10">
          <p className="text-sm text-indigo-100 leading-relaxed font-medium mb-4">
            You learn best between 9-11 AM. Consider scheduling your deep work sessions during this time.
          </p>
          <button className="bg-indigo-500/20 text-sm text-indigo-200 font-semibold px-4 py-2 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center gap-2 group">
            Explore more insights 
            <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        {/* Robot Illustration Placeholder */}
        <div className="absolute right-0 bottom-0 mr-4 -mb-2 z-0">
          <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center relative border border-indigo-500/20">
             <Bot className="w-12 h-12 text-indigo-400 z-10" />
             <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
