import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques

function Step2({ ratings }) {
  const [average, setAverage] = useState(0);
  const [showRemarks, setShowRemarks] = useState(false);
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: ''
  });

  useEffect(() => {
    const calculateAverage = async () => {
      try {
        const response = await axios.post('https://localhost:7082/api/Evaluation/calculate-average', ratings);
        setAverage(response.data.average);
      } catch (error) {
        console.error("Erreur lors du calcul de la moyenne :", error);
      }
    };

    if (ratings && Object.keys(ratings).length > 0) {
      calculateAverage();
    }
  }, [ratings]);

  // Handle showing or hiding remarks
  const toggleRemarks = () => {
    setShowRemarks(!showRemarks);
  };

  // Handle input changes for the remarks section
  const handleRemarksChange = (field, value) => {
    setRemarks({
      ...remarks,
      [field]: value
    });
  };

  return (
    <div className="step2-container">
      <div className="average-section">
        <h3>Résultat d'Évaluation</h3>
        <p className="average-score">
          <strong>Note Générale: </strong>{average} / 5
        </p>
      </div>
      {/* Button to toggle remarks */}
      <div className="remarks-toggle">
        <button className="btn-show-remarks" onClick={toggleRemarks}>
          {showRemarks ? 'Masquer les Remarques' : 'Ajouter des Remarques'}
        </button>
      </div>

      {/* Remarks Section */}
      {showRemarks && (
        <div className="remarks-section">
          <div className="remark">
            <label>Points forts:</label>
            <textarea
              value={remarks.strengths}
              onChange={(e) => handleRemarksChange('strengths', e.target.value)}
              placeholder="Mentionnez les points forts ici"
            />
          </div>
          <div className="remark">
            <label>Points faibles:</label>
            <textarea
              value={remarks.weaknesses}
              onChange={(e) => handleRemarksChange('weaknesses', e.target.value)}
              placeholder="Mentionnez les points faibles ici"
            />
          </div>
          <div className="remark">
            <label>Évaluation Générale:</label>
            <textarea
              value={remarks.generalEvaluation}
              onChange={(e) => handleRemarksChange('generalEvaluation', e.target.value)}
              placeholder="Donnez une évaluation générale ici"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Step2;