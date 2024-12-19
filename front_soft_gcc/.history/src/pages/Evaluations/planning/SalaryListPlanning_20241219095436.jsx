const handleOpenModal = () => {
  if (selectedEmployees.length === 0) {
    alert('Veuillez sélectionner au moins un employé.');
    return;
  }
  setShowModal(true);
};

const handlePlanificationSubmit = async () => {
  if (selectedEmployees.length === 0) {
    alert('Aucun employé sélectionné.');
    return;
  }

  const payload = {
    employeeIds: selectedEmployees,
    evaluationDate: evaluationDate, // État pour la date sélectionnée
    evaluationTypeId: evaluationTypeId, // État pour le type sélectionné
    supervisorName: supervisorName, // État pour le superviseur
  };

  try {
    await axios.post('https://localhost:7082/api/EvaluationPlanning/planify', payload);
    alert('Évaluation planifiée avec succès.');
    setShowModal(false);
    setSelectedEmployees([]);
    fetchEmployeesWithoutEvaluations(); // Met à jour la liste
  } catch (error) {
    console.error('Erreur lors de la planification :', error);
    alert('Une erreur s\'est produite.');
  }
};

return (
  <Template>
    <div className="salary-list-planning">
      <h4 className="title">Planification des évaluations</h4>

      {/* Barre de recherche et filtres */}
      <div className="filters card p-3 mb-4">
        {/* Votre logique de recherche et de filtres */}
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
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">Aucun employé trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bouton pour ouvrir le modal */}
      <button
        className="btn btn-primary mt-3"
        onClick={handleOpenModal}
        disabled={selectedEmployees.length === 0}
      >
        Planifier les évaluations
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedEmployees.length === 1
                    ? `Planification - ${filteredEmployees.find(emp => emp.employeeId === selectedEmployees[0]).firstName} ${filteredEmployees.find(emp => emp.employeeId === selectedEmployees[0]).lastName}`
                    : `Planification pour ${selectedEmployees.length} employés`}
                </h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Date d'évaluation :</label>
                    <input
                      type="date"
                      className="form-control"
                      value={evaluationDate}
                      onChange={(e) => setEvaluationDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type d'évaluation :</label>
                    <select
                      className="form-control"
                      value={evaluationTypeId}
                      onChange={(e) => setEvaluationTypeId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="1">Annuel</option>
                      <option value="2">Par projet</option>
                      {/* Ajouter d'autres options dynamiquement */}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Superviseur :</label>
                    <input
                      type="text"
                      className="form-control"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handlePlanificationSubmit}>
                  Planifier
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
