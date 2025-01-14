import React, { useState, useEffect } from "react";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchSelectedEmployee,
  selectedEmployeeId,
}) => {
  const [fetchedEmployee, setFetchedEmployee] = useState(null);

  // Charger les informations de l'employé sélectionné depuis l'API
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (selectedEmployeeId) {
        try {
          // Récupération des informations complètes de l'employé
          const employee = await fetchSelectedEmployee(selectedEmployeeId);
          setFetchedEmployee(employee);

          // Ajouter l'employé sélectionné aux participants si non présent
          if (
            employee?.employeeId &&
            !selectedParticipants.includes(Number(employee.employeeId))
          ) {
            setSelectedParticipants((prev) => [
              ...prev,
              Number(employee.employeeId),
            ]);
          }
        } catch (error) {
          console.error("Erreur lors du fetch de l'employé :", error);
        }
      }
    };

    fetchEmployeeDetails();
  }, [selectedEmployeeId, selectedParticipants, fetchSelectedEmployee, setSelectedParticipants]);

  // Gestion de la sélection d'un participant
  const handleSelectParticipant = (participantId) => {
    const id = participantId ? parseInt(participantId, 10) : null;

    if (id && !selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  // Supprimer un participant (non autorisé pour l'employé sélectionné)
  const removeParticipant = (participantId) => {
    if (participantId === Number(fetchedEmployee?.employeeId)) {
      return; // Empêche la suppression de l'employé sélectionné
    }

    setSelectedParticipants(
      selectedParticipants.filter((id) => id !== participantId)
    );
  };

  const availableParticipants = participantsList.filter(
    (participant) => !selectedParticipants.includes(participant.id)
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
          {availableParticipants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {`${participant.firstName} ${participant.lastName}`}
            </option>
          ))}
        </select>
      </div>

      <ul className="list-group mt-3">
        {selectedParticipants.map((id) => {
          // Si l'id correspond à l'employé sélectionné, utiliser directement fetchedEmployee
          const participant =
            Number(id) === Number(fetchedEmployee?.employeeId)
              ? fetchedEmployee
              : null; // Aucune recherche dans participantsList nécessaire

          const isDefaultParticipant =
            fetchedEmployee && Number(id) === Number(fetchedEmployee.employeeId);

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
