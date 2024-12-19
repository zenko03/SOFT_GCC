import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques

function SalaryListPlanning() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    department: '',
  });

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations', {
        params: filters,
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés :', error);
    }
  };

  // const fetchFiltersData = async () => {
  //   try {
  //     const positionsResponse = await axios.get('https://localhost:7082/api/Positions');
  //     const departmentsResponse = await axios.get('https://localhost:7082/api/Departments');
  //     setPositions(positionsResponse.data);
  //     setDepartments(departmentsResponse.data);
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération des filtres :', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchFiltersData();
  //   fetchEmployees();
  // }, [filters]);

  // const handleFilterChange = (e) => {
  //   const { name, value } = e.target;
  //   setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  // };

  return (
    <Template>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Planification des évaluations</h4>

              {/* Section des filtres */}
              <div className="filters">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher un employé"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="form-control"
                />

                <select
                  name="position"
                  value={filters.position}
                  onChange={handleFilterChange}
                  className="form-control"
                >
                  <option value="">Tous les postes</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.name}>
                      {position.name}
                    </option>
                  ))}
                </select>

                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="form-control"
                >
                  <option value="">Tous les départements</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tableau des employés */}
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Département</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>
                        <button className="btn btn-primary">Planifier</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default SalaryListPlanning;
