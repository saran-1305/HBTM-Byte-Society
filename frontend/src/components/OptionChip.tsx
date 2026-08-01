import React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface OptionChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  label: string;
}

export const OptionChip: React.FC<OptionChipProps> = ({ selected = false, label, className, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        'relative inline-flex items-center px-4 py-3 rounded-full border text-base font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        selected
          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        className
      )}
      {...props}
    >
      <span className="flex-1 pr-6 text-left">{label}</span>
      <div className="absolute right-4 flex items-center justify-center">
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Check className="w-4 h-4 text-indigo-600" />
          </motion.div>
        )}
      </div>
    </button>
  );
};
