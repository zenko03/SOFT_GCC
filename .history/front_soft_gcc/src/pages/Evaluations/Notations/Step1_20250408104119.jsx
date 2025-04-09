import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';

const Step1 = ({ evaluationId, setRatings, evaluationTypes, selectedEmployee }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);
  const [isTypeSelected, setIsTypeSelected] = useState(false);

  // Charger les détails de l'évaluation et le type d'évaluation de l'employé
  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        
        // Définir le type d'évaluation actuel
        const employeeEvalType = evaluationTypes.find(
          type => type.EvaluationTypeId === response.data.evaluationTypeId
        );
        
        if (employeeEvalType) {
          setCurrentEvaluationType(employeeEvalType);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        setError('Erreur lors du chargement des détails de l\'évaluation');
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchEvaluationDetails();
    }
  }, [evaluationId, evaluationTypes]);

  // Charger les questions sélectionnées une fois le type d'évaluation choisi
  const loadSelectedQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`
      );
      setQuestions(response.data.questions);
      setIsTypeSelected(true);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Erreur lors du chargement des questions');
      setLoading(false);
    }
  };

  const handleEvaluationTypeSelect = async (type) => {
    if (type.EvaluationTypeId === currentEvaluationType?.EvaluationTypeId) {
      await loadSelectedQuestions();
    }
  };

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div className="loader">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      {!isTypeSelected ? (
        // Affichage des types d'évaluation
        <div className="evaluation-types-section">
          <h3>Sélectionnez le type d'évaluation</h3>
          <div className="evaluation-types-grid">
            {evaluationTypes.map((type) => (
              <button
                key={type.EvaluationTypeId}
                className={`evaluation-type-button ${
                  type.EvaluationTypeId === currentEvaluationType?.EvaluationTypeId
                    ? 'active'
                    : 'disabled'
                }`}
                onClick={() => handleEvaluationTypeSelect(type)} disabled={type.EvaluationTypeId !== currentEvaluationType?.EvaluationTypeId}
              >
                {type.Designation}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="questions-section">
          <h2>Questions pour le type d'évaluation: {currentEvaluationType?.Designation}</h2>
          {questions.map((question) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.string.isRequired,
  setRatings: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      EvaluationTypeId: PropTypes.string.isRequired,
      Designation: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedEmployee: PropTypes.object.isRequired,
};

export default Step1;