import React, { useState, useEffect } from "react";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  selectedEmployee,
}) => {
  const [dropdownValues, setDropdownValues] = useState([]);

  // Ajout automatique de l'employé sélectionné
  useEffect(() => {
    console.log("selectedEmployee:", selectedEmployee);
    if (
      selectedEmployee?.employeeId &&
      !selectedParticipants.includes(Number(selectedEmployee.employeeId))
    ) {
      setSelectedParticipants((prev) => [
        ...prev,
        Number(selectedEmployee.employeeId),
      ]);
    }
  }, [selectedEmployee, selectedParticipants, setSelectedParticipants]);

  // Gestion de la sélection d'un participant
  const handleSelectParticipant = (participantId) => {
    console.log("handleSelectParticipant called with:", participantId);

    const id = participantId ? parseInt(participantId, 10) : null;

    console.log("Parsed ID:", id);

    if (id && !selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    }

    // Mise à jour des valeurs dans la liste déroulante
    setDropdownValues((prev) => [...prev, id]);

    console.log("Updated selectedParticipants:", selectedParticipants);
  };

  // Supprimer un participant (non autorisé pour l'employé sélectionné)
  const removeParticipant = (participantId) => {
    console.log("removeParticipant called with:", participantId);

    if (participantId === Number(selectedEmployee?.employeeId)) {
      return; // Empêche la suppression de l'employé sélectionné
    }

    setSelectedParticipants(
      selectedParticipants.filter((id) => id !== participantId)
    );

    // Retirer le participant de la liste déroulante
    setDropdownValues((prev) => prev.filter((id) => id !== participantId));

    console.log("Updated selectedParticipants after removal:", selectedParticipants);
  };

  // Obtenir les participants restants pour la liste déroulante
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
          console.log("Searching for participant with ID:", id);
          const participant = participantsList.find(
            (p) => p.id === Number(id)
          );
          console.log("Found participant:", participant);

          const isDefaultParticipant =
            selectedEmployee &&
            Number(id) === Number(selectedEmployee.employeeId);

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
