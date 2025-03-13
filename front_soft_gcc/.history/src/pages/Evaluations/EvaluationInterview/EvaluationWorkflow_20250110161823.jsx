import React, { useState } from 'react';
import { useUser } from './UserContext ';


const EvaluationWorkflow = () => {
  const { userRole } = useUser(); // Récupère le rôle actuel
  console.log("userRole: ", userRole); // 'RH', 'Manager', ou 'Director'

  const [status, setStatus] = useState('manager');

  const handleValidation = () => {
    if (status === 'manager') {
      setStatus('director');
      alert('Validation par le Manager terminée. En attente de validation du Directeur.');
    } else if (status === 'director') {
      setStatus('completed');
      alert('Validation par le Directeur terminée. Évaluation validée.');
    }
  };

  const handleSave = async () => {
    if (!evaluationData.rating || evaluationData.rating < 1) {
        setError('Veuillez attribuer une note avant de soumettre.');
        return;
    }

    setError('');
    try {
        // Préparer les données à enregistrer dans le champ Notes
        const notes = JSON.stringify({
            comment: evaluationData.comments,
            rating: evaluationData.rating,
        });

        const response = await fetch(`https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Notes: notes, // Enregistrer les données combinées dans Notes
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'enregistrement de l\'entretien.');
        }

        // Redirection et mise à jour du statut
        navigate('/homeInterview');
        alert('Statut mis à jour : En attente de validation');
    } catch (err) {
        setError('Impossible de terminer l\'entretien.');
        console.log("error: ",err);
    }
};
  return (
    <div className="card">
      <div className="card-body">
        <h5>Circuit de Validation</h5>
        <p>
          <strong>Statut actuel :</strong>{' '}
          {status === 'manager' && 'En attente de validation par le Manager.'}
          {status === 'director' && 'En attente de validation par le Directeur.'}
          {status === 'completed' && 'Validation terminée.'}
        </p>
        {status !== 'completed' && (
          <button className="btn btn-primary" onClick={handleValidation}>
            Valider
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluationWorkflow;
