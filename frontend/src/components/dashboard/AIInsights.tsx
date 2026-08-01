import { Sparkles, ArrowRight, Bot } from 'lucide-react';

const AIInsights = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Insights
        </h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">New insight</a>
      </div>

      <div className="flex-1 bg-[#F5F3FF] rounded-xl p-5 flex items-center justify-between border border-indigo-50 overflow-hidden relative">
        <div className="max-w-[70%] relative z-10">
          <p className="text-sm text-indigo-900 leading-relaxed font-medium mb-4">
            You learn best between 9-11 AM. Consider scheduling your deep work sessions during this time.
          </p>
          <button className="bg-white text-sm text-slate-900 font-semibold px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all flex items-center gap-2 group">
            Explore more insights 
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        {/* Robot Illustration Placeholder */}
        <div className="absolute right-0 bottom-0 mr-4 -mb-2 z-0">
          <div className="w-24 h-24 bg-indigo-200/50 rounded-full flex items-center justify-center relative">
             <Bot className="w-12 h-12 text-indigo-600 z-10" />
             <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
