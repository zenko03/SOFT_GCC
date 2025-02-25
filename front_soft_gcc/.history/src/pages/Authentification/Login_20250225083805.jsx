

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // ... (le reste du code reste identique)

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="brand-logo">
            <img src="../../assets/images/logo-dark.svg" alt="logo" />
          </div>
          <h1 className="app-title">SOFT GCC</h1>
          <p className="app-subtitle">Gestion de Carrière et Compétences</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Rester connecté
            </label>
            <a href="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="signup-link">
          Pas encore de compte ? <a href="/register">Créer un compte</a>
        </p>
      </div>
    </div>
  );
};

export default Login;