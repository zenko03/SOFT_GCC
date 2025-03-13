import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // Vérifier si l'utilisateur est connecté

  if (!token) {
    return <Navigate to="/login" />; // Rediriger vers la page de connexion
  }

  return <Outlet />; // Afficher la route protégée
};

export default ProtectedRoute;