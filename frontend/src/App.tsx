import { Routes, Route } from 'react-router-dom';
import WelcomePage from './features/onboard/WelcomePage';
import OnboardFlow from './features/onboard/OnboardFlow';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/onboard/questions" element={<OnboardFlow />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/curate" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
