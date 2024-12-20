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
  const [ratings, setRatings] = useState({});
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: '',
  });

  const [isEmployeeLoaded, setIsEmployeeLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Contrôle pour éviter plusieurs appels API

  // Fonction pour sauvegarder les résultats
  const saveEvaluationResults = async () => {
    if (!selectedEmployee || !selectedEvaluationType || !ratings) {
      console.error('Données incomplètes pour sauvegarder l\'évaluation.');
      return;
    }

    const average = calculateAverage(); // Fonction pour calculer la moyenne
    const data = {
      evaluationId: selectedEmployee.evaluationId,
      ratings,
      overallScore: average,
      strengths: remarks.strengths,
      weaknesses: remarks.weaknesses,
      generalEvaluation: remarks.generalEvaluation,
    };

    try {
      const response = await axios.post(
        'https://localhost:7082/api/Evaluation/save-evaluation-results',
        data
      );
      console.log('Résultats sauvegardés avec succès :', response.data);
      setIsSaved(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des résultats :', error.response?.data || error.message);
    }
  };

  const allQuestionsRated = () => questions.every(q => ratings[q.questionId] !== undefined);

  const calculateAverage = () => {
    const scores = Object.values(ratings);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
  };

  // Récupération des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User');
        setEmployees(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleOpenModal = async (employeeId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
      const evalResponse = await axios.get('https://localhost:7082/api/Evaluation/types');

      setSelectedEmployee(response.data);
      setEvaluationTypes(evalResponse.data);

      setIsEmployeeLoaded(true);
      setShowModal(true);
      setCurrentStep(1);
      setIsSaved(false);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé ou des types d\'évaluation :', error);
    }
  };

  const handleCloseModal = () => {
    if (!isSaved && window.confirm('Êtes-vous sûr de vouloir fermer sans sauvegarder ?')) {
      setShowModal(false);
      setIsEmployeeLoaded(false);
    } else if (isSaved) {
      setShowModal(false);
      setIsEmployeeLoaded(false);
    }
  };

  const handleSaveRemarks = (newRemarks) => setRemarks(newRemarks);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            evaluationTypes={evaluationTypes}
            onEvaluationTypeChange={setSelectedEvaluationType}
            selectedEvaluationType={selectedEvaluationType}
            selectedEmployee={selectedEmployee}
            ratings={ratings}
            setRatings={setRatings}
            setQuestions={setQuestions}
          />
        );
      case 2:
        return (
          <Step2
            ratings={ratings}
            remarks={remarks}
            setRemarks={setRemarks}
            onSaveRemarks={handleSaveRemarks}
          />
        );
      case 3:
        return <Step3 ratings={ratings} average={calculateAverage()} />;
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
                    <tr key={`${employee.employeeId}-${index}`}>
                      <td>
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.FirstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : 'Aucune évaluation'}
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={() => handleOpenModal(employee.employeeId)}>
                          Notation
                        </button>
                        <Link className="btn btn-secondary" to="/salary-list">Réinitialiser</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedEmployee && isEmployeeLoaded && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  NOTATIONS - {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <ul className="step-navigation">
                  <li style={{ pointerEvents: 'auto' }} onClick={() => setCurrentStep(1)} className={currentStep === 1 ? 'active' : ''}>Étape 1</li>
                  <li style={{ pointerEvents: allQuestionsRated() ? 'auto' : 'none' }} className={currentStep === 2 ? 'active' : ''}>Étape 2</li>
                  <li className={currentStep === 3 ? 'active' : ''}>Étape 3</li>
                </ul>
                {renderStepContent()}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1}>Précédent</button>
                <button className="btn btn-primary" onClick={async () => {
                  if (currentStep === 2) await saveEvaluationResults();
                  setCurrentStep(prev => Math.min(prev + 1, 3));
                }} disabled={!allQuestionsRated() && currentStep === 1}>
                  {currentStep === 3 ? 'Terminer' : 'Suivant'}
                </button>
                <button className="btn btn-danger" onClick={handleCloseModal}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Template>
  );
}

export default SalaryList;