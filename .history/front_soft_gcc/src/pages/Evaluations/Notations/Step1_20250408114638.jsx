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
            setIsTypeSelected(true);
            await loadSelectedQuestions();
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
      setQuestions(response.data.questions || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Erreur lors du chargement des questions');
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div className="loader">Chargement...</div>;
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
          value={currentEvaluationType?.evaluationTypeId || ''}
          disabled={true}
        >
          <option value="" disabled>Sélectionnez un type d&apos;évaluation</option>
          {evaluationTypes.map((type) => (
            <option
              key={type.evaluationTypeId}
              value={type.evaluationTypeId}
              style={{
                backgroundColor: type.evaluationTypeId === employeeEvalType?.evaluationTypeId ? '#e6f7ff' : 'white',
                color: type.evaluationTypeId === employeeEvalType?.evaluationTypeId ? '#1890ff' : '#333'
              }}
            >
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      <div className="questions-section">
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