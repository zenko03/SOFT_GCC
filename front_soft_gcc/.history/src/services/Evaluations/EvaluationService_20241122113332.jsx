import axios from 'axios';

export const fetchEvaluationTypes = async () => {
  try {
    const response = await axios.get('/api/Evaluation/types');
    return response.data;
  } catch (error) {
    console.error("Error fetching evaluation types:", error);
    throw error;
  }
};
