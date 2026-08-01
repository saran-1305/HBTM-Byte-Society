import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileSummary, setProfileSummary] = useState('');

  // Form State
  const [aspiration, setAspiration] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [habitInput, setHabitInput] = useState('');
  const [stuckPoint, setStuckPoint] = useState('');

  const timeframes = ['Weeks', 'Months', 'This year', 'Someday'];
  const habitPlaceholders = ['scrolling social media', 'long commute', 'late nights'];

  // Handle Enter Key Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (step === 1 && aspiration.trim()) handleNext();
        if (step === 2 && timeframe) handleNext();
        if (step === 4 && stuckPoint.trim()) submitForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, aspiration, timeframe, stuckPoint]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const addHabit = (h: string) => {
    if (h.trim() && !habits.includes(h.trim())) {
      setHabits([...habits, h.trim()]);
    }
    setHabitInput('');
  };

  const removeHabit = (h: string) => {
    setHabits(habits.filter((habit) => habit !== h));
  };

  const submitForm = () => {
    setStep(5);
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setProfileSummary(
        `Got it. A ${timeframe.toLowerCase()} journey to becoming a ${aspiration.split(' ')[0] || 'better version of yourself'}, despite the challenges of ${habits.length ? habits[0] : 'daily distractions'}.`
      );
      setIsSubmitting(false);
    }, 1800);
  };

  // Background color scales from dark slate to a slightly lighter blue/slate
  const getBackgroundColor = () => {
    switch (step) {
      case 1: return 'bg-[#0F172A]';
      case 2: return 'bg-[#141C34]';
      case 3: return 'bg-[#182341]';
      case 4: return 'bg-[#1C2A4D]';
      case 5: return 'bg-[#1E293B]';
      default: return 'bg-[#0F172A]';
    }
  };

  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${getBackgroundColor()} text-white flex flex-col font-sans`}>
      {/* Top Navigation */}
      <div className="pt-8 px-8 flex justify-between items-center max-w-4xl mx-auto w-full h-16">
        <div>
          {step > 1 && step < 5 && (
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Progress Dots */}
        {step < 5 && (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-indigo-500 w-4' : i < step ? 'bg-white/50' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
        <div className="w-10"></div> {/* Spacer to center dots */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-3xl mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Who are you trying to become?</h1>
                <p className="text-xl text-slate-400">Not your job title. The version of you that you're working toward.</p>
              </div>
              <textarea
                value={aspiration}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder="A writer who publishes every week"
                className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-slate-600 text-3xl md:text-4xl leading-relaxed py-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none overflow-hidden"
                rows={3}
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!aspiration.trim()}
                className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Continue <span className="text-indigo-300 text-sm ml-2 font-normal">Press Enter ↵</span>
              </button>
            </motion.div>
          )}

          {/* STEP 2: TIMEFRAME */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full space-y-8 text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">How far out are you imagining this?</h1>
              <div className="flex flex-wrap justify-center gap-4">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-8 py-5 rounded-2xl text-xl font-medium border-2 transition-all ${
                      timeframe === tf
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-105'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="pt-8 h-16">
                <AnimatePresence>
                  {timeframe && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={handleNext}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all"
                    >
                      Continue <span className="text-indigo-300 text-sm ml-2 font-normal">Press Enter ↵</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* STEP 3: HABITS */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What does your day actually look like right now?</h1>
                <p className="text-xl text-slate-400">Be honest — this helps us understand the gap.</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4 flex flex-wrap gap-2 items-center min-h-[80px]">
                <AnimatePresence>
                  {habits.map((habit) => (
                    <motion.div
                      key={habit}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-lg"
                    >
                      {habit}
                      <button onClick={() => removeHabit(habit)} className="hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <input
                  type="text"
                  value={habitInput}
                  onChange={(e) => setHabitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHabit(habitInput);
                    }
                  }}
                  placeholder={habits.length === 0 ? "Type a habit & press enter..." : "Add another..."}
                  className="flex-1 bg-transparent border-none text-white placeholder-slate-500 text-xl py-2 focus:outline-none min-w-[200px]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {habitPlaceholders.map((placeholder) => (
                  <button
                    key={placeholder}
                    onClick={() => addHabit(placeholder)}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2"
                  >
                    + {placeholder}
                  </button>
                ))}
              </div>

              <div className="pt-8">
                <button
                  onClick={handleNext}
                  disabled={habits.length === 0}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STUCK POINT */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full space-y-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Where do you get stuck most?</h1>
              <input
                type="text"
                value={stuckPoint}
                onChange={(e) => setStuckPoint(e.target.value)}
                placeholder="Starting is fine, finishing is the problem"
                className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-slate-600 text-3xl leading-relaxed py-4 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button
                onClick={submitForm}
                disabled={!stuckPoint.trim()}
                className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Complete <span className="text-indigo-300 text-sm ml-2 font-normal">Press Enter ↵</span>
              </button>
            </motion.div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full text-center space-y-8"
            >
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                  <h2 className="text-2xl font-medium text-slate-300">Getting to know you...</h2>
                </div>
              ) : (
                <div className="space-y-8 py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10" />
                  </div>
                  <p className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-200 max-w-2xl mx-auto">
                    "{profileSummary}"
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-8 bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105"
                  >
                    Enter DASKALOS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardFlow;
