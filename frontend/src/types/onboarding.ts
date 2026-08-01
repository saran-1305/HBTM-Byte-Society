export interface OnboardingProfile {
  aspiration: string;
  motivation: string;
  currentHabits: string[];
  currentChallenges: string[];
  interests: string[];
  learningStyle: string;
  availableTime: string;
}

export enum OnboardingStep {
  Welcome = 1,
  Aspiration = 2,
  Motivation = 3,
  Habits = 4,
  Challenges = 5,
  Interests = 6,
  LearningStyle = 7,
  Time = 8,
  Finish = 9,
}
