import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';

const Step1 = ({ evaluationId, setRatings, evaluationTypes }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);

  // Charger les détails de l'évaluation et les questions associées
  useEffect(() => {
    const fetchData = async () => {
      if (!evaluationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Récupérer les détails de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        console.log('Détails de l\'évaluation reçus:', evaluationResponse.data);
        
        if (evaluationResponse.data && evaluationResponse.data.evaluationTypeId) {
          // Trouver le type d'évaluation correspondant
          const evalType = evaluationTypes.find(
            type => type.evaluationTypeId === evaluationResponse.data.evaluationTypeId || 
                   type.EvaluationTypeId === evaluationResponse.data.evaluationTypeId
          );
          
          if (evalType) {
            setCurrentEvaluationType(evalType);
          }
        }

        // Charger les questions sélectionnées
        const questionsResponse = await axios.get(
          `https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`
        );
        console.log('Questions reçues:', questionsResponse.data);
        
        setQuestions(questionsResponse.data.questions || []);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [evaluationId, evaluationTypes]);

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  const handleEvaluationTypeChange = (e) => {
    const selectedType = evaluationTypes.find(type => type.EvaluationTypeId === parseInt(e.target.value));
    setCurrentEvaluationType(selectedType);
    // Vous pouvez ajouter ici la logique pour charger les questions correspondant au nouveau type
  };

  if (loading) {
    return <div className="loader">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      <div className="evaluation-type-section">
        <h2>Type d&apos;évaluation</h2>
        <select
          className="evaluation-type-select"
          value={currentEvaluationType?.EvaluationTypeId || ''}
          onChange={handleEvaluationTypeChange}
          style={{ color: '#333' }}
        >
          <option value="">Sélectionnez un type d'évaluation</option>
          {evaluationTypes.map((type) => (
            <option key={type.EvaluationTypeId} value={type.EvaluationTypeId}>
              {type.Designation}
            </option>
          ))}
        </select>
      </div>

      <div className="questions-section">
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.questionId} className="question-item">
              <p className="question-text">{question.text}</p>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-button ${localRatings[question.questionId] === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(question.questionId, rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Aucune question disponible pour cette évaluation.</p>
        )}
      </div>
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.string.isRequired,
  setRatings: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.string,
      EvaluationTypeId: PropTypes.string,
      designation: PropTypes.string,
      Designation: PropTypes.string
    })
  ).isRequired
};

export default Step1;