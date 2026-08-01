import React, { createContext, useContext, useState, useEffect } from 'react';
import { type OnboardingProfile, OnboardingStep } from '@/types/onboarding';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  profile: Partial<OnboardingProfile>;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<OnboardingProfile>) => void;
  submitProfile: () => Promise<void>;
  isSubmitting: boolean;
}

const defaultProfile: Partial<OnboardingProfile> = {
  currentHabits: [],
  currentChallenges: [],
  interests: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.Welcome);
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>(defaultProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.profile) setProfile({ ...defaultProfile, ...parsed.profile });
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('onboarding_state', JSON.stringify({ currentStep, profile }));
  }, [currentStep, profile]);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, OnboardingStep.Finish));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, OnboardingStep.Welcome));
  };

  const updateProfile = (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting profile:', profile);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Clear local storage after successful submission
      localStorage.removeItem('onboarding_state');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        profile,
        nextStep,
        prevStep,
        updateProfile,
        submitProfile,
        isSubmitting,
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
