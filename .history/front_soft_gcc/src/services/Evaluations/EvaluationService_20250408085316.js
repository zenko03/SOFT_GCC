import axios from 'axios';

const API_URL = 'https://localhost:7082/api/Evaluation';

class EvaluationService {
  static async getEvaluationDetails(evaluationId) {
    try {
      const response = await axios.get(`${API_URL}/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'évaluation:', error);
      throw error;
    }
  }

  static async getSelectedQuestions(evaluationId) {
    try {
      const response = await axios.get(`${API_URL}/evaluation/${evaluationId}/selected-questions`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des questions sélectionnées:', error);
      throw error;
    }
  }

  static async saveEvaluationResults(evaluationId, ratings, overallScore, strengths, weaknesses, generalEvaluation) {
    try {
      const response = await axios.post(`${API_URL}/save-evaluation-results`, {
        evaluationId,
        ratings,
        overallScore,
        strengths,
        weaknesses,
        generalEvaluation
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des résultats:', error);
      throw error;
    }
  }

  static async validateEvaluation(evaluationId, validationData) {
    try {
      const response = await axios.post(`${API_URL}/validate-evaluation`, {
        evaluationId,
        ...validationData
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'évaluation:', error);
      throw error;
    }
  }
}

export default EvaluationService; 