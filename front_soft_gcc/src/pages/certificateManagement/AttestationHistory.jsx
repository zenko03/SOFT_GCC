import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Table, Spinner, Card, Badge } from 'react-bootstrap';
import { FileEarmarkArrowDown, Eye } from 'react-bootstrap-icons';
import './AttestationHistory.css'; // pour le style modernisé du tableau
import { urlApi } from '../../helpers/utils';
import DateDisplayWithTime from '../../helpers/DateDisplayWithTime';

const AttestationHistory = ({ registrationNumber }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!registrationNumber) return;
    setLoading(true);
    axios
      .get(urlApi(`/CareerPlan/Certificate/Get/${registrationNumber}`))
      .then(res => setHistory(res.data))
      .catch(err => console.error('Erreur chargement historique :', err))
      .finally(() => setLoading(false));
  }, [registrationNumber]);

  console.log(history);
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
          <div className="archive-table-container p-4 rounded shadow-sm bg-white">
            <h5 className="mb-4 fw-semibold text-primary">📁 Archive des fichiers exportés</h5>
            <Table responsive className="table-modern align-middle">
              <thead>
                <tr>
                  <th>📄 Nom</th>
                  <th>📅 Date de création</th>
                  <th>📌 Statut</th>
                  <th>📦 Taille</th>
                  <th>🔗 Actions</th>
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
                      <a
                        href={"#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary btn-sm me-2"
                      >
                        <Eye className="me-1" />
                        Visualiser
                      </a>
                      <a
                        href={"#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <FileEarmarkArrowDown className="me-1" />
                        Télécharger
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttestationHistory;
