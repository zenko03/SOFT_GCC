import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings, evaluationTypes, onNext, onEvaluationTypeSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

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
          const evalType = evaluationTypes.find(
            type => type.evaluationTypeId === evaluationResponse.data.evaluationTypeId || 
                   type.EvaluationTypeId === evaluationResponse.data.evaluationTypeId
          );
          
          if (evalType) {
            setSelectedEvaluationType(evalType);
            onEvaluationTypeSelect(evalType);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [evaluationId, evaluationTypes, onEvaluationTypeSelect]);

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  const handleEvaluationTypeChange = async (e) => {
    const selectedTypeId = parseInt(e.target.value);
    const selectedType = evaluationTypes.find(type => 
      type.evaluationTypeId === selectedTypeId || 
      type.EvaluationTypeId === selectedTypeId
    );
    
    if (!selectedType) {
      setError('Type d\'évaluation non trouvé');
      return;
    }

    setSelectedEvaluationType(selectedType);
    onEvaluationTypeSelect(selectedType);
    setLoading(true);
    setError(null);

    try {
      // Mettre à jour le type d'évaluation dans l'évaluation existante
      await axios.put(`https://localhost:7082/api/Evaluation/${evaluationId}`, {
        evaluationTypeId: selectedTypeId
      });

      // Récupérer les questions sélectionnées pour ce type d'évaluation
      const selectedQuestionsResponse = await axios.get(
        `https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`
      );
      
      if (selectedQuestionsResponse.data && selectedQuestionsResponse.data.questions) {
        setSelectedQuestions(selectedQuestionsResponse.data.questions);
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du type d\'évaluation');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Chargement en cours...</div>;
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
          value={selectedEvaluationType?.evaluationTypeId || selectedEvaluationType?.EvaluationTypeId || ''}
          onChange={handleEvaluationTypeChange}
        >
          <option value="" key="default">Sélectionnez un type d&apos;évaluation</option>
          {evaluationTypes.map((type) => (
            <option 
              key={type.evaluationTypeId || type.EvaluationTypeId} 
              value={type.evaluationTypeId || type.EvaluationTypeId}
            >
              {type.designation || type.Designation}
            </option>
          ))}
        </select>
      </div>

      {selectedEvaluationType && selectedQuestions.length > 0 && (
        <div className="questions-section">
          {selectedQuestions.map((question) => (
            <div key={question.questionId} className="question-item">
              <p className="question-text">{question.question || question.text}</p>
              <div className="rating-buttons">
                <button
                  className={`rating-button ${localRatings[question.questionId] === 1 ? 'selected' : ''}`}
                  onClick={() => handleRatingChange(question.questionId, 1)}
                >
                  Insuffisant
                </button>
                <button
                  className={`rating-button ${localRatings[question.questionId] === 2 ? 'selected' : ''}`}
                  onClick={() => handleRatingChange(question.questionId, 2)}
                >
                  Satisfaisant
                </button>
                <button
                  className={`rating-button ${localRatings[question.questionId] === 3 ? 'selected' : ''}`}
                  onClick={() => handleRatingChange(question.questionId, 3)}
                >
                  Très bon
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvaluationType && selectedQuestions.length === 0 && (
        <div className="no-questions">
          Aucune question disponible pour ce type d&apos;évaluation.
        </div>
      )}

      <div className="step-actions">
        <button
          className="next-button"
          onClick={onNext}
          disabled={!selectedEvaluationType || Object.keys(localRatings).length !== selectedQuestions.length}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.number,
  setRatings: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.number,
      EvaluationTypeId: PropTypes.number,
      designation: PropTypes.string,
      Designation: PropTypes.string
    })
  ).isRequired,
  onNext: PropTypes.func.isRequired,
  onEvaluationTypeSelect: PropTypes.func.isRequired
};

export default Step1;