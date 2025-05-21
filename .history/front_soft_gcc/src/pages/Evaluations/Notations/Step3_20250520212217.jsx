import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';
import './Step3.css';
// Importer depuis le nouveau fichier
import { downloadEvaluationPDF, previewEvaluationPDF } from './pdfGenerator';

// Logo Softwell encodé directement en base64 pour éviter les problèmes d'import

const Step3 = ({ ratings, average, evaluationId, validationData, onValidationChange, onGeneratePDF }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [showTrainingSuggestions, setShowTrainingSuggestions] = useState(false);
  const [trainingSuggestions, setTrainingSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Ajout d'un verrou pour éviter les générations de PDF multiples
  const pdfGenerationLock = useRef(false);
  // Référence pour suivre si le montage est terminé
  const isComponentMounted = useRef(false);
  // Drapeau pour indiquer si l'utilisateur a demandé un PDF (utilisé dans les fonctions internes)
  const userRequestedPdf = useRef(false);
  // Référence pour éviter les appels multiples à l'API
  const isApiCalled = useRef(false);

  // Récupérer les données de l'employé une fois au chargement
  useEffect(() => {
    const fetchEmployeeData = async () => {
      // Éviter de rappeler si déjà en cours
      if (isApiCalled.current) return;
      isApiCalled.current = true;
      
      try {
        console.log("Récupération des données de l'employé pour l'évaluation", evaluationId);
        
        // Vérifier si evaluationId est valide
        if (!evaluationId || evaluationId <= 0) {
          throw new Error("ID d'évaluation invalide");
        }
        
        // Essayer de récupérer les informations de l'évaluation en premier
        try {
          const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
          console.log("Données d'évaluation reçues:", evaluationResponse.data);
          
          if (evaluationResponse.data) {
            // Récupérer l'ID de l'employé depuis l'évaluation
            const employeeId = evaluationResponse.data.employeeId || evaluationResponse.data.userId;
            
            if (employeeId) {
              try {
                // Essayer de récupérer les détails de l'employé
                const employeeResponse = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
                
                if (employeeResponse.data) {
                  console.log("Données d'employé récupérées:", employeeResponse.data);
                  setEmployeeData({
                    firstName: employeeResponse.data.firstName || 'Non trouvé',
                    lastName: employeeResponse.data.lastName || 'Non trouvé',
                    department: employeeResponse.data.department || 'Non défini',
                    position: employeeResponse.data.position || 'Non défini'
                  });
                  isApiCalled.current = false;
                  return;
                }
              } catch (err) {
                console.warn("Erreur lors de la récupération des détails de l'employé:", err.message);
              }
            }
            
            // Si nous avons des informations directement dans l'évaluation, les utiliser
            if (evaluationResponse.data.firstName && evaluationResponse.data.lastName) {
              setEmployeeData({
                firstName: evaluationResponse.data.firstName,
                lastName: evaluationResponse.data.lastName,
                department: evaluationResponse.data.department || 'Non défini',
                position: evaluationResponse.data.position || 'Non défini'
              });
              isApiCalled.current = false;
              return;
            }
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération des données d'évaluation:", err.message);
        }
        
        // Essayer avec l'API des employés évalués
        try {
          const employeesResponse = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
            params: { pageNumber: 1, pageSize: 100 }
          });
          
          if (employeesResponse.data && employeesResponse.data.employees) {
            // Chercher l'employé correspondant à cette évaluation
            const employee = employeesResponse.data.employees.find(
              emp => emp.evaluationId === parseInt(evaluationId)
            );
            
            if (employee) {
              console.log("Employé trouvé dans la liste:", employee);
              setEmployeeData({
                firstName: employee.firstName || 'Non trouvé',
                lastName: employee.lastName || 'Non trouvé',
                department: employee.department || 'Non défini',
                position: employee.position || 'Non défini'
              });
              isApiCalled.current = false;
              return;
            }
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération de la liste des employés:", err.message);
        }
        
        // Si aucune des méthodes précédentes n'a fonctionné, utiliser des données par défaut
        throw new Error("Impossible de récupérer les données de l'employé");
      } catch (err) {
        console.error("Erreur lors de la récupération des données de l'employé:", err);
        // Données fictives en cas d'erreur pour permettre tout de même la génération du PDF
        setEmployeeData({
          firstName: 'Employé',
          lastName: 'Non identifié',
          department: 'Département non spécifié',
          position: 'Poste non spécifié'
        });
      } finally {
        isApiCalled.current = false;
      }
    };

    if (evaluationId && !employeeData) {
      fetchEmployeeData();
    }
  }, [evaluationId, employeeData]);

  // Fonction pour prévisualiser le PDF
  const handlePreviewPDF = async () => {
    try {
      setLoading(true);
      
      // Si les suggestions de formation n'ont pas été chargées, les charger maintenant
      let suggestions = trainingSuggestions;
      if (!showTrainingSuggestions) {
        try {
          const response = await axios.post('https://localhost:7082/api/Evaluation/suggestions', { ratings });
          suggestions = response.data;
        } catch (err) {
          console.error('Error fetching training suggestions for preview:', err);
          suggestions = [];
        }
      }

      // Préparation des données d'évaluation
      const evaluationDataForPDF = {
        evaluationId,
        date: new Date().toLocaleDateString()
      };

      // Générer l'URL de prévisualisation du PDF
      const url = previewEvaluationPDF(
        evaluationDataForPDF,
        employeeData || {
          firstName: 'Employé',
          lastName: 'Non identifié',
          department: 'Département inconnu',
          position: 'Poste inconnu'
        },
        ratings,
        average,
        validationData,
        suggestions
      );
      
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (err) {
      console.error('Erreur lors de la prévisualisation du PDF:', err);
      setError('Une erreur est survenue lors de la prévisualisation du PDF.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fermer la prévisualisation
  const closePreview = () => {
    setShowPreview(false);
    // Libérer l'URL de l'objet blob
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Marquer que le composant est monté
  useEffect(() => {
    console.log("Composant Step3 monté");
    isComponentMounted.current = true;
    
    return () => {
      console.log("Composant Step3 démonté");
      isComponentMounted.current = false;
      pdfGenerationLock.current = false;
      
      // Réinitialiser userRequestedPdf pour éviter les effets indésirables
      userRequestedPdf.current = false;
    };
  }, []);

  // Enregistrer la fonction de génération PDF au composant parent
  useEffect(() => {
    if (!isComponentMounted.current || !onGeneratePDF) return;
    
    // Créer et enregistrer explicitement la fonction de génération
    console.log("Enregistrement de la fonction de génération PDF (sans génération automatique)", evaluationId);
    
    // Créer une fonction wrapper qui ne sera exécutée que lorsque l'utilisateur 
    // clique sur "Valider et Générer PDF" dans le composant parent
    const generatePdfOnDemandOnly = () => {
      console.log("Fonction de génération de PDF appelée explicitement par l'utilisateur");
      userRequestedPdf.current = true;
      
      // Préparation des données d'évaluation
      const evaluationDataForPDF = {
        evaluationId,
        date: new Date().toLocaleDateString()
      };

      // S'assurer que employeeData est défini
      const employeeDataForPDF = employeeData || {
        firstName: 'Employé',
        lastName: 'Non identifié',
        department: 'Département inconnu',
        position: 'Poste inconnu'
      };
      
      // Appeler directement la fonction de téléchargement
      return downloadEvaluationPDF(
        evaluationDataForPDF,
        employeeDataForPDF,
        ratings,
        average,
        validationData,
        trainingSuggestions
      );
    };
    
    // Enregistrer UNIQUEMENT la référence à la fonction, sans l'exécuter
    onGeneratePDF(() => generatePdfOnDemandOnly);
    
    return () => {
      // Nettoyer la référence lors du démontage pour éviter les memory leaks
      console.log("Nettoyage de la référence à la fonction de génération PDF");
      if (onGeneratePDF) onGeneratePDF(null);
    };
  }, [onGeneratePDF, evaluationId, ratings, average, validationData, employeeData, trainingSuggestions]);

  const handleCheckboxChange = (field) => {
    const newValue = !validationData[field];
    onValidationChange(field, newValue);
    
    // Si on décoche la case, on efface l'erreur correspondante
    if (!newValue) {
      const errors = { ...validationErrors };
      delete errors[field === 'serviceApproved' ? 'serviceDate' : 'dgDate'];
      setValidationErrors(errors);
    } 
    // Si on coche la case et qu'aucune date n'est sélectionnée, on affiche l'erreur
    else if (field === 'serviceApproved' && !validationData.serviceDate) {
      setValidationErrors(prev => ({ ...prev, serviceDate: 'Veuillez sélectionner une date' }));
    }
    else if (field === 'dgApproved' && !validationData.dgDate) {
      setValidationErrors(prev => ({ ...prev, dgDate: 'Veuillez sélectionner une date' }));
    }
  };

  const handleDateChange = (field, value) => {
    onValidationChange(field, value);
    
    // Validation de la date
    const errors = { ...validationErrors };
    const dateField = field === 'serviceDate' ? 'serviceApproved' : 'dgApproved';
    
    if (validationData[dateField]) {
      if (!value) {
        // Si la date est vide et que la validation est cochée
        errors[field] = 'Veuillez sélectionner une date';
      } else {
        // Si une date valide est sélectionnée, on supprime l'erreur
        delete errors[field];
      }
    }
    
    setValidationErrors(errors);
  };

  // Formatter et regrouper les données d'évaluation pour l'affichage
  const formatEvaluationData = () => {
    // Regrouper les questions par note
    const ratingGroups = {};
    
    Object.entries(ratings).forEach(([questionId, rating]) => {
      if (!ratingGroups[rating]) {
        ratingGroups[rating] = [];
      }
      ratingGroups[rating].push(parseInt(questionId));
    });
    
    return ratingGroups;
  };

  // Fonction pour récupérer les suggestions de formation
  const fetchTrainingSuggestions = async () => {
    console.log('Fetching training suggestions with ratings:', ratings);
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/suggestions', { ratings });
      console.log('Training suggestions response:', response.data);
      setTrainingSuggestions(response.data);
      setShowTrainingSuggestions(true);
    } catch (err) {
      console.error('Error fetching training suggestions:', err);
      setError('Erreur lors de la récupération des suggestions de formation.');
    } finally {
      setLoading(false);
    }
  };

  const ratingGroups = formatEvaluationData();

  return (
    <div className="step3-container">
      <h3>Étape 3 : Validation de l&apos;évaluation</h3>
      
      {/* Prévisualisation du PDF en modal */}
      {showPreview && previewUrl && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <div className="pdf-preview-header">
              <h4>Prévisualisation du rapport d&apos;évaluation</h4>
              <button className="pdf-close-button" onClick={closePreview}>×</button>
            </div>
            <div className="pdf-preview-body">
              <iframe 
                src={previewUrl} 
                title="Prévisualisation du PDF" 
                width="100%" 
                height="100%"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="summary-section">
        <div className="summary-header">
          <h4>Résumé de l&apos;évaluation</h4>
          <p className="evaluation-id">ID d&apos;évaluation : {evaluationId}</p>
        </div>
        
        <div className="average-badge">
          <span className="average-label">Note moyenne</span>
          <span className="average-value">{average}/5</span>
        </div>
        
        <div className="ratings-summary">
          <h5>Répartition des notes</h5>
          <ul className="rating-distribution">
            {[5, 4, 3, 2, 1].map(rating => (
              <li key={rating}>
                <div className="rating-bar">
                  <span className="rating-label">{rating}</span>
                  <div className="rating-graph">
                    <div 
                      className={`rating-fill rating-${rating}`} 
                      style={{ width: `${(ratingGroups[rating]?.length || 0) / Object.keys(ratings).length * 100}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{ratingGroups[rating]?.length || 0}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Bouton de prévisualisation PDF */}
        <div className="pdf-preview-button-container">
          <button 
            className="btn btn-secondary"
            onClick={handlePreviewPDF}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            {loading ? 'Chargement...' : 'Prévisualiser le rapport'}
          </button>
        </div>
      </div>
      
      {/* Section des suggestions de formation */}
      <div className="training-section">
        <h4>Suggestions de formation</h4>
        <button
          className="btn btn-primary"
          onClick={fetchTrainingSuggestions}
          disabled={loading}
        >
          {showTrainingSuggestions ?
            '🔄 Recharger les suggestions' :
            '🎓 Voir les suggestions de formation'}
        </button>

        {loading && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement des suggestions...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}

        {showTrainingSuggestions && trainingSuggestions.length > 0 && (
          <div className="training-suggestions mt-3">
            <h5 className="mb-3">Suggestions de formation basées sur les résultats</h5>
            <div className="list-group">
              {trainingSuggestions.map((item, index) => (
                <div key={index} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.question}:</strong> {item.training}
                    </div>
                  </div>
                  {item.details && (
                    <p className="small text-muted mt-1">{item.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showTrainingSuggestions && trainingSuggestions.length === 0 && (
          <div className="alert alert-info mt-3" role="alert">
            Aucune suggestion de formation disponible pour cette évaluation.
          </div>
        )}
      </div>
      
      <div className="validation-section">
        <h4>Validation de l&apos;évaluation</h4>
        <p className="validation-instructions">
          Cette étape finalise l&apos;évaluation. Après validation, un rapport d&apos;évaluation sera généré et les résultats seront enregistrés dans le système.
        </p>
        
        <div className="validation-checkboxes">
          <div className="checkbox-group">
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="serviceApproval" 
                checked={validationData.serviceApproved} 
                onChange={() => handleCheckboxChange('serviceApproved')}
              />
              <label htmlFor="serviceApproval">Validation par le chef de service</label>
            </div>
            
            {validationData.serviceApproved && (
              <div className="date-input">
                <label htmlFor="serviceDate">Date de validation :</label>
                <input 
                  type="date" 
                  id="serviceDate" 
                  value={validationData.serviceDate || ''} 
                  onChange={(e) => handleDateChange('serviceDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={validationErrors.serviceDate ? 'error' : ''}
                />
                {validationErrors.serviceDate && (
                  <p className="error-message">{validationErrors.serviceDate}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="checkbox-group">
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="dgApproval" 
                checked={validationData.dgApproved} 
                onChange={() => handleCheckboxChange('dgApproved')}
              />
              <label htmlFor="dgApproval">Validation par la direction générale</label>
            </div>
            
            {validationData.dgApproved && (
              <div className="date-input">
                <label htmlFor="dgDate">Date de validation :</label>
                <input 
                  type="date" 
                  id="dgDate" 
                  value={validationData.dgDate || ''} 
                  onChange={(e) => handleDateChange('dgDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={validationErrors.dgDate ? 'error' : ''}
                />
                {validationErrors.dgDate && (
                  <p className="error-message">{validationErrors.dgDate}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="final-notes">
        <div className="note-card">
          <div className="note-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="note-content">
            <h5>Rappel important</h5>
            <p>Une fois validée, l&apos;évaluation ne pourra plus être modifiée. Assurez-vous que toutes les informations sont correctes avant de procéder.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Step3.propTypes = {
  ratings: PropTypes.object.isRequired,
  average: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  evaluationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  validationData: PropTypes.shape({
    serviceApproved: PropTypes.bool.isRequired,
    dgApproved: PropTypes.bool.isRequired,
    serviceDate: PropTypes.string,
    dgDate: PropTypes.string
  }).isRequired,
  onValidationChange: PropTypes.func.isRequired,
  onGeneratePDF: PropTypes.func
};

export default Step3;
