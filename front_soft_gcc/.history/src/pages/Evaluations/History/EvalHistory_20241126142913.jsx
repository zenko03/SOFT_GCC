import React, { useState } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';

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

  // Gestion de la recherche
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Gestion des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Filtrage des employés en fonction des critères
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

  // Fonction pour passer à l'étape suivante
  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));

  // Fonction pour revenir à l'étape précédente
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  // Rendu du contenu de chaque étape du modal
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5>Détails de l'Évaluation</h5>
            <p><strong>Date :</strong> {selectedEmployee.evaluationDate}</p>
            <p><strong>Type :</strong> {selectedEmployee.evaluationType}</p>
            <p><strong>Évaluateurs :</strong></p>
            <ul>
              {selectedEmployee.evaluators.map((evaluator, index) => (
                <li key={index}>{evaluator}</li>
              ))}
            </ul>
          </div>
        );
      case 2:
        return (
          <div>
            <h5>Recommandations Passées</h5>
            <ul>
              {selectedEmployee.recommendations.map((rec, index) => (
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
              {selectedEmployee.recommendations.map((rec, index) => (
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

  return (
    <Template>
      <div className="container mt-4">

        {/* Section de Recherche et Filtres */}
        <div className="card mb-4">
          <div className="card-body">
            <h5>Recherche et Filtres</h5>
            
          </div>
        </div>

        {/* Section Tableau des Employés */}
        <div className="card mb-4">
          <div className="card-body">
            <h5>Liste des Évaluations</h5>
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
          </div>
        </div>

        {/* Section Graphique Global */}
        <div className="card">
          <div className="card-body">
            <GlobalPerformanceGraph data={mockEmployees} />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;
