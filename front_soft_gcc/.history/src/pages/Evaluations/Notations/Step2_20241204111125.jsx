import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques

function Step2({ ratings }) {
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true); // Pour afficher un état de chargement
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: ''
  });

  // Fonction pour récupérer la moyenne depuis l'API
  const fetchAverage = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/evaluations/calculate-average', ratings);
      setAverage(response.data.average);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du calcul de la moyenne.');
    } finally {
      setLoading(false);
    }
  };

  // Appel de l'API au montage du composant ou quand les ratings changent
  useEffect(() => {
    if (ratings && Object.keys(ratings).length > 0) {
      fetchAverage();
    } else {
      setAverage(0);
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
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <p className="average-score">
            <strong>Note Générale: </strong>{average} / 5
          </p>
        )}
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
