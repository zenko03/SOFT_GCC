import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndPermissions = async () => {
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
                // Récupérer l'utilisateur
                const userResponse = await axios.get("https://localhost:7082/api/Authentification/current-user", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const userData = userResponse.data;
                console.log("Utilisateur récupéré:", userData);

                // Stocker l'utilisateur dans le localStorage pour persistance
                localStorage.setItem('userData', JSON.stringify(userData));
                setUser(userData);

                // Récupérer les permissions de l'utilisateur
                const permissionsResponse = await axios.get(`https://localhost:7082/api/Permission/user/${userData.id}`);
                console.log("Permissions récupérées:", permissionsResponse.data);
                
                // Convertir les permissions en tableau de noms
                const permissionNames = permissionsResponse.data.map(p => p.name);
                setUserPermissions(permissionNames);

                // Attribution du rôle
                let roleTitle;
                switch (userData.roleId) {
                    case 1: roleTitle = "RH"; break;
                    case 2: roleTitle = "Manager"; break;
                    case 3: roleTitle = "Director"; break;
                    default: roleTitle = "Unknown"; break;
                }
                setUserRole(roleTitle);
                
                // Mettre à jour la propriété roleTitle dans userData si elle n'existe pas
                if (!userData.roleTitle) {
                    const updatedUserData = { ...userData, roleTitle };
                    setUser(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
                // En cas d'erreur, essayer de récupérer depuis le localStorage
                const cachedUserData = localStorage.getItem('userData');
                if (cachedUserData) {
                    try {
                        const parsedUserData = JSON.parse(cachedUserData);
                        setUser(parsedUserData);
                        
                        // Définir le rôle à partir des données en cache
                        switch (parsedUserData.roleId) {
                            case 1: setUserRole("RH"); break;
                            case 2: setUserRole("Manager"); break;
                            case 3: setUserRole("Director"); break;
                            default: setUserRole("Unknown"); break;
                        }
                    } catch (parseError) {
                        console.error("Erreur lors de l'analyse des données utilisateur en cache:", parseError);
                        setUser(null);
                        setUserRole(null);
                        localStorage.removeItem('userData');
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndPermissions();
    }, []);

    const hasPermission = (permissionName) => {
        console.log("Vérification de la permission:", permissionName);
        console.log("Permissions disponibles:", userPermissions);
        return userPermissions.includes(permissionName);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
        setUserRole(null);
        setUserPermissions([]);
    };

    return (
        <UserContext.Provider value={{ user, userRole, userPermissions, loading, hasPermission, logout }}>
            {children}
        </UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useUser = () => useContext(UserContext);