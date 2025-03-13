import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import axios from 'axios';

const EvaluationHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          'https://localhost:7082/api/EvaluationHistory/history',
          {
            params: {
              startDate: filters.evaluationDate || null,
              evaluationType: '',
              department: filters.position || '',
              employeeName: searchQuery || '',
            },
          }
        );
        setEvaluations(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des évaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [searchQuery, filters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredEvaluations = evaluations
    .filter((emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((emp) =>
      filters.evaluationDate ? emp.startDate === filters.evaluationDate : true
    )
    .filter((emp) =>
      filters.status
        ? emp.status.toLowerCase() === filters.status.toLowerCase()
        : true
    )
    .filter((emp) =>
      filters.position
        ? emp.position.toLowerCase().includes(filters.position.toLowerCase())
        : true
    );

  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <Template>
        <div className="alert alert-danger">{error}</div>
      </Template>
    );
  }

  const closeModal = () => {
    setSelectedEvaluation(null);
    setShowModal(false);
  };
  return (
    <Template>
      <div className="container mt-4">
        <h2 className="mb-4">Historique des Évaluations</h2>

        <div className="card shadow mb-4">
          <div className="card-header">
            <h5 className="mb-0">Filtres</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un employé"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-md-8 d-flex">
                <input
                  type="date"
                  name="evaluationDate"
                  className="form-control mx-1"
                  value={filters.evaluationDate}
                  onChange={handleFilterChange}
                />
                <select
                  name="status"
                  className="form-control mx-1"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Statut</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En attente">En attente</option>
                </select>
                <input
                  type="text"
                  name="position"
                  className="form-control mx-1"
                  placeholder="Poste"
                  value={filters.position}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow mb-4">
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Chargement...</span>
                </div>
              </div>
            ) : (
              <div>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Poste</th>
                      <th>Date d'évaluation</th>
                      <th>Statut</th>
                      <th>Note</th>
                      <th>Type d'evaluation</th>

                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvaluations.map((emp) => (
                      <tr key={emp.evaluationId}>
                        <td>{emp.firstName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.startDate}</td>
                        <td>{emp.status}</td>
                        <td>{emp.overallScore}</td>
                        <td>{emp.evaluationType}</td>

                        <td>
                          <button className="btn btn-info btn-sm">Détails</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  {/* Details de l'evaluation */}
                {showModal && selectedEvaluation && (
                  <EvaluationDetailsModal
                    evaluation={selectedEvaluation}
                    onClose={closeModal}
                  />
                )}

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Précédent
                  </button>
                  <span>
                    Page {currentPage} sur {totalPages || 1}
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for Future Graphs */}
        <div className="card shadow mb-4">
          <div className="card-header">
            <h5 className="mb-0">Graphiques de Performance</h5>
          </div>
          <div className="card-body">
            <PerformanceGraph />
            <GlobalPerformanceGraph />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;
