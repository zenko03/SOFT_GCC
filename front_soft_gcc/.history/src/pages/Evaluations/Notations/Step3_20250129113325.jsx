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

      {/* Section de validation */}
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

      {/* Section des suggestions de formation */}
      <div className="training-section border-top pt-3">
        <button
          className="btn btn-info btn-sm mb-3"
          onClick={fetchTrainingSuggestions}
          disabled={loading}
        >
          {showTrainingSuggestions ?
            '🔄 Recharger les suggestions' :
            '🎓 Voir les suggestions de formation'}
        </button>

        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement des suggestions...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
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
                      <strong>{item.question}:</strong>  {item.training}
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => console.log('Formation sélectionnée:', item.training)}
                    >
                      Sélectionner
                    </button>
                  </div>
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
    </div>
  );
}

export default Step3;
