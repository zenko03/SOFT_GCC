import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUser  = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await axios.get("https://localhost:7082/api/Authentification/current-user", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const userData = response.data;
                console.log("Utilisateur récupéré:", userData);

                setUser(userData);

                // Attribution du rôle
                switch (userData.roleId) {
                    case 1:
                        setUser Role("RH");
                        break;
                    case 2:
                        setUser Role("Manager");
                        break;
                    case 3:
                        setUser Role("Director");
                        break;
                    default:
                        setUser Role("Unknown");
                        break;
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                setUser (null);
                setUser Role(null);
            }
        };

        fetchUser ();
    }, [localStorage.getItem('token')]); // Ajoutez le token comme dépendance

    return (
        <UserContext.Provider value={{ user, userRole, setUser  }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser  = () => useContext(UserContext);