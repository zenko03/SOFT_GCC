import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepChange = (step) => setCurrentStep(step);

  // Préparer les données du graphique
  const chartData = {
    labels: evaluation?.questionDetails?.map((q) => q.question) || [],
    datasets: [
      {
        label: "Scores par question",
        data: evaluation?.questionDetails?.map((q) => q.score) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Scores par question pour une évaluation" },
    },
  };


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

      case 3:
        return (
          <div>
            <h5>Graphique d'Évolution des Scores</h5>
            {evaluation?.questionDetails && evaluation.questionDetails.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>Aucune donnée disponible pour ce graphique.</p>
            )}
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
              <li className="nav-item">
                <button
                  className={`nav-link ${currentStep === 3 ? "active" : ""}`}
                  onClick={() => handleStepChange(3)}
                >
                  Graphique
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
              disabled={currentStep === 3}
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
