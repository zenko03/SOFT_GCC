import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../Evaluations/EvaluationInterview/UserContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const { loading, isInitialized, hasPermission, userPermissions } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      console.log("=== VÉRIFICATION DES PERMISSIONS ===");
      console.log("Route actuelle:", location.pathname);
      console.log("Permission requise:", requiredPermission);
      console.log("Permissions actuelles:", userPermissions);
      
      if (!requiredPermission) {
        console.log("Aucune permission requise pour cette route");
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      try {
        const hasRequiredPermission = hasPermission(requiredPermission);
        console.log("Résultat de la vérification:", hasRequiredPermission);
        console.log("=== FIN VÉRIFICATION DES PERMISSIONS ===");
        
        setIsAuthorized(hasRequiredPermission);
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isInitialized && !loading) {
      setIsChecking(true);
      checkPermission();
    }
  }, [location.pathname, requiredPermission, isInitialized, loading, hasPermission, userPermissions]);

  // Attendre que l'initialisation soit terminée
  if (!isInitialized || loading || isChecking) {
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
  console.log("État final de isAuthorized avant redirection:", isAuthorized);
  if (requiredPermission && !isAuthorized) {
    console.log('Permission non accordée, redirection vers unauthorized');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredPermission: PropTypes.string,
};

export default ProtectedRoute;
