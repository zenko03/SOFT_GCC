import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
import axios from 'axios';


const EvaluationHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedEmployee, setSelectedEmployee] = useState(null); // Évaluation sélectionnée
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Suivi des étapes du wizard

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/history', {
        params: {
          startDate: null,
          endDate: null, // Assuming you don't have an end date filter, or adjust accordingly
          evaluationType: "", // If you don't have this filter, pass an empty string or null
          department: "", // Similar to evaluationType
          employeeName: searchQuery // Assuming searchQuery is used for employee name
        }
      });
      setEvaluations(response.data);
      console.log("donnee recu ", response.data);
    } catch (err) {
      console.error('API error:', err);
      setError('Erreur lors du chargement des évaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Remplacez mockEmployees par evaluations
  const filteredEmployees = evaluations
    .filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((emp) => !filters.evaluationDate || emp.evaluationDate === filters.evaluationDate)
    .filter((emp) => !filters.status || emp.status === filters.status)
    .filter((emp) => !filters.position || emp.position.toLowerCase().includes(filters.position.toLowerCase()));

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div>Chargement des évaluations...</div>;
  if (error) return <div>{error}</div>;

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };


  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setShowModal(false);
  };

  const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  const handlePreviousStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));

  // const renderStepContent = () => {
  //   switch (currentStep) {
  //     case 1:
  //       return (
  //         <div>
  //           <p><strong>Date :</strong> {selectedEmployee.evaluationDate}</p>
  //           <p><strong>Type :</strong> {selectedEmployee.evaluationType}</p>
  //           <p><strong>Évaluateurs :</strong></p>
  //           <ul>
  //             {selectedEmployee.evaluators.map((evaluator, index) => (
  //               <li key={index}>{evaluator}</li>
  //             ))}
  //           </ul>
  //         </div>
  //       );
  //     case 2:
  //       return (
  //         <div>
  //           <ul>
  //             {selectedEmployee.recommendations.map((rec, index) => (
  //               <li key={index}>
  //                 <p><strong>Formation :</strong> {rec.training}</p>
  //                 <p><strong>Détails :</strong> {rec.details}</p>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //       );
  //     case 3:
  //       return (
  //         <div>
  //           <ul>
  //             {selectedEmployee.recommendations.map((rec, index) => (
  //               <li key={index}>
  //                 <p><strong>Formation :</strong> {rec.training}</p>
  //                 <p>
  //                   <strong>Statut :</strong>{' '}
  //                   {rec.status === 'completed' ? (
  //                     <span className="badge badge-success">Réalisée</span>
  //                   ) : (
  //                     <span className="badge badge-warning">En attente</span>
  //                   )}
  //                 </p>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //       );

  //     default:
  //       return null;
  //   }
  // };

  return (
    <Template>
      <div className="container mt-4">
        <h2 className="mb-4">Historique des Évaluations</h2>

        {/* Section Filtres et Tableau */}
        <div className="card mb-4">
          <div className="card-body">
            <h5>Liste des Évaluations avec Filtres</h5>
            <div className="row mb-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un employé"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-md-8">
                <div className="d-flex">
                  <input
                    type="date"
                    name="evaluationDate"
                    className="form-control mx-1"
                    value={filters.evaluationDate}
                    onChange={handleFilterChange}
                  />
                  <select
                    name="status"
                    className="form-control mx-1"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Statut</option>
                    <option value="Terminé">Terminé</option>
                    <option value="En attente">En attente</option>
                  </select>
                  <input
                    type="text"
                    name="position"
                    className="form-control mx-1"
                    placeholder="Poste"
                    value={filters.position}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            {/* Tableau */}
            {loading ? (
              <p>Chargement en cours...</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Date d'évaluation</th>
                    <th>Statut</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.fistName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.startDate}</td>
                        <td>{emp.status}</td>
                        <td>{emp.overallScore}</td>
                        <td>
                          <button className="btn btn-info" onClick={() => handleShowModal(emp)}>
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucun employé trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Précédent
              </button>
              <span>
                Page {currentPage} sur {totalPages || 1}
              </span>
              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        {/* Section Graphique Global */}
        <div className="card">
          <div className="card-body">
            <h5>Graphique Global des Performances</h5>
            <GlobalPerformanceGraph data={evaluations} />
            {currentStep === 4 && selectedEmployee.performanceData && (
              <PerformanceGraph performanceData={selectedEmployee.performanceData} />
            )}
          </div>
        </div>

        {/* Modal avec wizard */}
        {/* Modal de détails avec wizard multi-étapes */}
        {showModal && selectedEmployee && (
          <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg-custom" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails de l'Évaluation</h5>
                  <button type="button" className="close" onClick={handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Étapes du modal */}
                  <ul className="step-navigation">
                    <li
                      className={currentStep === 1 ? 'active' : ''}
                      onClick={() => setCurrentStep(1)}
                    >
                      Étape 1: Détails de l'Évaluation
                    </li>
                    <li
                      className={currentStep === 2 ? 'active' : ''}
                      onClick={() => setCurrentStep(2)}
                    >
                      Étape 2: Recommandations Passées
                    </li>
                    <li
                      className={currentStep === 3 ? 'active' : ''}
                      onClick={() => setCurrentStep(3)}
                    >
                      Étape 3: Statut des Recommandations
                    </li>
                    <li
                      className={currentStep === 4 ? 'active' : ''}
                      onClick={() => setCurrentStep(4)}
                    >
                      Étape 4: Évolution des Performances
                    </li>
                  </ul>
                  {renderStepContent()}
                  {currentStep === 4 && selectedEmployee.performanceData && (
                    <PerformanceGraph performanceData={selectedEmployee.performanceData} />
                  )}
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
                    disabled={currentStep === 4}
                  >
                    Suivant
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleExportPDF(selectedEmployee)}
                  >
                    Exporter en PDF
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
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
};

export default EvaluationHistory;
