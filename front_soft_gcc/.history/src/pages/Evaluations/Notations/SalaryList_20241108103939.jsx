import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';

function SalaryList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/Employee'); // Appel API pour récupérer les employés avec détails
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <Template>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Notation d'évaluation des employés</h4>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Date d'évaluation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="py-1">
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="image" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>{employee.evaluationDate}</td>
                      <td>
                        <button className="btn btn-primary">Notation</button>
                        <Link className="btn btn-primary" to="/salary-list">Réinitialiser</Link>
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

export default SalaryList;
