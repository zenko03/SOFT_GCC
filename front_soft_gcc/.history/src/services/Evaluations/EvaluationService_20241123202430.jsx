import axios from 'axios';

// Service pour interagir avec les API liées aux évaluations
const EvaluationService = {
  /**
   * Récupère tous les types d'évaluations depuis le backend
   * @returns {Promise<Array>} Liste des types d'évaluation
   */
  fetchEvaluationTypes: async () => {
    try {
      const response = await axios.get('/api/Evaluation/types'); // Remplacez l'URL si nécessaire
      return response.data;
    } catch (error) {
      console.error("Error fetching evaluation types:", error);
      throw error;
    }
  },

  /**
   * Récupère les questions pour un type d'évaluation et un poste donnés
   * @param {number} evaluationTypeId - ID du type d'évaluation
   * @param {number} postId - ID du poste
   * @returns {Promise<Array>} Liste des questions
   */
  fetchEvaluationQuestions: async (evaluationTypeId, postId) => {
    try {
      const response = await axios.get('/api/Evaluation/questions', {
        params: { evaluationTypeId, postId }, // Passer les paramètres en tant que query string
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching evaluation questions:", error);
      throw error;
    }
  },
};

export default EvaluationService;
