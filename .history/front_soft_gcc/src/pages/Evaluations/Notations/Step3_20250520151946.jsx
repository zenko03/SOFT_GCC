import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';
import './Step3.css';
// Réimporter la fonction de génération de PDF
import { downloadEvaluationPDF } from '../../../utils/pdfGenerator';

// Logo Softwell encodé directement en base64 pour éviter les problèmes d'import

const Step3 = ({ ratings, average, evaluationId, validationData, onValidationChange, onGeneratePDF }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [showTrainingSuggestions, setShowTrainingSuggestions] = useState(false);
  const [trainingSuggestions, setTrainingSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  
  // Récupérer les données de l'employé une fois au chargement
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Cette URL doit correspondre à votre API backend
        const response = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}/employee-details`);
        setEmployeeData(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de l'employé:", err);
        // Données fictives en cas d'erreur pour permettre tout de même la génération du PDF
        setEmployeeData({
          firstName: 'Employé',
          lastName: 'Non trouvé',
          department: 'Département inconnu',
          position: 'Poste inconnu'
        });
      }
    };

    if (evaluationId) {
      fetchEmployeeData();
    }
  }, [evaluationId]);

  // Fonction pour générer le PDF
  const generatePDF = async () => {
    try {
      // Si les suggestions de formation n'ont pas été chargées, les charger maintenant
      let suggestions = trainingSuggestions;
      if (!showTrainingSuggestions) {
        try {
          const response = await axios.post('https://localhost:7082/api/Evaluation/suggestions', { ratings });
          suggestions = response.data;
        } catch (err) {
          console.error('Error fetching training suggestions for PDF:', err);
          suggestions = [];
        }
      }

      // Préparation des données d'évaluation
      const evaluationDataForPDF = {
        evaluationId,
        date: new Date().toLocaleDateString() // Ou récupérer la date réelle de l'évaluation depuis l'API
      };

      // Générer et télécharger le PDF en incluant le logo encodé en base64
      const fileName = downloadEvaluationPDF(
        evaluationDataForPDF,
        employeeData || {}, // Utiliser les données récupérées ou un objet vide
        ratings,
        average,
        validationData,
        suggestions,
        SOFTWELL_LOGO_BASE64 // Ajouter le logo encodé en base64
      );

      return fileName;
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setError('Une erreur est survenue lors de la génération du PDF.');
      return null;
    }
  };

  // Exposer la fonction de génération de PDF au composant parent
  useEffect(() => {
    if (onGeneratePDF) {
      onGeneratePDF(generatePDF);
    }
  }, [onGeneratePDF, employeeData, trainingSuggestions]);

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
