import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques

function Step2({ ratings, remarks, setRemarks, onNextStep }) {
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);

  // Fonction pour récupérer la moyenne
  const fetchAverage = async () => {
    setLoading(true);
    try {
      if (ratings && Object.keys(ratings).length > 0) {
        console.log("Sending ratings to backend:", ratings);
        const response = await axios.post(
          'https://localhost:7082/api/Evaluation/calculate-average',
          ratings
        );
        setTimeout(() => {
          setAverage(response.data.average);
          setLoading(false);
        }, 1000);
      } else {
        setAverage(0);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du calcul de la moyenne.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAverage();
  }, [ratings]);

  // Gestion des remarques
  const handleRemarksChange = (field, value) => {
    setRemarks({
      ...remarks,
      [field]: value,
    });
  };

  return (
    <div className="step2-container">
      <div className="average-section">
        <h3>Résultat d'Évaluation</h3>
        {loading ? (
          <div className="loader"></div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <p className="average-score">
            <strong>Note Générale: </strong>
            {average} / 5
          </p>
        )}
      </div>

      {/* Remarques */}
      <div className="remarks-section">
        <div className="remark">
          <label>Points forts:</label>
          <textarea
            value={remarks.strengths}
            onChange={(e) => handleRemarksChange('strengths', e.target.value)}
          />
        </div>
        <div className="remark">
          <label>Points faibles:</label>
          <textarea
            value={remarks.weaknesses}
            onChange={(e) => handleRemarksChange('weaknesses', e.target.value)}
          />
        </div>
        <div className="remark">
          <label>Évaluation Générale:</label>
          <textarea
            value={remarks.generalEvaluation}
            onChange={(e) => handleRemarksChange('generalEvaluation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

Step2.propTypes = {
  ratings: PropTypes.object.isRequired,
  remarks: PropTypes.shape({
    strengths: PropTypes.string.isRequired,
    weaknesses: PropTypes.string.isRequired,
    generalEvaluation: PropTypes.string.isRequired
  }).isRequired,
  setRemarks: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired
};

export default Step2;
