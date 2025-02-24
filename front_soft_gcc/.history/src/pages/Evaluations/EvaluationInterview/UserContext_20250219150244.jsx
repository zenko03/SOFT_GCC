import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded Token:", decoded.roleId); // Vérifie la structure du token

                setUser(decoded);

                // Vérification du rôle avec le nouvel attribut "roleId"
                switch (decoded.roleId) {
                    case "1":
                        setUserRole("RH");
                        break;
                    case "2":
                        setUserRole("Manager");
                        break;
                    case "3":
                        setUserRole("Director");
                        break;
                    default:
                        setUserRole("Unknown");
                        break;
                }

            } catch (error) {
                console.error('Erreur lors du décodage du token:', error);
                setUser(null);
                setUserRole(null);
            }
        }
    }, []);


    return (
        <UserContext.Provider value={{ user, userRole, setUserRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
