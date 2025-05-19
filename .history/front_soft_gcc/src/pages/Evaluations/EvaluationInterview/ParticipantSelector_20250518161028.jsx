import React, { useState, useEffect } from "react";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee, // Employé sélectionné (prop)
  employees, // Liste complète des employés
}) => {
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Récupérer l'employé sélectionné via le fetchedEmployee
  useEffect(() => {
    if (fetchedEmployee) {
      setCurrentEmployee(fetchedEmployee);
      
      // S'assurer que l'employé concerné est bien dans la liste des participants
      const employeeId = Number(fetchedEmployee.employeeId);
      if (employeeId && !selectedParticipants.includes(employeeId)) {
        console.log("Ajout automatique de l'employé évalué dans les participants");
        setSelectedParticipants([employeeId, ...selectedParticipants]);
      }
    }
  }, [fetchedEmployee, selectedParticipants, setSelectedParticipants]);

  // Gestion de la sélection d'un participant
  const handleParticipantSelection = (participantId) => {
    // Empêcher la désélection de l'employé concerné
    if (currentEmployee && participantId === Number(currentEmployee.employeeId)) {
      return;
    }
    
    // Basculer la sélection pour les autres participants
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };

  return (
    <div className="form-group">
      <label>Participants à l'entretien</label>
      
      {/* Affichage de l'employé concerné */}
      {currentEmployee && (
        <div className="mb-3 p-2 border rounded bg-light">
          <div className="d-flex align-items-center">
            <input 
              type="checkbox"
              checked={true}
              disabled={true}
              className="me-2"
            />
            <strong>{currentEmployee.firstName} {currentEmployee.lastName}</strong>
            <span className="badge bg-primary ms-2">Employé évalué</span>
          </div>
        </div>
      )}
      
      {/* Liste des autres participants potentiels */}
      <div className="participants-list mt-2">
        {participantsList.map((participant) => {
          const participantId = Number(participant.employeeId || participant.id);
          
          // Ne pas afficher à nouveau l'employé concerné dans la liste
          if (currentEmployee && participantId === Number(currentEmployee.employeeId)) {
            return null;
          }
          
          return (
            <div key={participantId} className="mb-2">
              <input
                type="checkbox"
                id={`participant-${participantId}`}
                checked={selectedParticipants.includes(participantId)}
                onChange={() => handleParticipantSelection(participantId)}
                className="me-2"
              />
              <label htmlFor={`participant-${participantId}`}>
                {participant.firstName} {participant.lastName} 
                {participant.role && ` - ${participant.role}`}
              </label>
            </div>
          );
        })}
      </div>
      
      {/* Information sur les participants sélectionnés */}
      <div className="mt-3">
        <small className="text-muted">
          {selectedParticipants.length} participant(s) sélectionné(s)
        </small>
      </div>
    </div>
  );
};

export default ParticipantsSelector;
