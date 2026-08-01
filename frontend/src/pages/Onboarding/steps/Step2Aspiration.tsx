import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const EXAMPLES = [
  "I want to become an AI Engineer.",
  "I want to become healthier.",
  "I want to become a founder."
];

export const Step2Aspiration: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const [value, setValue] = useState(profile.aspiration || '');

  const handleNext = () => {
    if (value.trim()) {
      updateProfile({ aspiration: value });
      nextStep();
    }
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-8">Who do you want to become?</h2>
      <TextInput
        autoFocus
        placeholder="e.g. I want to become..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
      />
      
      <div className="mt-8 space-y-3">
        <p className="text-sm text-slate-500 font-medium">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setValue(ex)}
              className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

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
