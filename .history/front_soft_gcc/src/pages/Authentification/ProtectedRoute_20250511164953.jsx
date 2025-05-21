import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, isInitialized, hasPermission, refreshPermissions, userPermissions } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Recharger les permissions au montage du composant et quand la location change
  useEffect(() => {
    const loadPermissions = async () => {
      if (isInitialized && !loading) {
        console.log('Rechargement des permissions pour la route:', location.pathname);
        await refreshPermissions();
      }
    };

    loadPermissions();
  }, [isInitialized, loading, refreshPermissions, location.pathname]);

  useEffect(() => {
    const checkPermission = async () => {
      console.log("=== DÉBUT VÉRIFICATION DES PERMISSIONS ===");
      console.log("Route actuelle:", location.pathname);
      console.log("Permission requise:", requiredPermission);
      console.log("Permissions actuelles:", JSON.stringify(userPermissions, null, 2));
      
      if (!requiredPermission) {
        console.log("Aucune permission requise pour cette route");
        setIsAuthorized(true);
        return;
      }

      const hasRequiredPermission = hasPermission(requiredPermission);
      console.log("Résultat de la vérification:", hasRequiredPermission);
      console.log("=== FIN VÉRIFICATION DES PERMISSIONS ===");
      setIsAuthorized(hasRequiredPermission);
    };

    checkPermission();
  }, [location.pathname, requiredPermission, hasPermission, userPermissions]);

  // Attendre que l'initialisation soit terminée
  if (!isInitialized || loading) {
    console.log('Chargement en cours...');
    return <div>Chargement...</div>;
  }

  // Vérifier l'authentification
  const token = localStorage.getItem("token");
  if (!token) {
    console.log('Aucun token trouvé, redirection vers login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les permissions si nécessaire
  if (requiredPermission) {
    console.log('=== VÉRIFICATION FINALE DES PERMISSIONS ===');
    console.log('Route:', location.pathname);
    console.log('Permission requise:', requiredPermission);
    console.log('Permissions actuelles:', JSON.stringify(userPermissions, null, 2));
    console.log('État d\'autorisation:', isAuthorized);
    
    if (!isAuthorized) {
      console.log('Permission non accordée, redirection vers unauthorized');
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string,
};

export default ProtectedRoute;
