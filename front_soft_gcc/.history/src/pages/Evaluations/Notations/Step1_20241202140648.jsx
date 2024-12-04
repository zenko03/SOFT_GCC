import React from 'react';

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType }) {
  return (
    <div>
      <h5>Sélectionnez le type d'évaluation :</h5>
      <select value={selectedEvaluationType || ''} onChange={(e) => onEvaluationTypeChange(e.target.value)}>
        <option value="" disabled>Sélectionnez un type</option>
        {evaluationTypes.map(type => (
          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
            {type.designation}
          </option> // Utilisez evaluationTypeId comme clé ici
        ))}
      </select>
    </div>
  );
}

export default Step1;