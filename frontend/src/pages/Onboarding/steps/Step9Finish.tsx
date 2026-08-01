import React, { useEffect } from 'react';
import { StepWrapper } from '@/components/StepWrapper';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Step9Finish: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <StepWrapper className="text-center mt-12 sm:mt-20 px-4">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 relative">
          <div className="absolute inset-0 rounded-full bg-indigo-200 animate-ping opacity-60" />
          <Sparkles className="w-10 h-10 relative z-10" />
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl mb-4">Building your profile now.</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
        Your dashboard will be ready in a moment.
      </p>
    </StepWrapper>
  );
};
