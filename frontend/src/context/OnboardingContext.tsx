import React, { createContext, useContext, useState, useEffect } from 'react';
import { type OnboardingProfile } from '@/types/onboarding';

interface OnboardingContextType {
  profile: Partial<OnboardingProfile>;
  updateProfile: (data: Partial<OnboardingProfile>) => void;
  startOnboarding: (name: string) => string;
  completeOnboarding: (profileSummary: string) => void;
  isOnboardingComplete: boolean;
}

const defaultProfile: Partial<OnboardingProfile> = {
  habits: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>(defaultProfile);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile({ ...defaultProfile, ...parsed.profile });
        if (parsed.isComplete) setIsOnboardingComplete(true);
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
      }
    }
  }, []);

  // Save to local storage on any change
  useEffect(() => {
    localStorage.setItem(
      'onboarding_state',
      JSON.stringify({ profile, isComplete: isOnboardingComplete })
    );
  }, [profile, isOnboardingComplete]);

  const updateProfile = (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  // Called from WelcomePage: generates a local user_id, no real auth
  const startOnboarding = (name: string) => {
    const userId = crypto.randomUUID();
    setProfile((prev) => ({ ...prev, userId, name }));
    return userId;
  };

  const completeOnboarding = (profileSummary: string) => {
    setProfile((prev) => ({ ...prev, profileSummary }));
    setIsOnboardingComplete(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        profile,
        updateProfile,
        startOnboarding,
        completeOnboarding,
        isOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
