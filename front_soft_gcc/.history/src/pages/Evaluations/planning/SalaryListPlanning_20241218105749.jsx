import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques

function SalaryListPlanning() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Récupérer les employés sans évaluation
  useEffect(() => {
    const fetchEmployeesWithoutEvaluations = async () => {
      try {
        const response = await axios.get(
          'https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations'
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
    fetchEmployeesWithoutEvaluations();
  }, []);

  // Gestion des filtres
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter((emp) =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
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
        <div className="filters">
          <input
            type="text"
            className="search-bar"
            placeholder="Rechercher un employé..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="employee-table">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Nom</th>
                <th>Poste</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>
                    <img
                      src="../../assets/images/faces-clipart/pic-1.png"
                      alt="employee"
                      className="employee-image"
                    />
                  </td>
                  <td>{employee.firstName} {employee.lastName}</td>
                  <td>{employee.position}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenModal(employee)}
                    >
                      Planifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  {/* Formulaire de planification */}
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
                        {/* Ajouter d'autres types si nécessaires */}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Superviseur :</label>
                      <input type="text" className="form-control" placeholder="Nom du superviseur" />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary">Planifier</button>
                  <button className="btn btn-secondary" onClick={handleCloseModal}>Fermer</button>
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
