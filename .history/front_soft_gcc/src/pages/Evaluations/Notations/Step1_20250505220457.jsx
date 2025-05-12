import { useState, useEffect } from 'react';
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
  const [questionOptions, setQuestionOptions] = useState({});

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
        console.log('Questions sélectionnées reçues brutes:', questionsResponse.data);
        
        // Vérifier les doublons potentiels par ID de question
        const questionIds = questionsResponse.data.map(q => q.questionId);
        const uniqueIds = [...new Set(questionIds)];
        if (questionIds.length !== uniqueIds.length) {
          console.warn('Doublons détectés dans les IDs de questions:', 
            questionIds.filter((id, index) => questionIds.indexOf(id) !== index));
        }
        
        // Filtrer pour n'avoir que des questions uniques par ID
        const uniqueQuestions = [];
        const seenIds = new Set();
        
        questionsResponse.data.forEach(item => {
          if (!seenIds.has(item.questionId)) {
            seenIds.add(item.questionId);
            uniqueQuestions.push(item);
          }
        });
        
        console.log('Questions uniques après filtrage:', uniqueQuestions);

        const formattedQuestions = uniqueQuestions.map(item => ({
          questionId: item.questionId,
          text: item.questionText,
          competenceLineId: item.competenceLineId,
          competenceName: item.competenceName || 'Non spécifié',
          response: item.responseValue ? { responseValue: item.responseValue } : null,
          responseType: item.responseType,
          isCorrect: item.isCorrect
        }));

        setSelectedQuestions(formattedQuestions);

        const newRatings = {};
        const newCriteriaRatings = {};
        const newComments = {};

        formattedQuestions.forEach(question => {
          // Si nous avons déjà une réponse formatée, l'utiliser
          if (question.response) {
            const responseValue = question.response.responseValue || "";
            
            // Pour les réponses QCM, nous avons déjà le texte de l'option et non l'ID
            if (question.responseType === 'QCM') {
              // Mettre l'affichage du texte de l'option pour les QCM
              newRatings[question.questionId] = responseValue;
            } else {
              // Pour les réponses textuelles, on affiche le texte
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
                  // Si ce n'est pas un objet JSON mais un nombre (note simple)
                  newRatings[question.questionId] = parseInt(responseValue) || 0;
                }
              } catch {
                // En cas d'erreur de parsing, tenter de traiter comme un nombre simple
                newRatings[question.questionId] = parseInt(responseValue) || 0;
              }
            }
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
            
            // Commenté car génère des erreurs 404
            /* 
            // Tester d'abord avec un seul ID
            const testId = questionIds[0];
            console.log('Test avec un seul ID:', testId);
            
            // Tester l'API pour une seule question d'abord
            try {
              const singleResponse = await axios.get(`https://localhost:7082/api/ReferenceAnswer/question/${testId}`);
              console.log('Test d\'une seule référence:', singleResponse.data);
            } catch (singleError) {
              console.error('Erreur lors du test d\'une seule référence:', singleError);
            }
            */
            
            // S'assurer que nous envoyons bien un tableau et pas autre chose
            const referencesResponse = await axios.post(
              'https://localhost:7082/api/ReferenceAnswer/questions', 
              questionIds,
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                } 
              }
            );
            
            console.log('Références reçues:', referencesResponse.data);
            console.log('Type de la réponse:', typeof referencesResponse.data);
            console.log('Structure de la réponse:', Object.keys(referencesResponse.data));
            
            setReferences(referencesResponse.data);
            
            // Initialiser l'état des références (toutes visibles par défaut pour déboguer)
            const initialExpandedState = {};
            questionIds.forEach(id => {
              initialExpandedState[id] = true; // Mettre à true pour afficher par défaut
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

  useEffect(() => {
    const fetchQuestionOptions = async () => {
      try {
        if (!evaluationId) return;
        
        // Récupérer les options de questions pour les questions QCM
        const optionsResponse = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}/options`);
        setQuestionOptions(optionsResponse.data);
        console.log("Options récupérées:", optionsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des options:", error);
      }
    };
    
    fetchQuestionOptions();
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
      // Update localRatings and setRatings (mais ne pas enregistrer en base de données)
      setLocalRatings(lr => {
        const newRatings = { ...lr, [questionId]: average };
        setRatings(newRatings); // Ceci met à jour les notes dans le composant parent pour une utilisation ultérieure
        return newRatings;
      });
      return updated;
    });
  };

  const handleCommentChange = (questionId, comment) => {
    setComments(prev => ({ ...prev, [questionId]: comment }));
    // Ne pas enregistrer en base de données pour l'instant
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
    
    // Si keyPoints est un string, le diviser en lignes
    if (typeof keyPoints === 'string') {
      const lines = keyPoints.split('\n').filter(line => line.trim() !== '');
      
      return (
        <ul>
          {lines.map((line, index) => (
            <li key={index}>{line.replace(/^-\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    
    // Si c'est un tableau
    if (Array.isArray(keyPoints)) {
      return (
        <ul>
          {keyPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      );
    }
    
    // Par défaut, afficher tel quel
    return <p>{keyPoints}</p>;
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
      
      {/* Bouton de dépannage pour afficher l'état des références */}
      <div className="debug-section" style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
        <button 
          onClick={() => console.log('État des références:', references)}
          style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Déboguer références
        </button>
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <p>Nombre de questions: {selectedQuestions.length}</p>
          <p>Nombre de références: {Object.keys(references).length}</p>
          <p>IDs des questions: {selectedQuestions.map(q => q.questionId).join(', ')}</p>
          <p>IDs des références: {Object.keys(references).join(', ')}</p>
        </div>
      </div>

      {selectedQuestions.length > 0 ? (
        <div className="questions-section">
          <h3>Questions</h3>
          {selectedQuestions.map((question, index) => (
            <div key={`question-${question.questionId}-${index}`} className="question-item">
              <div className="question-response-section">
                <div className="question-header">
                  <div className="question-title">
                    <h4>Question {question.questionId}</h4>
                    <span className="competence-tag">
                      {question.competenceName}
                    </span>
                  </div>
                  <div className={`question-rating ${getRatingColorClass(localRatings[question.questionId])}`}>
                    <span className="rating-value">{localRatings[question.questionId] || 0}</span>
                    <span className="rating-label">/5</span>
                  </div>
                </div>
                
                <div className="question-content">
                  <p>{question.text}</p>
                </div>

                {/* Afficher la réponse donnée par l'employé */}
                {question.response && (
                  <div className="employee-response">
                    <h5>Réponse de l&apos;employé :</h5>
                    <div className="response-content">
                      {question.responseType === 'QCM' ? (
                        <div className="qcm-response">
                          {(() => {
                            // Essayer de nettoyer la valeur de réponse des guillemets potentiels
                            const cleanResponseValue = question.response.responseValue.replace(/^"|"$/g, '');
                            const optionId = parseInt(cleanResponseValue, 10);
                            
                            // Si nous avons les options pour cette question et l'ID est valide
                            if (questionOptions[question.questionId] && !isNaN(optionId)) {
                              // Chercher l'option correspondante
                              const option = questionOptions[question.questionId].find(opt => opt.optionId === optionId);
                              if (option) {
                                return <span className="option-text">{option.optionText}</span>;
                              }
                            }
                            
                            // Affichage par défaut si l'option n'est pas trouvée
                            return <span className="option-text">{question.response.responseValue}</span>;
                          })()}
                        </div>
                      ) : (
                        <p>{question.response.responseValue}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Section de notation */}
                <div className="rating-section">
                  <h5>Notation :</h5>
                  <div className="criteria-list">
                    {evaluationCriteria.map(criteria => (
                      <div key={criteria.id} className="criteria-item">
                        <div className="criteria-label">{criteria.label}</div>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={`star ${getCriteriaRating(question.questionId, criteria.id) >= star ? 'active' : ''}`}
                              onClick={() => handleCriteriaRatingChange(question.questionId, criteria.id, star)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="comment-section">
                    <label htmlFor={`comment-${question.questionId}`}>Commentaire :</label>
                    <textarea
                      id={`comment-${question.questionId}`}
                      value={comments[question.questionId] || ''}
                      onChange={(e) => handleCommentChange(question.questionId, e.target.value)}
                      placeholder="Ajouter un commentaire sur cette réponse..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section de référence avec toggle */}
              {references[question.questionId] && (
                <div className="reference-section">
                  <div className="reference-header" onClick={() => toggleReferenceExpand(question.questionId)}>
                    <h5>Réponse de référence</h5>
                    <span className="expand-icon">{expandedReferences[question.questionId] ? '▼' : '►'}</span>
                  </div>
                  {expandedReferences[question.questionId] && (
                    <div className="reference-content">
                      <p>{references[question.questionId].referenceText}</p>
                      {references[question.questionId].keyPoints && (
                        <div className="key-points">
                          <h6>Points clés attendus :</h6>
                          {renderKeyPoints(references[question.questionId].keyPoints)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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