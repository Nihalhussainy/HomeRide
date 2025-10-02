import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from '../context/NotificationContext.jsx';
import './Navbar.css';
import { FaCarSide } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { showConfirmation } = useNotification();

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
    showConfirmation('Are you sure you want to logout?', () => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <FaCarSide size={30} className="navbar-brand-icon" />
        HomeRide
      </NavLink>
      <div className="nav-links">
        {token ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/search" className="search-link">
              <FiSearch size={20} />
              <span>Search</span>
            </NavLink>
            {userRole === 'ADMIN' && (
              <NavLink to="/admin">Admin Panel</NavLink>
            )}
            <NavLink to="/profile">My Profile</NavLink>
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