import type { OnboardingProfile } from '@/types/onboarding';

// Matches backend/data/arc_config.py::StageName exactly (explore, commit,
// struggle, breakthrough, integrate) — display labels only differ in case.
export const STAGES = ['Explore', 'Commit', 'Struggle', 'Breakthrough', 'Integrate'] as const;
export type Stage = (typeof STAGES)[number];

// Mirrors the backend STAGE_CONFIG table: one engine, parameterized by stage,
// rather than four separate hardcoded branches. Drives real UI behavior
// (wildcard cadence, which content type leads the feed) instead of just
// being prose about a "different engine per stage."
export interface StageConfig {
  primaryType: 'media' | 'knowledge' | 'experience' | 'community_thread';
  typeWeights: Record<string, number>;
  wildcardFrequency: number; // 0 = no wildcards this stage
  refusalSensitivity: 'low' | 'high';
  driftCheckEnabled: boolean;
  feel: string;
}

export const STAGE_CONFIG: Record<Stage, StageConfig> = {
  Explore: {
    primaryType: 'media',
    typeWeights: { media: 0.7, knowledge: 0.2, experience: 0.1 },
    wildcardFrequency: 3,
    refusalSensitivity: 'low',
    driftCheckEnabled: false,
    feel: 'Open, low-pressure, breadth over depth.',
  },
  Commit: {
    primaryType: 'experience',
    typeWeights: { media: 0.2, knowledge: 0.2, experience: 0.6 },
    wildcardFrequency: 6,
    refusalSensitivity: 'low',
    driftCheckEnabled: true,
    feel: 'Tactical, small concrete reps, low-friction asks.',
  },
  Struggle: {
    primaryType: 'knowledge',
    typeWeights: { media: 0.1, knowledge: 0.6, experience: 0.3 },
    wildcardFrequency: 4,
    refusalSensitivity: 'high',
    driftCheckEnabled: true,
    feel: 'Honest, reframing, never toxic positivity.',
  },
  Breakthrough: {
    primaryType: 'media',
    typeWeights: { media: 0.6, knowledge: 0.1, experience: 0.3 },
    wildcardFrequency: 5,
    refusalSensitivity: 'low',
    driftCheckEnabled: true,
    feel: 'Confident, demanding — you have earned harder content.',
  },
  Integrate: {
    primaryType: 'community_thread',
    typeWeights: { community_thread: 1.0 },
    wildcardFrequency: 0,
    refusalSensitivity: 'low',
    driftCheckEnabled: false,
    feel: "The curator stops feeding you content and starts pointing you at people.",
  },
};

// Local fallback heuristic, used when the real /api/arc/{user_id} call is
// unavailable: no goal yet -> Explore, goal but no named obstacle -> Commit,
// obstacle named -> Struggle, then reflecting regularly against that
// obstacle moves through Breakthrough and eventually Integrate.
export const getStageIndex = (profile: Partial<OnboardingProfile>, reflectionCount: number): number => {
  if (!profile.aspiration) return 0;
  if (!profile.stuckPoint) return 1;
  if (reflectionCount >= 7) return 4;
  if (reflectionCount >= 3) return 3;
  return 2;
};
