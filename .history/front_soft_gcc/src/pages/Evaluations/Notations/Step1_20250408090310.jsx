import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/Questions.css';
import EvaluationService from '../../../services/Evaluations/EvaluationService';

function Step1({
  evaluationTypes,
  setRatings,
  ratings,
  evaluationId,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);
  const [currentEvaluationTypeName, setCurrentEvaluationTypeName] = useState('');

  useEffect(() => {
    if (!evaluationId) {
      setError("Aucune évaluation sélectionnée.");
      setQuestions([]);
      return;
    }

    const fetchSelectedQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer les détails de l'évaluation pour obtenir le type d'évaluation
        const evaluationDetails = await EvaluationService.getEvaluationDetails(evaluationId);
        setCurrentEvaluationType(evaluationDetails.evaluationTypeId);
        
        // Trouver le nom du type d'évaluation
        const type = evaluationTypes?.find(t => t.evaluationTypeId === evaluationDetails.evaluationTypeId);
        if (type) {
          setCurrentEvaluationTypeName(type.designation);
        }

        // Récupérer les questions sélectionnées
        const response = await EvaluationService.getSelectedQuestions(evaluationId);
        if (response && response.questions) {
          setQuestions(response.questions);
          setLocalRatings(ratings || {});
        } else {
          setQuestions([]);
          setError("Aucune question trouvée pour cette évaluation.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        setError("Erreur lors de la récupération des questions.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedQuestions();
  }, [evaluationId, ratings, evaluationTypes]);

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
      <div className="evaluation-type-display">
        <h5>Type d&apos;évaluation :</h5>
        <div className="current-evaluation-type">
          {currentEvaluationTypeName || 'Chargement...'}
        </div>
      </div>

      {loading && <div className="loader">Chargement...</div>}

      {error && <div className="error-message">{error}</div>}

      {Array.isArray(questions) && questions.length > 0 && (
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
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationId: PropTypes.number,
};

export default Step1;