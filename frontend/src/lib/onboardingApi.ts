import { api } from './api';

// Mirrors backend/agents/identity/schemas.py::IdentityProfileResponse.
// Note: this response does NOT echo back aspirations/habits/challenges/
// available_time even though the DB row stores them — only full_name and
// the agent-generated fields. Anything else has to stay client-side.
export interface IdentityProfileResponse {
  id: string;
  user_id: string;
  full_name: string;
  onboarding_completed: boolean;
  identity_summary?: string | null;
  core_motivations?: string[] | null;
  personality_traits?: string[] | null;
  recommended_learning_approach?: string | null;
  growth_focus_areas?: string[] | null;
  confidence_score?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface OnboardingSavePayload {
  full_name?: string;
  age?: number;
  occupation?: string;
  aspirations?: string[];
  interests?: string[];
  current_skills?: string[];
  learning_style?: string;
  available_time?: string;
  strengths?: string[];
  weaknesses?: string[];
  habits?: string[];
  challenges?: string[];
  preferred_content_types?: string[];
  long_term_goal?: string;
}

// Creates the identity_profiles row. Throws (400) if one already exists
// for this user — callers should treat that as non-fatal.
export const startOnboardingProfile = (fullName: string, age?: number, occupation?: string) =>
  api.post<IdentityProfileResponse>('/api/onboarding/start', { full_name: fullName, age, occupation });

export const saveOnboardingProfile = (data: OnboardingSavePayload) =>
  api.put<IdentityProfileResponse>('/api/onboarding/update', data);

// Runs the LLM identity agent server-side and returns the generated summary.
export const completeOnboardingProfile = () =>
  api.post<IdentityProfileResponse>('/api/onboarding/complete');

export const getOnboardingProfile = () =>
  api.get<IdentityProfileResponse>('/api/onboarding/profile');
