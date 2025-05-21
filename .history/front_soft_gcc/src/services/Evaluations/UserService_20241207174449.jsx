import axios from 'axios';

const API_BASE_URL = 'https://votre-api.com/api'; // Remplacez par l'URL de votre API

const UserService = {
  getEmployeeById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  },
};

export default UserService;
