import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques
import { formatDate } from '../../../services/Evaluations/utils';
import { isValidInterviewDate } from '../../../services/Evaluations/utils';
import { compareDates } from '../../../services/Evaluations/utils';
import ParticipantsSelector from './ParticipantSelector';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext ';


function EvaluationInterviewHome() {

  const navigate = useNavigate();

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
  const [selectAll, setSelectAll] = useState(false); // État pour la case "Tout sélectionner"

  const [participantsList, setParticipantsList] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationId: '',
    scheduledDate: '',
    participants: [], // Tableau vide initial
  });

  const { userRole } = useUser(); // Récupère le rôle actuel
    console.log("userRole: ", userRole); // 'RH', 'Manager', ou 'Director'

  const fetchSelectedEmployee = async (employeeId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/${employeeId}`);
      setEvaluationDetails((prevState) => ({ ...prevState, selectedEmployee: response.data }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé sélectionné :', error);
      setEvaluationDetails((prevState) => ({ ...prevState, selectedEmployee: null }));
    }
  };

  // Assurez-vous que `fetchSelectedEmployee` soit appelé lorsqu'un employé est sélectionné (par exemple via un événement ou un useEffect).



  const [showModal, setShowModal] = useState(false);

  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);

  // Fonction pour récupérer les participants
  const fetchParticipants = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/User/managers-directors');
      setParticipantsList(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des participants :', error);
    }
  };

  // Appeler fetchParticipants au montage du composant
  useEffect(() => {
    fetchParticipants();
  }, []);

  // gérer la sélection de l'employé par défaut.
  useEffect(() => {
    selectedEmployees.forEach((empId) => {
      if (!evaluationDetails.participants.includes(empId)) {
        setEvaluationDetails((prevState) => ({
          ...prevState,
          participants: [...prevState.participants, empId],
        }));
      }
    });
  }, [selectedEmployees, evaluationDetails.participants]);

  const fetchEmployeesWithoutEvaluations = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationInterview/employees-finished-evaluations',
        { params: { ...filters, search: searchQuery } }
      );
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des employés qui ont finis ses evaluations :',
        error
      );
    }
  };



  const fetchFilterOptions = async () => {
    try {
      const [positionsRes, departmentsRes] = await Promise.all([
        axios.get('https://localhost:7082/api/EvaluationInterview/positions'),
        axios.get('https://localhost:7082/api/EvaluationInterview/departments'),
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

  }, [filters, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseInt(value, 10) : '';
    setFilters((prev) => ({ ...prev, [name]: parsedValue }));
  };


  const handleOpenModal = async (employeeId) => {
    if (!employeeId) {
      alert('Veuillez sélectionner un employé avant de planifier.');
      return;
    }

    const employee = employees.find(emp => emp.employeeId === employeeId);

    if (!employee || employee.evaluationDate) {
      alert('Cet employé a déjà une date d’évaluation planifiée.');
      return;
    }

    await fetchSelectedEmployee(employeeId);

    setShowModal(true);
    setEvaluationDetails((prevState) => ({
      ...prevState,
      evaluationId: employee.evaluationId || '',
      scheduledDate: today,
      participants: [
        Number(employee.employeeId),
        ...participantsList
          .filter(participant => participant.isDefault)
          .map(participant => Number(participant.id)),
      ],
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({
      evaluationId: '',
      scheduledDate: '',
      participants: [],
    });
  };


  // Gestion des changements du formulaire
  const handleEvaluationDetailsChange = ({ name, value }) => {
    setEvaluationDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMassPlanning = async () => {
    try {
      const payload = {
        evaluationId: evaluationDetails.evaluationId,
        scheduledDate: evaluationDetails.scheduledDate,
        participants: evaluationDetails.participants, // Assurez-vous que c'est un tableau d'entiers
      };

      console.log('Payload envoyé :', payload);
      console.log('Participants envoyés :', evaluationDetails.participants);
      if (!Array.isArray(evaluationDetails.participants) || evaluationDetails.participants.length === 0) {
        console.error("Aucun participant sélectionné ou liste invalide.");
        return;
      }


      const response = await axios.post(
        'https://localhost:7082/api/EvaluationInterview/schedule-interview',
        payload
      );

      console.log('Entretien planifié avec succès :', response.data);
    } catch (error) {
      console.error('Erreur lors de la planification :', error.response?.data || error);
    }
  };


  const startInterview = async (employeeId, navigate) => {
    try {
      // Étape 1 : Récupérer l'ID de l'entretien à partir de l'ID de l'employé
      const interviewResponse = await axios.get(
        `https://localhost:7082/api/EvaluationInterview/get-interview-by-participant/${employeeId}`
      );

      const interview = interviewResponse.data;
      if (!interview || !interview.interviewId) {
        console.error("Aucun ID d'entretien valide trouvé.");
        alert("Aucun entretien trouvé pour cet employé.");
        return;
      }

      const { interviewId, status } = interview;

      console.log("etat ",interview.status, status, interviewId);
      // if (state === 20) {
      //   alert("Cet entretien est déjà en progression.");
      //   return;
      // }

      // Étape 2 : Démarrer l'entretien avec l'ID récupéré
      await axios.put(
        `https://localhost:7082/api/EvaluationInterview/start-interview/${interviewId}`
      );

      // Succès : Rediriger vers EvaluationInterviews avec les données nécessaires
      alert("L'entretien a été démarré avec succès !");
      navigate("/validation", { state: { interview, employeeId } });
    } catch (error) {
      if (error.response) {
        // Erreur avec réponse du backend
        console.error(
          `Erreur lors de l'appel API : ${error.response.status} - ${error.response.data}`
        );
        alert(error.response.data.message || "Une erreur est survenue.");
      } else if (error.request) {
        // Pas de réponse du serveur
        console.error("Aucune réponse reçue :", error.request);
        alert("Le serveur ne répond pas. Veuillez réessayer.");
      } else {
        // Erreur de configuration ou autre
        console.error("Erreur lors de l'appel API :", error.message);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };




  return (
    <Template>
      <div className="salary-list-planning">
        <h4 className="title">Entretien D'evaluation</h4>

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
                  filteredEmployees.map((employee) => {
                    return (
                      <tr key={employee.employeeId}>

                        <td>
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td>{employee.position}</td>
                        <td>{employee.department}</td>
                        <td>
                          {isValidInterviewDate(employee.interviewDate)
                            ? formatDate(employee.interviewDate)
                            : 'Pas encore planifié'
                          }
                        </td>
                        <td>
                          {employee.interviewDate && employee.interviewDate !== '' ? (
                            compareDates(employee.interviewDate, today) ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => startInterview(employee.employeeId, navigate)}
                              >
                                Démarrer l'entretien
                              </button>
                            ) : new Date(employee.interviewDate) > new Date(today) ? null : null
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenModal(employee.employeeId)}
                            >
                              Planifier l'entretien
                            </button>

                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Aucun employé trouvé.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        </div>

        {/* Modal */}
        {showModal && (
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

                    {/* Utilisation de ParticipantsSelector */}
                    <ParticipantsSelector
                      participantsList={participantsList}
                      selectedParticipants={evaluationDetails.participants}
                      setSelectedParticipants={(participants) => {
                        const validParticipants = participants.filter((p) => !isNaN(Number(p)));
                        setEvaluationDetails((prevState) => ({
                          ...prevState,
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
        )}
      </div>
    </Template>
  );
}

export default EvaluationInterviewHome;
