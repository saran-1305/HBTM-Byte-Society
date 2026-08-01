import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import ColorBends from '@/components/ColorBends';
import { registerAndLogin, login } from '@/lib/auth';
import { startOnboardingProfile, getOnboardingProfile } from '@/lib/onboardingApi';
import { ApiError } from '@/lib/api';

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

type Mode = 'signup' | 'login';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { startOnboarding, completeOnboarding } = useOnboarding();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = mode === 'signup'
    ? name.trim() && email.trim() && password.length >= 6
    : email.trim() && password.length > 0;

  const handleSignup = async () => {
    const user = await registerAndLogin(email.trim(), password);
    // Best-effort: a stale local session with the same account may have
    // already created this row, which is a 400 here — not a real failure.
    try {
      await startOnboardingProfile(name.trim());
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 400)) throw err;
    }
    startOnboarding(name.trim(), user.id);
    navigate('/onboarding');
  };

  const handleLogin = async () => {
    const user = await login(email.trim(), password);
    try {
      const existing = await getOnboardingProfile();
      startOnboarding(existing.full_name || email.trim(), user.id);
      if (existing.onboarding_completed) {
        completeOnboarding(existing.identity_summary || '');
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch {
      // No profile yet on this account — start fresh.
      startOnboarding(email.trim(), user.id);
      navigate('/onboarding');
    }
  };

  const handleContinue = async () => {
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') await handleSignup();
      else await handleLogin();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
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
          {!expanded ? (
            <Button
              size="lg"
              onClick={() => setExpanded(true)}
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
              {mode === 'signup' && (
                <TextInput
                  autoFocus
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-center text-xl text-white placeholder:text-white/35 border-white/20 focus:border-white"
                />
              )}
              <TextInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center text-xl text-white placeholder:text-white/35 border-white/20 focus:border-white"
              />
              <TextInput
                type="password"
                placeholder={mode === 'signup' ? 'Password (6+ characters)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleContinue();
                }}
                className="text-center text-xl text-white placeholder:text-white/35 border-white/20 focus:border-white"
              />

              {error && <p className="text-sm text-spotlight -mt-1">{error}</p>}

              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!canSubmit || loading}
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {mode === 'signup' ? 'Continue' : 'Log in'}
              </Button>

              <button
                type="button"
                onClick={() => { setMode((m) => (m === 'signup' ? 'login' : 'signup')); setError(''); }}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
