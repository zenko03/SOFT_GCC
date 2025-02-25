import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Register.css'; // Importation du fichier CSS

const Register = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    roleId: 1, // Par défaut, vous pouvez ajuster cela selon vos besoins
    departementId: 1, // Par défaut, vous pouvez ajuster cela selon vos besoins
  });

  const [error, setError] = useState(""); // Pour gérer les erreurs
  const navigate = useNavigate(); // Pour la navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    try {
      const response = await axios.post(
        "http://localhost:7082/api/Authentification/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Inscription réussie !");
        navigate("/login"); // Rediriger vers la page de connexion
      }
    } catch (err) {
      if (err.response) {
        // Erreur provenant du serveur
        setError(err.response.data.message || "Une erreur s'est produite.");
      } else {
        // Erreur réseau ou autre
        setError("Une erreur s'est produite lors de la communication avec le serveur.");
      }
      console.error("Erreur lors de l'inscription :", err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <div className="brand-logo">
            <img src="../../assets/images/logo-dark.svg" alt="logo" />
          </div>
          <h1 className="app-title">Créer un compte</h1>
          <p className="app-subtitle">L'inscription est facile et rapide.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Nom de famille"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
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
          
          <div className="mt-3">
            <button
              type="submit"
              className="register-button"
            >
              S'INSCRIRE
            </button>
          </div>
          <div className="text-center mt-4">
            Déjà un compte ?{" "}
            <a href="/login" className="login-link">
              Connexion
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;