import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

function SalaryList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Stocker l'employé sélectionné
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Étape courante
  const [evaluationTypes, setEvaluationTypes] = useState([]);
const [evaluationQuestions, setEvaluationQuestions] = useState([]);
const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);

  // Récupération des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User');
        setEmployees(response.data);
        console.log("liste des employées: ", response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
      }
    };

    fetchEmployees();
  }, []);

  console.log("l'employé selectionné ", selectedEmployee);


  // Fonction pour récupérer les détails d'un employé
  const handleOpenModal = async (employeeId) => {
    try {
      // First, fetch employee details
      const employeeResponse = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
      const selectedEmployee = employeeResponse.data;
      
      // Then, fetch evaluation types
      const evaluationTypesResponse = await axios.get('https://localhost:7082/api/Evaluation/types');
      const evaluationTypes = evaluationTypesResponse.data;
  
      // Optional: If you want to get questions specific to this employee's post
      const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/questions`, {
        params: {
          evaluationTypeId: evaluationTypes[0].id, // Assuming you want the first type
          postId: selectedEmployee.postId
        }
      });
      const questions = questionsResponse.data;
  
      setSelectedEmployee(selectedEmployee);
      setEvaluationTypes(evaluationTypes);
      setEvaluationQuestions(questions);
      setShowModal(true);
    } catch (error) {
      console.error("Error during modal opening process:", error);
      // Handle error appropriately
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null); // Réinitialiser l'état de l'employé sélectionné
    setCurrentStep(1); // Réinitialiser à la première étape
  };

  // Gestion des étapes
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
        return <Step1 notes={notes} setNotes={setNotes} employeePostId={selectedEmployee?.employeePostId} />;
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
  <div className="modal">
    {/* Existing modal header */}
    <div className="modal-body">
      {/* Evaluation Type Selection */}
      <div className="form-group">
        <label>Select Evaluation Type</label>
        <select 
          className="form-control"
          value={selectedEvaluationType?.id || ''}
          onChange={(e) => {
            const selectedType = evaluationTypes.find(type => type.id === parseInt(e.target.value));
            setSelectedEvaluationType(selectedType);
            // Optionally fetch questions for this type and post
            fetchQuestionsForType(selectedType.id, selectedEmployee.postId);
          }}
        >
          <option value="">Select Evaluation Type</option>
          {evaluationTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rest of your existing modal content */}
    </div>
  </div>
)}
    </Template>
  );
}

export default SalaryList;
