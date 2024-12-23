import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css'; // Styles spécifiques

function SalaryListPlanning() {
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
  const [evaluationTypes, setEvaluationTypes] = useState([]); // Stocke les types d'évaluations
  const [evaluationDetails, setEvaluationDetails] = useState({
    evaluationType: '',
    supervisor: '',
    startDate: '',
    endDate: '',
  });
  const [showModal, setShowModal] = useState(false);

  const fetchEmployeesWithoutEvaluations = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations',
        { params: { ...filters, search: searchQuery } }
      );
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des employés sans évaluation :',
        error
      );
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

  const fetchEvaluationTypes = async () => {
    try {
      const evalResponse = await axios.get('https://localhost:7082/api/Evaluation/types');
      setEvaluationTypes(evalResponse.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des types d\'évaluations :', error);
    }
  };

  useEffect(() => {
    fetchEmployeesWithoutEvaluations();
    fetchFilterOptions();
    fetchEvaluationTypes(); // Appel pour récupérer les types d'évaluations
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({ evaluationType: '', supervisor: '', startDate: '', endDate: '' });
  };

  const handleEvaluationDetailsChange = (e) => {
    const { name, value } = e.target;
    setEvaluationDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMassPlanning = async () => {
    if (!evaluationDetails.evaluationType || !evaluationDetails.startDate || !evaluationDetails.endDate || !evaluationDetails.supervisor) {
      alert('Veuillez remplir tous les champs avant de planifier.');
      return;
    }

    try {
      const payload = selectedEmployees.map((employeeId) => ({
        userId: employeeId,
        evaluationTypeId: parseInt(evaluationDetails.evaluationType, 10),
        supervisorId: evaluationDetails.supervisor,
        startDate: evaluationDetails.startDate,
        endDate: evaluationDetails.endDate,
      }));

      await axios.post('https://localhost:7082/api/EvaluationPlanning/create-evaluation', payload);

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
        {/* Votre contenu existant */}

        {/* Modal */}
        {showModal && (
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
                  <form>
                    <div className="form-group">
                      <label>Date de début :</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={evaluationDetails.startDate}
                        onChange={handleEvaluationDetailsChange}
                      />
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
                          <option key={type.evaluationTypeId} value={String(type.evaluationTypeId)}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Superviseur :</label>
                      <input
                        type="text"
                        name="supervisor"
                        className="form-control"
                        value={evaluationDetails.supervisor}
                        onChange={handleEvaluationDetailsChange}
                      />
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

export default SalaryListPlanning;
