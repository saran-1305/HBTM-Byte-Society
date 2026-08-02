import React from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

const AIInsights = () => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#3A2E27] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1FA35A]/400" />
          AI Insights
        </h2>
        <a href="#" className="text-[#1FA35A]/400 text-sm font-semibold hover:text-[#1FA35A]/300 transition-colors">New insight</a>
      </div>

      <div className="flex-1 bg-[#1FA35A]/950/30 rounded-full p-5 flex items-center justify-between border border-[#1FA35A]/500/20 overflow-hidden relative">
        <div className="max-w-[70%] relative z-10">
          <p className="text-sm text-[#1FA35A]/100 leading-relaxed font-medium mb-4">
            You learn best between 9-11 AM. Consider scheduling your deep work sessions during this time.
          </p>
          <button className="bg-[#1FA35A]/500/20 text-sm text-[#1FA35A]/200 font-semibold px-4 py-2 rounded-full border border-[#1FA35A]/500/30 hover:bg-[#1FA35A]/500/30 transition-all flex items-center gap-2 group">
            Explore more insights 
            <ArrowRight className="w-4 h-4 text-[#1FA35A]/300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        {/* Robot Illustration Placeholder */}
        <div className="absolute right-0 bottom-0 mr-4 -mb-2 z-0">
          <div className="w-24 h-24 bg-[#1FA35A]/500/10 rounded-full flex items-center justify-center relative border border-[#1FA35A]/500/20">
             <Bot className="w-12 h-12 text-[#1FA35A]/400 z-10" />
             <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;





