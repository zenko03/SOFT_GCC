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
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [employeeResponses, setEmployeeResponses] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

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
      <h2>Questions de l&apos;évaluation</h2>
      <div className="questions-list">
        {selectedQuestions.map(question => (
          <QuestionResponse
            key={question.questionId}
            question={question}
            response={employeeResponses[question.questionId]}
            correctAnswer={correctAnswers[question.questionId]}
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
  evaluationTypes: PropTypes.arrayOf(PropTypes.shape({
    evaluationTypeId: PropTypes.number.isRequired,
    designation: PropTypes.string.isRequired
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