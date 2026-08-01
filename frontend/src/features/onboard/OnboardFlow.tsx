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

  const submitForm = async () => {
    setStep(5);
    setIsSubmitting(true);
    try {
      // 1. Register guest user and get a token
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${localStorage.getItem('daskalos_user_id')}@daskalos.ai`,
          password: 'daskalos_default_pw',
          name: localStorage.getItem('daskalos_user_name') || 'Learner',
        }),
      });
      let token = '';
      if (registerRes.ok) {
        const regData = await registerRes.json();
        token = regData.access_token;
        localStorage.setItem('token', token);
      } else {
        // Already registered, try login
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `${localStorage.getItem('daskalos_user_id')}@daskalos.ai`,
            password: 'daskalos_default_pw',
          }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          token = loginData.access_token;
          localStorage.setItem('token', token);
        }
      }

      const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      // 2. Start onboarding session
      await fetch('/api/onboarding/start', { method: 'POST', headers: authHeaders });

      // 3. Save answers
      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          long_term_goal: aspiration,
          timeframe,
          current_habits: habits,
          stuck_points: stuckPoint,
          interests: [aspiration],
        }),
      });

      // 4. Complete onboarding → triggers AI identity generation
      const completeRes = await fetch('/api/onboarding/complete', { method: 'POST', headers: authHeaders });
      if (completeRes.ok) {
        const completeData = await completeRes.json();
        setProfileSummary(
          completeData.identity_summary ||
          `Got it. A ${timeframe.toLowerCase()} journey to becoming ${aspiration}, despite the challenges of ${habits.length ? habits[0] : 'daily distractions'}.`
        );
      } else {
        setProfileSummary(
          `Got it. A ${timeframe.toLowerCase()} journey to becoming ${aspiration || 'your best self'}, despite ${habits.length ? habits[0] : 'daily distractions'}.`
        );
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setProfileSummary(`A ${timeframe.toLowerCase()} journey to becoming ${aspiration || 'your best self'}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out bg-[#000000] text-white flex flex-col font-sans`}>
      {/* Top Navigation */}
      <div className="pt-8 px-8 flex justify-between items-center max-w-4xl mx-auto w-full h-16">
        <div>
          {step > 1 && step < 5 && (
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center text-[#666666] hover:text-white"
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
                  i === step ? 'bg-white w-4' : i < step ? 'bg-white/50' : 'bg-white/10'
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
                <p className="text-xl text-[#999999]">Not your job title. The version of you that you're working toward.</p>
              </div>
              <textarea
                value={aspiration}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder="A writer who publishes every week"
                className="w-full bg-transparent border-b-2 border-[#333333] text-white placeholder-[#666666] text-3xl md:text-4xl leading-relaxed py-4 focus:outline-none focus:border-white transition-colors resize-none overflow-hidden"
                rows={3}
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!aspiration.trim()}
                className="mt-8 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                Continue <span className="text-[#666666] text-sm ml-2 font-bold">Press Enter ↵</span>
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
                    className={`px-8 py-5 rounded-2xl text-xl font-bold border-2 transition-all ${
                      timeframe === tf
                        ? 'bg-white border-white text-black scale-105'
                        : 'bg-transparent border-[#333333] text-[#999999] hover:bg-white/10 hover:border-[#666666]'
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
                      className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
                    >
                      Continue <span className="text-[#666666] text-sm ml-2 font-bold">Press Enter ↵</span>
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
                <p className="text-xl text-[#999999]">Be honest — this helps us understand the gap.</p>
              </div>
              
              <div className="bg-[#121212] rounded-2xl border border-transparent focus-within:border-white transition-colors p-4 flex flex-wrap gap-2 items-center min-h-[80px]">
                <AnimatePresence>
                  {habits.map((habit) => (
                    <motion.div
                      key={habit}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-lg"
                    >
                      {habit}
                      <button onClick={() => removeHabit(habit)} className="hover:text-red-400 transition-colors">
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
                  className="flex-1 bg-transparent border-none text-white placeholder-[#666666] text-xl py-2 focus:outline-none min-w-[200px]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {habitPlaceholders.map((placeholder) => (
                  <button
                    key={placeholder}
                    onClick={() => addHabit(placeholder)}
                    className="bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white border border-white/10 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    + {placeholder}
                  </button>
                ))}
              </div>

              <div className="pt-8">
                <button
                  onClick={handleNext}
                  disabled={habits.length === 0}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
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
                className="w-full bg-transparent border-b-2 border-[#333333] text-white placeholder-[#666666] text-3xl leading-relaxed py-4 focus:outline-none focus:border-white transition-colors"
                autoFocus
              />
              <button
                onClick={submitForm}
                disabled={!stuckPoint.trim()}
                className="mt-8 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                Complete <span className="text-[#666666] text-sm ml-2 font-bold">Press Enter ↵</span>
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
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <h2 className="text-2xl font-bold text-white">Getting to know you...</h2>
                </div>
              ) : (
                <div className="space-y-8 py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white max-w-2xl mx-auto">
                    "{profileSummary}"
                  </p>
                  <button
                    onClick={() => navigate('/profile/setup')}
                    className="mt-8 bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-200 transition-all"
                  >
                    Continue Setup
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
