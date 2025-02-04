import React, { useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // For specific styles

function Step3({ ratings, evaluationId, validationData,
  onValidationChange }) {
  const [serviceApproved, setServiceApproved] = useState(false);
  const [dgApproved, setDgApproved] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [dgDate, setDgDate] = useState('');
  const [showTrainingSuggestions, setShowTrainingSuggestions] = useState(false);
  const [trainingSuggestions, setTrainingSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle training suggestions fetch
  const fetchTrainingSuggestions = async () => {
    console.log('Fetching training suggestions with ratings:', ratings); // Log des ratings
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/suggestions', { ratings });
      console.log('Training suggestions response:', response.data); // Log de la réponse
      setTrainingSuggestions(response.data);
      setShowTrainingSuggestions(true);
    } catch (err) {
      console.error('Error fetching training suggestions:', err); // Log de l'erreur
      setError('Erreur lors de la récupération des suggestions de formation.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="step3-container">
      <h4>Validation et Suggestions de Formation</h4>

      <div className="validation-section mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={validationData.serviceApproved}
                onChange={(e) => onValidationChange('serviceApproved', e.target.checked)}
              />
              <label className="form-check-label">
                Chef de Service Validé
              </label>
            </div>
            <input
              type="date"
              className="form-control mt-2"
              value={validationData.serviceDate}
              onChange={(e) => onValidationChange('serviceDate', e.target.value)}
              disabled={!validationData.serviceApproved}
            />
          </div>

          <div className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={validationData.dgApproved}
                onChange={(e) => onValidationChange('dgApproved', e.target.checked)}
              />
              <label className="form-check-label">
                Directeur Général Validé
              </label>
            </div>
            <input
              type="date"
              className="form-control mt-2"
              value={validationData.dgDate}
              onChange={(e) => onValidationChange('dgDate', e.target.value)}
              disabled={!validationData.dgApproved}
            />
          </div>
        </div>
      </div>

      <div className="training-section border-top pt-3">
        <button
          className="btn btn-info btn-sm"
          onClick={fetchTrainingSuggestions}
          disabled={loading}
        >
          {showTrainingSuggestions ?
            '🔄 Recharger les suggestions' :
            '🎓 Voir les suggestions de formation'}
        </button>

        {/* ... reste du code existant pour l'affichage des suggestions */}
      </div>
    </div>
  );
}

export default Step3;
