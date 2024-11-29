import React, { useState } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph'; // Import du graphique
import '../../assets/css/Evaluations/EvaluationHistory.css'; // Import du fichier CSS

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

  const mockEmployees = [
    {
      id: 1,
      name: 'Herman Beck',
      position: 'Comptable',
      evaluationDate: '2024-10-10',
      status: 'Terminé',
      score: 4.5,
      performanceData: [
        { evaluationDate: '2024-01-10', score: 4.2 },
        { evaluationDate: '2024-05-15', score: 4.5 },
        { evaluationDate: '2024-10-10', score: 4.8 },
      ],
      evaluationType: 'Évaluation annuelle',
      evaluators: ['Manager : John Doe', 'Directeur : Jane Smith'],
      recommendations: [
        { training: 'Formation Leadership', details: 'Améliorer les compétences de gestion', status: 'completed' },
        { training: 'Formation Technique', details: 'Améliorer les compétences en React', status: 'pending' },
      ],
    },
    // Autres employés...
  ];

  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setShowModal(false);
    setCurrentStep(1); // Réinitialise l'étape lors de la fermeture du modal
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const filteredEmployees = mockEmployees
    .filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((emp) => !filters.evaluationDate || emp.evaluationDate === filters.evaluationDate)
    .filter((emp) => !filters.status || emp.status === filters.status)
    .filter((emp) => !filters.position || emp.position.toLowerCase().includes(filters.position.toLowerCase()));

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const renderStepContent = () => {
    if (!selectedEmployee) return null;

    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5>Détails de l'Évaluation</h5>
            <p>Date : {selectedEmployee.evaluationDate}</p>
            <p>Type : {selectedEmployee.evaluationType}</p>
            <p>Évaluateurs : {selectedEmployee.evaluators.join(', ')}</p>
          </div>
        );
      case 2:
        return (
          <div>
            <h5>Recommandations Passées</h5>
            <ul>
              {selectedEmployee.recommendations.map((rec, index) => (
                <li key={index}>
                  <strong>{rec.training}</strong>: {rec.details}
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
              {selectedEmployee.recommendations.map((rec, index) => (
                <li key={index}>
                  <strong>{rec.training}</strong>: {rec.status === 'completed' ? 'Réalisé' : 'En attente'}
                </li>
              ))}
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="graph-section">
            <h5>Évolution des Performances</h5>
            <PerformanceGraph className="performance-graph" performanceData={selectedEmployee.performanceData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Template>
      <div className="container">
        <h2 className="mb-4">Historique des Évaluations</h2>

        {/* Barre de recherche et filtres */}
        <div className="row mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un employé"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-md-8">
            <div className="d-flex">
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

        {/* Tableau des employés */}
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
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td>{emp.evaluationDate}</td>
                  <td>{emp.status}</td>
                  <td>{emp.score}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleShowModal(emp)}>
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Aucun employé trouvé.
                </td>
              </tr>
            )}
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
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Suivant
          </button>
        </div>

        {/* Modal */}
        {showModal && selectedEmployee && (
          <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails de l'Évaluation</h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">{renderStepContent()}</div>
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
                    disabled={currentStep === 4}
                  >
                    Suivant
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
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
};

export default EvaluationHistory;
