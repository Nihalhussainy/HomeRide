import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Navbar from './components/Navbar.jsx';
import RouteGuard from './components/RouteGuard.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <div>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes for All Logged-in Users */}
          <Route 
            path="/dashboard" 
            element={<RouteGuard><DashboardPage /></RouteGuard>} 
          />
          <Route 
            path="/profile" 
            element={<RouteGuard><ProfilePage /></RouteGuard>} 
          />
          {/* NEW: Route for the dedicated Search page */}
          <Route 
            path="/search" 
            element={<RouteGuard><SearchPage /></RouteGuard>} 
          />

          {/* Protected Route exclusively for Admins */}
          <Route 
            path="/admin" 
            element={<RouteGuard adminOnly={true}><AdminDashboardPage /></RouteGuard>} 
          />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;
