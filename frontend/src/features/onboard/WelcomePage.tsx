import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import ColorBends from '@/components/ColorBends';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 sm:px-6 text-center relative overflow-hidden">
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <ColorBends
            rotation={90}
            speed={0.2}
            colors={['#ff2727', '#ff9f9f', '#ff6767']}
            transparent
            autoRotate={0}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.15}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
          />
        </div>
      )}
      {/* Scrim so the shader adds atmosphere without fighting text legibility */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl font-sans font-bold tracking-[-0.02em] text-white mb-4 leading-tight"
        >
          Welcome to Daskalos
        </motion.h1>

        <motion.p variants={item} className="text-base sm:text-lg text-white/55 mb-10 leading-relaxed">
          Your AI companion for becoming who you're trying to be.
        </motion.p>

        <motion.div variants={item} className="w-full flex flex-col items-center gap-4">
          {!showNameInput ? (
            <Button
              size="lg"
              onClick={() => setShowNameInput(true)}
              className="w-full sm:w-auto px-10"
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
                className="text-center text-xl text-white placeholder:text-white/35 border-white/20 focus:border-white"
              />
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!name.trim()}
                className="w-full"
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
