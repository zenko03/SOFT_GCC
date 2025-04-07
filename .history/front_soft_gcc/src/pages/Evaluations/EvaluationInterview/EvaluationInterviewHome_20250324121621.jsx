import React, { useState, useEffect, useCallback } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css';
import { formatDate, isValidInterviewDate, compareDates } from '../../../services/Evaluations/utils';
import ParticipantsSelector from './ParticipantSelector';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Assurez-vous que le chemin d'importation est correct
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faChevronLeft, faChevronRight, faTimes, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

function EvaluationInterviewHome() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  // Constantes
  const INTERVIEW_STATUS = {
    PLANNED: 10,
    IN_PROGRESS: 20,
    PENDING_VALIDATION: 25,
    COMPLETED: 30,
    REJECTED: 40,
    CANCELLED: 50
  };

  // États de base
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ position: '', department: '' });
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [participantsList, setParticipantsList] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationId: '',
    scheduledDate: '',
    participants: [],
    selectedEmployee: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);

  // Gestion centralisée des erreurs - Fonction de base qui ne dépend d'aucune autre fonction
  const handleError = useCallback((error, customMsg = "Une erreur est survenue. Veuillez réessayer.") => {
    console.error(error);
    const message = error.response?.data?.message || customMsg;
    toast.error(message);
  }, []);

  // ====== FONCTIONS DE RÉCUPÉRATION DE DONNÉES ======

  // Récupération des participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7082/api/User/managers-directors');
      setParticipantsList(response.data);
    } catch (error) {
      handleError(error, "Erreur lors de la récupération des participants.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Récupération des employés sans évaluations
  const fetchEmployeesWithoutEvaluations = useCallback(async () => {
    if (!user) return; // Ne pas charger si l'utilisateur n'est pas disponible

    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationInterview/employees-finished-evaluations-paginated', {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          position: filters.position,
          department: filters.department,
          search: searchQuery,
        },
      });
      setEmployees(response.data.employees);
      setFilteredEmployees(response.data.employees);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      handleError(error, "Erreur lors de la récupération des employés sans évaluation.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, searchQuery, handleError, user]);

  // Récupération des options de filtre
  const fetchFilterOptions = useCallback(async () => {
    if (!user) return; // Ne pas charger si l'utilisateur n'est pas disponible

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
  }, [handleError, user]);

  // ====== EFFETS ======

  useEffect(() => {
    if (!userLoading && user) {
      fetchParticipants();
    }
  }, [fetchParticipants, userLoading, user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchEmployeesWithoutEvaluations();
      fetchFilterOptions();
    }
  }, [filters, searchQuery, currentPage, pageSize, fetchEmployeesWithoutEvaluations, fetchFilterOptions, userLoading, user]);

  // ====== GESTION DES ÉVÉNEMENTS ======

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
      toast.error('Veuillez sélectionner un employé avant de planifier.');
      return;
    }
    const employee = employees.find(emp => emp.employeeId === employeeId);
    if (!employee || employee.evaluationDate) {
      toast.error('Cet employé a déjà une date d’évaluation planifiée.');
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
      if (!Array.isArray(evaluationDetails.participants) || evaluationDetails.participants.length === 0) {
        toast.error("Aucun participant sélectionné ou liste invalide.");
        return;
      }
      const response = await axios.post(
        'https://localhost:7082/api/EvaluationInterview/schedule-interview',
        payload
      );
      toast.success('Entretien planifié avec succès.');
      setShowModal(false);
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
        toast.error("Aucun entretien trouvé pour cet employé.");
        return;
      }
      const { interviewId } = interview;
      await axios.put(`https://localhost:7082/api/EvaluationInterview/start-interview/${interviewId}`);
      toast.success('Entretien démarré avec succès.');
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
        toast.error("Aucun entretien trouvé pour cet employé.");
        return;
      }
      navigate("/validation", { state: { interview, employeeId } });
    } catch (error) {
      handleError(error, "Erreur lors de la validation de l'entretien.");
    }
  }, [navigate, handleError]);

  const handleCancelInterview = useCallback(async (interviewId) => {
    if (!interviewId) {
      toast.error("Identifiant d'entretien manquant.");
      return;
    }

    const confirmed = window.confirm("Êtes-vous sûr de vouloir annuler cet entretien ?");
    if (confirmed) {
      try {
        const response = await axios.put(`https://localhost:7082/api/EvaluationInterview/update-interview/${interviewId}`, {
          NewStatus: INTERVIEW_STATUS.CANCELLED
        });

        if (response.status === 204) {
          toast.success("Entretien annulé avec succès.");
          fetchEmployeesWithoutEvaluations();
        } else {
          toast.error("Erreur lors de l'annulation de l'entretien.");
        }
      } catch (error) {
        console.error("Erreur lors de l'annulation de l'entretien:", error);
        if (error.response && error.response.data) {
          toast.error(error.response.data.title || "Une erreur s'est produite.");
        } else {
          toast.error("Une erreur s'est produite. Veuillez réessayer.");
        }
      }
    }
  }, [INTERVIEW_STATUS, fetchEmployeesWithoutEvaluations]);

  const getAndCancelInterview = useCallback(async (employeeId) => {
    try {
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/get-interview-by-participant/${employeeId}`
      );

      const interview = interviewResponse.data;
      if (!interview || !interview.interviewId) {
        toast.error("Aucun entretien trouvé pour cet employé.");
        return;
      }

      await handleCancelInterview(interview.interviewId);

    } catch (error) {
      handleError(error, "Erreur lors de la récupération des informations d'entretien.");
    }
  }, [handleCancelInterview, handleError]);

  const handleEditInterview = useCallback(async (interviewId) => {
    try {
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/interview-details/${interviewId}`
      );

      const interview = interviewResponse.data;

      setEvaluationDetails({
        evaluationId: interview.evaluationId,
        scheduledDate: interview.interviewDate?.split('Z')[0] || '',
        participants: interview.participants?.map(p => p.userId) || [],
        selectedEmployee: null,
      });

      setShowModal(true);
    } catch (error) {
      handleError(error, "Erreur lors de la récupération des détails de l'entretien.");
    }
  }, [handleError]);

  const getAndEditInterview = useCallback(async (employeeId) => {
    try {
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/get-interview-by-participant/${employeeId}`
      );

      const interview = interviewResponse.data;
      if (!interview || !interview.interviewId) {
        toast.error("Aucun entretien trouvé pour cet employé.");
        return;
      }

      await handleEditInterview(interview.interviewId);

    } catch (error) {
      handleError(error, "Erreur lors de la récupération des informations d'entretien.");
    }
  }, [handleEditInterview, handleError]);

  const renderActionButton = useCallback((employee) => {
    if (!user) return null;

    const isManager = user.roleId === 2;
    const isDirector = user.roleId === 4;
    const isRH = user.roleId === 1;

    const canManagerValidate =
      isManager &&
      employee.interviewStatus === INTERVIEW_STATUS.PENDING_VALIDATION &&
      (employee.managerApproval === null || employee.managerComments === null);

    const canDirectorValidate =
      isDirector &&
      employee.interviewStatus === INTERVIEW_STATUS.PENDING_VALIDATION &&
      (employee.directorApproval === null || employee.directorComments === null);

    const managerValidated =
      employee.managerApproval !== null && employee.managerComments !== null;
    const directorValidated =
      employee.directorApproval !== null && employee.directorComments !== null;
    const interviewCompleted = managerValidated && directorValidated;

    const isToday = compareDates(employee.interviewDate, today);
    const isFutureDate = employee.interviewDate && new Date(employee.interviewDate) > new Date(today);
    const isPastDate = employee.interviewDate && new Date(employee.interviewDate) < new Date(today) && !isToday;
    if (employee.interviewStatus === INTERVIEW_STATUS.PLANNED) {
      if (isRH) {
        if (isPastDate) {
          // Entretien planifié dans le passé mais non réalisé
          return (
            <div className="d-flex align-items-center">
              <span className="text-danger me-2">Entretien manqué</span>
              <button className="btn btn-outline-primary btn-sm me-1" onClick={() => getAndEditInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => getAndCancelInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          );
        } else if (isToday) {
          // Entretien planifié pour aujourd'hui
          return (
            <div className="d-flex align-items-center">
              <button
                className="btn btn-success btn-sm me-2"
                onClick={() => startInterview(employee.employeeId)}
              >
                Démarrer l'entretien
              </button>
              <button className="btn btn-outline-primary btn-sm me-1" onClick={() => getAndEditInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => getAndCancelInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          );
        } else if (isFutureDate) {
          // Entretien planifié pour une date future
          return (
            <div className="d-flex align-items-center">
              <span className="text-info me-2">Planifié</span>
              <button className="btn btn-outline-primary btn-sm me-1" onClick={() => getAndEditInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => getAndCancelInterview(employee.employeeId)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          );
        }
      } else {
        // Non-RH : affichage différent selon la date
        if (isPastDate) {
          return <span className="text-danger">Entretien manqué</span>;
        } else if (isToday) {
          return <span className="text -success">Aujourd'hui</span>;
        } else if (isFutureDate) {
          return <span className="text-info">Planifié</span>;
        }
      }
    }
    if (employee.interviewStatus === INTERVIEW_STATUS.COMPLETED) {
      return <span className="text-success">Entretien terminé</span>;
    }

    if (employee.interviewStatus === INTERVIEW_STATUS.REJECTED) {
      return <span className="text-danger">Entretien rejeté</span>;
    }

    if (employee.interviewStatus === INTERVIEW_STATUS.CANCELLED) {
      return <span className="text-secondary">Entretien annulé</span>;
    }

    if (employee.interviewStatus === INTERVIEW_STATUS.PENDING_VALIDATION) {
      if (isRH) {
        return (
          <div className="d-flex align-items-center">
            <span className="text-warning me-2">En attente de validation</span>
            <button
              className="btn btn-outline-secondary btn-sm me-1"
              onClick={() => getAndCancelInterview(employee.employeeId)}
              aria-label="Annuler l'entretien"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        );
      }
    }

    if (employee.interviewStatus === INTERVIEW_STATUS.PLANNED) {
      if (isRH) {
        return (
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-primary btn-sm me-1"
              onClick={() => getAndEditInterview(employee.employeeId)}
              aria-label="Modifier l'entretien"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => getAndCancelInterview(employee.employeeId)}
              aria-label="Annuler l'entretien"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        );
      }
    }

    if (employee.interviewStatus === INTERVIEW_STATUS.IN_PROGRESS) {
      return <span className="text-info">Entretien en cours</span>;
    }

    return null;
  }, [user, today, getAndCancelInterview, getAndEditInterview]);

  return (
    <Template>
      <div className="salary-list-planning">
        <h4 className="title">Entretien d'évaluation</h4>
        {loading && <div className="loading">Chargement...</div>}
        <div className="filters card p-3 mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Rechercher un employé"
            />
            <select
              name="position"
              className="form-control w-25 mx-2"
              value={filters.position}
              onChange={handleFilterChange}
              aria-label="Filtrer par poste">
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
              aria-label="Filtrer par département"
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

            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              <span>
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Nombre d'employés par page"
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
                <option value={50}>50 par page</option>
              </select>
            </div>
          </div>
        </div>

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
                        {dateError && <div className="alert alert-danger">{dateError}</div>}
                        <input
                          type="datetime-local"
                          id="scheduledDateTime"
                          className="form-control"
                          value={evaluationDetails.scheduledDate}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            const currentDate = new Date().toISOString().split('T')[0];
                            if (selectedDate < currentDate) {
                              setDateError("La date ne peut pas être dans le passé.");
                            } else {
                              setDateError("");
                              handleEvaluationDetailsChange({ name: 'scheduledDate', value: selectedDate });
                            }
                          }}
                          aria-label="Date et heure planifiée"
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