import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch("http://localhost:7273/api/authentification/current-user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération de l'utilisateur");
                }

                const userData = await response.json();
                console.log("Utilisateur récupéré:", userData);

                setUser(userData);

                // Attribution du rôle
                switch (userData.roleId) {
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
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                setUser(null);
                setUserRole(null);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, userRole, setUserRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
