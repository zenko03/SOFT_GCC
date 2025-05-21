import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css';
import './Step3.css';
// Importation de l'utilitaire de génération de PDF
// Assurez-vous d'avoir installé les dépendances nécessaires:
// npm install jspdf jspdf-autotable
import { downloadEvaluationPDF } from '../../../utils/pdfGenerator';

// Logo Softwell encodé directement en base64 pour éviter les problèmes d'import
// Cette chaîne base64 représente le logo Softwell
const SOFTWELL_LOGO_BASE64 = 'data:image/png;base64,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';

const Step3 = ({ ratings, average, evaluationId, validationData, onValidationChange }) => {
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
  onValidationChange: PropTypes.func.isRequired
};

export default Step3;
