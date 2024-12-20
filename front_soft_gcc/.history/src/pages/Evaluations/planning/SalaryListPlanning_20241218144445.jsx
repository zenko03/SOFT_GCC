import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques

function SalaryListPlanning() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    department: '',
  });
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Récupérer les employés sans évaluation
  const fetchEmployeesWithoutEvaluations = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations',
        { params: { ...filters, search: searchQuery } }
      );
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des employés sans évaluation :',
        error
      );
    }
  };

  // Récupérer les options pour les filtres
  const fetchFilterOptions = async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        axios.get('https://localhost:7082/api/EvaluationPlanning/positions'), // Endpoint pour récupérer les postes
        axios.get('https://localhost:7082/api/EvaluationPlanning/departments'), // Endpoint pour récupérer les départements
      ]);
      setPositions(positionsRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des filtres :', error);
    }
  };

  useEffect(() => {
    fetchEmployeesWithoutEvaluations();
    fetchFilterOptions();
  }, [filters, searchQuery]);

  // Gestion de la recherche
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Gestion des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value ? parseInt(value) : '',
    }));
  };

  // Gestion du modal
  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <Template>
      <div className="salary-list-planning">
        <h4 className="title">Planification des évaluations</h4>

        {/* Barre de recherche et filtres */}
        <div className="filters">
          <input
            type="text"
            className="search-bar"
            placeholder="Rechercher un employé..."
            value={searchQuery}
            onChange={handleSearch}
          />
          
          <select
            name="position"
            className="filter-select"
            value={filters.position}
            onChange={handleFilterChange}
          >
            <option value="">Tous les postes</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
          <select
            name="department"
            className="filter-select"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <option value="">Tous les départements</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>

        </div>

        {/* Tableau des employés */}
        <div className="employee-cards">
          {filteredEmployees.map((employee) => (
            <div key={employee.employeeId} className="card">
              <img
                src="../../assets/images/faces-clipart/pic-1.png"
                alt="employee"
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">
                  {employee.firstName} {employee.lastName}
                </h5>
                <p className="card-text">{employee.position}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenModal(employee)}
                >
                  Planifier
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* Modal */}
        {showModal && selectedEmployee && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Planification - {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label>Date d'évaluation :</label>
                      <input type="date" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Type d'évaluation :</label>
                      <select className="form-control">
                        <option value="1">Annuel</option>
                        <option value="2">Par projet</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Superviseur :</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nom du superviseur"
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary">Planifier</button>
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
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

export default SalaryListPlanning;
