export interface Recommendation {
  id: string;
  type: 'book' | 'video' | 'article' | 'audio';
  title: string;
  author: string;
  topic: string;
  fit: number;
  duration?: string; // for video/audio only, e.g. "12:34" or "48 min"
  // Present when this came from the real recommendation engine
  // (lib/recommendationApi.ts) rather than the local mock library.
  thumbnail?: string;
  url?: string;
  description?: string;
}

// Pool of recommendations keyed by topic
export const RECS_BY_TOPIC: Record<string, Recommendation[]> = {
  Technology: [
    { id: 't1', type: 'book', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', topic: 'Technology', fit: 92 },
    { id: 't2', type: 'book', title: "System Design Interview – An Insider's Guide", author: 'Alex Xu', topic: 'Technology', fit: 88 },
    { id: 't3', type: 'video', title: 'A Philosophy of Software Design | Talks at Google', author: 'John Ousterhout', topic: 'Technology', fit: 81, duration: '58 min' },
    { id: 't4', type: 'audio', title: 'The Pragmatic Engineer', author: 'Gergely Orosz', topic: 'Technology', fit: 85, duration: '52 min' },
    { id: 't5', type: 'video', title: 'Git Explained in 100 Seconds', author: 'Fireship', topic: 'Technology', fit: 79, duration: '1:40' },
  ],
  Business: [
    { id: 'b1', type: 'book', title: 'Zero to One', author: 'Peter Thiel', topic: 'Business', fit: 90 },
    { id: 'b2', type: 'article', title: 'How to Build a Startup Culture', author: 'First Round Review', topic: 'Business', fit: 85 },
    { id: 'b3', type: 'audio', title: 'How I Built This', author: 'Guy Raz', topic: 'Business', fit: 87, duration: '46 min' },
    { id: 'b4', type: 'video', title: 'Y Combinator: How to Start a Startup', author: 'Sam Altman', topic: 'Business', fit: 83, duration: '28:04' },
  ],
  Psychology: [
    { id: 'p1', type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', topic: 'Psychology', fit: 91 },
    { id: 'p2', type: 'article', title: 'The Mental Models Every Engineer Should Know', author: 'Farnam Street', topic: 'Psychology', fit: 87 },
    { id: 'p3', type: 'audio', title: 'Hidden Brain', author: 'Shankar Vedantam', topic: 'Psychology', fit: 84, duration: '39 min' },
  ],
  Finance: [
    { id: 'f1', type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', topic: 'Finance', fit: 89 },
    { id: 'f2', type: 'audio', title: 'Planet Money', author: 'NPR', topic: 'Finance', fit: 82, duration: '24 min' },
  ],
  Fitness: [
    { id: 'fit1', type: 'video', title: 'The Perfect Science-Based Morning Routine', author: 'Andrew Huberman', topic: 'Fitness', fit: 88, duration: '18 min' },
    { id: 'fit2', type: 'audio', title: 'The Huberman Lab Podcast', author: 'Andrew Huberman', topic: 'Fitness', fit: 86, duration: '1 hr 12 min' },
  ],
  Design: [
    { id: 'd1', type: 'book', title: 'A Philosophy of Software Design', author: 'John Ousterhout', topic: 'Design', fit: 84 },
    { id: 'd2', type: 'video', title: 'Design Systems in 10 Minutes', author: 'DesignCourse', topic: 'Design', fit: 80, duration: '10:03' },
  ],
  Writing: [
    { id: 'w1', type: 'article', title: 'How to Write Simply', author: 'Paul Graham', topic: 'Writing', fit: 86 },
    { id: 'w2', type: 'audio', title: 'Writing Excuses', author: 'Brandon Sanderson', topic: 'Writing', fit: 78, duration: '18 min' },
  ],
};

export const FALLBACK_RECS: Recommendation[] = [
  { id: 'fb1', type: 'book', title: 'Deep Work', author: 'Cal Newport', topic: 'Focus', fit: 85 },
  { id: 'fb2', type: 'book', title: 'The Power of Habit', author: 'Charles Duhigg', topic: 'Habits', fit: 82 },
  { id: 'fb3', type: 'book', title: 'The Embedded Entrepreneur', author: 'Arvid Kahl', topic: 'Building', fit: 80 },
  { id: 'fb4', type: 'audio', title: 'Deep Questions', author: 'Cal Newport', topic: 'Focus', fit: 83, duration: '1 hr 4 min' },
  { id: 'fb5', type: 'audio', title: 'Building Atomic Habits with James Clear', author: 'James Clear', topic: 'Habits', fit: 81, duration: '38 min' },
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

export const inferTopics = (aspiration: string): string[] => {
  const lower = aspiration.toLowerCase();
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((word) => lower.includes(word)))
    .map(([topic]) => topic);
};

// A wildcard is a pick outside the topics matched to the user's stated goal:
// deliberately off their usual path, flagged rather than hidden.
export const isWildcard = (rec: Recommendation, aspiration: string | undefined): boolean => {
  if (!aspiration) return false;
  const topics = inferTopics(aspiration);
  if (topics.length === 0) return false;
  return !topics.includes(rec.topic);
};

// Matched-topic items are ranked first (they're what's actually relevant to
// the stated goal), then padded out with the rest of the library so a thin
// topic pool (e.g. Writing has no videos) doesn't leave a whole content type
// looking empty.
export const getRecommendationsFor = (aspiration: string | undefined): Recommendation[] => {
  const topics = aspiration ? inferTopics(aspiration) : [];
  const matched: Recommendation[] = [];
  for (const topic of topics) {
    const pool = RECS_BY_TOPIC[topic];
    if (pool) matched.push(...pool);
  }
  matched.sort((a, b) => b.fit - a.fit);

  const matchedIds = new Set(matched.map((r) => r.id));
  const padding = ALL_RECOMMENDATIONS
    .filter((r) => !matchedIds.has(r.id))
    .sort((a, b) => b.fit - a.fit);

  return matched.length > 0 ? [...matched, ...padding] : padding;
};

export const ALL_RECOMMENDATIONS: Recommendation[] = [
  ...Object.values(RECS_BY_TOPIC).flat(),
  ...FALLBACK_RECS,
];
