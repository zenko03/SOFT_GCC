import React, { useState, useEffect } from "react";

const ParticipantSelector = ({
  selectedEmployee,
  participantsList,
  onParticipantChange,
}) => {
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Ajouter l'employé sélectionné par défaut
  useEffect(() => {
    if (
      participantsList.length > 0 && // Vérifier que la liste des participants est prête
      selectedEmployee &&
      selectedEmployee.employeeId && // Vérifier que l'employé a un ID
      !selectedParticipants.includes(selectedEmployee.employeeId) // Éviter les doublons
    ) {
      const existsInList = participantsList.some(
        (p) => p.id === selectedEmployee.employeeId
      );
      if (existsInList) {
        setSelectedParticipants((prev) => [
          ...prev,
          selectedEmployee.employeeId,
        ]);
      } else {
        console.warn(
          `L'employé sélectionné avec l'ID ${selectedEmployee.employeeId} n'est pas dans la liste des participants.`
        );
      }
    }
  }, [selectedEmployee, participantsList, selectedParticipants]);

  // Gérer l'ajout d'un participant
  const handleAddParticipant = (id) => {
    if (!selectedParticipants.includes(id)) {
      setSelectedParticipants((prev) => [...prev, id]);
    }
  };

  // Gérer la suppression d'un participant
  const handleRemoveParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.filter((participantId) => participantId !== id)
    );
  };

  // Mettre à jour les participants sélectionnés vers le parent
  useEffect(() => {
    if (onParticipantChange) {
      onParticipantChange(selectedParticipants);
    }
  }, [selectedParticipants, onParticipantChange]);

  return (
    <div>
      {/* Liste déroulante pour ajouter des participants */}
      <select
        className="form-select"
        onChange={(e) => handleAddParticipant(parseInt(e.target.value, 10))}
      >
        <option value="">Ajouter un participant</option>
        {participantsList.map((participant) => (
          <option key={participant.id} value={participant.id}>
            {participant.lastName}
          </option>
        ))}
      </select>

      {/* Liste des participants sélectionnés */}
      <ul className="list-group mt-3">
        {selectedParticipants.map((id) => {
          const participant = participantsList.find((p) => p.id === id);
          return (
            <li
              key={id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {participant
                ? participant.lastName
                : `Participant inconnu (ID: ${id})`}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveParticipant(id)}
              >
                -
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipantSelector;
