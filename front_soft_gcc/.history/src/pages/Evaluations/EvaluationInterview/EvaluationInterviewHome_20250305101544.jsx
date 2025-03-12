import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css';
import { formatDate, isValidInterviewDate, compareDates } from '../../../services/Evaluations/utils';
import ParticipantsSelector from './ParticipantSelector';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function EvaluationInterviewHome() {
  const navigate = useNavigate();
  const { user } = useUser();
  console.log("user: ", user);
  console.log("userId: ", user.roleId, "roleTitle: ", user.roleTitle);

  // Pagination et états
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    department: '',
  });
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationId: '',
    scheduledDate: '',
    participants: [],
    selectedEmployee: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  // Gestion centralisée des erreurs
  const handleError = useCallback((error, customMsg = "Une erreur est survenue. Veuillez réessayer.") => {
    console.error(error);
    const message = error.response?.data?.message || customMsg;
    setErrorMessage(message);
    // Vous pouvez aussi intégrer une solution de toast notification ici
  }, []);

  // Récupération des participants
  const fetchParticipants = useCallback(async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/User/managers-directors');
      setParticipantsList(response.data);
    } catch (error) {
      handleError(error, "Erreur lors de la récupération des participants.");
    }
  }, [handleError]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Mise à jour des participants sélectionnés dans evaluationDetails
  useEffect(() => {
    selectedEmployees.forEach((empId) => {
      if (!evaluationDetails.participants.includes(empId)) {
        setEvaluationDetails((prev) => ({
          ...prev,
          participants: [...prev.participants, empId],
        }));
      }
    });
  }, [selectedEmployees, evaluationDetails.participants]);

  // Appel API pour récupérer les employés sans évaluations
  const fetchEmployeesWithoutEvaluations = useCallback(async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationInterview/employees-finished-evaluations-paginated',
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
      handleError(error, "Erreur lors de la récupération des employés sans évaluation.");
    }
  }, [currentPage, pageSize, filters, searchQuery, handleError]);

  // Récupération des options de filtres
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        axios.get('https://localhost:7082/api/EvaluationInterview/positions'),
        axios.get('https://localhost:7082/api/EvaluationInterview/departments'),
      ]);
      setPositions(positionsRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      handleError(error, "Erreur lors de la récupération des filtres.");
    }
  }, [handleError]);

  useEffect(() => {
    fetchEmployeesWithoutEvaluations();
    fetchFilterOptions();
  }, [filters, searchQuery, currentPage, pageSize, fetchEmployeesWithoutEvaluations, fetchFilterOptions]);

  // Fonctions de gestion des événements, mémorisées avec useCallback
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value.toLowerCase());
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseInt(value, 10) : '';
    setFilters((prev) => ({ ...prev, [name]: parsedValue }));
  }, []);

  const fetchSelectedEmployee = useCallback(async (employeeId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/${employeeId}`);
      setEvaluationDetails((prev) => ({ ...prev, selectedEmployee: response.data }));
    } catch (error) {
      handleError(error, "Erreur lors de la récupération de l'employé sélectionné.");
      setEvaluationDetails((prev) => ({ ...prev, selectedEmployee: null }));
    }
  }, [handleError]);

  const handleOpenModal = useCallback(async (employeeId) => {
    if (!employeeId) {
      setErrorMessage('Veuillez sélectionner un employé avant de planifier.');
      return;
    }
    const employee = employees.find(emp => emp.employeeId === employeeId);
    if (!employee || employee.evaluationDate) {
      setErrorMessage('Cet employé a déjà une date d’évaluation planifiée.');
      return;
    }
    await fetchSelectedEmployee(employeeId);
    setShowModal(true);
    setEvaluationDetails((prev) => ({
      ...prev,
      evaluationId: employee.evaluationId || '',
      scheduledDate: today,
      participants: [
        Number(employee.employeeId),
        ...participantsList
          .filter(participant => participant.isDefault)
          .map(participant => Number(participant.id)),
      ],
    }));
  }, [employees, fetchSelectedEmployee, today, participantsList]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEvaluationDetails({
      evaluationId: '',
      scheduledDate: '',
      participants: [],
      selectedEmployee: null,
    });
    setErrorMessage('');
  }, []);

  const handleEvaluationDetailsChange = useCallback(({ name, value }) => {
    setEvaluationDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleMassPlanning = useCallback(async () => {
    try {
      const payload = {
        evaluationId: evaluationDetails.evaluationId,
        scheduledDate: evaluationDetails.scheduledDate,
        participants: evaluationDetails.participants,
      };
      console.log('Payload envoyé :', payload);
      if (!Array.isArray(evaluationDetails.participants) || evaluationDetails.participants.length === 0) {
        setErrorMessage("Aucun participant sélectionné ou liste invalide.");
        return;
      }
      const response = await axios.post(
        'https://localhost:7082/api/EvaluationInterview/schedule-interview',
        payload
      );
      console.log('Entretien planifié avec succès :', response.data);
      // Réinitialiser ou notifier l'utilisateur en cas de succès
      setShowModal(false);
      setErrorMessage('');
    } catch (error) {
      handleError(error, "Erreur lors de la planification de l'entretien.");
    }
  }, [evaluationDetails, handleError]);

  const startInterview = useCallback(async (employeeId) => {
    try {
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/get-interview-by-participant/${employeeId}`
      );
      const interview = interviewResponse.data;
      if (!interview || !interview.interviewId) {
        setErrorMessage("Aucun entretien trouvé pour cet employé.");
        return;
      }
      const { interviewId } = interview;
      await axios.put(`https://localhost:7082/api/EvaluationInterview/start-interview/${interviewId}`);
      // Succès
      setErrorMessage('');
      navigate("/validation", { state: { interview, employeeId } });
    } catch (error) {
      handleError(error, "Erreur lors du démarrage de l'entretien.");
    }
  }, [navigate, handleError]);

  const ValidateInterview = useCallback(async (employeeId) => {
    try {
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/get-interview-by-participant/${employeeId}`
      );
      const interview = interviewResponse.data;
      if (!interview || !interview.interviewId) {
        setErrorMessage("Aucun entretien trouvé pour cet employé.");
        return;
      }
      setErrorMessage('');
      navigate("/validation", { state: { interview, employeeId } });
    } catch (error) {
      handleError(error, "Erreur lors de la validation de l'entretien.");
    }
  }, [navigate, handleError]);

  // Fonction pour centraliser la logique conditionnelle d'affichage du bouton d'action pour chaque employé
  const renderActionButton = useCallback((employee) => {
    const isManager = user === 1;
    const isDirector = user === 2;
    const isRH = user === 3;

    const canManagerValidate =
      isManager &&
      employee.interviewStatus === 25 &&
      (employee.managerApproval === null || employee.managerComments === null);

    const canDirectorValidate =
      isDirector &&
      employee.interviewStatus === 25 &&
      (employee.directorApproval === null || employee.directorComments === null);

    const managerValidated =
      employee.managerApproval !== null && employee.managerComments !== null;
    const directorValidated =
      employee.directorApproval !== null && employee.directorComments !== null;
    const interviewCompleted = managerValidated && directorValidated;

    const isToday = compareDates(employee.interviewDate, today);
    const isFutureDate =
      employee.interviewDate && new Date(employee.interviewDate) > new Date(today);

    if (employee.interviewStatus === 25 && isRH) {
      return <span className="text-warning">En attente de validation</span>;
    } else if (interviewCompleted) {
      return <span className="text-success">Entretien terminé</span>;
    } else if (canManagerValidate || canDirectorValidate) {
      return (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => ValidateInterview(employee.employeeId)}
        >
          Valider
        </button>
      );
    } else if ((isManager && managerValidated) || (isDirector && directorValidated)) {
      return <span className="text-info">Déjà validé</span>;
    } else if (isToday) {
      return (
        <button
          className="btn btn-success btn-sm"
          onClick={() => startInterview(employee.employeeId)}
        >
          Démarrer l'entretien
        </button>
      );
    } else if (isFutureDate) {
      return null;
    } else {
      return (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleOpenModal(employee.employeeId)}
        >
          Planifier l'entretien
        </button>
      );
    }
  }, [user, today, ValidateInterview, startInterview, handleOpenModal]);

  return (
    <Template>
      <div className="salary-list-planning">
        <h4 className="title">Entretien d'évaluation</h4>
        {/* Message d'erreur */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
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
                <option key={pos.posteId} value={String(pos.posteId)}>
                  {pos.title}
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
            <table className="table table-bordered">
              <thead className="thead-light">
                <tr>
                  <th>Nom</th>
                  <th>Poste</th>
                  <th>Département</th>
                  <th>Date d'entretien</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>
                        {isValidInterviewDate(employee.interviewDate)
                          ? formatDate(employee.interviewDate)
                          : "Pas encore planifié"}
                      </td>
                      <td>
                        {renderActionButton(employee)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Aucun employé trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
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
          </div>
        </div>

        {/* Modal de planification */}
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
                    <h5 className="modal-title">Planning d'entretien</h5>
                    <button type="button" className="close" onClick={handleCloseModal}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="form-group">
                        <label htmlFor="scheduledDateTime">Date et heure planifiée</label>
                        <input
                          type="datetime-local"
                          id="scheduledDateTime"
                          className="form-control"
                          value={evaluationDetails.scheduledDate}
                          onChange={(e) =>
                            handleEvaluationDetailsChange({ name: 'scheduledDate', value: e.target.value })
                          }
                        />
                      </div>
                      <ParticipantsSelector
                        participantsList={participantsList}
                        selectedParticipants={evaluationDetails.participants}
                        setSelectedParticipants={(participants) => {
                          const validParticipants = participants.filter((p) => !isNaN(Number(p)));
                          setEvaluationDetails((prev) => ({
                            ...prev,
                            participants: validParticipants,
                          }));
                        }}
                        fetchedEmployee={evaluationDetails.selectedEmployee}
                        employees={employees}
                      />
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleMassPlanning}>
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

export default EvaluationInterviewHome;
