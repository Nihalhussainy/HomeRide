import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { useNotification } from '../context/NotificationContext.jsx';
import "../App.css";
import axios from "axios";
import { FiUserPlus, FiCheck } from "react-icons/fi";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!passwordsMatch) {
      showNotification("Passwords do not match.", 'error');
      return;
    }

    if (!gender) {
      showNotification("Please select your gender.", 'error');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        name,
        email,
        password,
        gender,
      });

      showNotification("Registration successful! Please log in.");
      navigate("/login");

    } catch (error) {
      const errorMessage = error.response?.data || "Registration failed. Please try again.";
      showNotification(errorMessage, 'error');
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="welcome-panel">
        <h2>Join HomeRide</h2>
        <p>Create your account to start sharing rides with colleagues.</p>
      </div>
      <div className="form-panel">
        <div className="form-box">
          <h1>Create Account</h1>
          <form onSubmit={handleRegister}>
            <Input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="input-wrapper">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordsMatch && (
                <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', marginTop: '5px', fontSize: '0.9rem' }}>
                  <FiCheck />
                  <span style={{ marginLeft: '5px' }}>Passwords match!</span>
                </div>
              )}
            </div>
            
            <div className="input-wrapper">
              <select 
                className="custom-input" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                required
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>Select Gender...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading || !passwordsMatch}>
              <FiUserPlus />
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;