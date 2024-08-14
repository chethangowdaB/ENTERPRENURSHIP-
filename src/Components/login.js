import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });
      const { token } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Decode token to get user role and id
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      const userId = decodedToken.userId;

      // Navigate to the home page with user information
      navigate('/home', { state: { id: userId, role: userRole } });
    } catch (error) {
      setError('Invalid email or password');
      console.error('Error during login:', error);
    }
  };

  return (
    
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin} className="form-container">
        <div className="form-group">
          <label>Email:</label>
          <input id="user" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" id="pass" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="signup-link">
        <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
