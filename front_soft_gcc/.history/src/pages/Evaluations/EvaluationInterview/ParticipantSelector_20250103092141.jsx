import React, { useState, useEffect } from 'react';

const ParticipantsSelector = ({ participantsList, selectedParticipants, setSelectedParticipants, selectedEmployee }) => {
  const [dropdowns, setDropdowns] = useState([null]);

  // Ajouter automatiquement l'employé sélectionné s'il n'est pas déjà présent
  useEffect(() => {
    if (
      selectedEmployee &&
      selectedEmployee.employeeId &&
      !selectedParticipants.includes(selectedEmployee.employeeId)
    ) {
      setSelectedParticipants((prev) => [...prev, selectedEmployee.employeeId]);
    }
  }, [selectedEmployee, selectedParticipants, setSelectedParticipants]);

  // Gérer la sélection d'un participant depuis une liste déroulante
  const handleSelectParticipant = (index, participantId) => {
    if (participantId && !isNaN(participantId) && !selectedParticipants.includes(participantId)) {
      setSelectedParticipants((prev) => [...prev, participantId]);
    }
    setDropdowns((prev) =>
      prev.map((value, i) => (i === index ? participantId : value))
    );
  };


  // Ajouter une nouvelle liste déroulante
  const addDropdown = () => {
    setDropdowns((prev) => [...prev, null]);
  };

  // Retirer un participant
  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== participantId));
    setDropdowns((prev) =>
      prev.filter((_, i) => selectedParticipants[i] !== participantId)
    );
  };

  return (
    <div>
      <div className="form-group">
        <label>Ajouter des participants</label>
        {dropdowns.map((selectedValue, index) => (
          <div className="input-group mt-2" key={index}>
            <select
              className="form-control"
              value={selectedValue || ''}
              onChange={(e) => handleSelectParticipant(index, parseInt(e.target.value, 10))}
            >
              <option value="">Sélectionnez un participant</option>
              {participantsList.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {`${participant.firstName} ${participant.lastName}`}
                </option>
              ))}
            </select>
            {index === dropdowns.length - 1 && (
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

export default ParticipantsSelector;
