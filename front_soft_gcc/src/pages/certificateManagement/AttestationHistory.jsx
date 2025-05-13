import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Table, Spinner, Card, Badge } from 'react-bootstrap';
import { FileEarmarkArrowDown, Eye } from 'react-bootstrap-icons';
import './AttestationHistory.css'; // pour le style modernisé du tableau
import { urlApi } from '../../helpers/utils';

const AttestationHistory = ({ employeeId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    axios
      .get(urlApi(`/CareerPlan/Certificate/Get/${employeeId}`))
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
          <div className="archive-table-container p-4 rounded shadow-sm bg-white">
            <h5 className="mb-4 fw-semibold text-primary">📁 Archive des fichiers exportés</h5>
            <Table responsive className="table-modern align-middle">
              <thead>
                <tr>
                  <th>📄 Nom</th>
                  <th>📅 Date de création</th>
                  <th>📌 Statut</th>
                  <th>📦 Taille</th>
                  <th className="text-end">🔗 Actions</th>
                </tr>
              </thead>
              <tbody>
                  <tr>
                    <td>Attestation</td>
                    <td>19 juin 2025 à 25h30</td>
                    <td>Fchier exporté</td>
                    <td>129 ko</td>
                    <td className="text-end">
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
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttestationHistory;
