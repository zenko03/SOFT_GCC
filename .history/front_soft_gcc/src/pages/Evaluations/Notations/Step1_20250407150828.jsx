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
    console.log('Step1 - Initialisation du composant');
    console.log('Type d\'évaluation sélectionné:', selectedEvaluationType);
    console.log('Employé sélectionné:', selectedEmployee);
    console.log('ID de l\'évaluation:', evaluationId);

    if (!selectedEvaluationType) {
      console.log('Erreur: Type d\'évaluation non sélectionné');
      setError("Veuillez sélectionner un type d'évaluation.");
      return;
    }

    if (!selectedEmployee?.positionId) {
      console.log('Erreur: Employé non sélectionné');
      setError("Veuillez sélectionner un employé.");
      return;
    }

    const fetchQuestions = async () => {
      console.log('Début de la récupération des questions');
      setLoading(true);
      setError(null);

      try {
        let fetchedQuestions = [];
        
        if (evaluationId) {
          console.log('Récupération des questions pour l\'évaluation existante:', evaluationId);
          const response = await EvaluationService.fetchSelectedQuestions(evaluationId);
          fetchedQuestions = Array.isArray(response) ? response : [];
          console.log('Questions récupérées pour l\'évaluation:', fetchedQuestions);
        } else if (selectedEvaluationType && selectedEmployee?.positionId) {
          console.log('Récupération des questions par type et poste:', {
            type: selectedEvaluationType,
            poste: selectedEmployee.positionId
          });
          const response = await EvaluationService.fetchEvaluationQuestions(
            selectedEvaluationType,
            selectedEmployee.positionId
          );
          fetchedQuestions = Array.isArray(response) ? response : [];
          console.log('Questions récupérées par type et poste:', fetchedQuestions);
        }
        
        setQuestions(fetchedQuestions);
        setLocalRatings(ratings);
        console.log('Questions mises à jour dans l\'état:', fetchedQuestions);
      } catch (error) {
        console.error('Erreur lors de la récupération des questions:', error);
        setError("Erreur lors de la récupération des questions.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [evaluationId, ratings, selectedEvaluationType, selectedEmployee]);

  useEffect(() => {
    console.log('Mise à jour des notes globales:', localRatings);
    setRatings(localRatings);
  }, [localRatings]);

  const handleRatingChange = (questionId, rating) => {
    console.log(`Changement de note pour la question ${questionId}: ${rating}`);
    console.log('Notes actuelles:', localRatings);
    setLocalRatings((prevRatings) => {
      const newRatings = {
        ...prevRatings,
        [questionId]: rating,
      };
      console.log('Nouvelles notes après mise à jour:', newRatings);
      return newRatings;
    });
  };

  return (
    <div className="step1-container">
      <h5>Type d&apos;évaluation :</h5>
      <select
        className="evaluation-select"
        value={selectedEvaluationType || ''}
        onChange={(e) => {
          console.log('Changement de type d\'évaluation:', e.target.value);
          onEvaluationTypeChange(Number(e.target.value));
        }}
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