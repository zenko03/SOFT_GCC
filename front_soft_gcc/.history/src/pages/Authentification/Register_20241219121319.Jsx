import React from 'react';
import '../../assets/css/Authentification/Register.css'; // Styles spécifiques

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-brand">
          <img src="/assets/images/logo-dark.svg" alt="Logo" className="register-logo" />
        </div>
        <h4>Create Your Account</h4>
        <p className="register-subtitle">Join us and manage your team efficiently.</p>
        <form className="register-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              id="fullName"
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              id="email"
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="password"
              placeholder="Password"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="confirmPassword"
              placeholder="Confirm Password"
            />
          </div>
          <div className="form-options">
            <label className="form-checkbox">
              <input type="checkbox" /> I agree to the <a href="#">terms and conditions</a>
            </label>
          </div>
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
