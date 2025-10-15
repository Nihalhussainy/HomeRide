import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaCarSide } from 'react-icons/fa';
import { FiLogOut, FiUser, FiPlusCircle, FiSearch, FiGrid, FiSettings, FiUserCheck } from 'react-icons/fi';
import Notifications from './Notifications'; // Import the new component
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const { showConfirmation } = useNotification();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem('token');
    let userRole = null;
    let userName = '';
    let userProfilePic = null; // In a real app, you'd get this from user context or local storage

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userRole = decodedToken.role.replace('ROLE_', '');
            userName = decodedToken.sub; // This is the email
        } catch (error) {
            console.error("Invalid or expired token:", error);
            localStorage.removeItem('token');
        }
    }

    const handleLogout = () => {
        showConfirmation('Are you sure you want to logout?', () => {
            localStorage.removeItem('token');
            setIsDropdownOpen(false);
            navigate('/login');
        });
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle navbar background on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <NavLink to={token ? "/homepage" : "/"} className="navbar-brand">
                <FaCarSide size={28} className="navbar-brand-icon" />
                <h1>HomeRide</h1>
            </NavLink>

            {token && (
                <div className="navbar-links">
                    <NavLink to="/search"><FiSearch /> Find a Ride</NavLink>
                    <NavLink to="/dashboard"><FiGrid /> My Dashboard</NavLink>
                </div>
            )}

            <div className="navbar-user-section">
                {token ? (
                    <>
                        <Notifications />
                        <div className="user-menu-container" ref={dropdownRef}>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="user-menu-button">
                                {userProfilePic ? (
                                    <img src={userProfilePic} alt="My Profile" className="user-avatar" />
                                ) : (
                                    <FiUserCheck size={36} className="user-avatar" />
                                )}
                            </button>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        Signed in as <br/> <strong>{userName}</strong>
                                    </div>
                                    <NavLink to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                        <FiUser /> My Profile
                                    </NavLink>
                                    <NavLink to="/offer-ride" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                        <FiPlusCircle/> Offer a Ride
                                    </NavLink>
                                    {userRole === 'ADMIN' && (
                                        <NavLink to="/admin"  className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <FiSettings /> Admin Panel
                                        </NavLink>
                                    )}
                                    <button onClick={handleLogout} className="dropdown-item logout">
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="register-btn">Request Access</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;