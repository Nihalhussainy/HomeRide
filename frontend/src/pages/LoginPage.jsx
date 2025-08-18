import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import '../App.css';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      // Send the login request to the backend API
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });

      const token = response.data.token;

      // Save the received JWT token in the browser's local storage
      localStorage.setItem('token', token);

      alert('Login Successful!');

      // Automatically redirect the user to the dashboard page
      navigate('/dashboard');

    } catch (error) {
      alert('Login failed. Please check your email and password.');
      console.error('There was an error during login!', error);
    }
  };

  return (
    <div className="app-container">
      <div className="welcome-panel">
        <h2>Welcome to HomeRide</h2>
        <p>Connecting you to your destination, one ride at a time.</p>
      </div>
      <div className="form-panel">
        <div className="login-container">
          <h1>User Login</h1>
          <form onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button>Login</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;