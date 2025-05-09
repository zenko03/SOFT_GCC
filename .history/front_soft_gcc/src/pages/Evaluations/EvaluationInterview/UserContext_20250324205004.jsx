import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                clearUserData();
                setLoading(false);
                return;
            }

            try {
                // Vérifier si le token est valide
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.exp * 1000 < Date.now()) {
                    console.log("Token expiré, déconnexion...");
                    clearUserData();
                    setLoading(false);
                    return;
                }

                // Récupération des informations de l'utilisateur
                console.log("Tentative de récupération de l'utilisateur avec le token:", token);
                const userResponse = await axios.get("https://localhost:7082/api/Authentification/current-user", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const userData = userResponse.data;
                console.log("Utilisateur récupéré:", userData);
                console.log("RoleId de l'utilisateur:", userData.roleId);

                // Récupération des permissions de l'utilisateur
                console.log("Tentative de récupération des permissions pour l'utilisateur:", userData.userId);
                const permissionsResponse = await axios.get(`https://localhost:7082/api/Permission/user/${userData.userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const permissions = permissionsResponse.data;
                console.log("Réponse de l'API des permissions:", permissionsResponse);
                console.log("Permissions récupérées:", permissions);

                // Vérification du format des permissions
                if (!Array.isArray(permissions)) {
                    console.error("Les permissions ne sont pas dans le format attendu:", permissions);
                    throw new Error("Format de permissions invalide");
                }

                // Stockage des données
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('userPermissions', JSON.stringify(permissions));
                
                setUser(userData);
                setUserPermissions(permissions);

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
                console.log("Rôle attribué:", roleTitle);
                setUserRole(roleTitle);
                
                if (!userData.roleTitle) {
                    const updatedUserData = { ...userData, roleTitle };
                    setUser(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
                clearUserData();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Fonction pour nettoyer toutes les données utilisateur
    const clearUserData = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPermissions');
        setUser(null);
        setUserRole(null);
        setUserPermissions([]);
    };

    // Fonction pour vérifier si l'utilisateur a une permission spécifique
    const hasPermission = (permissionName) => {
        return userPermissions.some(permission => permission.name === permissionName);
    };

    // Fonction de déconnexion
    const logout = () => {
        clearUserData();
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            userRole, 
            userPermissions, 
            loading, 
            setUser, 
            logout,
            hasPermission 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);