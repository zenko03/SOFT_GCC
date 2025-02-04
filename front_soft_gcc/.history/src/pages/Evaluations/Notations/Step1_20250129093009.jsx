import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({
  evaluationTypes,
  onEvaluationTypeChange,
  selectedEvaluationType,
  selectedEmployee,
  setRatings,
  ratings,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({}); // Pour stocker temporairement les notes des questions
  const [cachedQuestions, setCachedQuestions] = useState({}); // Cache des questions par type d'évaluation

  // Récupérer les questions lorsque le type d'évaluation ou l'employé change
  useEffect(() => {
    if (!selectedEmployee || !selectedEmployee.posteId) {
      setError("Aucun employé sélectionné ou poste non défini.");
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
          `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${selectedEvaluationType}&postId=${selectedEmployee.posteId}`
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
        setError("Erreur lors de la récupération des questions. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedEvaluationType, selectedEmployee.posteId]);

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
          `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.posteId}`
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

  return (
    <div className="step1-container">
      <h5>Sélectionnez le type d'évaluation :</h5>
      <select
        className="evaluation-select"
        value={selectedEvaluationType || ''}
        onChange={handleEvaluationTypeChange}
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

      {/* {questions.length === 0 && !loading && (
        <div className="no-questions-message">
          Aucune question disponible pour ce type d'évaluation.
        </div>
      )} */}

      <div className="questions-container">
        {questions.map((question) => (
          <div key={question.questiondId} className="question-item">
            <p>{question.question}</p>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label
                  key={`rating-${question.questiondId}-${rating}`}
                  className="rating-label"
                >
                  <input
                    type="radio"
                    name={`rating-${question.questiondId}`}
                    value={rating}
                    checked={localRatings[question.questiondId] === rating}
                    onChange={() => handleRatingChange(question.questiondId, rating)}
                    aria-label={`Note ${rating} pour ${question.question}`}
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