import React from 'react';
// Use NavLink for active styling
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';
import { FaCarSide } from 'react-icons/fa'; // Import a car icon

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let userRole = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.role.replace('ROLE_', '');
    } catch (error) {
      console.error("Invalid or expired token:", error);
      localStorage.removeItem('token');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    // We don't need an alert, the redirect is enough feedback
    navigate('/login');
    // No need to force reload, React Router handles the state change
  };

  return (
    <nav className="navbar">
      <NavLink to={token ? "/dashboard" : "/login"} className="navbar-brand">
        <FaCarSide size={30} className="navbar-brand-icon" />
        HomeRide
      </NavLink>
      <div className="nav-links">
        {token ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/profile">My Profile</NavLink>
            {userRole === 'ADMIN' && (
              <NavLink to="/admin">Admin Panel</NavLink>
            )}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
