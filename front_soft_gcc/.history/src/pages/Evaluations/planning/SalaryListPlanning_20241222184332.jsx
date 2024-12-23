import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css';
import { FaTrashAlt } from 'react-icons/fa'; // Icone pour supprimer

function SalaryListPlanning() {
  // ... autres hooks et fonctions

  const handleRemoveSelectedEmployee = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
  };

  const renderSelectedEmployees = () => (
    <div className="selected-employees-list">
      {selectedEmployees.length > 0 ? (
        <ul className="list-group">
          {selectedEmployees.map((employeeId) => {
            const employee = employees.find((e) => e.employeeId === employeeId);
            return (
              <li key={employeeId} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {employee.firstName} {employee.lastName} - {employee.position}
                </span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveSelectedEmployee(employeeId)}
                >
                  <FaTrashAlt />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">Aucun employé sélectionné.</p>
      )}
    </div>
  );

  return (
    <Template>
      <div className="salary-list-planning">
        {/* Autres sections */}

        {showModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg custom-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Planification en masse</h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label>Date de début :</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={evaluationDetails.startDate}
                        onChange={handleEvaluationDetailsChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de fin :</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={evaluationDetails.endDate}
                        onChange={handleEvaluationDetailsChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Type d'évaluation :</label>
                      <select
                        name="evaluationType"
                        className="form-control"
                        value={evaluationDetails.evaluationType}
                        onChange={handleEvaluationDetailsChange}
                      >
                        <option value="">Choisir un type</option>
                        {evaluationTypes.map((type) => (
                          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                            {type.designation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Superviseur :</label>
                      <input
                        type="text"
                        name="supervisor"
                        className="form-control"
                        value={evaluationDetails.supervisor}
                        onChange={handleEvaluationDetailsChange}
                      />
                    </div>
                  </form>

                  <div className="mt-4">
                    <h6>Employés sélectionnés :</h6>
                    {renderSelectedEmployees()}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={handleMassPlanning}
                    disabled={selectedEmployees.length === 0}
                  >
                    Planifier
                  </button>
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
