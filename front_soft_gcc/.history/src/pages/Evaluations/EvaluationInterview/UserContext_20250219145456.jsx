import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Supposons que le token est stocké ici
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);

                // Vérification du rôle avec roleId
                if (decoded.role?.roleId === 1) {
                    setUserRole('RH');
                } else if (decoded.role?.roleId === 2) {
                    setUserRole('Manager');
                } else if (decoded.role?.roleId === 3) {
                    setUserRole('Director');
                } else {
                    setUserRole('Unknown');
                }
                console.log('Rôle extrait du token :', decoded.role?.roleId); // Affiche le rôle extrait

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
