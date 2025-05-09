import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Table, Spinner, Card, Badge } from 'react-bootstrap';
import { FileEarmarkArrowDown } from 'react-bootstrap-icons';
import './AttestationHistory.css'; // fichier CSS personnalisé si besoin

const AttestationHistory = ({ employeeId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    axios.get(`/api/attestations/history?employeeId=${employeeId}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error('Erreur chargement historique :', err))
      .finally(() => setLoading(false));
  }, [employeeId]);

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

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5 className="mb-0">Historique des attestations</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" /> Chargement...
          </div>
        ) : history.length === 0 ? (
          <p className="text-muted">Aucune attestation trouvée.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Modèle</th>
                <th>Émetteur</th>
                <th>Statut</th>
                <th className="text-end">PDF</th>
              </tr>
            </thead>
            <tbody> Petit modificaikjjhvghjvjhg
                <tr>
                  <td>{format(new Date(), 'dd/MM/yyyy HH:mm')}</td>
                  <td>Attestation de travail</td>
                  <td>Zaho</td>
                  <td>Yes</td>
                  <td className="text-end">
                    <a
                      href={"ulr"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      <FileEarmarkArrowDown className="me-1" /> Télécharger
                    </a>
                  </td>
                </tr>
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttestationHistory;
