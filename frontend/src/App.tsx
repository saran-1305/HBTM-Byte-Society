import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<div className="p-8 text-center text-2xl font-bold">Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
