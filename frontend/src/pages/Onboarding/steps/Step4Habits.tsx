import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { StepWrapper } from '@/components/StepWrapper';
import { Button } from '@/components/Button';
import { OptionChip } from '@/components/OptionChip';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PREDEFINED_HABITS = [
  'Reading',
  'Gym',
  'Meditation',
  'Coding',
  'Journaling'
];

export const Step4Habits: React.FC = () => {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const selectedHabits = profile.currentHabits || [];

  const toggleHabit = (habit: string) => {
    const isSelected = selectedHabits.includes(habit);
    let newHabits;
    if (isSelected) {
      newHabits = selectedHabits.filter(h => h !== habit);
    } else {
      newHabits = [...selectedHabits, habit];
    }
    updateProfile({ currentHabits: newHabits });
  };

  return (
    <StepWrapper>
      <h2 className="text-3xl mb-4">What are your current habits?</h2>
      <p className="text-slate-500 mb-8">Select all that apply.</p>
      
      <div className="flex flex-wrap gap-4">
        {PREDEFINED_HABITS.map((habit) => (
          <OptionChip
            key={habit}
            label={habit}
            selected={selectedHabits.includes(habit)}
            onClick={() => toggleHabit(habit)}
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
