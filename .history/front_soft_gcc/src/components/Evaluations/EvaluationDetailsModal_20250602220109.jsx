import { useState } from 'react';
import { Modal, Button, Tab, Nav, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaUser, FaCalendarAlt, FaBuilding, FaStar, FaChartLine, FaClipboardList, FaUsers, FaCommentDots, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';
import PerformanceGraph from '../../pages/Evaluations/History/PerformanceGraph';
import '../../assets/css/Evaluations/EvaluationDetailsModal.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EvaluationDetailsModal = ({ show, onHide, evaluation, lastEvaluations }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!evaluation) return null;

  // Formatage des dates pour une meilleure lisibilité
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };
  
  // Déterminer la couleur du badge selon le statut
  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Non défini</Badge>;
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminée':
      case 'approuvée':
        return <Badge bg="success">Terminée</Badge>;
      case 'in progress':
      case 'en cours':
        return <Badge bg="info">En cours</Badge>;
      case 'pending':
      case 'planifiée':
        return <Badge bg="warning">Planifiée</Badge>;
      case 'cancelled':
      case 'annulée':
        return <Badge bg="danger">Annulée</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Déterminer la classe de couleur selon le score
  const getScoreClass = (score) => {
    if (!score && score !== 0) return "text-secondary";
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-primary";
    if (score >= 2) return "text-warning";
    return "text-danger";
  };

  // Prépare les données pour le graphique d'évolution
  const prepareGraphData = () => {
    if (!lastEvaluations || !Array.isArray(lastEvaluations) || lastEvaluations.length === 0) {
      return [];
    }
    
    return lastEvaluations.map(evaluation => ({
      date: formatDate(evaluation.startDate),
      score: evaluation.overallScore
    }));
  };

  // Rendre le texte si présent, sinon afficher un message par défaut
  const renderWithDefault = (text, defaultMessage = "Non spécifié") => {
    return text && text.trim() !== "" ? text : defaultMessage;
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      dialogClassName="evaluation-details-modal modal-lg"
      aria-labelledby="evaluation-details-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="evaluation-details-title">
          Détails de l'évaluation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Row>
            <Col sm={12}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="general">
                    <FaClipboardList className="me-1" /> Informations générales
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="performance">
                    <FaChartLine className="me-1" /> Performance
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="details">
                    <FaStar className="me-1" /> Évaluation détaillée
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>

          <Tab.Content>
            {/* Onglet Informations générales */}
            <Tab.Pane eventKey="general">
              <Row>
                <Col md={4}>
                  <div className="score-display">
                    <div className="score-circle">
                      <span className={getScoreClass(evaluation.overallScore)}>
                        {evaluation.overallScore ? evaluation.overallScore.toFixed(2) : '--'}
                      </span>
                    </div>
                    <div className="score-label">Score global</div>
                  </div>
                </Col>
                <Col md={8}>
                  <Card className="mb-3">
                    <Card.Header>Informations de base</Card.Header>
                    <Card.Body>
                      <Row className="mb-2">
                        <Col xs={1}><FaUser /></Col>
                        <Col xs={11}>
                          <span className="fw-medium">Employé : </span>
                          {evaluation.firstName} {evaluation.lastName}
                        </Col>
                      </Row>
                      <Row className="mb-2">
                        <Col xs={1}><FaBuilding /></Col>
                        <Col xs={11}>
                          <span className="fw-medium">Poste : </span>
                          {renderWithDefault(evaluation.position)}
                        </Col>
                      </Row>
                      <Row className="mb-2">
                        <Col xs={1}><FaBuilding /></Col>
                        <Col xs={11}>
                          <span className="fw-medium">Département : </span>
                          {renderWithDefault(evaluation.department)}
                        </Col>
                      </Row>
                      <Row className="mb-2">
                        <Col xs={1}><FaCalendarAlt /></Col>
                        <Col xs={11}>
                          <span className="fw-medium">Période : </span>
                          {formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}
                        </Col>
                      </Row>
                      <Row className="mb-0">
                        <Col xs={1}><FaClipboardList /></Col>
                        <Col xs={11}>
                          <span className="fw-medium">Type : </span>
                          {renderWithDefault(evaluation.evaluationType)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Header>Statut</Card.Header>
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={8}>
                          <span className="fw-medium">Statut de l'évaluation : </span>
                          {getStatusBadge(evaluation.interviewStatus)}
                        </Col>
                        <Col xs={4} className="text-end">
                          <span className="fw-medium">Date d'entretien : </span><br />
                          {formatDate(evaluation.interviewDate)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              {evaluation.participants && evaluation.participants.length > 0 && (
                <Card className="mt-3">
                  <Card.Header>
                    <FaUsers className="me-2" />
                    Participants
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {evaluation.participants.map((participant, index) => (
                        <ListGroup.Item key={index}>
                          {participant}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}
              <Card className="mt-3">
                <Card.Header>
                  <FaCommentDots className="me-2" />
                  Commentaires généraux
                </Card.Header>
                <Card.Body>
                  <p>{renderWithDefault(evaluation.evaluationComments)}</p>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Onglet Performance */}
            <Tab.Pane eventKey="performance">
              <Card className="mb-3">
                <Card.Header>Évolution des performances</Card.Header>
                <Card.Body>
                  <PerformanceGraph performanceData={prepareGraphData()} />
                </Card.Body>
              </Card>
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>
                      <FaLightbulb className="me-2" />
                      Points forts
                    </Card.Header>
                    <Card.Body>
                      <p>{renderWithDefault(evaluation.strengths)}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>
                      <FaExclamationTriangle className="me-2" />
                      Points à améliorer
                    </Card.Header>
                    <Card.Body>
                      <p>{renderWithDefault(evaluation.weaknesses)}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Card>
                <Card.Header>Recommandations</Card.Header>
                <Card.Body>
                  <p>{renderWithDefault(evaluation.recommendations)}</p>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Onglet Évaluation détaillée */}
            <Tab.Pane eventKey="details">
              {evaluation.questionDetails && evaluation.questionDetails.length > 0 ? (
                <Card>
                  <Card.Header>Questions d'évaluation</Card.Header>
                  <ListGroup variant="flush">
                    {evaluation.questionDetails.map((question, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col xs={9}>
                            <span className="fw-medium">{question.question}</span>
                          </Col>
                          <Col xs={3} className="text-end">
                            <span className={`fw-bold ${getScoreClass(question.score)}`}>
                              {question.score !== null && question.score !== undefined ? question.score.toFixed(2) : '--'} / 5
                            </span>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              ) : (
                <div className="alert alert-info">
                  Aucune question détaillée disponible pour cette évaluation.
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

EvaluationDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  evaluation: PropTypes.object,
  lastEvaluations: PropTypes.array
};

export default EvaluationDetailsModal; 