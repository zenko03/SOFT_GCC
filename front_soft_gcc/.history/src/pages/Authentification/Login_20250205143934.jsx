import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
        "http://localhost:7082/api/Authentification/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { token } = response.data; // Récupérer le token JWT
        localStorage.setItem("token", token); // Stocker le token dans le localStorage
        alert("Connexion réussie !");
        navigate("/dashboard"); // Rediriger vers le tableau de bord ou une autre page
      }
    } catch (err) {
      if (err.response) {
        // Erreur provenant du serveur
        setError(err.response.data.message || "Identifiants invalides.");
      } else {
        // Erreur réseau ou autre
        setError("Une erreur s'est produite lors de la communication avec le serveur.");
      }
      console.error("Erreur lors de la connexion :", err);
    }
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth">
          <div className="row flex-grow">
            <div className="col-lg-4 mx-auto">
              <div className="auth-form-light text-left p-5">
                <div className="brand-logo">
                  <img src="../../assets/images/logo-dark.svg" alt="logo" />
                </div>
                <h4>Hello! Let's get started</h4>
                <h6 className="font-weight-light">Sign in to continue.</h6>
                {error && <div className="alert alert-danger">{error}</div>}{" "}
                {/* Affichage des erreurs */}
                <form className="pt-3" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control form-control-lg"
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
                      className="form-control form-control-lg"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mt-3">
                    <button
                      type="submit"
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN IN
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input
                          type="checkbox"
                          className="form-check-input"
                        />{" "}
                        Keep me signed in
                      </label>
                    </div>
                    <a href="/forgot-password" className="auth-link text-black">
                      Forgot password?
                    </a>
                  </div>
                  <div className="mb-2">
                    <button
                      type="button"
                      className="btn btn-block btn-facebook auth-form-btn"
                    >
                      <i className="mdi mdi-facebook mr-2"></i>Connect using Facebook
                    </button>
                  </div>
                  <div className="text-center mt-4 font-weight-light">
                    Don't have an account?{" "}
                    <a href="/register" className="text-primary">
                      Create
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;