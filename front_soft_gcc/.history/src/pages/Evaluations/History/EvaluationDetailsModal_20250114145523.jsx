import React, { useState } from 'react';
import { Radar, Bar } from 'react-chartjs-2';

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Step 1: Scores détaillés par critère ou section
        const radarData = {
          labels: evaluation.overallScore.map((score) => score.section),
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
        // Step 2: Commentaires
        return (
          <div>
            <h5>Commentaires</h5>
            <p>
              <strong>Points faible :</strong> {evaluation.weaknesses}
            </p>
           
          </div>
        );

      case 3:
        // Step 3: Recommandations
        return (
          <div>
            <h5>Recommandations</h5>
            {/* <ul>
              {evaluation.recommendations.map((rec, index) => (
                <li key={index}>
                  <p><strong>Formation :</strong> {rec.training}</p>
                  <p><strong>Coaching :</strong> {rec.coaching}</p>
                  <p><strong>Objectifs :</strong> {rec.objectives}</p>
                </li>
              ))}
            </ul> */}
          </div>
        );

      case 4:
        // Step 4: Participants
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
