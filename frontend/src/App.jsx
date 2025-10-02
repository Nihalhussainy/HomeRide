import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx'; // Import the new HomePage
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
import './StaticPages.css';
import AboutPage from './pages/AboutPage.jsx'; // <-- ADD THIS
import ContactPage from './pages/ContactPage.jsx'; // <-- ADD THIS

function App() {
  return (
    <NotificationProvider>
      <div>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          {/* UPDATED: The root path now goes to HomePage */}
          <Route path="/" element={<HomePage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
           <Route path="/about" element={<AboutPage />} /> {/* <-- ADD THIS */}
          <Route path="/contact" element={<ContactPage />} /> {/* <-- ADD THIS */}


          {/* Protected Routes for All Logged-in Users */}
          <Route 
            path="/dashboard" 
            element={<RouteGuard><DashboardPage /></RouteGuard>} 
          />
          <Route 
            path="/profile" 
            element={<RouteGuard><ProfilePage /></RouteGuard>} 
          />
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
