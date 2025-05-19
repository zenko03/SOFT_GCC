import React, { useState, useEffect } from "react";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee, // Employé sélectionné (prop)
  employees, // Liste complète des employés
}) => {
  const [currentEmployee, setCurrentEmployee] = useState(null); // Renommée

  // Récupérer l'employé sélectionné via le fetchedEmployee
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (fetchedEmployee) {
        setCurrentEmployee(fetchedEmployee);
      }
    };

    fetchEmployeeDetails();
  }, [fetchedEmployee]);

  // Gestion de la sélection d'un participant
  const handleSelectParticipant = (participantId) => {
    const id = participantId ? parseInt(participantId, 10) : null;

    if (id && !selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  // Supprimer un participant (non autorisé pour l'employé sélectionné)
  const removeParticipant = (participantId) => {
    if (participantId === Number(currentEmployee?.employeeId)) {
      return; // Empêche la suppression de l'employé sélectionné
    }

    setSelectedParticipants(
      selectedParticipants.filter((id) => id !== participantId)
    );
  };

  // Filtrer pour ne pas montrer les participants déjà sélectionnés
  const availableParticipants = participantsList.filter(
    (participant) => {
      const id = participant.employeeId || participant.id;
      return !selectedParticipants.includes(Number(id));
    }
  );

  return (
    <div>
      <div className="form-group">
        <label>Ajouter un participant</label>
        <select
          className="form-control mt-2"
          onChange={(e) => handleSelectParticipant(e.target.value)}
        >
          <option value="">Sélectionnez un participant</option>
          {availableParticipants.map((participant) => {
            const id = participant.employeeId || participant.id;
            return (
              <option key={id} value={id}>
                {`${participant.firstName} ${participant.lastName}`}
              </option>
            );
          })}
        </select>
      </div>

      <ul className="list-group mt-3">
        {selectedParticipants.map((id) => {
          const participant =
            participantsList.find((p) => Number(p.employeeId || p.id) === Number(id)) ||
            employees.find((emp) => emp.employeeId === Number(id)) ||
            (id === currentEmployee?.employeeId ? currentEmployee : null);

          const isDefaultParticipant =
            currentEmployee && Number(id) === Number(currentEmployee.employeeId);

          return (
            <li
              key={id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {participant
                ? `${participant.firstName} ${participant.lastName}`
                : `Participant inconnu (ID: ${id})`}
              {!isDefaultParticipant && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeParticipant(id)}
                >
                  -
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipantsSelector;
