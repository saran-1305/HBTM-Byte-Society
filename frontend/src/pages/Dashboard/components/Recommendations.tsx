import React from 'react';
import { Book, PlayCircle, FileText } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'book' | 'video' | 'article';
  title: string;
  author: string;
  tag: string;
  match: number;
  imageUrl?: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'book',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    tag: 'Deep Work',
    match: 90,
  },
  {
    id: '2',
    type: 'video',
    title: 'System Design Interview in 40 Minutes',
    author: 'Alex Xu',
    tag: 'System Design',
    match: 88,
  },
  {
    id: '3',
    type: 'article',
    title: 'The Mental Models Every Engineer Should Know',
    author: 'Farnam Street',
    tag: 'Mental Models',
    match: 85,
  }
];

export const Recommendations: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5 text-indigo-500" />;
      case 'video': return <PlayCircle className="w-5 h-5 text-indigo-500" />;
      case 'article': return <FileText className="w-5 h-5 text-indigo-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Today's Top Recommendations</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        {mockRecommendations.map((rec) => (
          <div key={rec.id} className="flex gap-4 items-start group cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative">
              {rec.imageUrl ? (
                <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
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
                {rec.match}% match
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
