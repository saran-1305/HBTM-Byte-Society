import { Loader2 } from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';

const Recommendations = () => {
  const { data: recs, loading } = useRecommendations();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Today's Top Recommendations</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>
      
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-8">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse text-center">AI Curator is finding the perfect materials...</p>
          </div>
        ) : recs && recs.length > 0 ? (
          recs.map((item: any) => (
            <div key={item.id} className="flex gap-4 group cursor-pointer">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200 bg-slate-100 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="text-slate-400 font-bold text-xl">{item.type.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-2 capitalize">{item.type} • {item.author}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{item.tag}</span>
                  <span className="text-xs font-semibold text-emerald-600">{item.match_percentage}% match</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">No recommendations available yet.</div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
