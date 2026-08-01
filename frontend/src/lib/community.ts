export type ThreadStageTag = 'Explore' | 'Commit' | 'Struggle' | 'Breakthrough';

export interface ThreadComment {
  id: string;
  author: string;
  text: string;
  daysAgo: number;
}

export interface Thread {
  id: string;
  title: string;
  body: string;
  author: string;
  stageTag: ThreadStageTag;
  upvotes: number;
  daysAgo: number;
  comments: ThreadComment[];
}

// Seeded with a deliberate lean toward Struggle threads: the Integrate stage's
// engine config sets thread_bias="struggle", since users arriving here just
// lived through it and are best placed to answer people still in it.
export const SEED_THREADS: Thread[] = [
  {
    id: 'th1',
    title: "The obstacle doesn't go away, you just get faster at noticing you're stuck",
    body: "Six weeks in and 'finishing what I start' still trips me up weekly. What changed is how fast I catch it now, usually within a day instead of a week. Anyone else notice the win isn't beating the obstacle, it's shortening the loop?",
    author: 'mira_writes',
    stageTag: 'Struggle',
    upvotes: 142,
    daysAgo: 1,
    comments: [
      { id: 'c1', author: 'devon_k', text: 'This is exactly it. I stopped trying to fix the pattern and started just cutting the loop shorter.', daysAgo: 1 },
      { id: 'c2', author: 'quiet_hours', text: 'Saving this for the next time I spiral about "still" struggling with the same thing.', daysAgo: 1 },
    ],
  },
  {
    id: 'th2',
    title: 'What actually got me unstuck on the "starting is fine, finishing is the problem" thing',
    body: "Broke every task into a version so small it felt embarrassing to skip. Not motivation, just friction removal. Three weeks of embarrassingly small finishes later, it's a habit now.",
    author: 'arjun_builds',
    stageTag: 'Struggle',
    upvotes: 98,
    daysAgo: 2,
    comments: [
      { id: 'c3', author: 'mira_writes', text: 'The embarrassingly-small part is underrated. I skip steps because they feel too easy to count.', daysAgo: 2 },
    ],
  },
  {
    id: 'th3',
    title: 'How do you tell the difference between resting and avoiding?',
    body: "Genuinely can't tell anymore if I'm taking a break or hiding from the hard part. Curious how people in Struggle figure this out in the moment, not in hindsight.",
    author: 'noah_p',
    stageTag: 'Struggle',
    upvotes: 76,
    daysAgo: 3,
    comments: [],
  },
  {
    id: 'th4',
    title: 'First week of actually committing instead of just planning',
    body: 'Picked a stupidly small daily rep tied to my goal. Did it every day this week, including two days I really did not want to. That is the whole update.',
    author: 'lena_codes',
    stageTag: 'Commit',
    upvotes: 61,
    daysAgo: 2,
    comments: [
      { id: 'c4', author: 'arjun_builds', text: 'The "including days I did not want to" part is the actual signal. Congrats.', daysAgo: 2 },
    ],
  },
  {
    id: 'th5',
    title: 'Still figuring out what I even want to become, and that is apparently fine',
    body: "Everyone here seems to have a crisp aspiration. Mine is fuzzy and I'm learning that's an Explore-stage thing, not a me thing.",
    author: 'sam_t',
    stageTag: 'Explore',
    upvotes: 54,
    daysAgo: 4,
    comments: [],
  },
  {
    id: 'th6',
    title: 'The stuff that felt impossible three months ago is just Tuesday now',
    body: "Not trying to flex, genuinely trying to document it so past-me (and current-you) believes it's possible. Breakthrough stage feels earned in a way Explore never did.",
    author: 'priya_writes',
    stageTag: 'Breakthrough',
    upvotes: 203,
    daysAgo: 5,
    comments: [
      { id: 'c5', author: 'noah_p', text: 'This is the thread I needed today.', daysAgo: 4 },
      { id: 'c6', author: 'devon_k', text: 'Following for when I get there.', daysAgo: 5 },
    ],
  },
  {
    id: 'th7',
    title: "Relapsed into the old habit for a full week. Here's what I'm doing about it",
    body: "Not writing this for sympathy, writing it because I know someone else in Struggle is mid-relapse right now and thinks it undoes the progress. It doesn't.",
    author: 'devon_k',
    stageTag: 'Struggle',
    upvotes: 167,
    daysAgo: 1,
    comments: [
      { id: 'c7', author: 'quiet_hours', text: 'Needed to read this exact sentence today.', daysAgo: 1 },
    ],
  },
  {
    id: 'th8',
    title: 'A small tracking trick that made my habit stick',
    body: 'Nothing fancy, just moved the tracking from an app to a sticky note where I could not avoid seeing it. Nine days in.',
    author: 'quiet_hours',
    stageTag: 'Commit',
    upvotes: 39,
    daysAgo: 6,
    comments: [],
  },
];

export function sortThreads(threads: Thread[], sort: 'hot' | 'new' | 'top'): Thread[] {
  const withScore = threads.map((t) => ({
    ...t,
    hotScore: t.upvotes + (t.stageTag === 'Struggle' ? 40 : 0) - t.daysAgo * 3,
  }));
  if (sort === 'new') return [...withScore].sort((a, b) => a.daysAgo - b.daysAgo);
  if (sort === 'top') return [...withScore].sort((a, b) => b.upvotes - a.upvotes);
  return [...withScore].sort((a, b) => b.hotScore - a.hotScore);
}

export function formatDaysAgo(days: number): string {
  if (days === 0) return 'just now';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
