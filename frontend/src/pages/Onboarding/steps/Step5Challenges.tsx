import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { OptionChip } from '@/components/OptionChip';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PREDEFINED_CHALLENGES = [
  'Procrastination',
  'Distraction',
  'Lack of consistency',
  'No mentor',
  'Information overload'
];

export const Step5Challenges: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const selectedChallenges = profile.currentChallenges || [];

  const toggleChallenge = (challenge: string) => {
    const isSelected = selectedChallenges.includes(challenge);
    let newChallenges;
    if (isSelected) {
      newChallenges = selectedChallenges.filter(c => c !== challenge);
    } else {
      newChallenges = [...selectedChallenges, challenge];
    }
    updateProfile({ currentChallenges: newChallenges });
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-4">What are your current challenges?</h2>
      <p className="text-slate-500 mb-8">Select all that apply.</p>
      
      <div className="flex flex-wrap gap-4">
        {PREDEFINED_CHALLENGES.map((challenge) => (
          <OptionChip
            key={challenge}
            label={challenge}
            selected={selectedChallenges.includes(challenge)}
            onClick={() => toggleChallenge(challenge)}
          />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Continue
        </Button>
      </div>
    </StepWrapper>
  );
};
