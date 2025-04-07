import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({
  selectedEmployee,
  onNext,
  evaluationTypes,
  onEvaluationTypeChange,
  selectedEvaluationType
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [employeeResponses, setEmployeeResponses] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

  useEffect(() => {
    const fetchSelectedQuestions = async () => {
      if (!selectedEmployee?.evaluationId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `https://localhost:7082/api/Evaluation/evaluation/${selectedEmployee.evaluationId}/selected-questions`
        );
        
        setSelectedQuestions(response.data.questions);
        setEmployeeResponses(response.data.responses);
        setCorrectAnswers(response.data.correctAnswers);
        setError(null);
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        setError("Erreur lors du chargement des questions");
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedQuestions();
  }, [selectedEmployee?.evaluationId]);

  const QuestionResponse = ({ question, response, correctAnswer }) => {
    const isCorrect = response?.isCorrect;
    
    return (
      <div className="question-response-item">
        <div className="question-text">{question.text}</div>
        <div className="response-section">
          <div className="response-value">
            Réponse : {response?.responseValue || "Non répondue"}
          </div>
          <div className="response-status">
            {isCorrect ? (
              <span className="correct-icon">✓</span>
            ) : (
              <span className="incorrect-icon">✗</span>
            )}
          </div>
          {!isCorrect && correctAnswer && (
            <div className="correct-answer-info">
              <span className="info-icon">ℹ</span>
              <div className="correct-answer-popup">
                Bonne réponse : {correctAnswer}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  QuestionResponse.propTypes = {
    question: PropTypes.shape({
      text: PropTypes.string.isRequired,
      questionId: PropTypes.number.isRequired
    }).isRequired,
    response: PropTypes.shape({
      responseValue: PropTypes.string,
      isCorrect: PropTypes.bool
    }),
    correctAnswer: PropTypes.string
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
          onChange={(e) => onEvaluationTypeChange(Number(e.target.value))}
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
        {selectedQuestions.map(({ questionId, text }) => (
          <QuestionResponse
            key={questionId}
            question={{ questionId, text }}
            response={employeeResponses[questionId]}
            correctAnswer={correctAnswers[questionId]}
          />
        ))}
      </div>
      <button className="next-button" onClick={onNext}>
        Suivant
      </button>
    </div>
  );
}

Step1.propTypes = {
  selectedEmployee: PropTypes.shape({
    positionId: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    evaluationId: PropTypes.number
  }).isRequired,
  onNext: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.number.isRequired,
      typeName: PropTypes.string.isRequired
    })
  ).isRequired,
  onEvaluationTypeChange: PropTypes.func.isRequired,
  selectedEvaluationType: PropTypes.number
};

export default Step1;