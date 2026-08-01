import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from '@/context/OnboardingContext';
import WelcomePage from '@/features/onboard/WelcomePage';
import OnboardFlow from '@/features/onboard/OnboardFlow';
import Dashboard from '@/pages/Dashboard';
import Identity from '@/pages/Identity';
import GrowthPlan from '@/pages/GrowthPlan';

function App() {
  return (
    <Router>
      <OnboardingProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/onboarding" element={<OnboardFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/growth-plan" element={<GrowthPlan />} />
        </Routes>
      </OnboardingProvider>
    </Router>
  );
}

export default App;
