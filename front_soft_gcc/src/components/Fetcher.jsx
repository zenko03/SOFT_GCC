import axios from 'axios';

// Domaine d'url pour les appels api
async function Fetcher(url) {
    try {        
      const response = await axios.get(`https://localhost:7082/api${url}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

export default Fetcher;