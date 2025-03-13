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
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationType: '',
    supervisor: '',
    startDate: '',
    endDate: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [planningSuccess, setPlanningSuccess] = useState(false);
  const [planningError, setPlanningError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // State for email sent status

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [evaluationTypes, setEvaluationTypes] = useState([]);

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
    setLoading(true);
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
      setLoading(false);
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedEmployees(selectAll ? [] : filteredEmployees.map(emp => emp.id));
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployees((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(empId => empId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({
      evaluationType: '',
      supervisor: '',
      startDate: '',
      endDate: '',
    });
    setEmailSent(false); // Reset email sent status when closing modal
  };

  const handleCreateEvaluation = async () => {
    try {
      const response = await axios.post('https://localhost:7082/api/EvaluationPlanning/create-evaluation', {
        employees: selectedEmployees,
        ...evaluationDetails,
      });
      setPlanningSuccess(true);
      setEmailSent(true); // Set email sent status to true
      // Optionally, you can show a success message or notification here
    } catch (error) {
      setPlanningError('Erreur lors de la création de l\'évaluation.');
      console.error('Erreur lors de la création de l\'évaluation :', error);
    }
  };

  const handleSendReminderEmail = async () => {
    try {
      await axios.post('https://localhost:7082/api/EvaluationPlanning/rappel-evaluation', {
        employees: selectedEmployees,
      });
      // Optionally, show a success message for the reminder email
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de rappel :', error);
    }
  };

  return (
    <Template>
      <div className="salary-list-planning">
        <h1>Planification des Évaluations</h1>
        <input
          type="text"
          placeholder="Rechercher des employés"
          value={searchQuery}
          onChange={handleSearch}
        />
        <div>
          <label>Position:</label>
          <select name="position" onChange={handleFilterChange}>
            <option value="">Tous</option>
            {positions.map((position) => (
              <option key={position.id} value={position.name}>{position.name}</option>
            ))}
          </select>
          <label>Département:</label>
          <select name="department" onChange={handleFilterChange}>
            <option value="">Tous</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>{department.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleOpenModal}>Planifier</button>
        {emailSent && <p>Email envoyé avec succès !</p>} {/* Indication d'email envoyé */}
        <button onClick={handleSendReminderEmail}>Envoyer un rappel par email</button> {/* Bouton de rappel email */}
        {/* Modal pour la planification */}
        {showModal && (
          <div className="modal">
            <h2>Créer une Évaluation</h2>
            <form onSubmit={handleCreateEvaluation}>
              <label>Type d'Évaluation:</label>
              <select
                value={evaluationDetails.evaluationType}
                onChange={(e) => setEvaluationDetails({ ...evaluationDetails, evaluationType: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {evaluationTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              <label>Superviseur:</label>
              <select
                value={evaluationDetails.supervisor}
                onChange={(e) => setEvaluationDetails({ ...evaluationDetails, supervisor: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.name}>{supervisor.name}</option>
                ))}
              </select>
              <label>Date de Début:</label>
              <input
                type="date"
                value={evaluationDetails.startDate}
                onChange={(e) => setEvaluationDetails({ ...evaluationDetails, startDate: e.target.value })}
              />
              <label>Date de Fin:</label>
              <input
                type="date"
                value={evaluationDetails.endDate}
                onChange={(e) => setEvaluationDetails({ ...evaluationDetails, endDate: e.target.value })}
              />
              <button type="submit ">Créer Évaluation</button>
              <button type="button" onClick={handleCloseModal}>Annuler</button>
            </form>
            {planningSuccess && <p>Évaluation créée avec succès !</p>}
            {planningError && <p>{planningError}</p>}
          </div>
        )}
        <div>
          {loading ? (
            <p>Chargement des employés...</p>
          ) : (
            <ul>
              {filteredEmployees.map((employee) => (
                <li key={employee.id}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleSelectEmployee(employee.id)}
                  />
                  {employee.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Précédent
          </button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      </div>
    </Template>
  );
}

export default SalaryListPlanning;