import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques

function SalaryListPlanning() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ position: '', department: '' });
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [autoReminderEnabled, setAutoReminderEnabled] = useState(false); // State for automatic reminders

  const [emailSent, setEmailSent] = useState(false); // State for email sent status

  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationType: '',
    supervisors: [], // Array pour stocker les superviseurs sélectionnés
    startDate: '',
    endDate: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [planningSuccess, setPlanningSuccess] = useState(false);
  const [planningError, setPlanningError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [dateError, setDateError] = useState(''); // State for date validation error

  //état pour gérer le superviseur en cours de sélection
  const [currentSupervisor, setCurrentSupervisor] = useState('');



  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [evaluationTypes, setEvaluationTypes] = useState([]);

  // Gestion du changement de superviseur actuel
  const handleCurrentSupervisorChange = (e) => {
    setCurrentSupervisor(e.target.value);
  };

  // Ajout d'un superviseur à la liste
  const handleAddSupervisor = () => {
    if (!currentSupervisor) return; // Ne rien faire si aucun superviseur n'est sélectionné

    // Vérifier si le superviseur n'est pas déjà dans la liste
    if (!evaluationDetails.supervisors.includes(currentSupervisor)) {
      // S'assurer que le superviseur existe dans la liste des superviseurs disponibles
      const supervisorExists = supervisors.some(sup => String(sup.id) === String(currentSupervisor));

      if (supervisorExists) {
        setEvaluationDetails(prev => ({
          ...prev,
          supervisors: [...prev.supervisors, currentSupervisor]
        }));
        setCurrentSupervisor(''); // Réinitialiser le sélecteur
      } else {
        alert('Superviseur non trouvé dans la liste');
      }
    } else {
      alert('Ce superviseur est déjà dans la liste');
    }
  };


  // Retirer un superviseur de la liste
  const handleRemoveSupervisor = (supervisorId) => {
    setEvaluationDetails(prev => ({
      ...prev,
      supervisors: prev.supervisors.filter(id => id !== supervisorId)
    }));
  };


  const fetchSupervisors = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/User/managers-directors');
      setSupervisors(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des superviseurs :', error);
    }
  };

  const fetchEvaluationTypes = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationPlanning/evaluation-types');
      setEvaluationTypes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des types d'évaluation :", error);
    }
  };

  const fetchEmployeesWithoutEvaluations = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations-paginated',
        {
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
            position: filters.position,
            department: filters.department,
            search: searchQuery,
          },
        }
      );
      setEmployees(response.data.employees);
      setFilteredEmployees(response.data.employees);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés sans évaluation :', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        axios.get('https://localhost:7082/api/EvaluationPlanning/positions'),
        axios.get('https://localhost:7082/api/EvaluationPlanning/departments'),
      ]);
      setPositions(positionsRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des filtres :', error);
    }
  };

  useEffect(() => {
    fetchEmployeesWithoutEvaluations();
    fetchFilterOptions();
    fetchEvaluationTypes();
    fetchSupervisors();
  }, [filters, searchQuery, currentPage, pageSize]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase().trim());
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseInt(value, 10) : '';
    setFilters((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      const allEmployeeIds = filteredEmployees.map((emp) => emp.employeeId);
      setSelectedEmployees(allEmployeeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({ evaluationType: '', supervisor: '', startDate: '', endDate: '' });
    setPlanningError(''); // Reset planning error
    setDateError(''); // Reset date error
  };



  const validateDates = (startDateStr, endDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    let error = '';

    if (!startDate || !endDate) {
      error = 'Les deux dates doivent être définies.';
    } else {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (startDate < today) {
        error = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
      } else if (endDate < startDate) {
        error = 'La date de fin ne peut pas être antérieure à la date de début.';
      }
    }

    return error;
  };

  // Modification de handleEvaluationDetailsChange pour ne pas gérer les superviseurs
  const handleEvaluationDetailsChange = (e) => {
    const { name, value } = e.target;
    const newDetails = { ...evaluationDetails, [name]: value };
    setEvaluationDetails(newDetails);

    // Validation des dates
    if (name === 'startDate' || name === 'endDate') {
      const error = validateDates(newDetails.startDate, newDetails.endDate);
      setDateError(error);
    }
  };
  const handleSendReminderEmail = async () => {
    try {
      await axios.post('https://localhost:7082/api/EvaluationPlanning/send-reminder', {
        employees: selectedEmployees,
      });
      alert('Rappel envoyé avec succès !'); // Optional success message
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de rappel :', error);
      alert('Une erreur est survenue lors de l\'envoi du rappel.');
    }
  };
  const handleMassPlanning = async () => {
    const error = validateDates(evaluationDetails.startDate, evaluationDetails.endDate);
    if (error) {
      setPlanningError(error);
      return;
    }

    if (!evaluationDetails.evaluationType || evaluationDetails.supervisors.length === 0) {
      alert('Veuillez remplir tous les champs avant de planifier. Vous devez sélectionner au moins un superviseur.');
      return;
    }

    try {
      // Création d'un tableau de tâches d'évaluation, une par employé, avec tous les superviseurs sélectionnés
      const payload = selectedEmployees.map((employeeId) => ({
        userId: employeeId,
        evaluationTypeId: parseInt(evaluationDetails.evaluationType, 10),
        supervisorIds: evaluationDetails.supervisors.map(id => parseInt(id, 10)), // Conversion en nombres
        startDate: evaluationDetails.startDate,
        endDate: evaluationDetails.endDate,
      }));

      console.log('Données envoyées au backend:', payload);

      const response = await axios.post('https://localhost:7082/api/EvaluationPlanning/create-evaluation', payload);
      console.log('Réponse du backend:', response.data);
      
      setPlanningSuccess(true);
      setEmailSent(true);
      setTimeout(() => {
        setShowModal(false);
        setPlanningSuccess(false);
        fetchEmployeesWithoutEvaluations();
        setSelectedEmployees([]);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la planification :', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      setPlanningError('Une erreur est survenue lors de la planification.');
    }
  };

  // Ajout d'une fonction manquante dans votre code original
  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
  };

  return (
    <Template>
      <div className="salary-list-planning">
        <h4 className="title">Planification des évaluations</h4>



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
            <select
              name="position"
              className="form-control w-25 mx-2"
              value={filters.position}
              onChange={handleFilterChange}
            >
              <option value="">Tous les postes</option>
              {positions.map((pos) => (
                <option key={pos.positionId} value={String(pos.positionId)}>
                  {pos.positionName}
                </option>
              ))}
            </select>
            <select
              name="department"
              className="form-control w-25"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">Tous les départements</option>
              {departments.map((dep) => (
                <option key={dep.departmentId} value={String(dep.departmentId)}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau des employés */}
        <div className="card">

          <div className="card-body">
            {/* Toggle for Automatic Reminders - Switched to Bootstrap Toggle */}
            <div className="form-group reminder-toggle">
              <div className="custom-switch-container">
                <div className="custom-control custom-switch custom-switch-lg">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="autoReminderToggle"
                    checked={autoReminderEnabled}
                    onChange={() => setAutoReminderEnabled(!autoReminderEnabled)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="autoReminderToggle"
                    style={{ cursor: 'pointer' }} /* Curseur uniquement sur le toggle */
                  />
                </div>
                <span className="toggle-text">Activer les rappels automatiques</span>
              </div>
            </div>
            {loading ? (
              <div className="text-center">Chargement des employés...</div>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead className="thead-light">
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Nom</th>
                      <th>Poste</th>
                      <th>Département</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.employeeId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.employeeId)}
                              onChange={() => handleSelectEmployee(employee.employeeId)}
                            />
                          </td>
                          <td>
                            {employee.firstName} {employee.lastName}
                          </td>
                          <td>{employee.position}</td>
                          <td>{employee.department}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Aucun employé trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="text-right mt-3">
                  <button className="btn btn-primary" onClick={handleOpenModal} disabled={selectedEmployees.length === 0}>
                    Planifier
                  </button>


                </div>

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
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5 par page</option>
                    <option value={10}>10 par page</option>
                    <option value={20}>20 par page</option>
                    <option value={50}>50 par page</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        {emailSent && <p>Email envoyé avec succès !</p>} {/* Indication d'email envoyé */}

        {/* Modal */}
        {showModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={handleCloseModal}
            ></div>

            <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
              <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Planification en masse</h5>
                    <button type="button" className="close" onClick={handleCloseModal}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    {planningSuccess ? (
                      <div className="text-center">
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
                        <h5 className="mt-3">Planification réussie !</h5>
                        <p>La planification a été effectuée avec succès.</p>
                      </div>
                    ) : planningError ? (
                      <div className="alert alert-danger">
                        {planningError}
                      </div>
                    ) : (
                      <form>
                        <div className="form-group">
                          <label>Employés sélectionnés :</label>
                          <ul className="selected-employees-list">
                            {selectedEmployees.map((employeeId) => {
                              const employee = employees.find((emp) => emp.employeeId === employeeId);
                              return (
                                <li key={employeeId} className="selected-employee-item">
                                  <span>{employee.firstName} {employee.lastName}</span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger ml-2"
                                    onClick={() => handleRemoveEmployee(employeeId)}
                                  >
                                    Retirer
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {/* Section superviseurs avec interface améliorée */}
                        <div className="form-group">
                          <label>Superviseurs :</label>

                          {/* Premier sélecteur de superviseur */}
                          <div className="d-flex mb-2">
                            <select
                              className="form-control"
                              value={currentSupervisor}
                              onChange={handleCurrentSupervisorChange}
                            >
                              <option value="">Sélectionner un superviseur</option>
                              {supervisors.map((supervisor) => (
                                <option key={supervisor.id} value={supervisor.id}>
                                  {supervisor.firstName} {supervisor.lastName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-outline-success ml-2"
                              onClick={handleAddSupervisor}
                              style={{ width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                              +
                            </button>
                          </div>

                          {/* Liste des superviseurs sélectionnés */}
                          {evaluationDetails.supervisors.length > 0 && (
                            <div className="selected-supervisors mt-2">
                              <label className="text-muted small">Superviseurs sélectionnés :</label>
                              <ul className="list-group">
                                {evaluationDetails.supervisors.map((supervisorId) => {
                                  const supervisor = supervisors.find(sup => String(sup.id) === String(supervisorId));
                                  return supervisor ? (
                                    <li key={supervisorId} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                      <span>{supervisor.firstName} {supervisor.lastName}</span>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveSupervisor(supervisorId)}
                                      >
                                        ×
                                      </button>
                                    </li>
                                  ) : null;
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Date de début :</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={evaluationDetails.startDate}
                            onChange={handleEvaluationDetailsChange}
                          />
                          {dateError && <div className="text-danger">{dateError}</div>}
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
                          {dateError && <div className="text-danger">{dateError}</div>}
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
                      </form>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleMassPlanning} disabled={!!dateError}>
                      Planifier
                    </button>

                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Template>
  );
}

export default SalaryListPlanning;