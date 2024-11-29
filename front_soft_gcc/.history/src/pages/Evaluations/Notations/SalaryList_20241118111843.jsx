import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SalaryList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Stocker l'employé sélectionné
  const [showModal, setShowModal] = useState(false);

  // Récupération des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User');
        setEmployees(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
      }
    };

    fetchEmployees();
  }, []);

  // Fonction pour récupérer les détails d'un employé
  const handleOpenModal = async (employeeId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
      console.log("Employé récupéré :", response.data); // Afficher les détails dans la console
      setSelectedEmployee(response.data); // Mettre à jour l'état avec les détails de l'employé
      setShowModal(true); // Afficher le modal
    } catch (error) {
      console.error("Erreur lors de la récupération de l'employé :", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null); // Réinitialiser l'état de l'employé sélectionné
  };

  return (
    <Template>
      <div className={`row ${showModal ? 'darken-background' : ''}`}>
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
                    <th>Dates d'évaluation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={`${employee.id}-${index}`}>
                      <td className="py-1">
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : "Aucune évaluation"}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleOpenModal(employee.id)} // Passer l'ID de l'employé
                        >
                          Notation
                        </button>
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

      {/* Modal de notation */}
      {showModal && selectedEmployee && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  NOTATIONS - {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>ID :</strong> {selectedEmployee.id}</p>
                <p><strong>Nom :</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                <p><strong>Poste :</strong> {selectedEmployee.position}</p>
                <p><strong>Date d'évaluation :</strong> {selectedEmployee.evaluationDate 
                  ? new Date(selectedEmployee.evaluationDate).toLocaleDateString()
                  : "Non planifiée"}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Template>
  );
}

export default SalaryList;
