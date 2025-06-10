import { Modal, Button, Row, Col, Card, Badge, ListGroup } from "react-bootstrap";
import PropTypes from 'prop-types';
import { FaUser, FaCalendarAlt, FaBuilding, FaClipboardList, FaCommentDots, FaLightbulb, FaExclamationTriangle, FaStar, FaTasks, FaUsers } from 'react-icons/fa';
import '../../../assets/css/Evaluations/EvaluationDetailsModal.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  // Helper function to determine badge color based on status
  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Non défini</Badge>;
    const statusString = String(status).toLowerCase(); // Ensure status is a string
    switch (statusString) {
      case 'completed':
      case 'terminée':
      case '30': // Assuming 30 means completed
        return <Badge bg="success">Terminée</Badge>;
      case 'in progress':
      case 'en cours':
      case '20': // Assuming 20 means in progress
      case '25': // Assuming 25 means pending validation (often shown as in progress to user)
        return <Badge bg="info">En cours</Badge>;
      case 'pending':
      case 'planifiée':
      case '10': // Assuming 10 means planned
        return <Badge bg="warning" text="dark">Planifiée</Badge>;
      case 'cancelled':
      case 'annulée':
      case '50': // Assuming 50 means cancelled
        return <Badge bg="danger">Annulée</Badge>;
      case 'rejected':
      case 'rejeté':
      case '40': // Assuming 40 means rejected
        return <Badge bg="danger">Rejetée</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Helper function to determine text color class based on score
  const getScoreClass = (score) => {
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return "text-secondary";
    if (numericScore >= 4) return "text-success";
    if (numericScore >= 3) return "text-primary"; // Using Bootstrap primary for "good"
    if (numericScore >= 2) return "text-warning";
    return "text-danger";
  };
  
  const getScoreText = (score) => {
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return "N/A";
    if (numericScore < 2) return "Insuffisant";
    if (numericScore < 3) return "À améliorer";
    if (numericScore < 4) return "Satisfaisant";
    if (numericScore < 4.5) return "Très bien";
    return "Excellent";
  }

  // Helper function to render text or a default message
  const renderWithDefault = (text, defaultMessage = "Non spécifié") => {
    return text && String(text).trim() !== "" ? String(text) : defaultMessage;
  };

  // Extract question details (keeping existing logic)
  const extractQuestionDetails = () => {
    if (!evaluation || !evaluation.questionDetails) {
      return [];
    }
    if (Array.isArray(evaluation.questionDetails)) {
      return evaluation.questionDetails;
    }
    if (typeof evaluation.questionDetails === 'string') {
      try {
        return evaluation.questionDetails.split(';')
          .filter(q => q.trim().length > 0)
          .map(q => {
            const scorePart = q.match(/Score:(\d+(\.\d+)?)/);
            return {
              question: q.match(/Question:(.*?),/)?.[1]?.trim() || "Question sans titre",
              score: scorePart ? parseFloat(scorePart[1]) : null // Keep null if no score
            };
          });
      } catch (e) {
        console.error("Erreur lors du parsing des détails de questions:", e);
        return [];
      }
    }
    return [];
  };
  const questionDetails = extractQuestionDetails();

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      dialogClassName="evaluation-details-modal modal-lg" // Existing class for main styling
      aria-labelledby="evaluation-details-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="evaluation-details-title">
          <FaClipboardList className="me-2" /> Détails de l&apos;évaluation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Employee Info + Overall Score */}
        <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="score-circle mx-auto">
                <span className={getScoreClass(evaluation.overallScore)}>
                  {evaluation.overallScore ? parseFloat(evaluation.overallScore).toFixed(2) : '--'}
                </span>
              </div>
              <div className={`score-label mt-2 fw-medium ${getScoreClass(evaluation.overallScore)}`}>
                {getScoreText(evaluation.overallScore)}
              </div>
            </Col>
            <Col md={9}>
              <h4 className="mb-2">{renderWithDefault(evaluation.firstName)} {renderWithDefault(evaluation.lastName)}</h4>
              <p className="mb-1 text-muted">
                <FaBuilding className="me-2" /> 
                {renderWithDefault(evaluation.position)}
              </p>
              <p className="mb-1 text-muted">
                <FaBuilding className="me-2" />
                {renderWithDefault(evaluation.department)}
              </p>
              <p className="mb-0 text-muted">
                <FaCalendarAlt className="me-2" /> 
                Période du {formatDate(evaluation.startDate)} au {formatDate(evaluation.endDate)}
              </p>
            </Col>
          </Row>
        </div>

        {/* General Info & Interview Details */}
        <Card className="mb-3">
          <Card.Header>
            <FaClipboardList className="me-2" /> Informations Générales et Entretien
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <p className="mb-1"><strong className="me-1">Type d&apos;évaluation:</strong> {renderWithDefault(evaluation.evaluationType)}</p>
                <p className="mb-0"><strong className="me-1">Date de l&apos;entretien:</strong> {formatDate(evaluation.interviewDate)}</p>
              </Col>
              <Col md={6}>
                <p className="mb-0"><strong className="me-1">Statut de l&apos;entretien:</strong> {getStatusBadge(evaluation.interviewStatus)}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Participants */}
        {evaluation.participants && evaluation.participants.length > 0 && (
          <Card className="mb-3">
            <Card.Header>
              <FaUsers className="me-2" /> Participants
            </Card.Header>
            <ListGroup variant="flush">
              {evaluation.participants.map((participant, index) => (
                <ListGroup.Item key={index} className="d-flex align-items-center">
                  <FaUser className="me-2 text-muted" /> {renderWithDefault(participant)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}

        {/* General Comments */}
        {renderWithDefault(evaluation.evaluationComments, '') !== 'Non spécifié' && (
            <Card className="mb-3">
                <Card.Header>
                    <FaCommentDots className="me-2" /> Commentaires Généraux
                </Card.Header>
                <Card.Body>
                    <p className="mb-0">{renderWithDefault(evaluation.evaluationComments)}</p>
                </Card.Body>
            </Card>
        )}


        {/* Strengths and Weaknesses */}
        <Row>
          <Col md={6}>
            {renderWithDefault(evaluation.strengths, '') !== 'Non spécifié' && (
                <Card className="mb-3">
                    <Card.Header>
                        <FaLightbulb className="me-2" /> Points Forts
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">{renderWithDefault(evaluation.strengths)}</p>
                    </Card.Body>
                </Card>
            )}
          </Col>
          <Col md={6}>
            {renderWithDefault(evaluation.weaknesses, '') !== 'Non spécifié' && (
                <Card className="mb-3">
                    <Card.Header>
                        <FaExclamationTriangle className="me-2" /> Points à Améliorer
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">{renderWithDefault(evaluation.weaknesses)}</p>
                    </Card.Body>
                </Card>
            )}
          </Col>
        </Row>

        {/* Recommendations */}
        {renderWithDefault(evaluation.recommendations, '') !== 'Non spécifié' && (
            <Card className="mb-3">
                <Card.Header>
                    <FaStar className="me-2" /> Recommandations
                </Card.Header>
                <Card.Body>
                    <p className="mb-0">{renderWithDefault(evaluation.recommendations)}</p>
                </Card.Body>
            </Card>
        )}

        {/* Question Details */}
        {questionDetails.length > 0 && (
          <Card>
            <Card.Header>
              <FaTasks className="me-2" /> Questions Détaillées de l&apos;Évaluation
            </Card.Header>
            <ListGroup variant="flush">
              {questionDetails.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <span className="flex-grow-1 me-3">{renderWithDefault(item.question)}</span>
                  {item.score !== null ? (
                    <Badge pill bg={getScoreClass(item.score).replace('text-', '')} className={`px-3 py-2 ${getScoreClass(item.score)}`}>
                      {parseFloat(item.score).toFixed(2)} / 5
                    </Badge>
                  ) : (
                    <Badge pill bg="secondary" className="px-3 py-2">N/A</Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" className="btn-fw" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

EvaluationDetailsModal.propTypes = {
  evaluation: PropTypes.object, // Changed to not required as we handle null evaluation
  onClose: PropTypes.func.isRequired
};

// Adding defaultProps for evaluation for safety, though the null check at the start is primary
EvaluationDetailsModal.defaultProps = {
  evaluation: null,
};

export default EvaluationDetailsModal;