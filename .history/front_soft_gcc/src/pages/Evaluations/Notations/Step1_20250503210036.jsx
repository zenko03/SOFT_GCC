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
  const [references, setReferences] = useState({});
  const [expandedReferences, setExpandedReferences] = useState({});

  const evaluationCriteria = [
    { id: 'relevance', label: 'Pertinence de la réponse' },
    { id: 'technical', label: 'Niveau technique' },
    { id: 'clarity', label: 'Clarté d&apos;expression' }
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
          } catch {
            newRatings[question.questionId] = parseInt(responseValue) || 0;
          }
        });

        setLocalRatings(newRatings);
        setCriteriaRatings(newCriteriaRatings);
        setComments(newComments);
        setRatings(newRatings);

        // Récupérer les références d'évaluation pour les questions sélectionnées
        if (formattedQuestions.length > 0) {
          try {
            const questionIds = formattedQuestions.map(q => q.questionId);
            console.log('Envoi de la requête avec questionIds:', questionIds);
            
            const referencesResponse = await axios.post(
              'https://localhost:7082/api/ReferenceAnswer/questions', 
              questionIds,
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            console.log('Références reçues:', referencesResponse.data);
            console.log('Type de la réponse:', typeof referencesResponse.data);
            console.log('Structure de la réponse:', Object.keys(referencesResponse.data));
            
            setReferences(referencesResponse.data);
            
            // Initialiser l'état des références (toutes repliées par défaut)
            const initialExpandedState = {};
            questionIds.forEach(id => {
              initialExpandedState[id] = false;
            });
            setExpandedReferences(initialExpandedState);
          }
          catch (refError) {
            console.error('Erreur lors de la récupération des références:', refError);
            console.error('Détails de l\'erreur:', refError.response?.data || refError.message);
            console.error('Status de l\'erreur:', refError.response?.status);
            // Ne pas bloquer le flux principal en cas d'erreur de références
          }
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

  const handleCriteriaRatingChange = (questionId, criteriaId, rating) => {
    const criteriaKey = `${questionId}-${criteriaId}`;
    setCriteriaRatings(prev => {
      const updated = { ...prev, [criteriaKey]: rating };
      // Compute average
      const questionCriteriaKeys = evaluationCriteria.map(c => `${questionId}-${c.id}`);
      const criteriaValues = questionCriteriaKeys
        .map(key => updated[key] || 0)
        .filter(v => v > 0);
      const average = criteriaValues.length
        ? Math.round(criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length)
        : 0;
      // Update localRatings and setRatings
      setLocalRatings(lr => {
        const newRatings = { ...lr, [questionId]: average };
        setRatings(newRatings);
        return newRatings;
      });
      return updated;
    });
  };

  const handleCommentChange = (questionId, comment) => {
    setComments(prev => {
      const updated = { ...prev, [questionId]: comment };
      return updated;
    });
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

  // Fonction pour afficher les points clés attendus sous forme de liste
  const renderKeyPoints = (keyPoints) => {
    if (!keyPoints) return null;
    
    const lines = keyPoints.split('\n').filter(line => line.trim() !== '');
    
    return (
      <ul>
        {lines.map((line, index) => (
          <li key={index}>{line.replace(/^-\s*/, '')}</li>
        ))}
      </ul>
    );
  };

  // Fonction pour basculer l'affichage de la référence
  const toggleReferenceExpand = (questionId) => {
    setExpandedReferences(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Log pour vérifier l'état des références avant le rendu
  console.log("État des références avant rendu:", references);
  console.log("Questions disponibles:", selectedQuestions.map(q => q.questionId));

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
                  <h5>Réponse de l&apos;employé :</h5>
                  <p>
                    {(() => {
                      const val = question.response?.responseValue;
                      if (!val) return "Aucune réponse";
                      try {
                        const parsed = JSON.parse(val);
                        if (typeof parsed === 'object') {
                          return Object.entries(parsed)
                            .filter(([k]) => k !== 'comment' && k !== 'overallRating')
                            .map(([k, v]) => <span key={k}>{k}: {v}<br /></span>);
                        }
                        return val;
                      } catch {
                        return val;
                      }
                    })()}
                  </p>
                </div>
                
                {/* Section de référence pour l'évaluation */}
                {console.log(`Question ${question.questionId} a-t-elle une référence?`, !!references[question.questionId])}
                {references && references[question.questionId] ? (
                  <div className="reference-section">
                    <button 
                      className="toggle-reference-btn"
                      onClick={() => toggleReferenceExpand(question.questionId)}
                    >
                      <span className={`indicator ${expandedReferences[question.questionId] ? '' : 'collapsed'}`}>▼</span>
                      {expandedReferences[question.questionId] ? 'Masquer les références d\'évaluation' : 'Voir les références d\'évaluation'}
                    </button>
                    
                    {expandedReferences[question.questionId] && (
                      <>
                        <h4><i className="fas fa-book"></i> Référence d&apos;évaluation</h4>
                        
                        <div className="reference-content">
                          <strong>Réponse de référence :</strong>
                          <p>{references[question.questionId].referenceText}</p>
                        </div>
                        
                        <div className="guidelines">
                          <strong>Critères d&apos;évaluation :</strong>
                          <p>{references[question.questionId].evaluationGuidelines}</p>
                        </div>
                        
                        <div className="key-points">
                          <strong>Points clés attendus :</strong>
                          {renderKeyPoints(references[question.questionId].expectedKeyPoints)}
                        </div>
                        
                        <div className="level-descriptions">
                          <h5>Description des niveaux de notation :</h5>
                          <div className="level-description">
                            <div className="level-number">1</div>
                            <div className="level-text">{references[question.questionId].scoreDescription1}</div>
                          </div>
                          <div className="level-description">
                            <div className="level-number">2</div>
                            <div className="level-text">{references[question.questionId].scoreDescription2}</div>
                          </div>
                          <div className="level-description">
                            <div className="level-number">3</div>
                            <div className="level-text">{references[question.questionId].scoreDescription3}</div>
                          </div>
                          <div className="level-description">
                            <div className="level-number">4</div>
                            <div className="level-text">{references[question.questionId].scoreDescription4}</div>
                          </div>
                          <div className="level-description">
                            <div className="level-number">5</div>
                            <div className="level-text">{references[question.questionId].scoreDescription5}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
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
                  <label>Commentaire d&apos;évaluation :</label>
                  <textarea
                    value={comments[question.questionId] || ''}
                    onChange={(e) => handleCommentChange(question.questionId, e.target.value)}
                    placeholder="Ajoutez un commentaire justificatif..."
                    className="comment-textarea"
                  />
                </div>

                <div className={`overall-rating ${getRatingColorClass(localRatings[question.questionId])}`}>
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