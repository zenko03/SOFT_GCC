import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // CSS pour le style
import SectionA from '../sections/SectionA'; // Votre composant actuel pour la section A

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType }) {
  return (
    <div>
      <h5>Sélectionnez le type d'évaluation :</h5>
      <select value={selectedEvaluationType || ''} onChange={(e) => onEvaluationTypeChange(e.target.value)}>
        <option value="" disabled>Sélectionnez un type</option> {/* Option par défaut */}
        {evaluationTypes.map(type => (
          <option key={type.id} value={type.id}>{type.name}</option> // Affiche chaque type d'évaluation
        ))}
      </select>

      {/* Vous pouvez éventuellement afficher les questions ici si elles sont déjà chargées */}
    </div>
  );
}

export default Step1;
