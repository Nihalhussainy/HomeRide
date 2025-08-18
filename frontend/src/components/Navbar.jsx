import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let userRole = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // The role from our backend JWT is "ROLE_ADMIN" or "ROLE_USER", etc.
      // We strip the "ROLE_" prefix to get the simple role name.
      userRole = decodedToken.role.replace('ROLE_', '');
    } catch (error) {
      console.error("Invalid or expired token:", error);
      // If the token is bad, it's a good idea to clear it
      localStorage.removeItem('token');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('You have been logged out.');
    navigate('/login');
    window.location.reload(); // Force a refresh to update the navbar state
  };

  return (
    <nav className="navbar">
      <Link to={token ? "/dashboard" : "/login"} className="navbar-brand">
        HomeRide
      </Link>
      <div className="nav-links">
        {token ? (
          // If a user IS logged in, show these links
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">My Profile</Link>
            {/* This link will ONLY appear if the user's role is ADMIN */}
            {userRole === 'ADMIN' && (
              <Link to="/admin">Admin</Link>
            )}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          // If a user is NOT logged in, show these links
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;