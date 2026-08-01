import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { cn } from '@/lib/cn';
import { Button } from '@/components/Button';
import { TIMEFRAME_OPTIONS, type AspirationTimeframe } from '@/types/onboarding';
import { submitOnboarding } from './onboardApi';

const EXAMPLE_HABITS = ['scrolling social media', 'long commute', 'late nights'];

const STEP_THEME = [
  {
    bg: 'bg-slate-900',
    heading: 'text-white',
    body: 'text-slate-400',
    dot: 'bg-white',
    dotIdle: 'bg-white/20',
    iconBtn: 'text-white/60 hover:text-white',
    cta: 'bg-white text-slate-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40',
    chipIdle: '',
    chipActive: '',
  },
  {
    bg: 'bg-slate-800',
    heading: 'text-white',
    body: 'text-slate-400',
    dot: 'bg-white',
    dotIdle: 'bg-white/20',
    iconBtn: 'text-white/60 hover:text-white',
    cta: 'bg-white text-slate-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40',
    chipIdle: 'border-white/15 bg-white/5 text-white hover:border-white/30',
    chipActive: 'border-white bg-white text-slate-900',
  },
  {
    bg: 'bg-slate-600',
    heading: 'text-white',
    body: 'text-slate-300',
    dot: 'bg-white',
    dotIdle: 'bg-white/25',
    iconBtn: 'text-white/70 hover:text-white',
    cta: 'bg-white text-slate-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40',
    chipIdle: '',
    chipActive: '',
  },
  {
    bg: 'bg-slate-200',
    heading: 'text-slate-900',
    body: 'text-slate-600',
    dot: 'bg-slate-900',
    dotIdle: 'bg-slate-400',
    iconBtn: 'text-slate-500 hover:text-slate-900',
    cta: '',
    chipIdle: '',
    chipActive: '',
  },
  {
    bg: 'bg-slate-50',
    heading: 'text-slate-900',
    body: 'text-slate-500',
    dot: 'bg-indigo-500',
    dotIdle: 'bg-slate-300',
    iconBtn: 'text-slate-500 hover:text-slate-900',
    cta: '',
    chipIdle: '',
    chipActive: '',
  },
];

export default function OnboardFlow() {
  const navigate = useNavigate();
  const { profile, updateProfile, completeOnboarding } = useOnboarding();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [aspiration, setAspiration] = useState('');
  const [timeframe, setTimeframe] = useState<AspirationTimeframe | ''>('');
  const [habits, setHabits] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [stuckPoint, setStuckPoint] = useState('');

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const submittedRef = useRef(false);

  // The flow requires a session started on the Welcome screen
  useEffect(() => {
    if (!profile.userId) navigate('/', { replace: true });
  }, [profile.userId, navigate]);

  useEffect(() => {
    if (step !== 5 || submittedRef.current) return;
    submittedRef.current = true;
    setLoading(true);
    submitOnboarding({
      user_id: profile.userId ?? '',
      aspiration,
      timeframe: timeframe as AspirationTimeframe,
      habits,
      stuck_point: stuckPoint,
    }).then((res) => {
      setSummary(res.profile_summary);
      updateProfile({ aspiration, timeframe: timeframe as AspirationTimeframe, habits, stuckPoint });
      completeOnboarding(res.profile_summary);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canAdvance = () => {
    switch (step) {
      case 1: return aspiration.trim().length > 0;
      case 2: return timeframe !== '';
      case 3: return habits.length > 0;
      case 4: return stuckPoint.trim().length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const addHabit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || habits.includes(trimmed)) return;
    setHabits((prev) => [...prev, trimmed]);
  };

  const removeHabit = (habit: string) => {
    setHabits((prev) => prev.filter((h) => h !== habit));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHabit(tagDraft);
      setTagDraft('');
    } else if (e.key === 'Backspace' && !tagDraft && habits.length > 0) {
      removeHabit(habits[habits.length - 1]);
    }
  };

  // Enter advances to the next step, except where a field needs Enter for its own purpose
  // (multi-line text, or committing a tag): those handle it locally.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || step === 5) return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === 'TEXTAREA' || tag === 'BUTTON' || active?.getAttribute('data-tag-input') === 'true') return;
      if (canAdvance()) goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, aspiration, timeframe, habits, stuckPoint]);

  const theme = STEP_THEME[step - 1];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h1 className={cn('text-3xl sm:text-5xl font-serif font-bold mb-4 leading-tight', theme.heading)}>
              Who are you trying to become?
            </h1>
            <p className={cn('text-base sm:text-lg mb-8 leading-relaxed max-w-xl', theme.body)}>
              Not your job title. The version of you that you're working toward.
            </p>
            <textarea
              autoFocus
              rows={4}
              value={aspiration}
              onChange={(e) => setAspiration(e.target.value)}
              placeholder="A writer who publishes every week"
              className={cn(
                'w-full bg-transparent border-0 border-b-2 border-white/20 py-3 text-xl sm:text-2xl font-serif leading-relaxed resize-none placeholder:text-white/30 focus:outline-none focus:ring-0 focus:border-white transition-colors',
                theme.heading
              )}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h1 className={cn('text-3xl sm:text-5xl font-serif font-bold mb-8 sm:mb-10 leading-tight', theme.heading)}>
              How far out are you imagining this?
            </h1>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeframe(opt.value)}
                  className={cn(
                    'rounded-2xl border-2 px-5 py-6 sm:py-8 text-lg sm:text-xl font-medium transition-all duration-200',
                    timeframe === opt.value ? theme.chipActive : theme.chipIdle
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h1 className={cn('text-3xl sm:text-5xl font-serif font-bold mb-4 leading-tight', theme.heading)}>
              What does your day actually look like right now?
            </h1>
            <p className={cn('text-base sm:text-lg mb-8 leading-relaxed max-w-xl', theme.body)}>
              Be honest. It helps us understand the gap.
            </p>
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-white/70 pb-4 mb-4">
              {habits.map((habit) => (
                <span
                  key={habit}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium bg-white text-slate-900"
                >
                  {habit}
                  <button
                    type="button"
                    onClick={() => removeHabit(habit)}
                    aria-label={`Remove ${habit}`}
                    className="hover:opacity-60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <input
                data-tag-input="true"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={habits.length === 0 ? 'Type a habit and press Enter' : 'Add another'}
                className={cn(
                  'flex-1 min-w-[140px] bg-transparent focus:outline-none text-base sm:text-lg py-1.5 placeholder:text-white/40',
                  theme.heading
                )}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_HABITS.filter((h) => !habits.includes(h)).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => addHabit(h)}
                  className="text-sm px-3 py-1.5 rounded-full border border-dashed border-white/25 text-white/70 hover:border-white/50 hover:text-white transition-colors"
                >
                  + {h}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h1 className={cn('text-3xl sm:text-5xl font-serif font-bold mb-8 leading-tight', theme.heading)}>
              Where do you get stuck most?
            </h1>
            <input
              autoFocus
              value={stuckPoint}
              onChange={(e) => setStuckPoint(e.target.value)}
              placeholder="Starting is fine, finishing is the problem"
              className={cn(
                'w-full bg-transparent border-0 border-b-2 border-slate-400 py-3 text-xl sm:text-2xl font-serif placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-900 transition-colors',
                theme.heading
              )}
            />
          </div>
        );
      case 5:
        return (
          <div className="text-center flex flex-col items-center">
            {loading ? (
              <>
                <div className="w-14 h-14 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin mb-6" />
                <p className="text-lg sm:text-xl font-serif text-slate-600">Getting to know you...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-8 max-w-xl leading-snug">
                  Got it. {summary}
                </p>
                <Button size="lg" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Enter Daskalos
                </Button>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('min-h-screen flex flex-col transition-colors duration-500', theme.bg)}>
      <header className="w-full px-5 sm:px-8 py-6 flex items-center justify-between shrink-0">
        {step > 1 && step < 5 ? (
          <button
            onClick={goBack}
            aria-label="Back"
            className={cn('p-2 -ml-2 rounded-full transition-colors', theme.iconBtn)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn('w-1.5 h-1.5 rounded-full transition-colors', i === step - 1 ? theme.dot : theme.dotIdle)}
            />
          ))}
        </div>

        <div className="w-9" />
      </header>

      <main className="flex-1 flex items-center px-5 sm:px-8 pb-16">
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {step < 5 && (
            <div className="mt-10 sm:mt-12 flex justify-end">
              <Button
                size="lg"
                onClick={goNext}
                disabled={!canAdvance()}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className={theme.cta}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
