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
      // For demo purposes, always generate a fresh user during onboarding submission
      // to ensure no stale token issues occur.
      const email = `demo${Date.now()}@example.com`;
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'demo' })
      });
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password: 'demo' })
      });
      const loginData = await loginRes.json();
      const token = loginData.access_token;
      localStorage.setItem('token', token);

      // 1. Start Onboarding
      await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: "Demo User", age: 25, occupation: "Professional" })
      });

      // 2. Save Onboarding
      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          aspirations: profile.aspiration ? [profile.aspiration] : [],
          interests: profile.interests || [],
          learning_style: profile.learningStyle || "",
          available_time: profile.availableTime || "",
          habits: profile.currentHabits || [],
          challenges: profile.currentChallenges || [],
          long_term_goal: profile.motivation || ""
        })
      });

      // 3. Complete Onboarding (Generates AI profile)
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      localStorage.removeItem('onboarding_state');
      
      // Redirect to dashboard after successful onboarding!
      window.location.href = '/dashboard';
    } catch (e) {
      console.error('Failed to submit profile', e);
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
