import apiClient from './apiClient';

// Inscription d'un utilisateur
export const registerUser = async (data) => {
    try {
        const response = await apiClient.post('/authentification/register', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Connexion d'un utilisateur
export const loginUser = async (data) => {
    try {
        const response = await apiClient.post('/authentification/login', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Réinitialisation du mot de passe
export const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/authentification/forgotpassword', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Mise à jour du mot de passe
export const resetPassword = async (data) => {
    try {
        const response = await apiClient.post('/authentification/resetpassword', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
