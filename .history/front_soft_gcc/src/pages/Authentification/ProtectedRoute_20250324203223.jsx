import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types'; // Step 1: Import PropTypes


const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Décodage du JWT
    return payload.exp * 1000 > Date.now(); // Vérifie expiration
  } catch (error) {
    return false;
  }
};

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, hasPermission } = useUser();

  if (loading) {
    return <div>Chargement...</div>;
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
  requiredPermission: PropTypes.string, // Mark as optional since it's checked with &&
};
export default ProtectedRoute;
