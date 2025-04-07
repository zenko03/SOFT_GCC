import React from "react";
import { Navigate, Outlet } from "react-router-dom";

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

const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
