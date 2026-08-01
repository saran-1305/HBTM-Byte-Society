import React from 'react';
import { Book, PlayCircle, FileText, Loader2 } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';

export const Recommendations: React.FC = () => {
  const { data: recs, loading } = useRecommendations();

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'book': return <Book className="w-5 h-5 text-indigo-500" />;
      case 'video': return <PlayCircle className="w-5 h-5 text-indigo-500" />;
      case 'article': return <FileText className="w-5 h-5 text-indigo-500" />;
      default: return <Book className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Today's Top Recommendations</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-8">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             <p className="text-sm animate-pulse">AI Curator is finding the perfect materials for you...</p>
          </div>
        ) : (
          recs.map((rec: any) => (
            <div key={rec.id} className="flex gap-4 items-start group cursor-pointer">
              <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative">
                {rec.image_url ? (
                  <img src={rec.image_url} alt={rec.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                     {getIcon(rec.type)}
                  </>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900 text-sm leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{rec.title}</h3>
                  <p className="text-xs text-slate-500 mb-2 capitalize">{rec.type} · {rec.author}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600">
                    {rec.tag}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-500 shrink-0 mt-0.5">
                  {rec.match_percentage}% match
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
