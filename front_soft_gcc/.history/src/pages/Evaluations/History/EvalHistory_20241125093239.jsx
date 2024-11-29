import React, { useState } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import '../../assets/css/Evaluations/EvaluationHistory.css';

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
        { training: 'Formation Leadership', details: 'Améliorer les compétences de gestion', status: 'Réalisée' },
        { training: 'Formation Technique', details: 'Améliorer les compétences en React', status: 'En attente' },
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
    setCurrentStep(1);
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
          <div className="step-content">
            <h5>Détails de l'Évaluation</h5>
            <p>Date : {selectedEmployee.evaluationDate}</p>
            <p>Type : {selectedEmployee.evaluationType}</p>
            <p>Évaluateurs : {selectedEmployee.evaluators.join(', ')}</p>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
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
          <div className="step-content">
            <h5>Statut des Recommandations</h5>
            <ul>
              {selectedEmployee.recommendations.map((rec, index) => (
                <li key={index}>
                  <strong>{rec.training}</strong>: {rec.status}
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
      {/* Barre de recherche, tableau et pagination ici */}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Détails de l'Évaluation</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <ul className="step-navigation">
                  <li className={currentStep === 1 ? 'active' : ''} onClick={() => setCurrentStep(1)}>Étape 1</li>
                  <li className={currentStep === 2 ? 'active' : ''} onClick={() => setCurrentStep(2)}>Étape 2</li>
                  <li className={currentStep === 3 ? 'active' : ''} onClick={() => setCurrentStep(3)}>Étape 3</li>
                  <li className={currentStep === 4 ? 'active' : ''} onClick={() => setCurrentStep(4)}>Étape 4</li>
                </ul>
                {renderStepContent()}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={currentStep === 1}
                  onClick={handlePreviousStep}
                >
                  Précédent
                </button>
                <button
                  className="btn btn-primary"
                  disabled={currentStep === 4}
                  onClick={handleNextStep}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Template>
  );
};

export default EvaluationHistory;
