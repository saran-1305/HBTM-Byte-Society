import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { ToastProvider } from '@/context/ToastContext';
import { CommandPaletteProvider } from '@/context/CommandPaletteContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ProductTour } from '@/components/ProductTour';
import WelcomePage from '@/features/onboard/WelcomePage';
import OnboardFlow from '@/features/onboard/OnboardFlow';
import Dashboard from '@/pages/Dashboard';
import Identity from '@/pages/Identity';
import Knowledge from '@/pages/Knowledge';
import Recommendations from '@/pages/Recommendations';
import Reflection from '@/pages/Reflection';
import Community from '@/pages/Community';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function AnimatedRoutes() {
  const location = useLocation();
  const { reduceMotionOverride } = useOnboarding();
  const skipAnimation = reduceMotionOverride || prefersReducedMotion();

  const routes = (
    <Routes location={location}>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/onboarding" element={<OnboardFlow />} />
      <Route path="/onboard/questions" element={<OnboardFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/curate" element={<Dashboard />} />
      <Route path="/identity" element={<Identity />} />
      <Route path="/growth-plan" element={<Navigate to="/identity" replace />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/reflection" element={<Reflection />} />
      <Route path="/community" element={<Community />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );

  if (skipAnimation) return routes;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {routes}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <OnboardingProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <OfflineBanner />
              <AnimatedRoutes />
              <ProductTour />
            </CommandPaletteProvider>
          </ToastProvider>
        </OnboardingProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
