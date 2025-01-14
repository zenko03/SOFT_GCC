import React, { createContext, useContext, useState } from 'react';

// Créez le contexte utilisateur
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userRole, setUserRole] = useState('Director'); // Par défaut, rôle RH

    return (
        <UserContext.Provider value={{ userRole, setUserRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
