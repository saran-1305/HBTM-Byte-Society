import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { OptionChip } from '@/components/OptionChip';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const TIME_OPTIONS = [
  '15 min',
  '30 min',
  '1 hour',
  '2+ hours'
];

export const Step8Time: React.FC = () => {
  const { profile, updateProfile, submitProfile, prevStep, isSubmitting } = useOnboarding();

  const handleSelect = (time: string) => {
    updateProfile({ availableTime: time });
  };

  const handleFinish = async () => {
    if (profile.availableTime) {
      await submitProfile();
    }
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-4">How much time can you dedicate daily?</h2>
      <p className="text-slate-500 mb-8">Select your available learning time.</p>
      
      <div className="flex flex-col gap-4">
        {TIME_OPTIONS.map((time) => (
          <OptionChip
            key={time}
            label={time}
            selected={profile.availableTime === time}
            onClick={() => handleSelect(time)}
            className="w-full text-lg py-4"
          />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button 
          onClick={handleFinish} 
          disabled={!profile.availableTime || isSubmitting} 
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Finish
        </Button>
      </div>
    </StepWrapper>
  );
};
