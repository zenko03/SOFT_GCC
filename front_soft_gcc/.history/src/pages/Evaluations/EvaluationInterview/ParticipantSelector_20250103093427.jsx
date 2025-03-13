import React, { useState, useEffect } from "react";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  selectedEmployee,
}) => {
  const [dropdownValues, setDropdownValues] = useState([null]);

  // Ajout automatique de l'employé sélectionné
  useEffect(() => {
    if (
      selectedEmployee?.employeeId &&
      !selectedParticipants.includes(selectedEmployee.employeeId)
    ) {
      setSelectedParticipants((prev) => [...prev, selectedEmployee.employeeId]);
    }
  }, [selectedEmployee, selectedParticipants, setSelectedParticipants]);

  // Gestion de la sélection d'un participant
  const handleSelectParticipant = (index, participantId) => {
    const id = participantId ? parseInt(participantId, 10) : null;

    if (id && !selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    }

    setDropdownValues((prev) =>
      prev.map((value, idx) => (idx === index ? id : value))
    );
  };

  // Ajouter une nouvelle liste déroulante
  const addDropdown = () => setDropdownValues([...dropdownValues, null]);

  // Supprimer un participant
  const removeParticipant = (participantId) => {
    setSelectedParticipants(
      selectedParticipants.filter((id) => id !== participantId)
    );
    setDropdownValues(dropdownValues.filter((value) => value !== participantId));
  };

  return (
    <div>
      <div className="form-group">
        <label>Ajouter des participants</label>
        {dropdownValues.map((value, index) => (
          <div className="input-group mt-2" key={index}>
            <select
              className="form-control"
              value={value || ""}
              onChange={(e) => handleSelectParticipant(index, e.target.value)}
            >
              <option value="">Sélectionnez un participant</option>
              {participantsList.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {`${participant.firstName} ${participant.lastName}`}
                </option>
              ))}
            </select>
            {index === dropdownValues.length - 1 && (
              <button
                type="button"
                className="btn btn-success ml-2"
                onClick={addDropdown}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <ul className="list-group mt-3">
        {selectedParticipants.map((id) => {
          const participant = participantsList.find((p) => p.id === id);
          return (
            <li
              key={id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {participant
                ? `${participant.firstName} ${participant.lastName}`
                : `Participant inconnu (ID: ${id})`}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeParticipant(id)}
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

export default ParticipantsSelector;
