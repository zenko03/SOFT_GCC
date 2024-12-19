import React, { useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // For specific styles

function Step3({ratings, evaluationId }) {
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

  // Handle evaluation validation
  const validateEvaluation = async () => {
    const payload = {
      evaluationId,
      isServiceApproved: serviceApproved,
      isDgApproved: dgApproved,
      serviceApprovalDate: serviceDate,
      dgApprovalDate: dgDate,
    };

    console.log('Validating evaluation with payload:', payload); // Log du payload
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/validate-evaluation', payload);
      console.log('Validation response:', response.data); // Log de la réponse
      setSuccessMessage(response.data.message);
    } catch (err) {
      console.error('Error validating evaluation:', err); // Log de l'erreur
      setError('Erreur lors de la validation de l\'évaluation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step3-container">
      <h4>Validation et Suggestions de Formation</h4>

      {/* Validation section */}
      <div className="validation-section">
        <div className="validation-item">
          <label>
            <input
              type="checkbox"
              checked={serviceApproved}
              onChange={(e) => setServiceApproved(e.target.checked)}
            />
            Chef de Service Validé
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            disabled={!serviceApproved}
          />
        </div>

        <div className="validation-item">
          <label>
            <input
              type="checkbox"
              checked={dgApproved}
              onChange={(e) => setDgApproved(e.target.checked)}
            />
            Directeur Général Validé
          </label>
          <input
            type="date"
            value={dgDate}
            onChange={(e) => setDgDate(e.target.value)}
            disabled={!dgApproved}
          />
        </div>
      </div>

      {/* Training Suggestions */}
      <div className="training-section">
        <button onClick={fetchTrainingSuggestions} disabled={loading}>
          {showTrainingSuggestions ? 'Recharger les suggestions' : 'Voir les suggestions de formation'}
        </button>

        {loading && <p>Chargement...</p>}

        {error && <p className="error">{error}</p>}

        {showTrainingSuggestions && trainingSuggestions.length > 0 && (
          <div className="training-suggestions">
            <h5>Suggestions de formation basées sur les résultats</h5>
            <ul>
              {trainingSuggestions.map((item, index) => (
                <li key={index}>
                  <strong>{item.question}:</strong> {item.training}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Final validation button */}
      <div className="validation-button">
        <button className="finalize-btn" onClick={validateEvaluation} disabled={loading}>
          Valider l'Évaluation
        </button>
        {successMessage && <p className="success">{successMessage}</p>}
      </div>
    </div>
  );
}

export default Step3;
