// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Onboarding from './Components/Onboarding';
import BloodConnectNavigator from './Components/BloodConnectNavigator';
import Home from './Pages/Home';
import SearchBlood from './Pages/SearchBlood';
import Donate from './Pages/Donate';
import Notification from './Pages/Notification';
import Profile from './Pages/Profile';

// App component
function App() {
  const location = useLocation();

  const protectedRoutes = [
    '/home',
    '/search-blood',
    '/donate',
    '/notification',
    '/profile',
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/auth" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search-blood" element={<SearchBlood />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {protectedRoutes.includes(location.pathname) && <BloodConnectNavigator />}
    </div>
  );
}

// Export App wrapped in Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
