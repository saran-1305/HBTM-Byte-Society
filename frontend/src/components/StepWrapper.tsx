import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

interface StepWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({ children, className }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn('w-full max-w-2xl mx-auto py-8', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
