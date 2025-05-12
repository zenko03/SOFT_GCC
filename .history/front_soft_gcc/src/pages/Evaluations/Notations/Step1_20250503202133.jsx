import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [criteriaRatings, setCriteriaRatings] = useState({});
  const [comments, setComments] = useState({});

  const evaluationCriteria = [
    { id: 'relevance', label: 'Pertinence de la réponse' },
    { id: 'technical', label: 'Niveau technique' },
    { id: 'clarity', label: 'Clarté d\'expression' }
  ];

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

        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        console.log('Questions sélectionnées reçues:', questionsResponse.data);
        
        const formattedQuestions = questionsResponse.data.map(item => ({
          questionId: item.questionId,
          text: item.questionText,
          competenceLineId: item.competenceLine.competenceLineId,
          competenceName: item.competenceLine.competenceName,
          response: item.response
        }));
        
        setSelectedQuestions(formattedQuestions);
        
        const newRatings = {};
        const newCriteriaRatings = {};
        const newComments = {};
        
        formattedQuestions.forEach(question => {
          const responseValue = question.response?.responseValue || "";
          
          try {
            const parsedValue = responseValue && responseValue.startsWith("{") 
              ? JSON.parse(responseValue)
              : null;
              
            if (parsedValue && typeof parsedValue === 'object') {
              evaluationCriteria.forEach(criteria => {
                const criteriaKey = `${question.questionId}-${criteria.id}`;
                newCriteriaRatings[criteriaKey] = parsedValue[criteria.id] || 0;
              });
              
              newComments[question.questionId] = parsedValue.comment || '';
              
              const criteriaValues = evaluationCriteria
                .map(c => parsedValue[c.id] || 0)
                .filter(v => v > 0);
                
              newRatings[question.questionId] = criteriaValues.length 
                ? Math.round(criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length) 
                : 0;
            } else {
              newRatings[question.questionId] = parseInt(responseValue) || 0;
            }
          } catch (e) {
            newRatings[question.questionId] = parseInt(responseValue) || 0;
          }
        });
        
        setLocalRatings(newRatings);
        setCriteriaRatings(newCriteriaRatings);
        setComments(newComments);
        setRatings(newRatings);

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

  const handleCriteriaRatingChange = (questionId, criteriaId, rating) => {
    const criteriaKey = `${questionId}-${criteriaId}`;
    
    setCriteriaRatings(prev => ({
      ...prev,
      [criteriaKey]: rating
    }));
    
    const questionCriteriaKeys = evaluationCriteria.map(c => `${questionId}-${c.id}`);
    const updatedCriteriaRatings = {
      ...criteriaRatings,
      [criteriaKey]: rating
    };
    
    const criteriaValues = questionCriteriaKeys
      .map(key => updatedCriteriaRatings[key] || 0)
      .filter(v => v > 0);
    
    const average = criteriaValues.length
      ? Math.round(criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length)
      : 0;
    
    const newRatings = { 
      ...localRatings, 
      [questionId]: average 
    };
    
    setLocalRatings(newRatings);
    setRatings(newRatings);
    
    const fullRating = {
      ...evaluationCriteria.reduce((obj, c) => {
        const key = `${questionId}-${c.id}`;
        return { ...obj, [c.id]: updatedCriteriaRatings[key] || 0 };
      }, {}),
      comment: comments[questionId] || '',
      overallRating: average
    };
    
    console.log(`Notation mise à jour pour question ${questionId}:`, fullRating);
  };

  const handleCommentChange = (questionId, comment) => {
    setComments(prev => ({
      ...prev,
      [questionId]: comment
    }));
  };

  const getCriteriaRating = (questionId, criteriaId) => {
    return criteriaRatings[`${questionId}-${criteriaId}`] || 0;
  };

  // Fonction utilitaire pour obtenir la classe de couleur en fonction de la note
  const getRatingColorClass = (rating) => {
    if (!rating) return '';
    if (rating <= 2) return 'rating-low';
    if (rating === 3) return 'rating-medium';
    return 'rating-high';
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
              <div className="question-response-section">
                <p className="question-text">{question.text}</p>
                {question.competenceName && (
                  <p className="competence-name">Compétence : {question.competenceName}</p>
                )}
                <div className="employee-response">
                  <h5>Réponse de l'employé :</h5>
                  <p>{question.response?.responseValue || "Aucune réponse"}</p>
                </div>
              </div>
              
              <div className="criteria-rating-section">
                <h5>Évaluation par critères :</h5>
                {evaluationCriteria.map(criteria => (
                  <div key={`${question.questionId}-${criteria.id}`} className="criteria-row">
                    <label>{criteria.label} :</label>
                    <div className="rating-buttons">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={`rating-${question.questionId}-${criteria.id}-${rating}`}
                          className={`rating-button ${getCriteriaRating(question.questionId, criteria.id) === rating ? 'selected' : ''} ${getCriteriaRating(question.questionId, criteria.id) === rating ? getRatingColorClass(rating) : ''}`}
                          onClick={() => handleCriteriaRatingChange(question.questionId, criteria.id, rating)}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="comment-section">
                  <label>Commentaire d'évaluation :</label>
                  <textarea
                    value={comments[question.questionId] || ''}
                    onChange={(e) => handleCommentChange(question.questionId, e.target.value)}
                    placeholder="Ajoutez un commentaire justificatif..."
                    className="comment-textarea"
                  />
                </div>
                
                <div className="overall-rating">
                  <h5>Note globale : {localRatings[question.questionId] || 0}/5</h5>
                </div>
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
  setRatings: PropTypes.func.isRequired
};

export default Step1;