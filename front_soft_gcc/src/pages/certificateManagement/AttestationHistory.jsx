import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Card, Badge, Modal, Button, Toast } from 'react-bootstrap';
import { Eye, Trash } from 'react-bootstrap-icons';
import { FaFileAlt, FaCalendarAlt, FaThumbtack, FaBoxOpen, FaLink } from 'react-icons/fa';
import './AttestationHistory.css'; // pour le style modernisé du tableau
import { urlApi } from '../../helpers/utils';
import DateDisplayWithTime from '../../helpers/DateDisplayWithTime';


const AttestationHistory = ({ registrationNumber }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedToDeleteId, setSelectedToDeleteId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // type: 'success' | 'error'

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!registrationNumber) return;
    setLoading(true);
    axios
      .get(urlApi(`/CareerPlan/Certificate/Get/${registrationNumber}`))
      .then(res => setHistory(res.data))
      .catch(err => console.error('Erreur chargement historique :', err))
      .finally(() => setLoading(false));
  }, [registrationNumber]);

  const renderStatus = (status) => {
    switch (status) {
      case 'signed':
        return <Badge bg="success">Signé</Badge>;
      case 'unsigned':
        return <Badge bg="secondary">Non signé</Badge>;
      case 'invalid':
        return <Badge bg="danger">Signature invalide</Badge>;
      default:
        return <Badge bg="light" text="dark">Inconnu</Badge>;
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(urlApi(`/CareerPlan/Certificate/GetPdfFilebyId/${id}`), {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      setSelectedPDF(fileURL);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier PDF :', error);
      showToastMessage("Impossible de charger le fichier PDF.", 'error');
    }
  };

  const handleAskDelete = (id) => {
    setSelectedToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(urlApi(`/CareerPlan/Certificate/Delete/${selectedToDeleteId}`));
      setHistory(prev => prev.filter(item => item.id !== selectedToDeleteId));
      showToastMessage('Attestation supprimée avec succès.', 'success');
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      showToastMessage("Échec de la suppression.", 'error');
    } finally {
      setShowConfirmModal(false);
      setSelectedToDeleteId(null);
    }
  };


  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setSelectedToDeleteId(null);
  };


  return (
    <Card className="mt-4">
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        delay={3000}
        autohide
        bg={toast.type === 'success' ? 'success' : 'danger'}
        animation={true} // <== active l'animation de fondu
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          borderRadius: '0.75rem',
        }}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">
            {toast.type === 'success' ? '✅ Succès' : '❌ Erreur'}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">{toast.message}</Toast.Body>
      </Toast>


      <Card.Header>
        <h5 className="mb-0">📁 Historique des attestations</h5>
      </Card.Header>
      <Modal
        show={showConfirmModal}
        onHide={handleCancelDelete}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Voulez-vous vraiment supprimer ce fichier d’attestation ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        fullscreen
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Visualisation de l’attestation</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '80vh' }}>
          {selectedPDF ? (
            <iframe
              src={selectedPDF}
              title="Aperçu PDF"
              style={{ width: '100%', height: '100%' }}
              frameBorder="0"
            />
          ) : (
            <div className="text-muted">Chargement du fichier...</div>
          )}
        </Modal.Body>
      </Modal>

      <Card.Body>
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" /> Chargement...
          </div>
        ) : history.length === 0 ? (
          <p className="text-muted">Aucune attestation trouvée.</p>
        ) : (
            <Table responsive className="table-modern align-middle">
              <thead>
                <tr>
                  <th><FaFileAlt className="me-2" />Nom</th>
                  <th><FaCalendarAlt className="me-2" />Date de création</th>
                  <th><FaThumbtack className="me-2" />Statut</th>
                  <th><FaBoxOpen className="me-2" />Taille</th>
                  <th><FaLink className="me-2" />Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.fileName || 'Attestation.pdf'}</td>
                    <td><DateDisplayWithTime isoDate={item.createdAt} /></td>
                    <td>{renderStatus('signed')}</td>
                    <td>{(item.fileSize / 1024).toFixed(1)} ko</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleView(item.id)} // Assure-toi que `item.id` existe
                      >
                        <Eye className="me-1" />
                        Visualiser
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleAskDelete(item.id)}
                      >
                        <Trash className="me-1" />
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttestationHistory;
