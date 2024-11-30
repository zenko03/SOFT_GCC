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
      <div className={`container ${showModal ? 'darken-background' : ''}`}>
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

        {/* Modal de détails avec wizard multi-étapes */}
        {showModal && selectedEmployee && (
          <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg-custom" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails de l'Évaluation</h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Étapes du modal */}
                  <ul className="step-navigation">
                    <li
                      className={currentStep === 1 ? 'active' : ''}
                      onClick={() => setCurrentStep(1)}
                    >
                      Étape 1: Détails de l'Évaluation
                    </li>
                    <li
                      className={currentStep === 2 ? 'active' : ''}
                      onClick={() => setCurrentStep(2)}
                    >
                      Étape 2: Recommandations Passées
                    </li>
                    <li
                      className={currentStep === 3 ? 'active' : ''}
                      onClick={() => setCurrentStep(3)}
                    >
                      Étape 3: Statut des Recommandations
                    </li>
                    <li
                      className={currentStep === 4 ? 'active' : ''}
                      onClick={() => setCurrentStep(4)}
                    >
                      Étape 4: Évolution des Performances
                    </li>
                  </ul>
                  {renderStepContent()}
                  {currentStep === 4 && selectedEmployee.performanceData && (
                    <PerformanceGraph performanceData={selectedEmployee.performanceData} />
                  )}
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

        {/* Ajouter le graphique global en haut ou en bas */}
        <div className="global-performance-graph">
          <GlobalPerformanceGraph data={mockEmployees} />
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;
