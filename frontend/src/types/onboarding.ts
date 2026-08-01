export type AspirationTimeframe = 'weeks' | 'months' | 'this_year' | 'someday';

export const TIMEFRAME_OPTIONS: { value: AspirationTimeframe; label: string }[] = [
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'this_year', label: 'This year' },
  { value: 'someday', label: 'Someday' },
];

export const TIMEFRAME_LABEL: Record<AspirationTimeframe, string> = {
  weeks: 'the next few weeks',
  months: 'the next few months',
  this_year: 'this year',
  someday: 'someday',
};

export interface OnboardingProfile {
  userId: string;
  name: string;
  aspiration: string;
  timeframe: AspirationTimeframe | '';
  habits: string[];
  stuckPoint: string;
  profileSummary: string;
}
