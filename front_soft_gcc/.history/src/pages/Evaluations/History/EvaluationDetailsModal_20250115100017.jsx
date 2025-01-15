import React, { useState } from "react";

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Gestion des étapes
  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Rendu du contenu pour chaque étape
  const renderStepContent = () => {
    if (!evaluation) return <div>Chargement des détails de l'évaluation...</div>;

    switch (currentStep) {
      case 1: // Étape 1 : Score global
        return (
          <div>
            <h5>Score Global</h5>
            <p>
              <strong>Score :</strong> {evaluation.overallScore || "Non disponible"}
            </p>
          </div>
        );

      case 2: // Étape 2 : Commentaires
        return (
          <div>
            <h5>Commentaires</h5>
            <p>
              <strong>Points faibles :</strong> {evaluation.weaknesses || "Aucun"}
            </p>
            <p>
              <strong>Points forts :</strong> {evaluation.strengths || "Aucun"}
            </p>
          </div>
        );

      case 3: // Étape 3 : Recommandations
        return (
          <div>
            <h5>Recommandations</h5>
            <p>{evaluation.recommendations || "Aucune recommandation disponible."}</p>
          </div>
        );

      case 4: // Étape 4 : Participants (aucun changement dans cette étape)
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
          {/* En-tête de la modal */}
          <div className="modal-header">
            <h5 className="modal-title">Détails de l'Évaluation</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>

          {/* Contenu de la modal */}
          <div className="modal-body">{renderStepContent()}</div>

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
