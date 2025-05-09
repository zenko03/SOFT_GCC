import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings, ratings }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!evaluationId) {
          setError("ID d&apos;évaluation non spécifié");
          setLoading(false);
          return;
        }

        // Récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        console.log('Questions sélectionnées reçues:', questionsResponse.data);
        
        // Transformer les données pour inclure les informations nécessaires
        const formattedQuestions = questionsResponse.data.map(item => ({
          questionId: item.QuestionId,
          text: item.QuestionText,
          competenceLineId: item.CompetenceLineId,
          competenceName: item.CompetenceLine?.CompetenceName,
          response: item.Response
        }));
        
        setSelectedQuestions(formattedQuestions);
        
        // Initialiser les notes pour chaque question
        const newRatings = {};
        formattedQuestions.forEach(question => {
          newRatings[question.questionId] = question.response?.ResponseValue || 0;
        });
        
        // Ne mettre à jour les ratings que si nécessaire
        if (JSON.stringify(newRatings) !== JSON.stringify(localRatings)) {
          setLocalRatings(newRatings);
          setRatings(newRatings);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchEvaluationDetails();
    }
  }, [evaluationId]);

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      <h2>Étape 1 : Notation</h2>
      
      {selectedQuestions.length > 0 ? (
        <div className="questions-section">
          <h3>Questions</h3>
          {selectedQuestions.map(question => (
            <div key={`question-${question.questionId}`} className="question-item">
              <p className="question-text">{question.text}</p>
              {question.competenceName && (
                <p className="competence-name">Compétence : {question.competenceName}</p>
              )}
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={`rating-${question.questionId}-${rating}`}
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
      ) : (
        <div className="no-questions-message">
          Aucune question n&apos;a été sélectionnée pour cette évaluation.
        </div>
      )}
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired
};

export default Step1;