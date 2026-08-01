import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const Step3Motivation: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const [value, setValue] = useState(profile.motivation || '');

  const handleNext = () => {
    if (value.trim()) {
      updateProfile({ motivation: value });
      nextStep();
    }
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-8">Why is this important to you?</h2>
      <TextInput
        autoFocus
        placeholder="Because I want to..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
      />
      
      <div className="mt-12 flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!value.trim()} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Continue
        </Button>
      </div>
    </StepWrapper>
  );
};
