import { api } from './api';

// backend/api/activity_router.py — start/complete have no declared
// response_model (return whatever the service dict is), so these are kept
// loosely typed; callers treat them as fire-and-best-effort.
export const startActivity = (userId: string, recommendationId: string) =>
  api.post<unknown>(`/api/activity/${userId}/start`, { recommendation_id: recommendationId });

export const completeActivity = (userId: string, recommendationId: string) =>
  api.post<unknown>(`/api/activity/${userId}/complete`, { recommendation_id: recommendationId });

export interface ReflectionSubmitPayload {
  recommendation_id: string;
  biggest_insight: string;
  confusion: string;
  application: string;
}

// Mirrors backend/schemas/activity.py::ReflectionAnalysis
export interface ReflectionAnalysis {
  understanding: string; // "High" | "Medium" | "Low"
  confidence: string;
  actionability: string;
  summary: string;
}

export interface ReflectionSubmitResponse {
  status: string;
  progress_added: number;
  promoted: boolean;
  analysis: ReflectionAnalysis;
}

// Real reflections move real progress server-side (backend/services/
// activity_service.py calls growth_service.apply_progress and can promote
// the user to the next stage), so this is the one call in the app that can
// change what /api/arc/{user_id} returns on next load.
export const submitReflectionActivity = (userId: string, payload: ReflectionSubmitPayload) =>
  api.post<ReflectionSubmitResponse>(`/api/activity/${userId}/reflection`, payload);
