import React, { useState } from "react";

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Gestion des étapes
  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepChange = (step) => setCurrentStep(step);

  // Rendu du contenu pour chaque étape
  const renderStepContent = () => {
    if (!evaluation) return <div>Chargement des détails de l'évaluation...</div>;

    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5>Résumé de l'Évaluation</h5>
            <p>
              <strong>Score global :</strong> {evaluation.overallScore || "Non disponible"}
            </p>
            <p>
              <strong>Points forts :</strong> {evaluation.strengths || "Aucun"}
            </p>
            <p>
              <strong>Points faibles :</strong> {evaluation.weaknesses || "Aucun"}
            </p>
            <p>
              <strong>Recommandations :</strong> {evaluation.recommendations || "Aucune recommandation disponible."}
            </p>
          </div>
        );

      case 2:
        return (
          <div>
            <h5>Détails de l'Interview</h5>
            <p>
              <strong>Date de l'interview :</strong> {new Date(evaluation.interviewDate).toLocaleString()}
            </p>
            <p>
              <strong>Statut de l'interview :</strong> {evaluation.interviewStatus || "Non défini"}
            </p>
            <h5>Participants</h5>
            <ul>
              {evaluation.participants && evaluation.participants.length > 0 ? (
                evaluation.participants.map((participant, index) => <li key={index}>{participant}</li>)
              ) : (
                <li>Aucun participant défini</li>
              )}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div className="modal-content">
          {/* En-tête de la modal */}
          <div className="modal-header">
            <h5 className="modal-title">Détails de l'Évaluation</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>

          {/* Wizard Navigation */}
          <div className="modal-body">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => handleStepChange(1)}
                >
                  Résumé
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => handleStepChange(2)}
                >
                  Interview
                </button>
              </li>
            </ul>

            {/* Contenu de la modal */}
            <div className="mt-3">{renderStepContent()}</div>
          </div>

          {/* Navigation */}
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
              disabled={currentStep === 2}
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
