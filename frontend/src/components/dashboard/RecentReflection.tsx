import { ArrowRight, MessageSquareHeart } from 'lucide-react';

interface Props {
  identitySummary?: string;
}

const RecentReflection = ({ identitySummary }: Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-bold text-slate-900">Your AI Identity</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex gap-4">
          <MessageSquareHeart className="w-8 h-8 text-indigo-300 flex-shrink-0 mt-1" />
          <div>
            <p className="text-slate-700 font-medium leading-relaxed italic text-sm">
              "{identitySummary || 'Loading your unique AI identity profile...'}"
            </p>
            <span className="text-xs text-slate-400 mt-4 block font-semibold">Based on onboarding</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Blob */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-slate-50 rounded-full blur-3xl z-0"></div>
    </div>
  );
};

export default RecentReflection;
