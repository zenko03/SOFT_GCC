import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques
import { formatDate } from '../../../services/Evaluations/utils';
import { isValidInterviewDate } from '../../../services/Evaluations/utils';
import { compareDates } from '../../../services/Evaluations/utils';


function EvaluationInterviewHome() {
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
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationType: '',
    supervisor: '',
    startDate: '',
    endDate: '',
  });
  const [showModal, setShowModal] = useState(false);

  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);



  const [evaluationTypes, setEvaluationTypes] = useState([]);

  const fetchEvaluationTypes = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationInterview/evaluation-types');
      setEvaluationTypes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des types d'évaluation :", error);
    }
  };

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

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
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
    fetchEvaluationTypes(); // Récupération des types d'évaluations

  }, [filters, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
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
      setSelectedEmployees([]); // Désélectionner tous
    } else {
      const allEmployeeIds = filteredEmployees.map((emp) => emp.employeeId);
      setSelectedEmployees(allEmployeeIds); // Sélectionner tous
    }
    setSelectAll(!selectAll);
  };

  const handleOpenModal = () => {
    setShowModal(true);

    const selectedEmployeesWithoutDate = employees.filter(emp =>
      selectedEmployees.includes(emp.employeeId) &&
      !emp.evaluationDate
    );

    setEvaluationDetails({
      evaluationId: selectedEmployeesWithoutDate[0]?.evaluationId || '',
      scheduledDate: '',
      participants: selectedEmployeesWithoutDate.map(emp => emp.employeeId)
    });
  };




  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({ evaluationType: '', supervisor: '', startDate: '', endDate: '' });
  };

  const handleEvaluationDetailsChange = (event) => {
    setEvaluationDetails(prev => ({
      ...prev,
      [event.name]: event.value
    }));
  };


  const handleMassPlanning = async () => {
    if (!evaluationDetails.scheduledDate || evaluationDetails.participants.length === 0) {
      alert('Veuillez sélectionner une date et au moins un participant avant de planifier.');
      return;
    }

    try {
      const payload = {
        evaluationId: parseInt(evaluationDetails.evaluationId, 10),
        scheduledDate: evaluationDetails.scheduledDate,
        participants: evaluationDetails.participants
      };

      await axios.post('https://localhost:7082/api/EvaluationInterview/schedule-interview', payload);

      alert('Planification effectuée avec succès pour tous les employés sélectionnés.');
      fetchEmployeesWithoutEvaluations();
      setSelectedEmployees([]);
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la planification :', error);
      alert('Une erreur est survenue lors de la planification.');
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
                  <th>Date d'entretien</th>

                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {

                    console.log("comparaison, dateEntretien: ", employee.interviewDate, " = today: ", today);
                    return (
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
                        <td>
                          {isValidInterviewDate(employee.interviewDate)
                            ? formatDate(employee.interviewDate)
                            : 'Pas encore planifié'
                          }
                        </td>
                        <td>
                          {employee.interviewDate && employee.interviewDate !== '' ? (
                            compareDates(employee.interviewDate) ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => startInterview(employee.employeeId)}
                              >
                                Démarrer l'entretien
                              </button>
                            ) : new Date(employee.interviewDate) > new Date(today) ? null : null
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openPlanningModal(employee.employeeId)}
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
            <div className="text-right mt-3">
              <button className="btn btn-primary" onClick={handleOpenModal} disabled={selectedEmployees.length === 0}>
                Planifier
              </button>
            </div>
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
                        onChange={(e) => handleEvaluationDetailsChange({ name: 'scheduledDate', value: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="participants">Participants</label>

                    </div>
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
