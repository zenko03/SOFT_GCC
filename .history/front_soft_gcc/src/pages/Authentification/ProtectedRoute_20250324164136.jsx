import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Décodage du JWT
    return payload.exp * 1000 > Date.now(); // Vérifie expiration
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return false;
  }
};

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { hasPermission, loading } = useUser();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string
};

export default ProtectedRoute;
