import React, { useState } from 'react';

const EvaluationWorkflow = () => {
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
