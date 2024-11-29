import React, { useState } from 'react';
import Template from '../../Template';

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
    },
    {
      id: 2,
      name: 'John Doe',
      position: 'Manager',
      evaluationDate: '2024-09-20',
      status: 'En attente',
      score: 3.8,
      evaluationType: 'Auto-évaluation',
      evaluators: ['Manager : Alice Brown'],
      recommendations: [
        { training: 'Formation Communication', details: 'Renforcer les compétences interpersonnelles', status: 'pending' },
      ],
    },
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

        {/* Modal de détails */}
        {showModal && selectedEmployee && (
          <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails de l'Évaluation</h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Détails de l'évaluation */}
                  <h5>Détails de l'Évaluation</h5>
                  <p><strong>Date :</strong> {selectedEmployee.evaluationDate}</p>
                  <p><strong>Type :</strong> {selectedEmployee.evaluationType}</p>
                  <p><strong>Évaluateurs :</strong></p>
                  <ul>
                    {selectedEmployee.evaluators.map((evaluator, index) => (
                      <li key={index}>{evaluator}</li>
                    ))}
                  </ul>

                  {/* Recommandations passées */}
                  <h5 className="mt-4">Recommandations Passées</h5>
                  <ul>
                    {selectedEmployee.recommendations.map((rec, index) => (
                      <li key={index}>
                        <p><strong>Formation :</strong> {rec.training}</p>
                        <p><strong>Détails :</strong> {rec.details}</p>
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
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
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
};

export default EvaluationHistory;
