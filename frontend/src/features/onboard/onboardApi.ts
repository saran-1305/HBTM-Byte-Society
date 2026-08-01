import { TIMEFRAME_LABEL, type AspirationTimeframe } from '@/types/onboarding';
import { saveOnboardingProfile, completeOnboardingProfile } from '@/lib/onboardingApi';

interface OnboardPayload {
  user_id: string;
  full_name: string;
  aspiration: string;
  timeframe: AspirationTimeframe;
  habits: string[];
  stuck_point: string;
}

interface OnboardResponse {
  profile_summary: string;
}

// Same warm, specific-feeling summary the backend LLM agent is prompted to
// produce — used if the backend or the LLM providers are unreachable, so
// onboarding never gets stuck waiting on infrastructure.
function mockSummary(payload: OnboardPayload): string {
  const goal = payload.aspiration.trim().replace(/\.$/, '');
  const goalMidSentence = goal.charAt(0).toLowerCase() + goal.slice(1);
  const firstHabit = payload.habits[0];
  const habitLine = firstHabit
    ? ` Right now, time tends to go toward ${firstHabit.toLowerCase()} instead.`
    : '';
  const stuckPoint = payload.stuck_point.trim().replace(/\.$/, '');
  const stuckLine = stuckPoint ? ` ${stuckPoint} is the part that trips you up most.` : '';

  return (
    `You're working to become ${goalMidSentence}, over ${TIMEFRAME_LABEL[payload.timeframe]}.` +
    habitLine +
    stuckLine
  );
}

// Fills in the identity profile (created earlier on WelcomePage's
// start-onboarding call) and runs the real LLM identity agent. Falls back
// to a local template if the backend/LLM is unreachable.
export async function submitOnboarding(payload: OnboardPayload): Promise<OnboardResponse> {
  try {
    await saveOnboardingProfile({
      full_name: payload.full_name,
      aspirations: [payload.aspiration],
      long_term_goal: payload.aspiration,
      habits: payload.habits,
      challenges: payload.stuck_point ? [payload.stuck_point] : [],
      available_time: TIMEFRAME_LABEL[payload.timeframe],
    });
    const completed = await completeOnboardingProfile();
    return { profile_summary: completed.identity_summary || mockSummary(payload) };
  } catch (err) {
    console.error('Onboarding API unreachable, using local summary:', err);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { profile_summary: mockSummary(payload) };
  }
}
