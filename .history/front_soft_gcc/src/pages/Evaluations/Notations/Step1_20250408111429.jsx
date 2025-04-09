import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';

const Step1 = ({ evaluationId, setRatings, evaluationTypes, selectedEmployee }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);
  const [isTypeSelected, setIsTypeSelected] = useState(false);
  const [employeeEvalType, setEmployeeEvalType] = useState(null);

  // Debug logs pour les props reçues
  useEffect(() => {
    console.log('Props reçues dans Step1:', {
      evaluationId,
      evaluationTypes,
      selectedEmployee
    });
  }, [evaluationId, evaluationTypes, selectedEmployee]);

  // Charger les détails de l'évaluation et le type d'évaluation de l'employé
  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      if (!evaluationId) {
        console.log("Pas d'ID d'évaluation fourni");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Récupération des détails de l'évaluation ${evaluationId}`);

        const response = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        console.log('Détails de l\'évaluation reçus:', response.data);

        if (response.data && response.data.evaluationTypeId) {
          const evalType = evaluationTypes.find(
            type => type.evaluationTypeId === response.data.evaluationTypeId
          );

          console.log('Type d\'évaluation trouvé:', evalType);

          if (evalType) {
            setEmployeeEvalType(evalType);
            setCurrentEvaluationType(evalType);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        setError('Erreur lors du chargement des détails de l\'évaluation');
        setLoading(false);
      }
    };

    fetchEvaluationDetails();
  }, [evaluationId, evaluationTypes]);

  const loadSelectedQuestions = async () => {
    try {
      setLoading(true);
      console.log(`Chargement des questions pour l'évaluation ${evaluationId}`);

      const response = await axios.get(
        `https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`
      );

      console.log('Questions reçues:', response.data);
      setQuestions(response.data.questions);
      setIsTypeSelected(true);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Erreur lors du chargement des questions');
      setLoading(false);
    }
  };

  const handleEvaluationTypeChange = async (event) => {
    const selectedTypeId = event.target.value;
    console.log('Type d\'évaluation sélectionné:', selectedTypeId);

    const selectedType = evaluationTypes.find(
      type => type.evaluationTypeId.toString() === selectedTypeId
    );

    if (selectedType) {
      console.log('Type trouvé:', selectedType);
      setCurrentEvaluationType(selectedType);

      if (selectedType.evaluationTypeId === employeeEvalType?.evaluationTypeId) {
        await loadSelectedQuestions();
      }
    }
  };

  if (loading) {
    return <div className="loader">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      {!isTypeSelected ? (
        <div className="evaluation-type-selection">
          <h3>Type d'évaluation pour {selectedEmployee?.firstName} {selectedEmployee?.lastName}</h3>
          <div className="evaluation-select-container">
            <select
              className="evaluation-select"
              value={currentEvaluationType?.evaluationTypeId || ''}
              onChange={handleEvaluationTypeChange}
            >
              <option value="" disabled>Sélectionnez un type d'évaluation</option>
              {evaluationTypes.map((type) => (
                <option
                  key={type.evaluationTypeId}
                  value={type.evaluationTypeId}
                  disabled={type.evaluationTypeId !== employeeEvalType?.evaluationTypeId}
                >
                  {type.designation}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="questions-section">
          <h2>Questions pour le type d'évaluation: {currentEvaluationType?.designation}</h2>
          {questions.map((question) => (
            <div key={question.questionId} className="question-item">
              <p className="question-text">{question.text}</p>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map((rating) => (
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
      )}
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.string.isRequired,
  setRatings: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.string.isRequired,
      designation: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedEmployee: PropTypes.object.isRequired,
};

export default Step1;