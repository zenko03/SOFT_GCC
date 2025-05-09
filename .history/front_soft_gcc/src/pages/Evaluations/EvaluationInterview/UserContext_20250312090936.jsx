import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true); // Ajout d'un état de chargement

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true); // Début du chargement
            const token = localStorage.getItem('token');
            
            if (!token) {
                setUser(null);
                setUserRole(null);
                setLoading(false); // Fin du chargement si pas de token
                return;
            }

            try {
                const response = await axios.get("https://localhost:7082/api/Authentification/current-user", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const userData = response.data;
                console.log("Utilisateur récupéré:", userData);

                // Stocker l'utilisateur dans le localStorage pour persistance
                localStorage.setItem('userData', JSON.stringify(userData));
                
                setUser(userData);

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
                setUserRole(roleTitle);
                
                // Mettre à jour la propriété roleTitle dans userData si elle n'existe pas
                if (!userData.roleTitle) {
                    const updatedUserData = { ...userData, roleTitle };
                    setUser(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                // En cas d'erreur, essayer de récupérer depuis le localStorage
                const cachedUserData = localStorage.getItem('userData');
                if (cachedUserData) {
                    try {
                        const parsedUserData = JSON.parse(cachedUserData);
                        setUser(parsedUserData);
                        
                        // Définir le rôle à partir des données en cache
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
                        console.error("Erreur lors de l'analyse des données utilisateur en cache:", parseError);
                        setUser(null);
                        setUserRole(null);
                        localStorage.removeItem('userData'); // Supprimer les données corrompues
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } finally {
                setLoading(false); // Fin du chargement dans tous les cas
            }
        };

        fetchUser();
    }, [/* Ne pas mettre localStorage.getItem comme dépendance */]); 

    // Fonction de déconnexion
    const logout = () => {
        localStorage .removeItem('token');
        localStorage.removeItem('userData');
        setUser (null);
        setUserRole(null);
    };

    return (
        <UserContext.Provider value={{ user, userRole, loading, setUser , logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser  = () => useContext(UserContext);