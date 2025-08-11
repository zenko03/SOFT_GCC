import api from '../../helpers/api';

const UserService = {
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/User/employee/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  },

  // Nouvelle méthode pour récupérer l'employé associé à un utilisateur
  getUserEmployeeMapping: async (userId) => {
    try {
      const response = await api.get(`/User/${userId}/employee-mapping`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du mapping utilisateur-employé:', error);
      throw error;
    }
  },

  // Méthode pour récupérer tous les utilisateurs ayant un rôle de manager ou directeur
  getManagers: async () => {
    try {
      const response = await api.get(`/User/managers-directors`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des managers:', error);
      throw error;
    }
  }
};

export default UserService;
