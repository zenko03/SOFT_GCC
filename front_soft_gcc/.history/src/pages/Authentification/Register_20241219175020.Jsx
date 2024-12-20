import React, { useState } from 'react';
import { registerUser } from '../../assets/utils/AuthService';
import '../../assets/css/Authentification/Register.css'; // Styles spécifiques

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setMessage(response.message || 'Registration successful!');
    } catch (error) {
      setMessage(error || 'An error occurred during registration.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-brand">
          {/* Logo peut être ajouté ici si nécessaire */}
        </div>
        <h4>Create Your Account</h4>
        <p className="register-subtitle">Join us and manage your team efficiently.</p>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              id="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-options">
            <label className="form-checkbox">
              <input type="checkbox" /> I agree to the <a href="#">terms and conditions</a>
            </label>
          </div>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p className="login-prompt">
          Already have an account? <a href="/login" className="login-link">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
