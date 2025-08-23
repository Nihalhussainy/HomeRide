import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import "../App.css";
import axios from "axios";
import { FiUserPlus } from "react-icons/fi";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!gender) {
      alert("Please select your gender.");
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

      alert("Registration successful! Please log in.");
      navigate("/login");

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      alert(errorMessage);
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

            {/* FIX: Added type="submit" to the button */}
            <Button type="submit" disabled={isLoading}>
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