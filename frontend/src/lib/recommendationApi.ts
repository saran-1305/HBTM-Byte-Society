import { api } from './api';
import type { Recommendation } from './recommendations';

// Mirrors backend/schemas/candidate.py
export interface BackendRecommendationItem {
  id: string;
  title: string;
  description: string;
  author: string;
  url: string;
  thumbnail: string;
  content_type: string;
  domain: string;
  stage: string;
  estimated_time: string;
  difficulty: string;
  tags: string[];
}

export interface ScoreBreakdown {
  stage: number;
  domain: number;
  history: number;
  difficulty: number;
  total: number; // ~32-100, see backend/services/ranking_service.py weights
}

export interface RecommendationResponse {
  recommendation: BackendRecommendationItem;
  score_breakdown: ScoreBreakdown;
}

export interface RankedCandidate {
  candidate: BackendRecommendationItem;
  scores: ScoreBreakdown;
}

export interface CandidateListResponse {
  candidates: RankedCandidate[];
}

// Mirrors backend/schemas/curator.py — the LLM-generated narrative layer
// on top of the deterministic recommendation.
export interface CuratorReasoning {
  title: string;
  summary: string;
  why_now: string;
  learning_focus: string;
  next_action: string;
  reflection_question: string;
  estimated_outcome: string;
  confidence: string;
}

export interface CuratorResponse {
  recommendation: BackendRecommendationItem;
  curator: CuratorReasoning;
}

export const getTopRecommendation = (userId: string) =>
  api.get<RecommendationResponse>(`/api/recommendation/${userId}`);

export const getCandidates = (userId: string) =>
  api.get<CandidateListResponse>(`/api/recommendation/${userId}/candidates`);

export const getCuratedRecommendation = (userId: string) =>
  api.get<CuratorResponse>(`/api/curator/${userId}`);

const TYPE_MAP: Record<string, 'book' | 'video' | 'article' | 'audio'> = {
  book: 'book',
  article: 'article',
  video: 'video',
  audio: 'audio',
  podcast: 'audio',
};

// Backend content shape -> the frontend's existing Recommendation shape, so
// MediaGrid/pages built against lib/recommendations.ts keep working
// unchanged whether the data came from the mock library or the real API.
export function toFrontendRecommendation(item: BackendRecommendationItem, scoreTotal?: number): Recommendation {
  return {
    id: item.id,
    type: TYPE_MAP[item.content_type.toLowerCase()] ?? 'article',
    title: item.title,
    author: item.author,
    topic: item.domain,
    fit: scoreTotal !== undefined ? Math.round(Math.min(100, Math.max(0, scoreTotal))) : 75,
    duration: item.estimated_time,
    thumbnail: item.thumbnail,
    url: item.url,
    description: item.description,
  };
}
