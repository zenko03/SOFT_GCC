import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // For specific styles

function Step3({ generalScore, ratings }) {
  const [serviceApproved, setServiceApproved] = useState(false);
  const [dgApproved, setDgApproved] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [dgDate, setDgDate] = useState('');
  const [showTrainingSuggestions, setShowTrainingSuggestions] = useState(false);

  const handleSaveResults = async () => {
    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/save-results', {
        ratings,
        remarks,
        evaluationType: selectedEvaluationType,
        employeeId: selectedEmployee.id,
      });
      console.log("Résultats sauvegardés :", response.data);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des résultats :", error);
    }
  };

  
  // Filter training based on scores
  const suggestedTrainings = trainingSuggestions.filter(
    (item, index) => ratings[`question${index + 1}`] && ratings[`question${index + 1}`] < item.minScore
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
