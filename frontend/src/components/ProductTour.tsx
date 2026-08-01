import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { cn } from '@/lib/cn';

const STEPS = [
  { title: 'Search is tab-specific', body: "Press ⌘K (or Ctrl+K) anywhere. Every tab searches its own content — there's no generic nav list to dig through." },
  { title: 'Track your stage', body: 'The bar on Dashboard and your Arc shows where you are across the 5-stage journey, and moves as you reflect.' },
  { title: 'Make it yours', body: "Bookmark picks, mark ones you don't want, and tune notifications any time from Settings." },
];

export function ProductTour() {
  const { profile, isOnboardingComplete, hasSeenTour, markTourSeen } = useOnboarding();
  const [step, setStep] = useState(0);

  const shouldShow = isOnboardingComplete && !!profile.aspiration && !hasSeenTour;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="tour"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="dialog"
          aria-label="Product tour"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm bg-surface rounded-2xl shadow-2xl p-5 border border-white/10"
        >
          <button
            type="button"
            onClick={markTourSeen}
            aria-label="Close tour"
            className="absolute top-3 right-3 text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs font-semibold text-spotlight uppercase tracking-wider mb-1.5">{step + 1} of {STEPS.length}</p>
          <h2 className="text-sm font-bold text-white mb-1.5 pr-6">{current.title}</h2>
          <p className="text-sm text-white/70 leading-relaxed mb-4">{current.body}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <span key={i} className={cn('w-1.5 h-1.5 rounded-full', i === step ? 'bg-spotlight' : 'bg-white/15')} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => (isLast ? markTourSeen() : setStep((s) => s + 1))}
              className="text-sm font-semibold text-white bg-spotlight hover:bg-spotlight-dark px-4 py-1.5 rounded-full transition-colors"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
