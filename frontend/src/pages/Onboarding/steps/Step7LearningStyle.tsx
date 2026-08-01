import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { OptionChip } from '@/components/OptionChip';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const LEARNING_STYLES = [
  'Reading',
  'Watching',
  'Listening',
  'Doing',
  'Mixed'
];

export const Step7LearningStyle: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();

  const handleSelect = (style: string) => {
    updateProfile({ learningStyle: style });
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-4">What is your preferred learning style?</h2>
      <p className="text-slate-500 mb-8">Select one.</p>
      
      <div className="flex flex-col gap-4">
        {LEARNING_STYLES.map((style) => (
          <OptionChip
            key={style}
            label={style}
            selected={profile.learningStyle === style}
            onClick={() => handleSelect(style)}
            className="w-full text-lg py-4"
          />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={!profile.learningStyle} 
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      </div>
    </StepWrapper>
  );
};
