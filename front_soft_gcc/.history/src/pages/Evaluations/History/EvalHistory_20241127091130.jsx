import React, { useState } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';

const EvaluationHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedEmployee, setSelectedEmployee] = useState(null); // Évaluation sélectionnée
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Suivi des étapes du wizard

  const mockEmployees = [
    {
      id: 1,
      name: 'Herman Beck',
      position: 'Comptable',
      evaluationDate: '2024-10-10',
      status: 'Terminé',
      score: 4.5,
      evaluationType: 'Évaluation annuelle',
      evaluators: ['Manager : John Doe', 'Directeur : Jane Smith'],
      recommendations: [
        { training: 'Formation Leadership', details: 'Améliorer les compétences de gestion', status: 'completed' },
        { training: 'Formation Technique', details: 'Améliorer les compétences en React', status: 'pending' },
      ],
      performanceData: [
        { date: '2023-01', score: 3.5 },
        { date: '2023-06', score: 4.0 },
        { date: '2024-01', score: 4.5 },
      ],
    },
    // Plus d'employés ici...
  ];

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
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

  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setShowModal(false);
  };

  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  return (
    <Template>
      <div className="container mt-4">
        <h2 className="mb-4">Historique des Évaluations</h2>

        {/* Section Filtres et Tableau */}
        <div className="card mb-4">
          <div className="card-body">
            <h5>Liste des Évaluations avec Filtres</h5>
            <div className="row mb-3">
              {/* Barre de recherche */}
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un employé"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Filtres */}
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

            {/* Tableau */}
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
                        <button
                          className="btn btn-info"
                          onClick={() => handleShowModal(emp)}
                        >
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
          </div>
        </div>

        {/* Section Graphique Global */}
        <div className="card">
          <div className="card-body">
            <h5>Graphique Global des Performances</h5>
            <GlobalPerformanceGraph data={mockEmployees} />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;
