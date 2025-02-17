import React, { useState } from "react";
import { Modal, Button, Tab, Nav } from "react-bootstrap";
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
import '../../../assets/css/Evaluations/EvaluationDetailModal.css';


// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepChange = (step) => setCurrentStep(step);

  // Préparer les données du graphique
  const chartData = {
    labels: evaluation?.questionDetails?.map((q) => q.questionId) || [],
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
    <Modal show={true} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Détails de l'Évaluation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={currentStep}>
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey={1} onClick={() => handleStepChange(1)}>
                Résumé
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey={2} onClick={() => handleStepChange(2)}>
                Interview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey={3} onClick={() => handleStepChange(3)}>
                Graphique
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey={currentStep}>{renderStepContent()}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handlePreviousStep} disabled={currentStep === 1}>
          Précédent
        </Button>
        <Button variant="primary" onClick={handleNextStep} disabled={currentStep === 3}>
          Suivant
        </Button>
        <Button variant="danger" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EvaluationDetailsModal;