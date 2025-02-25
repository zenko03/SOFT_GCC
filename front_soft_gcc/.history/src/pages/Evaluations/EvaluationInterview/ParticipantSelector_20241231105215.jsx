import React, { useState } from 'react';

const ParticipantsSelector = ({ participantsList, selectedParticipants, setSelectedParticipants }) => {
  const [newParticipant, setNewParticipant] = useState('');

  const handleAddParticipant = () => {
    if (newParticipant && !selectedParticipants.includes(parseInt(newParticipant, 10))) {
      setSelectedParticipants((prev) => [...prev, parseInt(newParticipant, 10)]);
    }
    setNewParticipant('');
  };

  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== participantId));
  };

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
          return (
            <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
              {participant ? participant.lastName : 'Participant inconnu'}
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
