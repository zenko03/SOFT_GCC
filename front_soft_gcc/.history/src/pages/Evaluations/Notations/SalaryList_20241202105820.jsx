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
  const [evaluationQuestions, setEvaluationQuestions] = useState([]);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User');
        setEmployees(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
        setError("Impossible de charger la liste des employés");
      }
    };

    fetchEmployees();
  }, []);

  const fetchQuestionsForType = async (evaluationTypeId, postId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/Evaluation/questions`, {
        params: { 
          evaluationTypeId: evaluationTypeId, 
          postId: postId 
        }
      });
      setEvaluationQuestions(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des questions :", error);
      setError("Impossible de charger les questions d'évaluation");
    }
  };

  const handleOpenModal = async (employeeId) => {
    setIsLoading(true);
    setError(null);

    try {
      const [employeeResponse, evaluationTypesResponse] = await Promise.all([
        axios.get(`https://localhost:7082/api/User/${employeeId}`),
        axios.get('https://localhost:7082/api/Evaluation/types')
      ]);

      const selectedEmployee = employeeResponse.data;
      const evaluationTypes = evaluationTypesResponse.data;

      setSelectedEmployee(selectedEmployee);
      setEvaluationTypes(evaluationTypes);
      
      if (evaluationTypes.length > 0) {
        const defaultEvaluationType = evaluationTypes[0];
        setSelectedEvaluationType(defaultEvaluationType);
        
        if (selectedEmployee.employeePostId) {
          await fetchQuestionsForType(defaultEvaluationType.id, selectedEmployee.employeePostId);
        }
      }

      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors de l'ouverture du modal :", error);
      setError("Impossible de charger les détails de l'employé ou les types d'évaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setCurrentStep(1);
    setSelectedEvaluationType(null);
    setEvaluationQuestions([]);
  };

  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  const [notes, setNotes] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Chargement...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Type d'évaluation</label>
                  <select 
                    className="form-control"
                    value={selectedEvaluationType?.id || ''}
                    onChange={async (e) => {
                      const selectedType = evaluationTypes.find(
                        type => type.id === parseInt(e.target.value)
                      );
                      setSelectedEvaluationType(selectedType);
                      if (selectedEmployee?.employeePostId) {
                        await fetchQuestionsForType(
                          selectedType.id, 
                          selectedEmployee.employeePostId
                        );
                      }
                    }}
                  >
                    <option value="">Sélectionner un type d'évaluation</option>
                    {evaluationTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Step1 
                  notes={notes} 
                  setNotes={setNotes} 
                  employeePostId={selectedEmployee?.employeePostId}
                  evaluationQuestions={evaluationQuestions}
                />
              </>
            )}
          </div>
        );
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

      {showModal && selectedEmployee && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  NOTATIONS - {selectedEmployee.poste?.Poste_id || 'Non défini'} {selectedEmployee.lastName}
                </h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <ul className="step-navigation">
                  <li
                    className={currentStep === 1 ? 'active' : ''}
                    onClick={() => setCurrentStep(1)}
                  >
                    Étape 1
                  </li>
                  <li
                    className={currentStep === 2 ? 'active' : ''}
                    onClick={() => setCurrentStep(2)}
                  >
                    Étape 2
                  </li>
                  <li
                    className={currentStep === 3 ? 'active' : ''}
                    onClick={() => setCurrentStep(3)}
                  >
                    Étape 3
                  </li>
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