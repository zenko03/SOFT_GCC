import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings, ratings, evaluationTypes = [], onEvaluationTypeSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState(null);

  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        const evaluationData = evaluationResponse.data;
        setEvaluationDetails(evaluationData);

        // Trouver le type d'évaluation correspondant
        const currentType = evaluationTypes.find(type => type.EvaluationTypeId === evaluationData.evaluationTypeId);
        setSelectedEvaluationType(currentType);

        // Initialiser les notes locales
        setLocalRatings(ratings);

      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'évaluation:', err);
        setError('Erreur lors du chargement des détails de l\'évaluation. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchEvaluationDetails();
    }
  }, [evaluationId, evaluationTypes]);

  const handleEvaluationTypeChange = async (e) => {
    const typeId = parseInt(e.target.value);
    const selectedType = evaluationTypes.find(type => type.EvaluationTypeId === typeId);
    setSelectedEvaluationType(selectedType);
    
    if (onEvaluationTypeSelect) {
      onEvaluationTypeSelect(selectedType);
    }

    // Vérifier si le type sélectionné correspond au type de l'évaluation
    if (evaluationDetails && selectedType.EvaluationTypeId === evaluationDetails.evaluationTypeId) {
      try {
        // Récupérer les questions sélectionnées pour cette évaluation
        const response = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}/selected-questions`);
        setSelectedQuestions(response.data || []);
        
        // Réinitialiser les notes pour les nouvelles questions
        const newRatings = {};
        response.data.forEach(question => {
          newRatings[question.questionId] = 0;
        });
        setLocalRatings(newRatings);
        setRatings(newRatings);
      } catch (err) {
        console.error('Erreur lors de la récupération des questions:', err);
        setError('Erreur lors de la récupération des questions. Veuillez réessayer.');
      }
    } else {
      setSelectedQuestions([]);
      setLocalRatings({});
      setRatings({});
      setError('Le type d\'évaluation sélectionné ne correspond pas à l\'évaluation en cours.');
    }
  };

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      <h2>Étape 1 : Notation</h2>
      
      <div className="evaluation-type-section">
        <h3>Type d&apos;évaluation</h3>
        <select
          className="evaluation-type-select"
          value={selectedEvaluationType?.EvaluationTypeId || ''}
          onChange={handleEvaluationTypeChange}
        >
          <option value="">Sélectionnez un type d&apos;évaluation</option>
          {evaluationTypes.map(type => (
            <option 
              key={`eval-type-${type.EvaluationTypeId}`} 
              value={type.EvaluationTypeId}
            >
              {type.Designation}
            </option>
          ))}
        </select>
      </div>

      {selectedEvaluationType && selectedQuestions.length > 0 && (
        <div className="questions-section">
          <h3>Questions</h3>
          {selectedQuestions.map(question => (
            <div key={`question-${question.questionId}`} className="question-item">
              <p>{question.text}</p>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={`rating-${question.questionId}-${rating}`}
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

      {selectedEvaluationType && selectedQuestions.length === 0 && (
        <div className="no-questions-message">
          Aucune question n&apos;a été sélectionnée pour ce type d&apos;évaluation.
        </div>
      )}

      {!selectedEvaluationType && (
        <div className="select-type-message">
          Veuillez sélectionner un type d&apos;évaluation pour afficher les questions.
        </div>
      )}
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      EvaluationTypeId: PropTypes.number,
      Designation: PropTypes.string
    })
  ),
  onEvaluationTypeSelect: PropTypes.func
};

export default Step1;