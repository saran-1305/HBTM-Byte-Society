import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { OptionChip } from '@/components/OptionChip';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PREDEFINED_INTERESTS = [
  'Technology',
  'Business',
  'Fitness',
  'Psychology',
  'Finance',
  'Writing',
  'Design'
];

export const Step6Interests: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const selectedInterests = profile.interests || [];

  const toggleInterest = (interest: string) => {
    const isSelected = selectedInterests.includes(interest);
    let newInterests;
    if (isSelected) {
      newInterests = selectedInterests.filter(i => i !== interest);
    } else {
      newInterests = [...selectedInterests, interest];
    }
    updateProfile({ interests: newInterests });
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-4">What are your interests?</h2>
      <p className="text-slate-500 mb-8">Select all that apply.</p>
      
      <div className="flex flex-wrap gap-4">
        {PREDEFINED_INTERESTS.map((interest) => (
          <OptionChip
            key={interest}
            label={interest}
            selected={selectedInterests.includes(interest)}
            onClick={() => toggleInterest(interest)}
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
