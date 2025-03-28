import React, { useState, useEffect } from 'react';

const ParticipantsSelector = ({ participantsList, selectedParticipants, setSelectedParticipants, selectedEmployee }) => {
  const [newParticipant, setNewParticipant] = useState('');

  useEffect(() => {
    // Si l'employé sélectionné n'est pas déjà dans la liste des participants
    if (
      selectedEmployee && // Vérifier si selectedEmployee existe
      selectedEmployee.employeeId && // Vérifier si employeeId existe
      !selectedParticipants.includes(selectedEmployee.employeeId) &&
      !participantsList.some((p) => p.id === selectedEmployee.employeeId)
    ) {
      setSelectedParticipants((prev) => [...prev, selectedEmployee.employeeId]); // Ajouter l'employé à la liste des participants
    }
  }, [selectedEmployee, participantsList, selectedParticipants, setSelectedParticipants]);

  const handleAddParticipant = () => {
    const participantId = parseInt(newParticipant, 10);
    if (
      participantId &&
      !selectedParticipants.includes(participantId)
    ) {
      console.log("Ajout de l'ID du participant :", participantId);
      setSelectedParticipants((prev) => [...prev, participantId]);
    } else {
      console.warn("Participant déjà ajouté ou ID invalide :", newParticipant);
    }
    setNewParticipant('');
  };



  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== participantId)); // Retirer un participant
  };


  useEffect(() => {
    if (
      selectedEmployee &&
      selectedEmployee.employeeId &&
      !selectedParticipants.includes(selectedEmployee.employeeId)
    ) {
      console.log("Selected Employee:", selectedEmployee);
      console.log("Participants List:", participantsList);
      const existsInList = participantsList.some((p) => p.id === selectedEmployee.employeeId);
      if (existsInList) {
        setSelectedParticipants((prev) => [...prev, selectedEmployee.employeeId]);
      } else {
        console.warn(
          `Employee with ID ${selectedEmployee.employeeId} not found in participantsList`
        );
      }
    }
  }, [selectedEmployee, participantsList, selectedParticipants, setSelectedParticipants]);


  return (
    <div>
      <div className="form-group">
        <label htmlFor="participants">Ajouter un participant</label>
        <div className="input-group">
          <select
            id="participants"
            className="form-control"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
          >
            <option value="">Sélectionnez un participant</option>
            {participantsList.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.lastName}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-success ml-2" onClick={handleAddParticipant}>
            +
          </button>
        </div>
      </div>

      <ul className="list-group mt-3">
        {selectedParticipants.map((id) => {
          const participant = participantsList.find((p) => p.id === id);
          if (!participant) {
            console.error(`Participant avec ID ${id} non trouvé dans participantsList.`);
          }
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
