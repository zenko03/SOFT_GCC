import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee, setRatings, ratings }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localRatings, setLocalRatings] = useState({}); // Pour stocker temporairement les notes des questions

  useEffect(() => {
    if (selectedEvaluationType && selectedEmployee.postId) { // Vérifiez si postId est défini
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${selectedEvaluationType}&postId=${selectedEmployee.postId}`
          );
          console.log("Questions récupérées :", response.data);
          setQuestions(response.data);
          setLocalRatings(ratings);
        } catch (error) {
          console.error("Erreur lors de la récupération des questions :", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [selectedEvaluationType, selectedEmployee.postId]); // Ajoutez une vérification conditionnelle
  

  const handleEvaluationTypeChange = async (event) => {
    const typeId = event.target.value;
    onEvaluationTypeChange(typeId); // Appel de la fonction parent
    setLoading(true); // Afficher l'indicateur de chargement

    try {
      console.log("employee selecftionne :", selectedEmployee)
      const response = await axios.get(
        `https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.postId}`
      );
      console.log("Questions récupérées après changement :", response.data); // Log des questions récupérées
      setQuestions(response.data);
      setLocalRatings({}); // Réinitialiser les notes lorsque le type d'évaluation change
    } catch (error) {
      
      console.error("Erreur lors de la récupération des questions :", error);
    } finally {
      setLoading(false); // Masquer l'indicateur de chargement
    }
  };

  const handleRatingChange = (questionId, rating) => {
    console.log(`Rating changed for question ${questionId}: ${rating}`); // Log pour vérifier l'ID de la question

    setLocalRatings(prevRatings => ({
      ...prevRatings,
      [questionId]: rating // Utiliser l'ID de la question comme clé
    }));
  };

  // Passer les notes au composant parent lorsque l'utilisateur change d'étape
  useEffect(() => {
    setRatings(localRatings); // Passer les notes mises à jour
  }, [localRatings]); // Gardez uniquement localRatings ici

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
        {questions.map(question => (
          <div key={question.questiondId} className="question-item"> {/* Utiliser questiondId ici */}
            <p>{question.question}</p> {/* Assurez-vous que 'question' est la bonne propriété */}
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(rating => (
                <label key={`rating-${question.questiondId}-${rating}`} className="rating-label"> {/* Utiliser questiondId ici aussi */}
                  <input
                    type="radio"
                    name={`rating-${question.questiondId}`}
                    value={rating}
                    checked={localRatings[question.questiondId] === rating}
                    onChange={() => handleRatingChange(question.questiondId, rating)} // Passer l'ID ici
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