import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // For specific styles

function Step3({ generalScore, notes }) {
  const [serviceApproved, setServiceApproved] = useState(false);
  const [dgApproved, setDgApproved] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [dgDate, setDgDate] = useState('');
  const [showTrainingSuggestions, setShowTrainingSuggestions] = useState(false);

  // Training suggestions based on low scores
  const trainingSuggestions = [
    { question: 'Effectuer par quinzaine la consolidation comptable...', minScore: 3, training: 'Formation en gestion comptable' },
    { question: 'Traiter les opérations comptables...', minScore: 3, training: 'Formation en gestion des opérations comptables' },
    { question: 'Établir la situation de trésorerie...', minScore: 3, training: 'Formation en gestion de trésorerie' },
    { question: 'Effectuer le classement des pièces...', minScore: 3, training: 'Formation en organisation documentaire' },
  ];

  // Filter training based on scores
  const suggestedTrainings = trainingSuggestions.filter(
    (item, index) => notes[`question${index + 1}`] && notes[`question${index + 1}`] < item.minScore
  );

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
      {suggestedTrainings.length > 0 && (
        <div className="training-section">
          <button onClick={() => setShowTrainingSuggestions(!showTrainingSuggestions)}>
            {showTrainingSuggestions ? 'Masquer les suggestions' : 'Voir les suggestions de formation'}
          </button>

          {showTrainingSuggestions && (
            <div className="training-suggestions">
              <h5>Suggestions de formation basées sur les résultats</h5>
              <ul>
                {suggestedTrainings.map((item, index) => (
                  <li key={index}>
                    <strong>{item.question}:</strong> {item.training}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Final validation button */}
      <div className="validation-button">
        <button className="finalize-btn">
          Valider l'Évaluation
        </button>
      </div>
    </div>
  );
}

export default Step3;
