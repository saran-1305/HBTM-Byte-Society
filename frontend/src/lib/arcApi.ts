import { api } from './api';

// Mirrors backend/schemas/stage.py::StageConfigResponse
export interface StageConfigResponse {
  name: string;
  description: string;
  primary_content_type: string;
  secondary_content_type: string;
  reflection_enabled: boolean;
  wildcard_frequency: number;
  stage_color: string;
  stage_icon: string;
}

export type BackendStageName = 'explore' | 'commit' | 'struggle' | 'breakthrough' | 'integrate';

// Mirrors backend/schemas/arc.py::ArcResponse
export interface ArcResponse {
  current_stage: BackendStageName;
  progress: number; // 0-1, progress within current_stage
  config: StageConfigResponse;
}

export interface StageTransition {
  from_stage: string;
  to_stage: string;
  completed_at: string;
}

// Mirrors the ad-hoc dict returned by GET /api/arc/status/{user_id}
export interface ArcStatusResponse {
  current_stage: string;
  progress: number;
  unlocked_stages: string[];
  next_stage: string | null;
  stage_history: StageTransition[];
}

export const getArcState = (userId: string) => api.get<ArcResponse>(`/api/arc/${userId}`);
export const getArcStatus = (userId: string) => api.get<ArcStatusResponse>(`/api/arc/status/${userId}`);

// "explore" -> "Explore" — matches the frontend's STAGES display casing.
export const toDisplayStage = (backendStage: string): string =>
  backendStage.charAt(0).toUpperCase() + backendStage.slice(1).toLowerCase();
