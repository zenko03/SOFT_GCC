import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaUser, FaCalendarAlt, FaBuilding, FaClipboardList, FaCommentDots, FaLightbulb, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import '../../assets/css/Evaluations/EvaluationDetailsModal.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EvaluationDetailsModal = ({ show, onHide, evaluation, lastEvaluations }) => {
  if (!evaluation) return null;

  // Formatage des dates pour une meilleure lisibilité
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
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
          <FaClipboardList className="me-2" /> Détails de l&apos;évaluation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Informations sur l'employé et score */}
        <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
              <div className="score-circle mx-auto">
                <span className={getScoreClass(evaluation.overallScore)}>
                  {evaluation.overallScore ? evaluation.overallScore.toFixed(2) : '--'}
                </span>
              </div>
              <div className="score-label">Score global</div>
            </div>
            <div className="col-md-10">
              <h5 className="mb-1">{evaluation.firstName} {evaluation.lastName}</h5>
              <p className="mb-1">
                <FaBuilding className="me-2" /> <span className="fw-medium">Poste :</span> {renderWithDefault(evaluation.position)}
              </p>
              <p className="mb-1">
                <FaBuilding className="me-2" /> <span className="fw-medium">Département :</span> {renderWithDefault(evaluation.department)}
              </p>
              <p className="mb-0">
                <FaCalendarAlt className="me-2" /> <span className="fw-medium">Période :</span> {formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center">
            <FaClipboardList className="me-2" />
            <span className="fw-medium">Informations générales</span>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <p className="mb-2">
                  <FaClipboardList className="me-2" /> <span className="fw-medium">Type d&apos;évaluation :</span> {renderWithDefault(evaluation.evaluationType)}
                </p>
                <p className="mb-0">
                  <FaCalendarAlt className="me-2" /> <span className="fw-medium">Date d&apos;entretien :</span> {formatDate(evaluation.interviewDate)}
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-0">
                  <span className="fw-medium">Statut de l&apos;évaluation :</span> {getStatusBadge(evaluation.interviewStatus)}
                </p>
              </Col>
            </Row>
            
            {/* Participants */}
            {evaluation.participants && evaluation.participants.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-medium"><FaUser className="me-2" /> Participants</h6>
                <ul className="list-group list-group-flush border-top pt-2">
                  {evaluation.participants.map((participant, index) => (
                    <li key={index} className="list-group-item px-0 py-2 border-0 border-bottom">
                      {participant}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Commentaires généraux */}
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center">
            <FaCommentDots className="me-2" />
            <span className="fw-medium">Commentaires généraux</span>
          </Card.Header>
          <Card.Body>
            <p>{renderWithDefault(evaluation.evaluationComments)}</p>
          </Card.Body>
        </Card>

        {/* Points forts et à améliorer */}
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FaLightbulb className="me-2" />
                <span className="fw-medium">Points forts</span>
              </Card.Header>
              <Card.Body>
                <p>{renderWithDefault(evaluation.strengths)}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                <span className="fw-medium">Points à améliorer</span>
              </Card.Header>
              <Card.Body>
                <p>{renderWithDefault(evaluation.weaknesses)}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recommandations */}
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center">
            <FaStar className="me-2" />
            <span className="fw-medium">Recommandations</span>
          </Card.Header>
          <Card.Body>
            <p>{renderWithDefault(evaluation.recommendations)}</p>
          </Card.Body>
        </Card>

        {/* Questions d'évaluation détaillées */}
        {evaluation.questionDetails && evaluation.questionDetails.length > 0 && (
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaClipboardList className="me-2" />
              <span className="fw-medium">Questions d&apos;évaluation</span>
            </Card.Header>
            <Card.Body className="p-0">
              <ul className="list-group list-group-flush">
                {evaluation.questionDetails.map((question, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span>{question.question}</span>
                    <span className={`badge ms-2 ${getScoreClass(question.score)}`} style={{ fontSize: '1em' }}>
                      {question.score !== null && question.score !== undefined ? question.score.toFixed(2) : '--'} / 5
                    </span>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" className="btn-fw" onClick={onHide}>
          <i className="me-1"></i>Fermer
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