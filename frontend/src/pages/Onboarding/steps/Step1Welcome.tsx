import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Step1Welcome: React.FC = () => {
  const { nextStep } = useOnboarding();

  return (
    <StepWrapper className="text-center mt-20">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl mb-6">Welcome to HBTM Byte Society</h1>
      <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
        We're building an AI agent tailored specifically to you. To do that, we need to get to know you better.
      </p>
      <Button size="lg" onClick={nextStep} rightIcon={<ArrowRight className="w-5 h-5" />}>
        Let's Begin
      </Button>
    </StepWrapper>
  );
};
