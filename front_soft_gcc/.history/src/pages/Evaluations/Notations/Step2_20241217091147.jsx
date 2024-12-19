import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques


function Step2({ ratings, remarks, setRemarks, onSaveRemarks }) {
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);

  const fetchAverage = async () => {
    setLoading(true);
    try {
      if (ratings && Object.keys(ratings).length > 0) {
        console.log("Sending ratings to backend:", ratings);
        const response = await axios.post('https://localhost:7082/api/Evaluation/calculate-average', ratings);
        setTimeout(() => {
          setAverage(response.data.average);
          setLoading(false);
        }, 2000);
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

  const toggleRemarks = () => {
    setShowRemarks(!showRemarks);
  };

  const handleRemarksChange = (field, value) => {
    setRemarks({
      ...remarks,
      [field]: value
    });
  };

  const handleSaveRemarks = () => {
    onSaveRemarks(remarks);
  };

  return (
    <div className="step2-container">
      {/* ...contenu existant */}
      {showRemarks && (
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
          <button onClick={handleSaveRemarks}>Enregistrer</button>
        </div>
      )}
    </div>
  );
}


export default Step2;