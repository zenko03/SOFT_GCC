import { useState } from "react";
import { Modal, Button, Tab, Nav } from "react-bootstrap";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveBar } from "@nivo/bar";
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/EvaluationDetailsModal.css';

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepChange = (step) => setCurrentStep(step);

  // Extraire les détails des questions sous forme de tableau si disponible
  const extractQuestionDetails = () => {
    console.log("EvaluationDetailsModal - données reçues:", evaluation);
    if (!evaluation || !evaluation.questionDetails) {
      console.log("Aucun détail de question disponible");
      // Si pas de détails disponibles, créer un tableau vide
      return [];
    }
    
    // Vérifier le format des données
    if (Array.isArray(evaluation.questionDetails)) {
      console.log("QuestionDetails est un tableau:", evaluation.questionDetails);
      return evaluation.questionDetails;
    }
    
    // Si c'est une chaîne, essayer de la parser
    if (typeof evaluation.questionDetails === 'string') {
      console.log("QuestionDetails est une chaîne, tentative de parsing:", evaluation.questionDetails);
      try {
        const questions = evaluation.questionDetails.split(';')
          .filter(q => q.trim().length > 0)
          .map(q => {
            const scorePart = q.match(/Score:(\d+(\.\d+)?)/);
            return {
              question: q.match(/Question:(.*?),/)?.[1] || "Question sans titre",
              score: scorePart ? parseFloat(scorePart[1]) : 0
            };
          });
        console.log("Questions après parsing:", questions);
        return questions;
      } catch (e) {
        console.error("Erreur lors du parsing des détails de questions:", e);
        return [];
      }
    }
    
    console.log("Format de QuestionDetails non reconnu:", typeof evaluation.questionDetails);
    return [];
  };

  // Préparer les données du graphique en ligne
  const questionDetails = extractQuestionDetails();
  const lineChartData = questionDetails.length > 0 ? [
    {
      id: "Scores par question",
      data: questionDetails.map((q, index) => ({
        x: `Q${index + 1}`,
        y: q.score || 0
      }))
    }
  ] : [];

  // Préparer les données du graphique radar
  const radarData = questionDetails.length > 0 ? 
    questionDetails.map((q, index) => ({
      question: `Q${index + 1}`,
      score: q.score || 0,
      scoreMax: 5
    })) : [];

  // Préparer les données du graphique en barres
  const barChartData = questionDetails.length > 0 ? 
    questionDetails.map((q, index) => ({
      question: `Question ${index + 1}`,
      score: q.score || 0,
      color: (q.score || 0) < 2 ? "#f44336" : (q.score || 0) < 4 ? "#ff9800" : "#4caf50"
    })) : [];

  // Thème commun pour les graphiques
  const chartTheme = {
    background: "transparent",
    axis: {
      domain: {
        line: { stroke: "#777777", strokeWidth: 1 }
      },
      ticks: {
        line: { stroke: "#777777", strokeWidth: 1 }
      }
    },
    grid: { line: { stroke: "#dddddd", strokeWidth: 1 } }
  };

  const renderStepContent = () => {
    if (!evaluation) return <div>Chargement des détails de l&apos;évaluation...</div>;

    switch (currentStep) {
      case 1:
        return (
          <div className="evaluation-summary">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Score global</h5>
              </div>
              <div className="card-body">
                <div className="score-display">
                  <div className={`score-circle ${
                    evaluation.overallScore < 2 ? "low" : 
                    evaluation.overallScore < 4 ? "medium" : "high"
                  }`}>
                    <span>{evaluation.overallScore || "N/A"}</span>
                  </div>
                  <div className="score-label">
                    {evaluation.overallScore < 2 ? "Insuffisant" : 
                     evaluation.overallScore < 3 ? "À améliorer" : 
                     evaluation.overallScore < 4 ? "Satisfaisant" : 
                     evaluation.overallScore < 4.5 ? "Très bien" : "Excellent"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header bg-success bg-opacity-25">
                    <h5 className="mb-0">Points forts</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{evaluation.strengths || "Aucun point fort spécifié"}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header bg-warning bg-opacity-25">
                    <h5 className="mb-0">Points à améliorer</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{evaluation.weaknesses || "Aucun point faible spécifié"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header bg-info bg-opacity-25">
                <h5 className="mb-0">Recommandations</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{evaluation.recommendations || "Aucune recommandation disponible."}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="interview-details">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Détails de l&apos;entretien</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Date :</strong></p>
                    <p className="mb-3">{new Date(evaluation.interviewDate).toLocaleDateString('fr-FR', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Statut :</strong></p>
                    <p className="mb-3">
                      <span className={`badge ${
                        evaluation.interviewStatus === 10 ? "bg-info" :
                        evaluation.interviewStatus === 20 ? "bg-primary" :
                        evaluation.interviewStatus === 25 ? "bg-warning" :
                        evaluation.interviewStatus === 30 ? "bg-success" :
                        evaluation.interviewStatus === 40 ? "bg-danger" :
                        "bg-secondary"
                      }`}>
                        {evaluation.interviewStatus === 10 ? "Planifié" :
                         evaluation.interviewStatus === 20 ? "En cours" :
                         evaluation.interviewStatus === 25 ? "En attente de validation" :
                         evaluation.interviewStatus === 30 ? "Complété" :
                         evaluation.interviewStatus === 40 ? "Rejeté" : "État inconnu"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Participants</h5>
              </div>
              <div className="card-body">
                {evaluation.participants && evaluation.participants.length > 0 ? (
                  <ul className="list-group">
                    {evaluation.participants.map((participant, index) => (
                      <li key={index} className="list-group-item d-flex align-items-center">
                        <span className="me-2">👤</span>
                        {participant}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">Aucun participant défini</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="charts-container">
            {evaluation?.questionDetails && evaluation.questionDetails.length > 0 ? (
              <>
                <div className="row mb-4">
                  <div className="col">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">Scores par question</h5>
                      </div>
                      <div className="card-body">
                        <div style={{ height: 300 }}>
                          <ResponsiveBar
                            data={barChartData}
                            keys={['score']}
                            indexBy="question"
                            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                            colors={({ data }) => data.color}
                            theme={chartTheme}
                            axisBottom={{ tickRotation: -45 }}
                            axisLeft={{
                              tickSize: 5,
                              tickPadding: 5,
                              tickRotation: 0,
                              legend: 'Score',
                              legendPosition: 'middle',
                              legendOffset: -40
                            }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            enableLabel={true}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-7">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">Évolution des scores</h5>
                      </div>
                      <div className="card-body">
                        <div style={{ height: 300 }}>
                          <ResponsiveLine
                            data={lineChartData}
                            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 0, max: 5, stacked: false }}
                            colors={['#2196f3']}
                            theme={chartTheme}
                            axisBottom={{ legend: 'Questions', legendOffset: 36 }}
                            axisLeft={{ legend: 'Score', legendOffset: -40 }}
                            pointSize={10}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            enableGridX={false}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            legends={[]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-5">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">Radar des compétences</h5>
                      </div>
                      <div className="card-body">
                        <div style={{ height: 300 }}>
                          <ResponsiveRadar
                            data={radarData}
                            keys={['score', 'scoreMax']}
                            indexBy="question"
                            maxValue={5}
                            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                            borderWidth={2}
                            gridShape="circular"
                            gridLabelOffset={20}
                            dotSize={8}
                            dotColor={{ theme: 'background' }}
                            dotBorderWidth={2}
                            colors={['#1976D2', '#E0E0E0']}
                            blendMode="multiply"
                            motionConfig="wobbly"
                            theme={chartTheme}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                Aucune donnée détaillée disponible pour cette évaluation.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered backdrop="static" className="evaluation-details-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Détails de l&apos;évaluation - {evaluation?.firstName} {evaluation?.lastName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={currentStep}>
          <Nav variant="tabs" className="nav-tabs-custom">
            <Nav.Item>
              <Nav.Link 
                eventKey={1} 
                onClick={() => handleStepChange(1)}
                className={currentStep === 1 ? 'active' : ''}
              >
                <i className="mdi mdi-information-outline me-1"></i>
                Résumé
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey={2} 
                onClick={() => handleStepChange(2)}
                className={currentStep === 2 ? 'active' : ''}
              >
                <i className="mdi mdi-account-group me-1"></i>
                Interview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey={3} 
                onClick={() => handleStepChange(3)}
                className={currentStep === 3 ? 'active' : ''}
              >
                <i className="mdi mdi-chart-line me-1"></i>
                Graphiques
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey={currentStep}>{renderStepContent()}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={handlePreviousStep} 
            disabled={currentStep === 1}
          >
            <i className="mdi mdi-arrow-left me-1"></i>
            Précédent
          </Button>
          <Button 
            variant="danger" 
            onClick={onClose}
          >
            <i className="mdi mdi-close-circle me-1"></i>
            Fermer
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNextStep} 
            disabled={currentStep === 3}
          >
            Suivant
            <i className="mdi mdi-arrow-right ms-1"></i>
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

EvaluationDetailsModal.propTypes = {
  evaluation: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default EvaluationDetailsModal;