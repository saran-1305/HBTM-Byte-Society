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
            'w-full bg-transparent border-0 border-b-2 border-slate-200 py-3 text-2xl font-serif text-slate-900 placeholder:text-slate-300 transition-colors focus:ring-0 focus:border-indigo-500 focus:outline-none',
            error && 'border-red-500 focus:border-red-500',
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
