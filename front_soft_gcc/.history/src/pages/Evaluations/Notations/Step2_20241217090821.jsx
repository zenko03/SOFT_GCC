import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques


function Step2({ ratings, remarks, setRemarks, onSaveRemarks }) {
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);
  // Fonction pour récupérer la moyenne depuis l'API
  const fetchAverage = async () => {
    setLoading(true);
    try {
      if (ratings && Object.keys(ratings).length > 0) {
        console.log("Sending ratings to backend:", ratings); // Log pour vérifier le format des données
        const response = await axios.post('https://localhost:7082/api/Evaluation/calculate-average', ratings);
        
        // Ajoutez un délai de 3 secondes avant de mettre à jour la moyenne
        setTimeout(() => {
          setAverage(response.data.average);
          setLoading(false); // Arrêter le chargement après le délai
        }, 2000); // Délai de 3000 ms (3 secondes)
      } else {
        setAverage(0); // Réinitialiser si pas de notes
        setLoading(false); // Arrêter le chargement si pas de notes
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du calcul de la moyenne.');
      setLoading(false); // Arrêter le chargement en cas d'erreur
    }
  };

  // Appel de l'API au montage du composant ou quand les ratings changent
  useEffect(() => {
    fetchAverage(); // Appeler la fonction pour récupérer la moyenne
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

  const handleSaveRemarks = () => {
    onSaveRemarks(remarks); // Propagation des remarques au parent
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