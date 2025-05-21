import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, isInitialized, hasPermission, refreshPermissions } = useUser();

  // Recharger les permissions au montage du composant
  useEffect(() => {
    if (isInitialized && !loading) {
      refreshPermissions();
    }
  }, [isInitialized, loading, refreshPermissions]);

  // Attendre que l'initialisation soit terminée
  if (!isInitialized || loading) {
    return <div>Chargement...</div>;
  }

  // Vérifier l'authentification
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les permissions si nécessaire
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Permission requise: ${requiredPermission}, Permission actuelle: ${hasPermission(requiredPermission)}`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string,
};

export default ProtectedRoute;
