import React from 'react';
import { cn } from '@/lib/cn';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full bg-transparent border-0 border-b-2 border-white/20 py-3 text-2xl font-sans text-white placeholder:text-white/30 transition-colors focus:ring-0 focus:border-spotlight focus:outline-none',
            error && 'border-spotlight focus:border-spotlight',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
