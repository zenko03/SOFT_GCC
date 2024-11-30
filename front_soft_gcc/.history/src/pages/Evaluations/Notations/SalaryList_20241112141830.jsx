import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import '../../../assets/css/Evaluations/notationModal.css';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import axios from 'axios';

function SalaryList() {
  const [employees, setEmployees] = useState([]);
  const [notes, setNotes] = useState({
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Récupération des données des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User');
        console.log(response.data); // Log de la réponse complète
        setEmployees(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
      }
    };
    
    fetchEmployees();
  }, []);

  // Gestion des étapes du modal
  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1 notes={notes} setNotes={setNotes} />;
      case 2:
        return <Step2 notes={notes} setNotes={setNotes} />;
      case 3:
        return <Step3 notes={notes} />;
      default:
        return null;
    }
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
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="py-1">
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {/* Affichez toutes les dates d'évaluation pour chaque employé */}
                        {employee.evaluationDates && employee.evaluationDates.length > 0 ? (
                          <ul>
                            {employee.evaluationDates.map((date, index) => (
                              <li key={index}>{new Date(date).toLocaleDateString()}</li>
                            ))}
                          </ul>
                        ) : (
                          "Aucune évaluation"
                        )}
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={handleOpenModal}>Notation</button>
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
      {showModal && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">NOTATIONS</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <ul className="step-navigation">
                  <li className={currentStep === 1 ? 'active' : ''} onClick={() => setCurrentStep(1)}>Étape 1</li>
                  <li className={currentStep === 2 ? 'active' : ''} onClick={() => setCurrentStep(2)}>Étape 2</li>
                  <li className={currentStep === 3 ? 'active' : ''} onClick={() => setCurrentStep(3)}>Étape 3</li>
                </ul>
                {renderStepContent()}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  Précédent
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={currentStep === 3}
                >
                  Suivant
                </button>
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
