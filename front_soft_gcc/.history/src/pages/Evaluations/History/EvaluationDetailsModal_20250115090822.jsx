import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  const renderStepContent = () => {
    if (!evaluation) {
      return <div>Chargement des détails de l'évaluation...</div>;
    }

    switch (currentStep) {
      case 1:
        if (!evaluation.scores || evaluation.scores.length === 0) {
          return <div>Aucun score disponible.</div>;
        }

        const radarData = {
          labels: evaluation.scores.map((score) => score.section),
          datasets: [
            {
              label: 'Scores par section',
              data: evaluation.scores.map((score) => score.value),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        return (
          <div>
            <h5>Scores par section</h5>
            <Radar data={radarData} />
          </div>
        );

      case 2:
        return (
          <div>
            <h5>Commentaires</h5>
            <p><strong>Points faibles :</strong> {evaluation.weaknesses || 'Aucun'}</p>
            <p><strong>Points forts :</strong> {evaluation.strengths || 'Aucun'}</p>
          </div>
        );

      case 3:
        if (!evaluation.recommendations || evaluation.recommendations.length === 0) {
          return <div>Aucune recommandation disponible.</div>;
        }

        return (
          <div>
            <h5>Recommandations</h5>
            <ul>
              {evaluation.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        );

      case 4:
        if (!evaluation.participants || evaluation.participants.length === 0) {
          return <div>Pas de participants disponibles.</div>;
        }

        return (
          <div>
            <h5>Participants</h5>
            <ul>
              {evaluation.participants.map((participant, index) => (
                <li key={index}>{participant}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails de l'Évaluation</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">{renderStepContent()}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
            >
              Précédent
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={currentStep === 4}
            >
              Suivant
            </button>
            <button type="button" className="btn btn-danger" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailsModal;
