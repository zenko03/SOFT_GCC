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

  const fetchFilterOptions = async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        axios.get('https://localhost:7082/api/EvaluationPlanning/positions'),
        axios.get('https://localhost:7082/api/EvaluationPlanning/departments'),
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseInt(value, 10) : '';
    setFilters((prev) => ({ ...prev, [name]: parsedValue }));
  };

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
        <div className="filters card p-3 mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={handleSearch}
            />

            <select
              name="position"
              className="form-control w-25 mx-2"
              value={filters.position}
              onChange={handleFilterChange}
            >
              <option value="">Tous les postes</option>
              {positions.map((pos) => (
                <option key={pos.posteId} value={String(pos.posteId)}>
                  {pos.title}
                </option>
              ))}
            </select>

            <select
              name="department"
              className="form-control w-25"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">Tous les départements</option>
              {departments.map((dep) => (
                <option key={dep.departmentId} value={String(dep.departmentId)}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau des employés */}
        <div className="card">
          <div className="card-body">
            <table className="table table-bordered">
              <thead className="thead-light">
                <tr>
                  <th>Nom</th>
                  <th>Poste</th>
                  <th>Département</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td>
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenModal(employee)}
                        >
                          Planifier
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Aucun employé trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
