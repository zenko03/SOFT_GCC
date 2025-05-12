import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../assets/css/Evaluations/notationModal.css';
import '../../../assets/css/Evaluations/Questions.css';
import '../../../assets/css/Evaluations/Steps.css';

function SalaryList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Chargement initial des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        });
        setEmployees(response.data.employees);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    };
    fetchEmployees();
  }, [currentPage, pageSize]);

  // Cette fonction redirige maintenant vers la page d'évaluation au lieu d'ouvrir un modal
  const handleOpenEvaluation = (employeeId, evaluationId) => {
    // Si un evaluationId est fourni, on l'utilise, sinon on utilise l'employeeId
    const path = evaluationId 
      ? `/evaluations/notation/evaluation/${evaluationId}`
      : `/evaluations/notation/employee/${employeeId}`;
    
    navigate(path);
  };

  const handleSearch = (e) => {
    let query_text = e.target.value.toLowerCase();
    setSearchQuery(query_text.trim());
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchQuery);
  });

  return (
    <Template>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Notation d&apos;évaluation des employés</h4>
              {/* Barre de recherche et filtres */}
              <div className="filters card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Dates d&apos;évaluation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => (
                    <tr key={`${employee.employeeId}-${index}`}>
                      <td>
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : 'Aucune évaluation'}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleOpenEvaluation(employee.employeeId, employee.evaluationId)}
                        >
                          Notation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>
                <span>
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Réinitialiser à la première page lorsque la taille de la page change
                  }}
                >
                  <option value={5}>5 par page</option>
                  <option value={10}>10 par page</option>
                  <option value={20}>20 par page</option>
                  <option value={50}>50 par page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default SalaryList;
