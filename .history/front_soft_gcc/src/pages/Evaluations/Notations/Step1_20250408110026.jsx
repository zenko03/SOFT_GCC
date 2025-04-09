import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings, evaluationTypes }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        const evaluation = evaluationResponse.data;

        // Récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        const questionsData = questionsResponse.data.questions || [];
        setQuestions(questionsData);

        // Mettre à jour le type d'évaluation actuel
        const currentType = evaluationTypes.find(type => type.EvaluationTypeId === evaluation.evaluationTypeId);
        if (currentType) {
          setCurrentEvaluationType(currentType);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchData();
    }
  }, [evaluationId, evaluationTypes]);

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!evaluationTypes || !currentEvaluationType) {
    return <div>Type d&apos;évaluation non trouvé</div>;
  }

  return (
    <div className="step1-container">
      <h2>Évaluation des Compétences</h2>
      
      <div className="evaluation-type-section">
        <label>Type d&apos;évaluation :</label>
        <select 
          value={currentEvaluationType.EvaluationTypeId} 
          disabled
          className="evaluation-type-select"
        >
          <option value="">Sélectionnez un type</option>
          {evaluationTypes.map(type => (
            <option 
              key={type.EvaluationTypeId} 
              value={type.EvaluationTypeId}
              style={{ 
                backgroundColor: type.EvaluationTypeId === currentEvaluationType.EvaluationTypeId ? '#e6f7ff' : 'white',
                color: type.EvaluationTypeId === currentEvaluationType.EvaluationTypeId ? '#1890ff' : '#333',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            >
              {type.Designation}
            </option>
          ))}
        </select>
      </div>

      <div className="questions-section">
        {questions.map(question => (
          <div key={question.questionId} className="question-item">
            <p className="question-text">{question.text}</p>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map(rating => (
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
  ).isRequired
};

export default Step1;