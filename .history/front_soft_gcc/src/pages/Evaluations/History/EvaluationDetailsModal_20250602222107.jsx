import { Modal, Button, Row, Col, Card, Badge, ListGroup } from "react-bootstrap";
import PropTypes from 'prop-types';
import { FaUser, FaCalendarAlt, FaBuilding, FaClipboardList, FaCommentDots, FaLightbulb, FaExclamationTriangle, FaStar, FaTasks, FaUsers } from 'react-icons/fa';
import '../../../assets/css/Evaluations/EvaluationDetailsModal.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EvaluationDetailsModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const getStatusBadge = (status) => {
    if (status === null || typeof status === 'undefined') return <Badge bg="secondary">Non défini</Badge>;
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'completed': case 'terminée': case '30':
        return <Badge bg="success">Terminée</Badge>;
      case 'in progress': case 'en cours': case '20': case '25':
        return <Badge bg="info">En cours</Badge>;
      case 'pending': case 'planifiée': case '10':
        return <Badge bg="warning" text="dark">Planifiée</Badge>;
      case 'cancelled': case 'annulée': case '50':
        return <Badge bg="danger">Annulée</Badge>;
      case 'rejected': case 'rejeté': case '40':
        return <Badge bg="danger">Rejetée</Badge>;
      default:
        return <Badge bg="secondary">{statusString}</Badge>;
    }
  };

  const getScoreClass = (score) => {
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return "text-secondary";
    if (numericScore >= 4) return "text-success";
    if (numericScore >= 3) return "text-primary";
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
  };

  const renderWithDefault = (text, defaultMessage = "Non spécifié") => {
    return text && String(text).trim() !== "" ? String(text) : defaultMessage;
  };

  const extractQuestionDetails = () => {
    if (!evaluation || !evaluation.questionDetails) return [];
    if (Array.isArray(evaluation.questionDetails)) return evaluation.questionDetails;
    if (typeof evaluation.questionDetails === 'string') {
      try {
        return evaluation.questionDetails.split(';')
          .filter(q => q.trim().length > 0)
          .map(q => {
            const scorePart = q.match(/Score:(\d+(\.\d+)?)/);
            const questionText = q.match(/Question:(.*?),/)?.[1]?.trim() || "Question sans titre";
            return {
              question: questionText,
              score: scorePart ? parseFloat(scorePart[1]) : null
            };
          });
      } catch (e) {
        console.error("Erreur parsing QuestionDetails:", e);
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
      dialogClassName="evaluation-details-modal modal-lg"
      aria-labelledby="evaluation-details-title"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="evaluation-details-title">
          <FaClipboardList className="me-2" /> Détails de l&apos;évaluation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className={`score-circle mx-auto ${getScoreClass(evaluation.overallScore).replace('text-', 'border-')}`}>
                <span className={getScoreClass(evaluation.overallScore)}>
                  {evaluation.overallScore ? parseFloat(evaluation.overallScore).toFixed(1) : '--'}
                </span>
              </div>
              <div className={`score-label mt-2 fw-medium ${getScoreClass(evaluation.overallScore)}`}>
                {getScoreText(evaluation.overallScore)}
              </div>
            </Col>
            <Col md={9}>
              <h4 className="mb-2">{renderWithDefault(evaluation.firstName)} {renderWithDefault(evaluation.lastName)}</h4>
              <p className="mb-1 text-muted">
                <FaBuilding className="me-2" /> {renderWithDefault(evaluation.position)}
              </p>
              <p className="mb-1 text-muted">
                <FaBuilding className="me-2" /> {renderWithDefault(evaluation.department)} 
              </p>
              <p className="mb-0 text-muted">
                <FaCalendarAlt className="me-2" /> 
                Période: {formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}
              </p>
            </Col>
          </Row>
        </div>

        <Card className="mb-3 shadow-sm">
          <Card.Header className="bg-light fw-medium">
            <FaClipboardList className="me-2 text-primary" /> Informations Générales et Entretien
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-2 mb-md-0">
                <p className="mb-1"><strong>Type d&apos;évaluation:</strong> {renderWithDefault(evaluation.evaluationType)}</p>
                <p className="mb-0"><strong>Date de l&apos;entretien:</strong> {formatDate(evaluation.interviewDate)}</p>
              </Col>
              <Col md={6}>
                <p className="mb-0"><strong>Statut de l&apos;entretien:</strong> {getStatusBadge(evaluation.interviewStatus)}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {evaluation.participants && evaluation.participants.length > 0 && (
          <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-light fw-medium">
              <FaUsers className="me-2 text-primary" /> Participants
            </Card.Header>
            <ListGroup variant="flush">
              {evaluation.participants.map((participant, index) => (
                <ListGroup.Item key={index} className="d-flex align-items-center py-2">
                  <FaUser className="me-2 text-muted" /> {renderWithDefault(participant)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}

        {renderWithDefault(evaluation.evaluationComments, '') !== 'Non spécifié' && (
            <Card className="mb-3 shadow-sm">
                <Card.Header className="bg-light fw-medium">
                    <FaCommentDots className="me-2 text-primary" /> Commentaires Généraux
                </Card.Header>
                <Card.Body>
                    <p className="mb-0 fst-italic">{renderWithDefault(evaluation.evaluationComments)}</p>
                </Card.Body>
            </Card>
        )}

        <Row>
          {renderWithDefault(evaluation.strengths, '') !== 'Non spécifié' && (
            <Col md={6}>
                <Card className="mb-3 shadow-sm">
                    <Card.Header className="bg-light fw-medium">
                        <FaLightbulb className="me-2 text-success" /> Points Forts
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">{renderWithDefault(evaluation.strengths)}</p>
                    </Card.Body>
                </Card>
            </Col>
          )}
          {renderWithDefault(evaluation.weaknesses, '') !== 'Non spécifié' && (
            <Col md={renderWithDefault(evaluation.strengths, '') !== 'Non spécifié' ? 6 : 12}>
                <Card className="mb-3 shadow-sm">
                    <Card.Header className="bg-light fw-medium">
                        <FaExclamationTriangle className="me-2 text-warning" /> Points à Améliorer
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">{renderWithDefault(evaluation.weaknesses)}</p>
                    </Card.Body>
                </Card>
            </Col>
          )}
        </Row>

        {renderWithDefault(evaluation.recommendations, '') !== 'Non spécifié' && (
            <Card className="mb-3 shadow-sm">
                <Card.Header className="bg-light fw-medium">
                    <FaStar className="me-2 text-info" /> Recommandations
                </Card.Header>
                <Card.Body>
                    <p className="mb-0">{renderWithDefault(evaluation.recommendations)}</p>
                </Card.Body>
            </Card>
        )}

        {questionDetails.length > 0 && (
          <Card className="shadow-sm">
            <Card.Header className="bg-light fw-medium">
              <FaTasks className="me-2 text-primary" /> Questions Détaillées
            </Card.Header>
            <ListGroup variant="flush">
              {questionDetails.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                  <span className="flex-grow-1 me-3">{renderWithDefault(item.question)}</span>
                  {item.score !== null && typeof item.score !== 'undefined' ? (
                    <Badge pill bg={getScoreClass(item.score).replace('text-', '')} 
                           className={`px-3 py-2 fw-bold ${getScoreClass(item.score)}`}>
                      {parseFloat(item.score).toFixed(1)} / 5
                    </Badge>
                  ) : (
                    <Badge pill bg="secondary" className="px-3 py-2 fw-bold">N/A</Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" className="btn-fw" onClick={onClose}>
          <i className="mdi mdi-close-circle me-1"></i> Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

EvaluationDetailsModal.propTypes = {
  evaluation: PropTypes.object, 
  onClose: PropTypes.func.isRequired
};

EvaluationDetailsModal.defaultProps = {
  evaluation: null,
};

export default EvaluationDetailsModal;