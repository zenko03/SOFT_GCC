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
  evaluationId, // Nouveau prop pour l'ID de l'évaluation
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({}); // Pour stocker temporairement les notes des questions
  const [cachedQuestions, setCachedQuestions] = useState({}); // Cache des questions par type d'évaluation

  useEffect(() => {
    if (!evaluationId) {
      setError("Aucune évaluation sélectionnée.");
      return;
    }

    const fetchSelectedQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const selectedQuestions = await EvaluationService.fetchSelectedQuestions(evaluationId);
        console.log("Questions sélectionnées récupérées :", selectedQuestions);
        setQuestions(selectedQuestions);
        setLocalRatings(ratings);
      } catch (error) {
        console.error("Erreur lors de la récupération des questions sélectionnées :", error);
        setError("Erreur lors de la récupération des questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedQuestions();
  }, [evaluationId, ratings]);

  // Transmettre les notes au parent lorsque localRatings change
  useEffect(() => {
    setRatings(localRatings);
  }, [localRatings]);

  // Gérer le changement de type d'évaluation
  const handleEvaluationTypeChange = async (event) => {
    const typeId = event.target.value;
    onEvaluationTypeChange(typeId); // Appel de la fonction parent
    setLoading(true);
    setError(null);

    try {
      if (cachedQuestions[typeId]) {
        setQuestions(cachedQuestions[typeId]);
        setLocalRatings({}); // Réinitialiser les notes
      } else {
        const response = await axios.get(
          `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&positionId=${selectedEmployee.positionId}`
        );
        console.log("Questions récupérées après changement :", response.data);
        setQuestions(response.data);
        setLocalRatings({}); // Réinitialiser les notes
        setCachedQuestions((prev) => ({
          ...prev,
          [typeId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des questions :", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="evaluation-type-display">
        {evaluationTypes.find(type => type.evaluationTypeId === selectedEvaluationType)?.designation}
      </div>

      {loading && <div className="loader">Chargement...</div>}

      {error && <div className="error-message">{error}</div>}

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
  evaluationId: PropTypes.number.isRequired, // Nouveau prop
};

export default Step1;