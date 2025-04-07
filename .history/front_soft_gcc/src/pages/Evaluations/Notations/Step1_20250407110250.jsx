import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({
  evaluationTypes,
  onEvaluationTypeChange,
  selectedEvaluationType,
  selectedEmployee,
  setRatings,
  ratings,
  onNext,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({}); // Pour stocker temporairement les notes des questions
  const [cachedQuestions, setCachedQuestions] = useState({}); // Cache des questions par type d'évaluation

  // Récupérer les questions lorsque le type d'évaluation ou l'employé change
  useEffect(() => {
    if (!selectedEmployee || !selectedEmployee.positionId) {
      setError("Aucun employé sélectionné ou position non définie.");
      return;
    }

    if (cachedQuestions[selectedEvaluationType]) {
      setQuestions(cachedQuestions[selectedEvaluationType]);
      setLocalRatings(ratings);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${selectedEvaluationType}&positionId=${selectedEmployee.positionId}`
        );
        console.log("Questions récupérées :", response.data);
        setQuestions(response.data);
        setLocalRatings(ratings);
        setCachedQuestions((prev) => ({
          ...prev,
          [selectedEvaluationType]: response.data,
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedEvaluationType, selectedEmployee.positionId]);

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
  const handleRatingChange = (questiondId, rating) => {
    console.log(`Rating changed for question ${questiondId}: ${rating}`);
    setLocalRatings((prevRatings) => ({
      ...prevRatings,
      [questiondId]: rating,
    }));
  };

  if (loading) {
    return <div className="loading">Chargement des questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="step1-container">
      <div className="evaluation-type-selection">
        <h3>Sélection du type d&apos;évaluation</h3>
        <select 
          value={selectedEvaluationType || ''} 
          onChange={handleEvaluationTypeChange}
          className="evaluation-type-select"
        >
          <option value="">Sélectionnez un type d&apos;évaluation</option>
          {evaluationTypes.map(type => (
            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
              {type.typeName}
            </option>
          ))}
        </select>
      </div>

      <h2>Questions de l&apos;évaluation</h2>
      <div className="questions-list">
        {questions.map(question => (
          <div key={question.questionId} className="question-item">
            <div className="question-text">{question.text}</div>
            <div className="rating-section">
              <select
                value={localRatings[question.questionId] || ''}
                onChange={(e) => handleRatingChange(question.questionId, parseInt(e.target.value))}
                className="rating-select"
              >
                <option value="">Sélectionnez une note</option>
                <option value="1">1 - Insuffisant</option>
                <option value="2">2 - À améliorer</option>
                <option value="3">3 - Satisfaisant</option>
                <option value="4">4 - Très bien</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button className="next-button" onClick={onNext}>
        Suivant
      </button>
    </div>
  );
}

Step1.propTypes = {
  evaluationTypes: PropTypes.arrayOf(PropTypes.shape({
    evaluationTypeId: PropTypes.number.isRequired,
    typeName: PropTypes.string.isRequired
  })).isRequired,
  onEvaluationTypeChange: PropTypes.func.isRequired,
  selectedEvaluationType: PropTypes.number,
  selectedEmployee: PropTypes.shape({
    positionId: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    evaluationId: PropTypes.number
  }).isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired
};

export default Step1;