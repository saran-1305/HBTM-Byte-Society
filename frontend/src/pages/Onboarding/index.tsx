import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { ProgressBar } from '@/components/ProgressBar';
import { OnboardingStep } from '@/types/onboarding';

// Steps
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2Aspiration } from './steps/Step2Aspiration';
import { Step3Motivation } from './steps/Step3Motivation';
import { Step4Habits } from './steps/Step4Habits';
import { Step5Challenges } from './steps/Step5Challenges';
import { Step6Interests } from './steps/Step6Interests';
import { Step7LearningStyle } from './steps/Step7LearningStyle';
import { Step8Time } from './steps/Step8Time';
import { Step9Finish } from './steps/Step9Finish';

export default function Onboarding() {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.Welcome:
        return <Step1Welcome />;
      case OnboardingStep.Aspiration:
        return <Step2Aspiration />;
      case OnboardingStep.Motivation:
        return <Step3Motivation />;
      case OnboardingStep.Habits:
        return <Step4Habits />;
      case OnboardingStep.Challenges:
        return <Step5Challenges />;
      case OnboardingStep.Interests:
        return <Step6Interests />;
      case OnboardingStep.LearningStyle:
        return <Step7LearningStyle />;
      case OnboardingStep.Time:
        return <Step8Time />;
      case OnboardingStep.Finish:
        return <Step9Finish />;
      default:
        return <Step1Welcome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full px-6 py-6 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {currentStep > OnboardingStep.Welcome && currentStep < OnboardingStep.Finish && (
            <ProgressBar currentStep={currentStep - 1} totalSteps={7} />
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col px-6 w-full max-w-4xl mx-auto overflow-hidden">
        {renderStep()}
      </main>
    </div>
  );
}
