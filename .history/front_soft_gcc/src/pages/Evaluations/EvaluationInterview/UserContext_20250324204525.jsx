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
                setUser(null);
                setUserRole(null);
                setUserPermissions([]);
                setLoading(false);
                return;
            }

            try {
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
                // Récupération depuis le cache en cas d'erreur
                const cachedUserData = localStorage.getItem('userData');
                const cachedPermissions = localStorage.getItem('userPermissions');
                
                if (cachedUserData && cachedPermissions) {
                    try {
                        const parsedUserData = JSON.parse(cachedUserData);
                        const parsedPermissions = JSON.parse(cachedPermissions);
                        
                        setUser(parsedUserData);
                        setUserPermissions(parsedPermissions);
                        
                        switch (parsedUserData.roleId) {
                            case 1:
                                setUserRole("RH");
                                break;
                            case 2:
                                setUserRole("Manager");
                                break;
                            case 3:
                                setUserRole("Director");
                                break;
                            default:
                                setUserRole("Unknown");
                                break;
                        }
                    } catch (parseError) {
                        console.error("Erreur lors de l'analyse des données en cache:", parseError);
                        setUser(null);
                        setUserRole(null);
                        setUserPermissions([]);
                        localStorage.removeItem('userData');
                        localStorage.removeItem('userPermissions');
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                    setUserPermissions([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Fonction pour vérifier si l'utilisateur a une permission spécifique
    const hasPermission = (permissionName) => {
        return userPermissions.some(permission => permission.name === permissionName);
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPermissions');
        setUser(null);
        setUserRole(null);
        setUserPermissions([]);
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