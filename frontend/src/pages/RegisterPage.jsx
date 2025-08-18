import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import "../App.css";
import axios from "axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigation

  // Handle Register
  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        name: name,
        email: email,
        password: password,
      });

      alert("✅ Registration successful! Please log in.");
      console.log("Server response:", response.data);

      // ✅ Redirect to login page after successful registration
      navigate("/login");

    } catch (error) {
      if (error.response) {
        // Backend returned an error
        if (error.response.status === 400) {
          alert("❌ Registration failed: Email already in use.");
        } else {
          alert(`❌ Registration failed: ${error.response.data}`);
        }
        console.error("Backend error:", error.response.data);
      } else if (error.request) {
        // No response received
        alert("⚠️ No response from server. Check if backend is running.");
        console.error("No response:", error.request);
      } else {
        // Other errors
        alert("⚠️ Error: " + error.message);
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="welcome-panel">
        <h2>Join HomeRide</h2>
        <p>Create your account to start sharing rides.</p>
      </div>
      <div className="form-panel">
        <div className="login-container">
          <h1>Create Account</h1>
          <form onSubmit={handleRegister}>
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <Button>Register</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
  