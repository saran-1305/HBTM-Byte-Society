import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const { startOnboarding } = useOnboarding();
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (!name.trim()) return;
    startOnboarding(name.trim());
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 sm:px-6 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md flex flex-col items-center"
      >
        <motion.div
          variants={item}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-8"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>

        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4 leading-tight"
        >
          Welcome to Daskalos
        </motion.h1>

        <motion.p variants={item} className="text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          Your AI companion for becoming who you're trying to be.
        </motion.p>

        <motion.div variants={item} className="w-full flex flex-col items-center gap-4">
          {!showNameInput ? (
            <Button
              size="lg"
              onClick={() => setShowNameInput(true)}
              className="w-full sm:w-auto px-10 bg-white text-slate-900 hover:bg-slate-100"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get started
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full flex flex-col gap-4"
            >
              <TextInput
                autoFocus
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleContinue();
                }}
                className="text-center text-xl text-white placeholder:text-slate-500 border-slate-700 focus:border-white"
              />
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!name.trim()}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
