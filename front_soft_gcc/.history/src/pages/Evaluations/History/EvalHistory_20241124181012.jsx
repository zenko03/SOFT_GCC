import React, { useState } from 'react';
import Template from '../../Template';

const EvalHistory = () => {
  // États pour la recherche, les filtres et la pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données mock pour les tests
  const mockEmployees = [
    { id: 1, name: 'Herman Beck', position: 'Comptable', evaluationDate: '2024-10-10', status: 'Terminé', score: 4.5 },
    { id: 2, name: 'John Doe', position: 'Manager', evaluationDate: '2024-09-20', status: 'En attente', score: 3.8 },
    { id: 3, name: 'Jane Smith', position: 'Technicien', evaluationDate: '2024-08-15', status: 'Terminé', score: 4.2 },
    { id: 4, name: 'Alice Brown', position: 'Développeur', evaluationDate: '2024-07-12', status: 'Terminé', score: 4.7 },
    { id: 5, name: 'Bob White', position: 'Analyste', evaluationDate: '2024-06-18', status: 'En attente', score: 3.5 },
  ];

  // Gestion de la recherche
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Gestion des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Application des filtres et de la recherche
  const filteredEmployees = mockEmployees
    .filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((emp) => !filters.evaluationDate || emp.evaluationDate === filters.evaluationDate)
    .filter((emp) => !filters.status || emp.status === filters.status)
    .filter((emp) => !filters.position || emp.position.toLowerCase().includes(filters.position.toLowerCase()));

  // Gestion de la pagination
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
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
    </Template>
  );
};

export default EvalHistory;
