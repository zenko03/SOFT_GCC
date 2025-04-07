import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques
import EvaluationService from '../../../services/Evaluations/EvaluationService';

function Step1({
  evaluationTypes,
  onEvaluationTypeChange,
  selectedEvaluationType,
  selectedEmployee,
  setRatings,
  ratings,
  evaluationId,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});

  useEffect(() => {
    if (!selectedEvaluationType) {
      setError("Veuillez sélectionner un type d'évaluation.");
      return;
    }

    if (!selectedEmployee?.positionId) {
      setError("Veuillez sélectionner un employé.");
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        let fetchedQuestions = [];
        
        if (evaluationId) {
          // Si on a un evaluationId, on récupère les questions sélectionnées
          const response = await EvaluationService.fetchSelectedQuestions(evaluationId);
          fetchedQuestions = Array.isArray(response) ? response : [];
          console.log("Questions sélectionnées récupérées :", fetchedQuestions);
        } else {
          // Sinon, on récupère les questions par type d'évaluation et poste
          const response = await EvaluationService.fetchEvaluationQuestions(
            selectedEvaluationType,
            selectedEmployee.positionId
          );
          fetchedQuestions = Array.isArray(response) ? response : [];
          console.log("Questions récupérées par type et poste :", fetchedQuestions);
        }
        
        setQuestions(fetchedQuestions);
        setLocalRatings(ratings);
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        setError("Erreur lors de la récupération des questions.");
        setQuestions([]); // S'assurer que questions est un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [evaluationId, ratings, selectedEvaluationType, selectedEmployee]);

  // Transmettre les notes au parent lorsque localRatings change
  useEffect(() => {
    setRatings(localRatings);
  }, [localRatings]);

  // Gérer le changement de note pour une question
  const handleRatingChange = (questionId, rating) => {
    console.log(`Rating changed for question ${questionId}: ${rating}`);
    setLocalRatings((prevRatings) => ({
      ...prevRatings,
      [questionId]: rating,
    }));
  };

  return (
    <div className="step1-container">
      <h5>Type d'évaluation :</h5>
      <select
        className="evaluation-select"
        value={selectedEvaluationType || ''}
        onChange={(e) => onEvaluationTypeChange(Number(e.target.value))}
      >
        <option value="" disabled>
          Sélectionnez un type
        </option>
        {evaluationTypes.map((type) => (
          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
            {type.designation}
          </option>
        ))}
      </select>

      {loading && <div className="loader">Chargement...</div>}

      {error && <div className="error-message">{error}</div>}

      {selectedEvaluationType && questions.length > 0 && (
        <div className="questions-container">
          {questions.map((question) => (
            <div key={question.questionId} className="question-item">
              <p>{question.text}</p>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label
                    key={`rating-${question.questionId}-${rating}`}
                    className="rating-label"
                  >
                    <input
                      type="radio"
                      name={`rating-${question.questionId}`}
                      value={rating}
                      checked={localRatings[question.questionId] === rating}
                      onChange={() => handleRatingChange(question.questionId, rating)}
                      aria-label={`Note ${rating} pour ${question.text}`}
                    />
                    {rating}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Step1.propTypes = {
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.number.isRequired,
      designation: PropTypes.string.isRequired
    })
  ).isRequired,
  onEvaluationTypeChange: PropTypes.func.isRequired,
  selectedEvaluationType: PropTypes.number,
  selectedEmployee: PropTypes.shape({
    positionId: PropTypes.number.isRequired
  }).isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationId: PropTypes.number,
};

export default Step1;