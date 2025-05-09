import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Importer PropTypes

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fonction pour nettoyer toutes les données utilisateur
    const clearUserData = () => {
        console.log("Nettoyage des données utilisateur...");
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPermissions');
        setUser(null);
        setUserRole(null);
        setUserPermissions([]);
        setIsInitialized(false);
    };

    // Fonction pour vérifier si le token est valide
    const isTokenValid = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isValid = payload.exp * 1000 > Date.now();
            console.log("Vérification du token:", isValid ? "Valide" : "Expiré");
            return isValid;
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            return false;
        }
    };

    // Fonction pour récupérer les données utilisateur
    const fetchUserData = async (token) => {
        try {
            console.log("Début de la récupération des données utilisateur...");
            
            // Récupération des informations de l'utilisateur
            const userResponse = await axios.get("https://localhost:7082/api/Authentification/current-user", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const userData = userResponse.data;
            console.log("Utilisateur récupéré:", userData);

            // Récupération des permissions
            const permissionsResponse = await axios.get(`https://localhost:7082/api/Permission/user/${userData.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const permissions = permissionsResponse.data;
            console.log("Permissions récupérées:", permissions);

            if (!Array.isArray(permissions)) {
                throw new Error("Format de permissions invalide");
            }

            // Attribution du rôle
            let roleTitle;
            switch (userData.roleId) {
                case 1:
                    roleTitle = "RH";
                    break;
                case 2:
                    roleTitle = "Manager";
                    break;
                case 3:
                    roleTitle = "Director";
                    break;
                default:
                    roleTitle = "Unknown";
                    break;
            }

            // Mise à jour des états
            setUser({ ...userData, roleTitle });
            setUserPermissions(permissions);
            setUserRole(roleTitle);

            // Stockage dans le localStorage
            localStorage.setItem('userData', JSON.stringify({ ...userData, roleTitle }));
            localStorage.setItem('userPermissions', JSON.stringify(permissions));

            console.log("Données utilisateur mises à jour avec succès");
            return true;
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            return false;
        }
    };

    // Fonction d'initialisation qui peut être appelée après la connexion
    const initializeUser = async () => {
        console.log("Initialisation du contexte utilisateur...");
        setLoading(true);
        
        const token = localStorage.getItem('token');
        console.log("Token trouvé:", token ? "Oui" : "Non");

        if (!token) {
            console.log("Aucun token trouvé, déconnexion...");
            clearUserData();
            setLoading(false);
            return;
        }

        if (!isTokenValid(token)) {
            console.log("Token invalide, déconnexion...");
            clearUserData();
            setLoading(false);
            return;
        }

        const success = await fetchUserData(token);
        if (!success) {
            console.log("Échec de la récupération des données, déconnexion...");
            clearUserData();
        }

        setLoading(false);
        setIsInitialized(true);
    };

    // Effet pour l'initialisation au montage du composant
    useEffect(() => {
        initializeUser();
    }, []);

    // Fonction pour vérifier si l'utilisateur a une permission spécifique
    const hasPermission = (permissionName) => {
        return userPermissions.some(permission => permission.name === permissionName);
    };

    // Fonction de déconnexion
    const logout = () => {
        console.log("Déconnexion de l'utilisateur...");
        clearUserData();
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            userRole, 
            userPermissions, 
            loading, 
            isInitialized,
            setUser, 
            logout,
            hasPermission,
            initializeUser
        }}>
            {children}
        </UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired // Valider que "children" est un élément React valide
};

export const useUser = () => useContext(UserContext);