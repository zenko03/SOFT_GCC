import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, isInitialized, hasPermission, refreshPermissions } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!requiredPermission) {
        setIsAuthorized(true);
        return;
      }

      // Recharger les permissions si nécessaire
      if (isInitialized && !loading) {
        await refreshPermissions();
      }

      const hasRequiredPermission = hasPermission(requiredPermission);
      setIsAuthorized(hasRequiredPermission);
    };

    checkPermission();
  }, [location.pathname, requiredPermission, isInitialized, loading]);

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
  if (requiredPermission && !isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string,
};

export default ProtectedRoute;
