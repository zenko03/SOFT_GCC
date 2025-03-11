import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import './Login.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTie } from 'react-icons/fa'; // Ajout d'icônes

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://localhost:7082/api/Authentification/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        // Mettre à jour l'utilisateur dans le contexte
        const user = await fetchUserDetails(response.data.token);
        setUser(user);
        navigate("/softGcc/tableauBord");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (token) => {
    try {
      const response = await axios.get("https://localhost:7082/api/Authentification/current-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
      throw error;
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-container">
        <div className="login-card">
          <div className="login-card-content">
            <div className="login-header">
              <div className="logo-container">
                <FaUserTie className="logo-icon" />
              </div>
              <h1 className="app-title">SOFT <span className="highlight">GCC</span></h1>
              <p className="app-subtitle">Gestion de Carrière et Compétences</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password} onChange={handleChange}
                    required
                  />
                  <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
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
      </div>
    </div>
  );
};

export default Login;