import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

function SalaryList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState({}); // État pour stocker les notes

  const allQuestionsRated = () => {
    return questions.every(question => ratings[question.questionId] !== undefined);
  };

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

  // Ouvrir le modal et récupérer les types d'évaluation
  const handleOpenModal = async (employeeId) => {
    try {
      // Récupérer les détails de l'employé
      const response = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
      const employeeData = response.data;

      // Récupérer les types d'évaluation
      const evalResponse = await axios.get('https://localhost:7082/api/Evaluation/types');
      const evaluationTypesData = evalResponse.data;

      // Mettre à jour l'état avec les données récupérées
      setSelectedEmployee(employeeData);
      setEvaluationTypes(evaluationTypesData);
      console.log("Détails de l'employé récupéré :", employeeData);
      console.log("Évaluation Types récupérés :", evaluationTypesData);

      setShowModal(true); // Ouvrir le modal après avoir mis à jour l'état
    } catch (error) {
      console.error("Erreur lors de la récupération de l'employé :", error);
    }
  };

  // Gestion des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            evaluationTypes={evaluationTypes}
            onEvaluationTypeChange={setSelectedEvaluationType}
            selectedEvaluationType={selectedEvaluationType}
            selectedEmployee={selectedEmployee}
            ratings={ratings} // Passer les notes à Step1
            setRatings={setRatings} // Passer la fonction pour mettre à jour les notes
          />
        );
      case 2:
        return <Step2 ratings={ratings} />;
      case 3:
        return <Step3 />;
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
                  {employees.map((employee, index) => (
                    <tr key={`${employee.id}-${index}`}>
                      <td className="py-1">
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.poste?.title || 'Non défini'}</td> {/* Affiche le titre du poste */}
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : "Aucune évaluation"}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleOpenModal(employee.id)}
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
                  NOTATIONS - {selectedEmployee.firstName} {selectedEmployee.lastName} {selectedEmployee.poste?.title || 'Non défini'}
                </h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Navigation entre les étapes */}
                <ul className="step-navigation">
                  <li onClick={() => setCurrentStep(1)} className={currentStep === 1 ? 'active' : ''}>Étape 1</li>
                  <li onClick={() => setCurrentStep(2)} className={currentStep === 2 ? 'active' : ''}>Étape 2</li>
                  <li onClick={() => setCurrentStep(3)} className={currentStep === 3 ? 'active' : ''}>Étape 3</li>
                </ul>

                {/* Contenu de l'étape */}
                {renderStepContent()}
              </div>

              {/* Boutons de navigation */}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1}>
                  Précédent
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(prev => Math.min(prev + 1, 3))} disabled={!allQuestionsRated() || currentStep === 3}>
                  Suivant
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>
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