import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const EvaluationFill = ({ interview, employeeId, extractedData }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [globalNotes, setGlobalNotes] = useState('');
  const [average, setAverage] = useState(0);
  const [autoFillStatus, setAutoFillStatus] = useState({
    applied: false,
    count: 0
  });

  useEffect(() => {
    // Charger les questions disponibles pour cette évaluation
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        const response = await axios.get(`https://localhost:7082/api/EvaluationQuestion/evaluation/${interview.evaluationId}/questions`);
        
        let loadedQuestions = response.data || [];
        console.log("Questions chargées:", loadedQuestions);
        
        // Si on a des données extraites, les associer aux questions par texte/contenu
        if (extractedData && extractedData.questions && extractedData.questions.length > 0) {
          console.log("Données extraites disponibles:", extractedData);
          
          // Garder une trace des questions qui ont été associées
          let matchCount = 0;
          
          loadedQuestions = loadedQuestions.map(question => {
            // Trouver une correspondance dans les données extraites
            const matchingData = extractedData.questions.find(extractedQuestion => 
              // Comparaison des textes (simple)
              isSimilarQuestion(extractedQuestion.questionText, question.questionText)
            );
            
            if (matchingData) {
              matchCount++;
              return {
                ...question,
                note: matchingData.rating || 0,
                comment: matchingData.comment || ''
              };
            }
            
            return question;
          });
          
          // Mettre à jour le statut de remplissage automatique
          setAutoFillStatus({
            applied: true,
            count: matchCount
          });
          
          // Si des notes générales sont disponibles dans les données extraites
          if (extractedData.notes) {
            setGlobalNotes(extractedData.notes);
          }
          
          // Si une moyenne est disponible dans les données extraites
          if (extractedData.average) {
            setAverage(extractedData.average);
          }
          
          // Notification de succès pour l'utilisateur
          if (matchCount > 0) {
            toast.success(`${matchCount} questions pré-remplies à partir du PDF importé.`);
          } else {
            toast.warning("Aucune correspondance trouvée entre le PDF et les questions de l'évaluation.");
          }
        }
        
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error("Erreur lors du chargement des questions:", error);
        toast.error("Erreur lors du chargement des questions de l'évaluation.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (interview && interview.evaluationId) {
      fetchQuestions();
    }
  }, [interview, extractedData]);
  
  // Calculer la moyenne des notes à chaque changement
  useEffect(() => {
    if (questions.length > 0) {
      const validRatings = questions
        .map(q => q.note)
        .filter(rating => rating > 0);
      
      if (validRatings.length > 0) {
        const avg = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        setAverage(parseFloat(avg.toFixed(2)));
      } else {
        setAverage(0);
      }
    }
  }, [questions]);
  
  // Fonction d'aide pour comparer deux questions (version simple)
  const isSimilarQuestion = (text1, text2) => {
    if (!text1 || !text2) return false;
    
    // Version simple: normalisation et test d'inclusion
    const normalize = str => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);
    
    // Si l'un des textes est très court, exiger une correspondance plus stricte
    if (norm1.length < 10 || norm2.length < 10) {
      return norm1 === norm2;
    }
    
    return norm1.includes(norm2) || norm2.includes(norm1);
  };
  
  // Gestion des changements de note
  const handleRatingChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].note = parseInt(value, 10);
    setQuestions(newQuestions);
  };
  
  // Gestion des changements de commentaire
  const handleCommentChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].comment = value;
    setQuestions(newQuestions);
  };
  
  // Enregistrement des données de l'évaluation
  const handleSaveEvaluation = async () => {
    try {
      setIsSaving(true);
      
      // Construire le payload avec les données à sauvegarder
      const payload = {
        evaluationId: interview.evaluationId,
        employeeId: employeeId,
        questions: questions.map(q => ({
          questionId: q.questionId,
          rating: q.note || 0,
          comment: q.comment || ''
        })),
        notes: globalNotes,
        average: average
      };
      
      // Appel à l'API pour sauvegarder les données
      await axios.post(
        'https://localhost:7082/api/EvaluationQuestion/evaluation/save-responses',
        payload
      );
      
      toast.success("Évaluation enregistrée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'évaluation:", error);
      toast.error("Erreur lors de l'enregistrement de l'évaluation");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="evaluation-fill-container">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center bg-light">
          <h5 className="mb-0 d-flex align-items-center">
            <i className="mdi mdi-clipboard-text-outline text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
            Remplissage de la fiche d&apos;évaluation
          </h5>
          <div>
            <span className="badge bg-primary me-2">
              Note moyenne: {average}/5
            </span>
            {autoFillStatus.applied && (
              <span className="badge bg-success">
                {autoFillStatus.count} questions pré-remplies
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3">Chargement des questions...</p>
            </div>
          ) : (
            <>
              {questions.length > 0 ? (
                <>
                  <div className="questions-list">
                    {/* En-têtes des colonnes */}
                    <div className="row fw-bold pb-2 mb-3 border-bottom">
                      <div className="col-md-5">Question</div>
                      <div className="col-md-2">Compétence</div>
                      <div className="col-md-1">Note</div>
                      <div className="col-md-4">Commentaire</div>
                    </div>
                    
                    {/* Liste des questions */}
                    {questions.map((question, index) => (
                      <div key={question.questionId} className="row mb-3 pb-3 question-item align-items-center border-bottom">
                        <div className="col-md-5">
                          <div className="question-text">{question.questionText}</div>
                        </div>
                        
                        <div className="col-md-2">
                          <span className="badge bg-info">
                            {question.competenceName || `Compétence ${question.competenceLineId}`}
                          </span>
                        </div>
                        
                        <div className="col-md-1">
                          <select 
                            className="form-select form-select-sm" 
                            value={question.note || 0}
                            onChange={(e) => handleRatingChange(index, e.target.value)}
                          >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </div>
                        
                        <div className="col-md-4">
                          <textarea 
                            className="form-control form-control-sm"
                            rows="2"
                            value={question.comment || ''}
                            onChange={(e) => handleCommentChange(index, e.target.value)}
                            placeholder="Commentaire..."
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Notes globales */}
                  <div className="form-group mt-4">
                    <label className="form-label d-flex align-items-center">
                      <i className="mdi mdi-note-text-outline me-2"></i>
                      Notes générales
                    </label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={globalNotes}
                      onChange={(e) => setGlobalNotes(e.target.value)}
                      placeholder="Notes générales sur l'évaluation..."
                    ></textarea>
                  </div>
                  
                  {/* Bouton d'enregistrement */}
                  <div className="d-flex justify-content-end mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveEvaluation}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <i className="mdi mdi-content-save-outline me-2"></i>
                          Enregistrer l&apos;évaluation
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="alert alert-warning">
                  <i className="mdi mdi-alert-outline me-2"></i>
                  Aucune question disponible pour cette évaluation.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

EvaluationFill.propTypes = {
  interview: PropTypes.object.isRequired,
  employeeId: PropTypes.number.isRequired,
  extractedData: PropTypes.object
};

export default EvaluationFill;
