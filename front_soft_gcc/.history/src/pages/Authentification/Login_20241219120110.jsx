import React from 'react';
import '../../assets/css/Authentification/Login.css'; // Styles spécifiques

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-brand">
          <img src="/assets/images/logo-dark.svg" alt="Logo" className="login-logo" />
        </div>
        <h4>Welcome Back!</h4>
        <p className="login-subtitle">Sign in to access your dashboard.</p>
        <form className="login-form">
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
          <div className="form-options">
            <label className="form-checkbox">
              <input type="checkbox" /> Keep me signed in
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary">Sign In</button>
          <button type="button" className="btn btn-facebook">
            <i className="mdi mdi-facebook"></i> Connect using Facebook
          </button>
        </form>
        <p className="signup-prompt">
          Don't have an account? <a href="/register" className="signup-link">Create one</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
