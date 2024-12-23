import React, { useState } from 'react';
import { loginUser } from '../../services/AuthService/AuthService';
import '../../assets/css/Authentification/Login.css'; // Styles spécifiques
import { Link, Navigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.token); // Stocker le token dans localStorage
      setMessage('Login successful!');
      Navigate('/');
      // Redirigez l'utilisateur si nécessaire
    } catch (error) {
      setMessage(error || 'Invalid email or password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-brand">
          <img src="/assets/images/logo-dark.svg" alt="Logo" className="login-logo" />
        </div>
        <h4>Welcome Back!</h4>
        <p className="login-subtitle">Se connecter</p>
        <form className="login-form" onSubmit={handleSubmit}>
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
          <div className="form-options">
            <label className="form-checkbox">
              <input type="checkbox" /> Rester connecter
            </label>
            <a href="#" className="forgot-password">Mot de passe oublié?</a>
          </div>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" className="btn btn-primary">Connexion</button>
          <button type="button" className="btn btn-facebook">
            <i className="mdi mdi-email"></i> Connect using Facebook
          </button>
        </form>
        <p className="signup-prompt">
          Don't have an account? <Link className='nav-link' to={'/Register'}>Create one</Link> 
        </p>
      </div>
    </div>
  );
};

export default Login;
