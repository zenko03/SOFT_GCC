import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/Steps.css';
import './Step3.css';

const Step3 = ({ ratings, average, evaluationId, validationData, onValidationChange }) => {
  const [validationErrors, setValidationErrors] = useState({});

  const handleCheckboxChange = (field) => {
    onValidationChange(field, !validationData[field]);
  };

  const handleDateChange = (field, value) => {
    onValidationChange(field, value);
    
    // Validation simple
    const errors = { ...validationErrors };
    if (!value && (field === 'serviceDate' && validationData.serviceApproved) || 
        (field === 'dgDate' && validationData.dgApproved)) {
      errors[field] = 'Veuillez sélectionner une date';
    } else {
      delete errors[field];
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
                  value={validationData.serviceDate} 
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
                  value={validationData.dgDate} 
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
