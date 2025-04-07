import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/Questions.css';
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
      setError("Veuillez sélectionner un type d&apos;évaluation.");
      setQuestions([]);
      return;
    }

    if (!selectedEmployee?.positionId) {
      setError("Veuillez sélectionner un employé.");
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        let fetchedQuestions = [];
        
        if (evaluationId) {
          fetchedQuestions = await EvaluationService.fetchSelectedQuestions(evaluationId);
          console.log("Questions sélectionnées récupérées :", fetchedQuestions);
        } else {
          fetchedQuestions = await EvaluationService.fetchEvaluationQuestions(
            selectedEvaluationType,
            selectedEmployee.positionId
          );
          console.log("Questions récupérées par type et poste :", fetchedQuestions);
        }
        
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
          setLocalRatings(ratings || {});
        } else {
          setQuestions([]);
          setError("Format de données invalide pour les questions.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        setError("Erreur lors de la récupération des questions.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [evaluationId, ratings, selectedEvaluationType, selectedEmployee]);

  useEffect(() => {
    if (setRatings) {
      setRatings(localRatings);
    }
  }, [localRatings, setRatings]);

  const handleRatingChange = (questionId, rating) => {
    console.log(`Rating changed for question ${questionId}: ${rating}`);
    setLocalRatings((prevRatings) => ({
      ...prevRatings,
      [questionId]: rating,
    }));
  };

  return (
    <div className="step1-container">
      <h5>Type d&apos;évaluation :</h5>
      <select
        className="evaluation-select"
        value={selectedEvaluationType || ''}
        onChange={(e) => onEvaluationTypeChange(Number(e.target.value))}
      >
        <option value="" disabled>
          Sélectionnez un type
        </option>
        {evaluationTypes?.map((type) => (
          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
            {type.designation}
          </option>
        ))}
      </select>

      {loading && <div className="loader">Chargement...</div>}

      {error && <div className="error-message">{error}</div>}

      {selectedEvaluationType && Array.isArray(questions) && questions.length > 0 && (
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