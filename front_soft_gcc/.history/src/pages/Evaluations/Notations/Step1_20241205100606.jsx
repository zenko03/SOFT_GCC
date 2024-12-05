import React, { useEffect } from 'react';
import '../../../assets/css/Evaluations/Questions.css';

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee, ratings, setRatings, questions, setQuestions }) {
  const handleEvaluationTypeChange = async (event) => {
    const typeId = event.target.value;
    onEvaluationTypeChange(typeId);
    try {
      const response = await axios.get(
        `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.postId}`
      );
      setQuestions(response.data);
      setRatings({}); // Réinitialiser les notes
    } catch (error) {
      console.error('Erreur lors de la récupération des questions :', error);
    }
  };

  const handleRatingChange = (questionId, rating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [questionId]: rating,
    }));
  };

  return (
    <div className="step1-container">
      <h5>Sélectionnez le type d'évaluation :</h5>
      <select className="evaluation-select" value={selectedEvaluationType || ''} onChange={handleEvaluationTypeChange}>
        <option value="" disabled>
          Sélectionnez un type
        </option>
        {evaluationTypes.map((type) => (
          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
            {type.designation}
          </option>
        ))}
      </select>

      <div className="questions-container">
        {questions.map((question) => (
          <div key={question.questionId} className="question-item">
            <p>{question.question}</p>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={`rating-${question.questionId}-${rating}`} className="rating-label">
                  <input
                    type="radio"
                    name={`rating-${question.questionId}`}
                    value={rating}
                    checked={ratings[question.questionId] === rating}
                    onChange={() => handleRatingChange(question.questionId, rating)}
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

export default Step1;
