import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './features/onboard/WelcomePage';
import OnboardFlow from './features/onboard/OnboardFlow';
import ProfileSetupPage from './features/profile/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';
import KnowledgePage from './features/knowledge/KnowledgePage';
import RecommendationsPage from './features/recommendations/RecommendationsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import ReflectionPage from './features/reflection/ReflectionPage';
import GrowthPlanPage from './features/growthplan/GrowthPlanPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/onboard/questions" element={<OnboardFlow />} />
      <Route path="/profile/setup" element={<ProfileSetupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/curate" element={<DashboardPage />} />
      <Route path="/knowledge" element={<KnowledgePage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/reflection" element={<ReflectionPage />} />
      <Route path="/growth-plan" element={<GrowthPlanPage />} />
    </Routes>
  );
}

export default App;
