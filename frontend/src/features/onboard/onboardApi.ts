import { TIMEFRAME_LABEL, type AspirationTimeframe } from '@/types/onboarding';

interface OnboardPayload {
  user_id: string;
  aspiration: string;
  timeframe: AspirationTimeframe;
  habits: string[];
  stuck_point: string;
}

interface OnboardResponse {
  profile_summary: string;
}

// POST /api/onboard isn't wired up on the backend yet, so this mocks a
// warm, specific-feeling summary from the same signals the real endpoint would use.
export async function submitOnboarding(payload: OnboardPayload): Promise<OnboardResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const goal = payload.aspiration.trim().replace(/\.$/, '');
  const goalMidSentence = goal.charAt(0).toLowerCase() + goal.slice(1);
  const firstHabit = payload.habits[0];
  const habitLine = firstHabit
    ? ` Right now, time tends to go toward ${firstHabit.toLowerCase()} instead.`
    : '';
  const stuckPoint = payload.stuck_point.trim().replace(/\.$/, '');
  const stuckLine = stuckPoint ? ` ${stuckPoint} is the part that trips you up most.` : '';

  const profile_summary =
    `You're working to become ${goalMidSentence}, over ${TIMEFRAME_LABEL[payload.timeframe]}.` +
    habitLine +
    stuckLine;

  return { profile_summary };
}
