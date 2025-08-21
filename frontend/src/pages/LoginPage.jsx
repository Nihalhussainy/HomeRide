import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import '../App.css';
import axios from 'axios';
import { FiLogIn } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });
      
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');

    } catch (error) {
      alert('Login failed. Please check your email and password.');
      console.error('There was an error during login!', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="welcome-panel">
        <h2>Welcome Back to HomeRide</h2>
        <p>Connecting you to your destination, one ride at a time.</p>
      </div>
      <div className="form-panel">
        <div className="form-box">
          <h1>User Login</h1>
          <form onSubmit={handleLogin}>
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
            <Button disabled={isLoading}>
              <FiLogIn />
              {isLoading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
