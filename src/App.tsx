import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { AuthPage } from './pages/AuthPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-slate-50 min-h-screen text-slate-900">
          <Routes>
            <Route path="/" element={<ChallengesPage />} />
            <Route path="/challenge/:id" element={<ChallengeDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
