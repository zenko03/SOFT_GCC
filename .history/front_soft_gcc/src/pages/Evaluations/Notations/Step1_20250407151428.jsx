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
  const [selectedType, setSelectedType] = useState('');
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

    if (evaluationId) {
      fetchQuestionsForEvaluation(evaluationId);
    }
  }, [evaluationId, selectedEvaluationType, selectedEmployee]);

  useEffect(() => {
    console.log('Mise à jour des notes globales:', localRatings);
    setRatings(localRatings);
  }, [localRatings]);

  const fetchQuestionsForEvaluation = async (evalId) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://localhost:7082/api/Evaluation/${evalId}/selected-questions`);
      setQuestions(response.data.questions);
      setLocalRatings(ratings);
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      setError('Erreur lors de la récupération des questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedType(typeId);
    onEvaluationTypeChange(Number(typeId));
  };

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

  const handleNext = () => {
    if (!selectedType) {
      setError('Veuillez sélectionner un type d\'évaluation');
      return;
    }
    setRatings(localRatings);
  };

  return (
    <div className="step-container">
      <h3>Étape 1 : Sélection du type d'évaluation</h3>
      
      <div className="form-group">
        <label htmlFor="evaluationType">Type d'évaluation :</label>
        <select
          id="evaluationType"
          value={selectedType}
          onChange={handleTypeChange}
          className="form-control"
        >
          <option value="">Sélectionnez un type</option>
          {evaluationTypes.map((type) => (
            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div>Chargement des questions...</div>}

      {questions.length > 0 && (
        <div className="questions-preview">
          <h4>Questions associées :</h4>
          <ul>
            {questions.map((question) => (
              <li key={question.questionId}>{question.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="step-actions">
        <button onClick={handleNext} className="btn btn-primary">
          Suivant
        </button>
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
  evaluationId: PropTypes.number,
};

export default Step1;