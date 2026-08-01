import React from 'react';
import { Book, PlayCircle, FileText, Globe } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

interface Recommendation {
  id: string;
  type: 'book' | 'video' | 'article';
  title: string;
  author: string;
  topic: string;
  fit: number;
}

// Pool of recommendations keyed by interest
const RECS_BY_INTEREST: Record<string, Recommendation[]> = {
  Technology: [
    { id: 't1', type: 'book', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', topic: 'Technology', fit: 92 },
    { id: 't2', type: 'video', title: 'System Design Interview in 40 Minutes', author: 'Alex Xu', topic: 'Technology', fit: 88 },
  ],
  Business: [
    { id: 'b1', type: 'book', title: 'Zero to One', author: 'Peter Thiel', topic: 'Business', fit: 90 },
    { id: 'b2', type: 'article', title: 'How to Build a Startup Culture', author: 'First Round Review', topic: 'Business', fit: 85 },
  ],
  Psychology: [
    { id: 'p1', type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', topic: 'Psychology', fit: 91 },
    { id: 'p2', type: 'article', title: 'The Mental Models Every Engineer Should Know', author: 'Farnam Street', topic: 'Psychology', fit: 87 },
  ],
  Finance: [
    { id: 'f1', type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', topic: 'Finance', fit: 89 },
  ],
  Fitness: [
    { id: 'fit1', type: 'video', title: 'Science-Based Morning Routine', author: 'Andrew Huberman', topic: 'Fitness', fit: 88 },
  ],
  Design: [
    { id: 'd1', type: 'book', title: 'A Philosophy of Software Design', author: 'John Ousterhout', topic: 'Design', fit: 84 },
  ],
  Writing: [
    { id: 'w1', type: 'article', title: 'How to Write Simply', author: 'Paul Graham', topic: 'Writing', fit: 86 },
  ],
};

const FALLBACK: Recommendation[] = [
  { id: 'fb1', type: 'book', title: 'Deep Work', author: 'Cal Newport', topic: 'Focus', fit: 85 },
  { id: 'fb2', type: 'video', title: 'The Power of Habits', author: 'Charles Duhigg', topic: 'Habits', fit: 82 },
  { id: 'fb3', type: 'article', title: 'Build in Public: A Starter Guide', author: 'Arvid Kahl', topic: 'Building', fit: 80 },
];

// The onboarding flow no longer collects explicit interest tags, so topics
// are inferred from keywords in the user's stated aspiration instead.
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Technology: ['code', 'coding', 'engineer', 'developer', 'programm', 'tech'],
  Business: ['found', 'founder', 'startup', 'business', 'entrepreneur'],
  Psychology: ['mind', 'psycholog', 'think'],
  Finance: ['money', 'finance', 'invest'],
  Fitness: ['health', 'fit', 'fitness', 'gym', 'run'],
  Design: ['design'],
  Writing: ['write', 'writer', 'writing', 'author'],
};

const inferTopics = (aspiration: string): string[] => {
  const lower = aspiration.toLowerCase();
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((word) => lower.includes(word)))
    .map(([topic]) => topic);
};

export const Recommendations: React.FC = () => {
  const { profile } = useOnboarding();
  const topics = profile.aspiration ? inferTopics(profile.aspiration) : [];

  // Pick recommendations based on topics inferred from the aspiration
  let recs: Recommendation[] = [];
  for (const topic of topics) {
    const pool = RECS_BY_INTEREST[topic];
    if (pool) recs.push(...pool);
    if (recs.length >= 4) break;
  }
  if (recs.length === 0) recs = FALLBACK;
  recs = recs.slice(0, 4).sort((a, b) => b.fit - a.fit);

  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5 text-indigo-500" />;
      case 'video': return <PlayCircle className="w-5 h-5 text-indigo-500" />;
      case 'article': return <FileText className="w-5 h-5 text-indigo-500" />;
      default: return <Globe className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">Picked for you today</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
      </div>

      <div className="flex flex-col gap-5">
        {recs.map((rec) => (
          <div key={rec.id} className="flex gap-4 items-start group cursor-pointer">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {getIcon(rec.type)}
            </div>

            <div className="flex-1 min-w-0 flex justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900 text-sm leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2 capitalize">{rec.type} · {rec.author}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600">
                  {rec.topic}
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-600 shrink-0 mt-0.5 whitespace-nowrap">
                {rec.fit}% fit
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
