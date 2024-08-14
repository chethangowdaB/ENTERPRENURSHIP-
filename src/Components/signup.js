import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/signup.css'; // Import the CSS file for styling

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8000/signup', { email, password });

      if (response.status === 201) {
        setLoginSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <div className="form-group">
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="signup-button" onClick={handleSignup}>Signup</button>
      {loginSuccess && (
        <div className="login-message">
          <p>You have successfully signed up. You can now login.</p>
          <Link to="/">Login</Link>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
