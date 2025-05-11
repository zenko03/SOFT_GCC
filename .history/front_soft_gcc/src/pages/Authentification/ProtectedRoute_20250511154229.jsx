import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, isInitialized, hasPermission, refreshPermissions } = useUser();

  // Recharger les permissions au montage du composant et quand la location change
  useEffect(() => {
    const loadPermissions = async () => {
      if (isInitialized && !loading) {
        console.log('Rechargement des permissions...');
        await refreshPermissions();
      }
    };

    loadPermissions();
  }, [isInitialized, loading, refreshPermissions, location.pathname]);

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
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(requiredPermission);
    console.log(`Route: ${location.pathname}`);
    console.log(`Permission requise: ${requiredPermission}`);
    console.log(`Permission actuelle: ${hasRequiredPermission}`);
    
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string,
};

export default ProtectedRoute;
