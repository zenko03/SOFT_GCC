// src/services/EvaluationTypeService.js
const EvaluationTypeService = {
    getEvaluationTypes: async () => {
      try {
        const response = await fetch('/api/evaluationTypes'); // API pour obtenir les types
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des types d'évaluation:", error);
        throw error;
      }
    },
  
    getQuestionsByTypeAndPosition: async (evaluationTypeId, position) => {
      try {
        const response = await fetch(`/api/questions?evaluationTypeId=${evaluationTypeId}&position=${position}`); // API pour obtenir les questions
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des questions:", error);
        throw error;
      }
    }
  };
  
  export default EvaluationTypeService;
  