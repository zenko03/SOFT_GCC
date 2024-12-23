import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import '../../../assets/css/Evaluations/SalaryListPlanning.css';

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
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Récupération des employés sans évaluation
  const fetchEmployeesWithoutEvaluations = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationPlanning/employees-without-evaluations',
        { params: { ...filters, search: searchQuery } }
      );
      if (response.data && response.data.length > 0) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else {
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des employés sans évaluation :',
        error
      );
    }
  };

  // Récupération des options de filtres (positions et départements)
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

  // Récupération des types d'évaluations
  const fetchEvaluationTypes = async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationPlanning/types');
      setEvaluationTypes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des types d\'évaluations :', error);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchEmployeesWithoutEvaluations();
      await fetchFilterOptions();
    };
    loadInitialData();
  }, []);

  // Filtrage dynamique des employés selon les filtres et la recherche
  useEffect(() => {
    fetchEmployeesWithoutEvaluations();
  }, [filters, searchQuery]);

  // Chargement des types d'évaluation (uniquement au montage)
  useEffect(() => {
    fetchEvaluationTypes();
  }, []);

  // Gestion de la recherche
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Gestion des changements de filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseInt(value, 10) : '';
    setFilters((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Gestion de l'ouverture et fermeture du modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEvaluationDetails({ evaluationType: '', supervisor: '', startDate: '', endDate: '' });
  };

  // Gestion des changements dans les détails de l'évaluation
  const handleEvaluationDetailsChange = (e) => {
    const { name, value } = e.target;
    setEvaluationDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de la planification en masse
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
        <div className="filters">
          <input
            type="text"
            placeholder="Rechercher un employé"
            value={searchQuery}
            onChange={handleSearch}
          />
          <select name="position" onChange={handleFilterChange}>
            <option value="">Toutes les positions</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
          <select name="department" onChange={handleFilterChange}>
            <option value="">Tous les départements</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {filteredEmployees.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => setSelectAll(!selectAll)}
                  />
                </th>
                <th>Nom</th>
                <th>Poste</th>
                <th>Département</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() =>
                        setSelectedEmployees((prev) =>
                          prev.includes(employee.id)
                            ? prev.filter((id) => id !== employee.id)
                            : [...prev, employee.id]
                        )
                      }
                    />
                  </td>
                  <td>{employee.name}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>Aucun employé sans évaluation trouvé.</div>
        )}

        <button className="btn btn-primary" onClick={handleOpenModal}>
          Planification en masse
        </button>

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
                          <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
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
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleMassPlanning}>
                    Planifier
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
