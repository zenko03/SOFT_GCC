import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee, setRatings }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localRatings, setLocalRatings] = useState({}); // Pour stocker temporairement les notes des questions

  useEffect(() => {
    // Charger les questions si le type d'évaluation est déjà sélectionné
    if (selectedEvaluationType) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${selectedEvaluationType}&postId=${selectedEmployee.postId}`);
          setQuestions(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des questions :", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [selectedEvaluationType, selectedEmployee.postId]);

  const handleEvaluationTypeChange = async (event) => {
    const typeId = event.target.value;
    onEvaluationTypeChange(typeId); // Appel de la fonction parent
    setLoading(true); // Afficher l'indicateur de chargement

    try {
      const response = await axios.get(`https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.postId}`);
      setQuestions(response.data);
      console.log("Questions récupérées :", response.data); // Log des questions récupérées

      // Réinitialiser les notes lorsque le type d'évaluation change
      setLocalRatings({});
    } catch (error) {
      console.error("Erreur lors de la récupération des questions :", error);
    } finally {
      setLoading(false); // Masquer l'indicateur de chargement
    }
  };

  const handleRatingChange = (questionId, rating) => {
    setLocalRatings(prevRatings => ({
      ...prevRatings,
      [questionId]: rating
    }));
  };

  return (
    <div className="step1-container">
      <h5>Sélectionnez le type d'évaluation :</h5>
      <select className="evaluation-select" value={selectedEvaluationType || ''} onChange={handleEvaluationTypeChange}>
        <option value="" disabled>Sélectionnez un type</option>
        {evaluationTypes.map(type => (
          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
            {type.designation}
          </option>
        ))}
      </select>

      {loading && <div className="loader"></div>} {/* Indicateur de chargement */}

      <div className="questions-container">
        {questions.length > 0 && questions.map(question => (
          <div key={question.questionId} className="question-item">
            <p>{question.question}</p> {/* Assurez-vous que 'question' est la bonne propriété */}
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(rating => (
                <label key={`rating-${question.questionId}-${rating}`} className="rating-label"> {/* Clé unique pour chaque label */}
                  <input
                    type="radio"
                    name={`rating-${question.questionId}`}
                    value={rating}
                    checked={localRatings[question.questionId] === rating}
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