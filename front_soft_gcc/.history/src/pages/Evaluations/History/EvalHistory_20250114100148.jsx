import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
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

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationHistory/history',
        {
          params: {
            startDate: filters.evaluationDate || null,
            endDate: null,
            evaluationType: '',
            department: filters.position || '',
            employeeName: searchQuery || '',
          },
        }
      );
      setEvaluations(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des évaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [searchQuery, filters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredEvaluations = evaluations
    .filter((emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((emp) =>
      filters.evaluationDate ? emp.startDate === filters.evaluationDate : true
    )
    .filter((emp) =>
      filters.status ? emp.status.toLowerCase() === filters.status.toLowerCase() : true
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

  if (error) return <div>{error}</div>;

  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setShowModal(false);
  };

  const handleNextStep = () =>
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  const handlePreviousStep = () =>
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  const renderStepContent = () => {
    if (!selectedEmployee) return null;

    switch (currentStep) {
      case 1:
        return (
          <div>
            <p><strong>Date :</strong> {selectedEmployee.evaluationDate}</p>
            <p><strong>Type :</strong> {selectedEmployee.evaluationType}</p>
            <p><strong>Évaluateurs :</strong></p>
            <ul>
              {selectedEmployee.evaluators?.map((evaluator, index) => (
                <li key={index}>{evaluator}</li>
              ))}
            </ul>
          </div>
        );
      case 2:
        return (
          <div>
            <h5>Recommandations</h5>
            <ul>
              {selectedEmployee.recommendations?.map((rec, index) => (
                <li key={index}>
                  <p><strong>Formation :</strong> {rec.training}</p>
                  <p><strong>Détails :</strong> {rec.details}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case 3:
        return (
          <div>
            <h5>Statut des Recommandations</h5>
            <ul>
              {selectedEmployee.recommendations?.map((rec, index) => (
                <li key={index}>
                  <p><strong>Formation :</strong> {rec.training}</p>
                  <p>
                    <strong>Statut :</strong>{' '}
                    {rec.status === 'completed' ? (
                      <span className="badge badge-success">Réalisée</span>
                    ) : (
                      <span className="badge badge-warning">En attente</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };
if(loading){
  return (
    <Template>
      <div className="container mt-4">
        <h2>Historique des Évaluations</h2>

        {/* Filtres */}
        <div className="card mb-4">
          <div className="card-body">
            <h5>Filtres</h5>
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

        {/* Tableau des évaluations */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Poste</th>
              <th>Date d'évaluation</th>
              <th>Statut</th>
              <th>Note</th>
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
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => handleShowModal(emp)}
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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

        {/* Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails de l'Évaluation</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCloseModal}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {renderStepContent()}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    disabled={currentStep === 3}
                  >
                    Suivant
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleCloseModal}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Template>
  );
}
  
};

export default EvaluationHistory;
