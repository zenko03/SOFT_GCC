import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import '../../../assets/css/Evaluations/notationModal.css'; // Styles spécifiques
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function SalaryList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: '',
  });
  const [isEmployeeLoaded, setIsEmployeeLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const [pageSize, setPageSize] = useState(10); // Nombre d'éléments par page
  const [totalPages, setTotalPages] = useState(0); // Nombre total de pages

  //etat de validation d'evaluation
  const [validationData, setValidationData] = useState({
    serviceApproved: false,
    dgApproved: false,
    serviceDate: '',
    dgDate: ''
  });
  //Api pour la fonction de validation
  const validateEvaluation = async () => {
    const payload = {
      evaluationId: selectedEmployee.evaluationId,
      ...validationData,
    };

    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/validate-evaluation', payload);
      console.log('Validation response:', response.data);
      setValidationSuccess(true); // Activer l'affichage de la confirmation
      setTimeout(() => {
        setShowModal(false); // Fermer le modal après un délai
        setValidationSuccess(false); // Réinitialiser l'état de confirmation
      }, 3000); // Fermer après 3 secondes
    } catch (err) {
      console.error('Error validating evaluation:', err);
      setError('Erreur lors de la validation de l\'évaluation.');
    }
  };

  const saveEvaluationResults = async () => {
    if (!selectedEmployee || !selectedEvaluationType || !ratings) {
      console.error('Données incomplètes pour sauvegarder l\'évaluation.');
      return;
    }

    const average = calculateAverage();
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


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        });
        setEmployees(response.data.employees); // Utilisez "employees" au lieu de "users"
        setTotalPages(response.data.totalPages); // Le nombre total de pages
      } catch (error) {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    };
    fetchEmployees();
  }, [currentPage, pageSize]); // Recharger les données lorsque la page ou la taille de la page change
  const handleSearch = (e) => {
    let query_text = e.target.value.toLowerCase();
    setSearchQuery(query_text.trim());
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchQuery);
  });

  useEffect(() => {
    setRatings({}); // Reset ratings when evaluation type or employee changes
  }, [selectedEvaluationType, selectedEmployee]);

  const handleOpenModal = async (employeeId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
      const evalResponse = await axios.get('https://localhost:7082/api/Evaluation/types');

      setSelectedEmployee(response.data);
      setEvaluationTypes(evalResponse.data);
      setRatings({}); // Reset ratings for the new employee
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
        return <Step3
          ratings={ratings}
          average={calculateAverage()}
          evaluationId={selectedEmployee.evaluationId}
          validationData={validationData}
          onValidationChange={(field, value) =>
            setValidationData(prev => ({ ...prev, [field]: value }))
          }
        />;
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
              {/* Barre de recherche et filtres */}
              <div className="filters card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
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
                  {filteredEmployees.map((employee, index) => (
                    <tr key={`${employee.employeeId}-${index}`}>
                      <td>
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
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

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>
                <span>
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Réinitialiser à la première page lorsque la taille de la page change
                  }}
                >
                  <option value={5}>5 par page</option>
                  <option value={10}>10 par page</option>
                  <option value={20}>20 par page</option>
                  <option value={50}>50 par page</option>
                </select>
              </div>
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
                {validationSuccess ? (
                  <div className="validation-success">
                    <div className="success-animation">
                      <svg
                        className="checkmark"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 52 52"
                      >
                        <circle
                          className="checkmark__circle"
                          cx="26"
                          cy="26"
                          r="25"
                          fill="none"
                        />
                        <path
                          className="checkmark__check"
                          fill="none"
                          d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        />
                      </svg>
                    </div>
                    <h5 className="text-center mt-3">Validation réussie !</h5>
                    <p className="text-center">La notation a été effectuée avec succès.</p>
                  </div>
                ) : (
                  <>
                    <ul className="step-navigation">
                      <li style={{ pointerEvents: 'auto' }} onClick={() => setCurrentStep(1)} className={currentStep === 1 ? 'active' : ''}>Étape 1</li>
                      <li style={{ pointerEvents: allQuestionsRated() ? 'auto' : 'none' }} className={currentStep === 2 ? 'active' : ''}>Étape 2</li>
                      <li className={currentStep === 3 ? 'active' : ''}>Étape 3</li>
                    </ul>
                    {renderStepContent()}
                  </>
                )}
              </div>

              <div className="modal-footer">
                {!validationSuccess && (
                  <>
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1}>Précédent</button>
                    <button className="btn btn-primary" onClick={async () => {
                      if (currentStep === 2) await saveEvaluationResults();
                      if (currentStep === 3) await validateEvaluation();
                      else setCurrentStep(prev => Math.min(prev + 1, 3));
                    }} disabled={!allQuestionsRated() && currentStep === 1}>
                      {currentStep === 3 ? 'Valider' : 'Suivant'}
                    </button>
                    <button className="btn btn-danger" onClick={handleCloseModal}>Fermer</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Template>
  );
}

export default SalaryList;
