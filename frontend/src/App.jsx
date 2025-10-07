import { Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Navbar from './components/Navbar';
import RouteGuard from './components/RouteGuard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OfferRidePage from './pages/OfferRidePage';
import SearchPage from './pages/SearchPage';
import RideDetailPage from './pages/RideDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import './App.css';
import './StaticPages.css';

function App() {
  return (
    <NotificationProvider>
      <div>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<RouteGuard><DashboardPage /></RouteGuard>} />
          <Route path="/profile" element={<RouteGuard><ProfilePage /></RouteGuard>} />
          <Route path="/offer-ride" element={<RouteGuard><OfferRidePage /></RouteGuard>} />
          <Route path="/search" element={<RouteGuard><SearchPage /></RouteGuard>} />
          <Route path="/ride/:id" element={<RouteGuard><RideDetailPage /></RouteGuard>} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<RouteGuard adminOnly={true}><AdminDashboardPage /></RouteGuard>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;